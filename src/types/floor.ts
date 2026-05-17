import type { DeviceSchema } from "./device";

export type BaseFloorSchema = {
  id: number;
  name: string;
};

export type FloorSchema = {
  id: number;
  name: string;
  building_id: number;
  floorplan_url: string;
  scale_factor: number;
  devices: DeviceSchema[];
};

export type FloorPlanTransform = {
  x: number;
  y: number;
  scale: number;
};
