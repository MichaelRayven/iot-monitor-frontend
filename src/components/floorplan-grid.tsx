import { Line } from "react-konva";
import type { FloorPlanTransform } from "@/types/floor";

type FloorplanGridProps = {
  transform: FloorPlanTransform;
  canvasWidth: number;
  canvasHeight: number;
};

export function FloorplanGrid({
  transform,
  canvasWidth,
  canvasHeight,
}: FloorplanGridProps) {
  const gridSize = 50;
  if (gridSize * transform.scale < 10) return null;

  const xPadding = canvasWidth * (1 / transform.scale);
  const yPadding = canvasHeight * (1 / transform.scale);

  const startX = -transform.x * (1 / transform.scale) - xPadding;
  const startY = -transform.y * (1 / transform.scale) - yPadding;
  const endX = startX + canvasWidth * (1 / transform.scale) + xPadding * 2;
  const endY = startY + canvasHeight * (1 / transform.scale) + yPadding * 2;

  const firstX = Math.ceil(startX / gridSize) * gridSize;
  const firstY = Math.ceil(startY / gridSize) * gridSize;
  const strokeWidth = 1 / transform.scale;
  const stroke = "rgba(50, 50, 50, 0.25)";

  const lines = [];
  for (let x = firstX; x <= endX; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }
  for (let y = firstY; y <= endY; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  return <>{lines}</>;
}
