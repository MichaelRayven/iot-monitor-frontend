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
import type { FloorPlanTransform, FloorSchema } from "../types";
import type { DeviceSchema } from "@/features/devices/types";

type FloorPlanCanvasProps = {
  className?: string;
  floorPlan: FloorSchema;
  transform: FloorPlanTransform;
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
  className,
  floorPlan,
  transform,
  onTransformChange,
  onDeviceDrop,
  onDeviceMove,
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(DEFAULT_CANVAS_SIZE);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const devices = floorPlan.devices ?? []

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
    const imageUrl = floorPlan.floorplan_url;

    if (!imageUrl) {
      setImage(null);
      setError("No floor plan image has been uploaded.");
      return;
    }

    setError(null);
    nextImage.onload = () => {
      setImage(nextImage);
    };
    nextImage.onerror = () => {
      setError(`Failed to load floor plan image: ${imageUrl}`);
    };
    nextImage.src = imageUrl;

    return () => {
      setImage(null);
    };
  }, [floorPlan.floorplan_url]);

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

  const getDeviceType = (device: DeviceSchema) =>
    device.device_type ?? device.device_type ?? "unknown";

  const getDeviceName = (device: DeviceSchema) => device.name ?? device.dev_eui;

  const getDeviceColor = (deviceType: string) => {
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
      className={className}
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onWheel={(e) => e.preventDefault()}
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
          <Stage
            draggable
            onDragEnd={(event) => {
              onTransformChange?.({
                x: event.target.x(),
                y: event.target.y(),
                scale: transform.scale
              }
              )
            }}
            onWheel={(event) => {
              if (event.evt.deltaY > 0) {
                if (transform.scale > 0.5) {
                  onTransformChange?.({
                    x: transform.x,
                    y: transform.y,
                    scale: transform.scale - 0.01
                  }
                  )
                }
              } else {
                if (transform.scale < 2.0) {
                  onTransformChange?.({
                    x: transform.x,
                    y: transform.y,
                    scale: transform.scale + 0.01
                  })
                }

              }
            }}
            width={canvasSize.width}
            height={canvasSize.height}
            x={transform.x}
            y={transform.y}
            scaleX={transform.scale}
            scaleY={transform.scale}>
            <Layer>
              <Group>
                {image && (
                  <KonvaImage
                    image={image}
                  />
                )}
                {devices
                  .filter(
                    (device) => device.is_stationary
                  )
                  .map((device) => (
                    <Group
                      key={device.dev_eui}
                      draggable
                      x={device.x ?? 0}
                      y={device.y ?? 0}
                      onDragEnd={(event) => {
                        event.cancelBubble = true;
                        onDeviceMove?.(
                          device.dev_eui,
                          event.target.x(),
                          event.target.y()
                        );
                      }}
                    >
                      <Circle
                        fill={getDeviceColor(getDeviceType(device))}
                        radius={12}
                      />
                      <Text
                        fontSize={12}
                        fill="#111827"
                        text={getDeviceName(device)}
                        x={18}
                        y={-6}
                      />
                    </Group>
                  ))}
              </Group>
            </Layer>
          </Stage>
        </>
      )
      }
    </div >
  );
}
