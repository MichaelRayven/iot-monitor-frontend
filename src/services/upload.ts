import { API_BASE_URL } from "@/lib/constants";

export type UploadResult = {
  key: string;
  url: string;
  fileName: string;
};

export const uploadImage = async (file: File): Promise<UploadResult> => {
  const urlResponse = await fetch(`${API_BASE_URL}/floorplan/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_name: file.name,
      file_type: file.type,
    }),
  });

  if (!urlResponse.ok) {
    throw new Error("Failed to get presigned URL");
  }

  const { upload_url, public_url, key } = await urlResponse.json();

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

  return {
    key,
    url: public_url,
    fileName: file.name,
  };
};

export const uploadImages = async (
  files: File[] | FileList
): Promise<UploadResult[]> => {
  const list = Array.from(files);
  if (!list.length) return [];

  const results: UploadResult[] = [];
  for (const file of list) {
    const result = await uploadImage(file);
    results.push(result);
  }

  return results;
};
