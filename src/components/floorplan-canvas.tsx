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
import type { FloorDevice } from "@/types/device";
import type { FloorPlanTransform, FloorSchema } from "@/types/floor";
import { AlarmRipple } from "./alarm-ripple";

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

  const getDeviceName = (device: FloorDevice) => device.name ?? device.dev_eui;

  const getDeviceColor = (deviceType: string) => {
    if (deviceType === "Smart-WB0101" || deviceType === "alarm-button") {
      return "#dc2626";
    }

    if (deviceType === "Beacon" || deviceType === "beacon") {
      return "#2563eb";
    }

    return "#16a34a";
  };

  const isDeviceInAlarm = (device: FloorDevice) => {
    if (device.device_type === "Smart-MS0101" && device.send_reason === 1) {
      return true;
    }
    if (
      (device.device_type === "Smart-WB0101" ||
        device.device_type === "alarm-button") &&
      device.mode !== undefined &&
      device.mode >= 2 &&
      device.mode <= 5
    ) {
      return true;
    }
    return false;
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
    >
      {error ? (
        <p className="canvas-message" role="alert">
          {error}
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
              event.evt.preventDefault();
              const stage = event.target.getStage();
              if (!stage) return;

              const oldScale = transform.scale;
              const pointer = stage.getPointerPosition();

              if (!pointer) return;

              const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
              };

              const scaleBy = 1.05;
              const newScale =
                event.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

              // constrain scale
              if (newScale < 0.2 || newScale > 5) return;

              const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
              };

              onTransformChange?.({
                x: newPos.x,
                y: newPos.y,
                scale: newScale,
              });
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
                  .filter((device) => {
                    // Include stationary devices and Smart Badges with beacons
                    if (device.is_stationary) return true;
                    if (
                      device.device_type === "Smart Badge" &&
                      device.beacons &&
                      device.beacons.length > 0
                    )
                      return true;
                    return false;
                  })
                  .map((device) => {
                    let posX = device.x ?? 0;
                    let posY = device.y ?? 0;
                    let isDraggable = device.is_stationary;

                    // If it's a Smart Badge, compute position based on beacons
                    if (
                      device.device_type === "Smart Badge" &&
                      device.beacons &&
                      device.beacons.length > 0
                    ) {
                      isDraggable = false;
                      let sumX = 0;
                      let sumY = 0;
                      let count = 0;

                      device.beacons.forEach((beacon) => {
                        const targetBeacon = devices.find(
                          (d) =>
                            d.is_stationary &&
                            (d.device_type === "Beacon" ||
                              d.device_type === "beacon") &&
                            d.dev_eui.toLowerCase() ===
                              beacon.mac_or_id.toLowerCase()
                        );

                        if (
                          targetBeacon &&
                          targetBeacon.x !== undefined &&
                          targetBeacon.y !== undefined
                        ) {
                          sumX += targetBeacon.x;
                          sumY += targetBeacon.y;
                          count++;
                        }
                      });

                      if (count > 0) {
                        posX = sumX / count;
                        posY = sumY / count;
                      } else {
                        // Don't render if we can't position it based on known beacons
                        return null;
                      }
                    }

                    return (
                      <Group
                        key={device.dev_eui}
                        draggable={isDraggable}
                        x={posX}
                        y={posY}
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
                        {isDeviceInAlarm(device) && (
                          <AlarmRipple x={0} y={0} color="#dc2626" />
                        )}
                        <Circle
                          fill={getDeviceColor(device.device_type)}
                          radius={16}
                        />
                        <Text
                          fontSize={16}
                          fill="#111827"
                          text={getDeviceName(device)}
                          x={24}
                          y={-8}
                        />
                      </Group>
                    );
                  })}
              </Group>
            </Layer>
          </Stage>
        </>
      )}
    </div>
  );
}
