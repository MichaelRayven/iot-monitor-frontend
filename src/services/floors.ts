import { API_BASE_URL } from "@/lib/constants";
import type { BuildingSchema } from "@/types/building";
import type { BaseFloorSchema, FloorSchema } from "@/types/floor";

export const getFloorsByBuilding = async (
  buildingId: number
): Promise<BaseFloorSchema[]> => {
  const response = await fetch(`${API_BASE_URL}/buildings`);
  if (!response.ok) {
    throw new Error("Failed to fetch buildings");
  }
  const buildings: BuildingSchema[] = await response.json();
  const building = buildings.find((b) => b.id === buildingId);
  return building?.floors ?? [];
};

export const getFloor = async (floorId: number): Promise<FloorSchema> => {
  const response = await fetch(`${API_BASE_URL}/floors/${floorId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch floor");
  }
  return response.json();
};

export const createFloor = async (floor: {
  name: string;
  building_id: number;
  floorplan_key?: string;
  scale_factor?: number;
}) => {
  const response = await fetch(`${API_BASE_URL}/floors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(floor),
  });

  if (!response.ok) {
    throw new Error("Failed to create floor");
  }

  return response.json();
};

export const updateFloor = async (
  floorId: number,
  floor: {
    name?: string;
    building_id?: number;
    floorplan_key?: string;
    scale_factor?: number;
  }
) => {
  const response = await fetch(`${API_BASE_URL}/floors/${floorId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(floor),
  });

  if (!response.ok) {
    throw new Error("Failed to update floor");
  }

  return response.json();
};
