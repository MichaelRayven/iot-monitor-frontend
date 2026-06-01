import { API_BASE_URL } from "@/lib/constants";
import type {
  DeviceType,
  FloorDevice,
  FloorDeviceWithData,
  VegaDevice,
} from "@/types/device";

// List all devices registered on the Vega IoT server
export const getVegaDevices = async (): Promise<VegaDevice[]> => {
  const response = await fetch(`${API_BASE_URL}/devices/vega`);
  if (!response.ok) {
    throw new Error("Failed to fetch Vega devices");
  }
  return response.json();
};

export const getDeviceTypes = async (): Promise<DeviceType[]> => {
  const response = await fetch(`${API_BASE_URL}/devices/types`);
  if (!response.ok) {
    throw new Error("Failed to fetch device types");
  }
  return response.json();
};

export const getFloorDevices = async (
  floorId: number
): Promise<FloorDevice[]> => {
  const response = await fetch(`${API_BASE_URL}/devices/floor/${floorId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch floor devices");
  }
  return response.json();
};

export const getDeviceData = async (
  deviceId: number
): Promise<FloorDeviceWithData> => {
  const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch device data");
  }
  return response.json();
};

export class ConflictError extends Error {
  existingDeviceId: number | null;
  constructor(message: string, existingDeviceId: number | null) {
    super(message);
    this.existingDeviceId = existingDeviceId;
  }
}

export const addFloorDevice = async (
  floorId: number,
  uid: string,
  isStationary: boolean,
  deviceType: string,
  name?: string,
  x?: number,
  y?: number
) => {
  const response = await fetch(`${API_BASE_URL}/devices/floor/${floorId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid,
      device_type: deviceType,
      is_stationary: isStationary,
      ...(name ? { name } : {}),
      ...(x !== undefined ? { x } : {}),
      ...(y !== undefined ? { y } : {}),
    }),
  });

  if (response.status === 409) {
    const body = await response.json();
    const detail = body.detail ?? {};
    throw new ConflictError(
      detail.message ?? "Device already exists",
      detail.existing_device_id ?? null
    );
  }

  if (!response.ok) {
    throw new Error("Failed to add floor device");
  }

  return response.json();
};

export const updateFloorDevice = async (
  deviceId: number,
  values: {
    floor_id?: number;
    name?: string;
    is_stationary?: boolean;
    x?: number;
    y?: number;
  }
) => {
  const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Failed to update floor device");
  }

  return response.json();
};

export const deleteFloorDevice = async (deviceId: number) => {
  const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete floor device");
  }
};
