import { create } from "zustand";

type AppState = {
  buildingId: number | null;
  setBuildingId: (id: number | null) => void;
  floorId: number | null;
  setFloorId: (id: number | null) => void;
  selectedDeviceId: number | null;
  setSelectedDeviceId: (id: number | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  buildingId: null,
  setBuildingId: (id) => set({ buildingId: id, floorId: null }),
  floorId: null,
  setFloorId: (id) => set({ floorId: id }),
  selectedDeviceId: null,
  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),
}));
