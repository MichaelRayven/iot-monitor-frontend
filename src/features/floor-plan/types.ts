import type { DeviceSchema } from "../devices/types";

export type BaseFloorSchema = {
  id: number;
  name: string;
};

export type FloorSchema = {
  id: string;
  name: string;
  building: string;
  floorplan_url: string;
  scale_factor: number;
  devices: DeviceSchema[];
};

export type FloorPlanTransform = {
  x: number;
  y: number;
  scale: number;
};

// Buildings

export type BuildingSchema = {
  id: number;
  name: string;
  address: string;
};
