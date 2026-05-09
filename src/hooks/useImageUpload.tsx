import { useState } from "react";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL!;

export type UploadResult = {
  key: string;
  url: string;
  fileName: string;
};

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const upload = async (files: File[] | FileList) => {
    const list = Array.from(files);
    if (!list.length) return [];

    setIsUploading(true);
    setError(null);

    try {
      const results: UploadResult[] = [];

      for (const file of list) {
        // 1. Generate presigned URL
        const urlReponse = await fetch(API_BASE_URL + "/floorplan/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            file_type: file.type,
          }),
        });

        if (!urlReponse.ok) {
          throw new Error("Failed to get presigned URL");
        }

        const { upload_url, public_url, key } = await urlReponse.json();

        // 2. Upload to S3
        const uploadResponse = await fetch(upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }

        results.push({
          key,
          url: public_url,
          fileName: file.name,
        });
      }

      return results;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
    error,
  };
}
