import type { FloorPlanTransform } from "../types";

type MockFloorPlan = {
  floorplan_url: string;
  height: number;
  initialTransform: FloorPlanTransform;
  width: number;
};

export const mockFloorPlans: MockFloorPlan[] = [
  {
    floorplan_url: "/floor-1.jpg",
    width: 1800,
    height: 1200,
    initialTransform: {
      x: 0,
      y: 0,
      scale: 0.5,
    },
  },
  {
    floorplan_url: "/floor-2.jpg",
    width: 1800,
    height: 1200,
    initialTransform: {
      x: 0,
      y: 0,
      scale: 0.5,
    },
  },
];
