import { useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Stage } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { FloorPlan, FloorPlanTransform } from "../types";

type FloorPlanCanvasProps = {
  floorPlan: FloorPlan;
  transform: FloorPlanTransform;
  onTransformChange?: (transform: FloorPlanTransform) => void;
};

type CanvasSize = {
  width: number;
  height: number;
};

const DEFAULT_CANVAS_SIZE: CanvasSize = {
  width: 960,
  height: 560,
};

export function FloorPlanCanvas({
  floorPlan,
  transform,
  onTransformChange,
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(DEFAULT_CANVAS_SIZE);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();

      if (width > 0 && height > 0) {
        setCanvasSize({ width, height });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const nextImage = new Image();
    nextImage.onload = () => {
      setImage(nextImage);
    };
    nextImage.onerror = () => {
      setError(`Failed to load floor plan image: ${floorPlan.imageUrl}`);
    };
    nextImage.src = floorPlan.imageUrl;

    return () => {
      setImage(null);
    };
  }, [floorPlan.imageUrl]);

  const handleDragEnd = (event: KonvaEventObject<DragEvent>) => {
    onTransformChange?.({
      x: event.target.x(),
      y: event.target.y(),
      scale: transform.scale,
    });
  };

  return (
    <div className="floor-plan-canvas" ref={containerRef}>
      {error ? (
        <p className="canvas-message" role="alert">
          Failed to load floor plan image.
        </p>
      ) : (
        <>
          {!image && (
            <p className="canvas-message" data-testid="canvas-loading">
              Loading floor plan...
            </p>
          )}
          <Stage width={canvasSize.width} height={canvasSize.height}>
            <Layer>
              <Group
                draggable
                x={transform.x}
                y={transform.y}
                scaleX={transform.scale}
                scaleY={transform.scale}
                onDragEnd={handleDragEnd}
              >
                {image && (
                  <KonvaImage
                    image={image}
                    width={floorPlan.width}
                    height={floorPlan.height}
                  />
                )}
              </Group>
            </Layer>
          </Stage>
        </>
      )}
    </div>
  );
}
