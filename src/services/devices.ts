import { API_BASE_URL } from "@/lib/constants";
import type {
  Device,
  DeviceType,
  FloorDevice,
  FloorDeviceWithData,
} from "@/types/device";

export const getDevices = async (): Promise<Device[]> => {
  const response = await fetch(`${API_BASE_URL}/devices`);
  if (!response.ok) {
    throw new Error("Failed to fetch devices");
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
  const response = await fetch(`${API_BASE_URL}/floors/${floorId}/devices`);
  if (!response.ok) {
    throw new Error("Failed to fetch floor devices");
  }
  return response.json();
};

export const getDeviceData = async (
  deviceId: number
): Promise<FloorDeviceWithData> => {
  const response = await fetch(`${API_BASE_URL}/floors/devices/${deviceId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch device data");
  }
  return response.json();
};

export const addFloorDevice = async (
  floorId: number,
  deviceId: number,
  isStationary: boolean,
  deviceType: string,
  x?: number,
  y?: number
) => {
  const response = await fetch(`${API_BASE_URL}/floors/${floorId}/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_id: deviceId,
      is_stationary: isStationary,
      device_type: deviceType,
      x,
      y,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add floor device");
  }

  return response.json();
};

export const updateFloorDevice = async (
  deviceId: number,
  values: {
    floor_id?: number;
    device_type?: string;
    is_stationary?: boolean;
    x?: number;
    y?: number;
  }
) => {
  const response = await fetch(`${API_BASE_URL}/floors/devices/${deviceId}`, {
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
  const response = await fetch(`${API_BASE_URL}/floors/devices/${deviceId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete floor device");
  }
};
