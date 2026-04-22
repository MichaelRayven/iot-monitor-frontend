export type DeviceType = "badge" | "beacon" | "alarm-button";

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  floorPlanId: string;
  x?: number;
  y?: number;
};
