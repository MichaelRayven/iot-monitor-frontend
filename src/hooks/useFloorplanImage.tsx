import { useEffect, useState } from "react";

export function useFloorplanImage(url: string | undefined) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      setError("No floor plan image has been uploaded.");
      return;
    }

    setError(null);
    const img = new Image();
    img.onload = () => setImage(img);
    img.onerror = () => setError(`Failed to load floor plan image: ${url}`);
    img.src = url;

    return () => setImage(null);
  }, [url]);

  return { image, error };
}
