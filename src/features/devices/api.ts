import { useEffect, useState } from "react";
import { fetchApiResource, fetchJson } from "../../shared/api";
import type { BackendDeviceSchema } from "./types";

export async function updateDevicePosition(
  floorId: number,
  floorDeviceId: number,
  x: number,
  y: number
) {
  await fetchJson<unknown>(
    `/floors/${floorId}/devices/${floorDeviceId}/position`,
    undefined,
    {
      body: JSON.stringify({ x, y }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    }
  );
}

export function useDevices() {
  const [devices, setDevices] = useState<BackendDeviceSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDevices() {
      try {
        setIsLoading(true);
        setError(null);

        const nextDevices = await fetchApiResource<BackendDeviceSchema[]>(
          "devices",
          ["/api/devices", "/devices", "/devices/"],
          abortController.signal
        );

        setDevices(nextDevices);
      } catch (nextError) {
        if (abortController.signal.aborted) {
          return;
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : "Failed to load devices"
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDevices();

    return () => {
      abortController.abort();
    };
  }, []);

  return { devices, error, isLoading };
}
