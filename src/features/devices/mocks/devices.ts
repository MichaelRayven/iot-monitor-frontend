import type { Device } from "../types";

export const mockDevices: Device[] = [
  {
    id: "beacon-1",
    name: "Beacon A1",
    type: "beacon",
    floorPlanId: "floor-1",
    x: 320,
    y: 260,
  },
  {
    id: "alarm-1",
    name: "Alarm Button A1",
    type: "alarm-button",
    floorPlanId: "floor-1",
    x: 540,
    y: 410,
  },
  {
    id: "badge-1",
    name: "Badge 101",
    type: "badge",
    floorPlanId: "floor-1",
  },
  {
    id: "beacon-2",
    name: "Beacon B1",
    type: "beacon",
    floorPlanId: "floor-2",
    x: 440,
    y: 300,
  },
  {
    id: "alarm-2",
    name: "Alarm Button B1",
    type: "alarm-button",
    floorPlanId: "floor-2",
  },
  {
    id: "badge-2",
    name: "Badge 202",
    type: "badge",
    floorPlanId: "floor-2",
  },
];
