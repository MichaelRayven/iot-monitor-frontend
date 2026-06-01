import type { BaseFloorSchema } from "./floor";

export type BuildingSchema = {
  id: number;
  name: string;
  address: string;
  floors: BaseFloorSchema[];
};
