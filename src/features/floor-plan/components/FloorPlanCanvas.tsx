import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import {
  Circle,
  Group,
  Image as KonvaImage,
  Layer,
  Stage,
  Text,
} from "react-konva";
import type { FloorPlan, FloorPlanTransform } from "../types";
import type { Device, DeviceType } from "../../devices/types";

type FloorPlanCanvasProps = {
  floorPlan: FloorPlan;
  transform: FloorPlanTransform;
  devices: Device[];
  onTransformChange?: (transform: FloorPlanTransform) => void;
  onDeviceDrop?: (deviceId: string, x: number, y: number) => void;
  onDeviceMove?: (deviceId: string, x: number, y: number) => void;
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
  devices,
  onTransformChange,
  onDeviceDrop,
  onDeviceMove,
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

  const toMapCoordinates = (clientX: number, clientY: number) => {
    const container = containerRef.current;

    if (!container) {
      return null;
    }

    const rect = container.getBoundingClientRect();
    const stageX = clientX - rect.left;
    const stageY = clientY - rect.top;

    return {
      x: (stageX - transform.x) / transform.scale,
      y: (stageY - transform.y) / transform.scale,
    };
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const deviceId = event.dataTransfer.getData("application/device-id");

    if (!deviceId) {
      return;
    }

    const coordinates = toMapCoordinates(event.clientX, event.clientY);

    if (!coordinates) {
      return;
    }

    onDeviceDrop?.(deviceId, coordinates.x, coordinates.y);
  };

  const getDeviceColor = (deviceType: DeviceType) => {
    if (deviceType === "alarm-button") {
      return "#dc2626";
    }

    if (deviceType === "beacon") {
      return "#2563eb";
    }

    return "#16a34a";
  };

  return (
    <div
      className="floor-plan-canvas"
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
                onDragEnd={(event) => {
                  onTransformChange?.({
                    x: event.target.x(),
                    y: event.target.y(),
                    scale: transform.scale,
                  });
                }}
              >
                {image && (
                  <KonvaImage
                    image={image}
                    width={floorPlan.width}
                    height={floorPlan.height}
                  />
                )}
                {devices
                  .filter(
                    (device) =>
                      typeof device.x === "number" &&
                      typeof device.y === "number"
                  )
                  .map((device) => (
                    <Group
                      key={device.id}
                      draggable
                      x={device.x}
                      y={device.y}
                      onDragEnd={(event) => {
                        event.cancelBubble = true;
                        onDeviceMove?.(
                          device.id,
                          event.target.x(),
                          event.target.y()
                        );
                      }}
                    >
                      <Circle fill={getDeviceColor(device.type)} radius={12} />
                      <Text
                        fontSize={12}
                        fill="#111827"
                        text={device.name}
                        x={18}
                        y={-6}
                      />
                    </Group>
                  ))}
              </Group>
            </Layer>
          </Stage>
        </>
      )}
    </div>
  );
}
