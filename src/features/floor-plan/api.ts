import { useCallback, useEffect, useState } from "react";
import { fetchApiResource, fetchJson } from "../../shared/api";
import { mockFloorPlans } from "./mocks/floorPlans";
import type { BackendFloorSchema, FloorPlanWithDevices } from "./types";

export type CreateFloorInput = {
  name: string;
  building?: string | null;
  scale_factor: number;
};

export type AddDeviceToFloorInput = {
  dev_eui: string;
  device_type?: string | null;
  is_stationary?: boolean;
  x?: number | null;
  y?: number | null;
};

const DEFAULT_WIDTH = 1800;
const DEFAULT_HEIGHT = 1200;

function withFloorPlanViewData(
  floor: BackendFloorSchema,
  index: number
): FloorPlanWithDevices {
  const fallbackFloorPlan = mockFloorPlans[index];

  return {
    ...floor,
    floorplan_url: floor.floorplan_url ?? fallbackFloorPlan?.floorplan_url ?? null,
    width: fallbackFloorPlan?.width ?? DEFAULT_WIDTH,
    height: fallbackFloorPlan?.height ?? DEFAULT_HEIGHT,
    initialTransform: fallbackFloorPlan?.initialTransform ?? {
      x: 0,
      y: 0,
      scale: 0.5,
    },
    devices: (floor.devices ?? []).map((device) => ({
      ...device,
      floor_id: floor.id,
    })),
  };
}

export async function createFloor(input: CreateFloorInput) {
  const floor = await fetchJson<BackendFloorSchema>("/floors", undefined, {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return withFloorPlanViewData(floor, 0);
}

export async function addDeviceToFloor(
  floorId: number,
  input: AddDeviceToFloorInput
) {
  await fetchJson<unknown>(`/floors/${floorId}/devices`, undefined, {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

export function useFloorPlans() {
  const [floorPlans, setFloorPlans] = useState<FloorPlanWithDevices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFloorPlans = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);

      const nextFloorPlans = await fetchApiResource<BackendFloorSchema[]>(
        "floors",
        ["/api/floors", "/floors", "/floors/"],
        signal
      );

      setFloorPlans(nextFloorPlans.map(withFloorPlanViewData));
    } catch (nextError) {
      if (signal?.aborted) {
        return;
      }

      setError(
        nextError instanceof Error ? nextError.message : "Failed to load floors"
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    void loadFloorPlans(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [loadFloorPlans]);

  return { error, floorPlans, isLoading, reload: loadFloorPlans };
}
