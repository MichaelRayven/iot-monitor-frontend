import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  addFloorDevice,
  ConflictError,
  updateFloorDevice,
} from "@/services/devices";
import type { FloorDevice } from "@/types/device";

type DevicePayload = {
  uid: string;
  floor_id: number;
  device_type: string;
  name?: string;
  is_stationary: boolean;
  x?: number;
  y?: number;
};

type ConflictState = {
  deviceId: number;
  payload: DevicePayload;
} | null;

export function useAddFloorDevice(floorId: number, onSuccess: () => void) {
  const queryClient = useQueryClient();
  const [conflict, setConflict] = useState<ConflictState>(null);

  const invalidateAndClose = () => {
    queryClient.invalidateQueries({ queryKey: ["floor-devices"] });
    onSuccess();
  };

  const addMutation = useMutation({
    mutationKey: ["floor-devices"],
    mutationFn: (payload: DevicePayload) =>
      addFloorDevice(
        floorId,
        payload.uid,
        payload.is_stationary,
        payload.device_type,
        payload.name,
        payload.x,
        payload.y
      ),
    onSuccess: (data: FloorDevice) => {
      queryClient.setQueryData(["floor-devices"], (old: FloorDevice[] = []) => [
        data,
        ...old,
      ]);
      invalidateAndClose();
    },
    onError: (error: Error, payload: DevicePayload) => {
      if (error instanceof ConflictError && error.existingDeviceId) {
        setConflict({ deviceId: error.existingDeviceId, payload });
      }
    },
  });

  const moveMutation = useMutation({
    mutationKey: ["floor-devices", "move"],
    mutationFn: () => {
      if (!conflict) throw new Error("No conflict to resolve");
      return updateFloorDevice(conflict.deviceId, {
        floor_id: floorId,
        is_stationary: conflict.payload.is_stationary,
        x: conflict.payload.x,
        y: conflict.payload.y,
      });
    },
    onSuccess: () => {
      setConflict(null);
      invalidateAndClose();
    },
  });

  const dismissConflict = () => setConflict(null);

  return {
    addMutation,
    moveMutation,
    conflict,
    dismissConflict,
  };
}
