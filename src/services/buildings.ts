import { API_BASE_URL } from "@/lib/constants";
import type { BuildingSchema } from "@/types/building";

export const getBuildings = async (): Promise<BuildingSchema[]> => {
  const response = await fetch(`${API_BASE_URL}/buildings`);
  if (!response.ok) {
    throw new Error("Failed to fetch buildings");
  }
  return response.json();
};

export const createBuilding = async (name: string, address: string) => {
  const response = await fetch(`${API_BASE_URL}/buildings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, address }),
  });

  if (!response.ok) {
    throw new Error("Failed to create building");
  }

  return response.json();
};
