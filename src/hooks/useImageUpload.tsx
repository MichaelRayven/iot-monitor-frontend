import { useState } from "react";
import { type UploadResult, uploadImages } from "@/services";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const upload = async (files: File[] | FileList): Promise<UploadResult[]> => {
    const list = Array.from(files);
    if (!list.length) return [];

    setIsUploading(true);
    setError(null);

    try {
      return await uploadImages(list);
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
