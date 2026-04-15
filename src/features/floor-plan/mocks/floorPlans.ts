import type { FloorPlan } from "../types";

export const mockFloorPlans: FloorPlan[] = [
  {
    id: "floor-1",
    name: "Floor 1",
    imageUrl: "/floor-1.jpg",
    width: 1800,
    height: 1200,
    initialTransform: {
      x: 0,
      y: 0,
      scale: 0.5,
    },
  },
  {
    id: "floor-2",
    name: "Floor 2",
    imageUrl: "/floor-2.jpg",
    width: 1800,
    height: 1200,
    initialTransform: {
      x: 0,
      y: 0,
      scale: 0.5,
    },
  },
];
