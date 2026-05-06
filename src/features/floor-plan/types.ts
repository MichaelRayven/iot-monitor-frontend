import type { DeviceSchema } from "../devices/types";

export type FloorSchema = {
  id: string;
  name: string;
  building?: string;
  floorplan_url?: string;
  scale_factor: number;
  devices?: DeviceSchema[];
};

export type FloorPlanTransform = {
  x: number;
  y: number;
  scale: number;
};