import type { DragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Group,
  Image as KonvaImage,
  Layer,
  Line,
  Stage,
  Text,
} from "react-konva";
import type { DeviceSchema } from "@/types/device";
import type { FloorPlanTransform, FloorSchema } from "@/types/floor";

type FloorPlanCanvasProps = {
  className?: string;
  floor: FloorSchema;
  transform: FloorPlanTransform;
  onTransformChange?: (transform: FloorPlanTransform) => void;
  onDeviceDrop?: (deviceId: number, x: number, y: number) => void;
  onDeviceMove?: (deviceId: number, x: number, y: number) => void;
  onDeviceClick?: (deviceId: number) => void;
};

type CanvasSize = {
  width: number;
  height: number;
};

const DEFAULT_CANVAS_SIZE: CanvasSize = {
  width: 960,
  height: 560,
};

export function FloorplanCanvas({
  className,
  floor,
  transform,
  onTransformChange,
  onDeviceClick,
  onDeviceDrop,
  onDeviceMove,
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(DEFAULT_CANVAS_SIZE);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const devices = floor.devices ?? [];

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
    const imageUrl = floor.floorplan_url;

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
  }, [floor.floorplan_url]);

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

    onDeviceDrop?.(Number(deviceId), coordinates.x, coordinates.y);
  };

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

  const renderGrid = () => {
    if (!image) return null;

    const gridSize = 50; // Fixed visual size in pixels
    if (gridSize * transform.scale < 10) return null; // Hide if visual size is < 10px

    const stageWidth = canvasSize.width;
    const stageHeight = canvasSize.height;
    const xPadding = canvasSize.width * (1 / transform.scale);
    const yPadding = canvasSize.height * (1 / transform.scale);

    // Calculate visible bounds in stage coordinates
    const stageStartX = -transform.x * (1 / transform.scale) - xPadding;
    const stageStartY = -transform.y * (1 / transform.scale) - yPadding;
    const stageEndX =
      stageStartX + stageWidth * (1 / transform.scale) + xPadding * 2;
    const stageEndY =
      stageStartY + stageHeight * (1 / transform.scale) + yPadding * 2;

    // Calculate grid line positions relative to stage origin
    const firstGridX = Math.ceil(stageStartX / gridSize) * gridSize;
    const firstGridY = Math.ceil(stageStartY / gridSize) * gridSize;

    const verticalLines = [];
    const horizontalLines = [];
    const strokeWidth = 1 / transform.scale; // Maintain 1px visual thickness

    // Generate vertical grid lines
    for (let x = firstGridX; x <= stageEndX; x += gridSize) {
      verticalLines.push(
        <Line
          key={`v-${x}`}
          points={[x, stageStartY, x, stageEndY]}
          stroke="rgba(50, 50, 50, 0.25)"
          strokeWidth={strokeWidth}
        />
      );
    }

    // Generate horizontal grid lines
    for (let y = firstGridY; y <= stageEndY; y += gridSize) {
      horizontalLines.push(
        <Line
          key={`h-${y}`}
          points={[stageStartX, y, stageEndX, y]}
          stroke="rgba(50, 50, 50, 0.25)"
          strokeWidth={strokeWidth}
        />
      );
    }

    return [...verticalLines, ...horizontalLines];
  };

  const imageScale = floor.scale_factor ? 50 / floor.scale_factor : 1;

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
                scale: transform.scale,
              });
            }}
            onWheel={(event) => {
              if (event.evt.deltaY > 0) {
                if (transform.scale > 0.25) {
                  onTransformChange?.({
                    x: transform.x,
                    y: transform.y,
                    scale: transform.scale - 0.05,
                  });
                }
              } else {
                if (transform.scale < 2.0) {
                  onTransformChange?.({
                    x: transform.x,
                    y: transform.y,
                    scale: transform.scale + 0.05,
                  });
                }
              }
            }}
            width={canvasSize.width}
            height={canvasSize.height}
            x={transform.x}
            y={transform.y}
            scaleX={transform.scale}
            scaleY={transform.scale}
          >
            <Layer>
              <Group>
                {image && (
                  <KonvaImage
                    image={image}
                    scaleX={imageScale}
                    scaleY={imageScale}
                  />
                )}
              </Group>
              <Group>{renderGrid()}</Group>
              <Group>
                {devices
                  .filter((device) => device.is_stationary)
                  .map((device) => (
                    <Group
                      key={device.dev_eui}
                      draggable
                      x={device.x ?? 0}
                      y={device.y ?? 0}
                      onDragEnd={(event) => {
                        event.cancelBubble = true;
                        onDeviceMove?.(
                          device.id,
                          event.target.x(),
                          event.target.y()
                        );
                      }}
                      onClick={(event) => {
                        event.cancelBubble = true;
                        onDeviceClick?.(device.id);
                      }}
                    >
                      <Circle
                        fill={getDeviceColor(device.device_type)}
                        radius={16}
                      />
                      <Text
                        fontSize={12}
                        fill="#111827"
                        text={getDeviceName(device)}
                        x={24}
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
