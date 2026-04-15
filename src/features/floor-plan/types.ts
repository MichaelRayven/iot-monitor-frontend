export type FloorPlanTransform = {
  x: number;
  y: number;
  scale: number;
};

export type FloorPlan = {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  initialTransform: FloorPlanTransform;
};
