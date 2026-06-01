import type { DragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Stage } from "react-konva";
import { useFloorplanImage } from "@/hooks/useFloorplanImage";
import { getStrategy } from "@/lib/device-strategies";
import type { FloorPlanTransform, FloorSchema } from "@/types/floor";
import { FloorplanDeviceNode } from "./floorplan-device-node";
import { FloorplanGrid } from "./floorplan-grid";

type Props = {
  className?: string;
  floor: FloorSchema;
  transform: FloorPlanTransform;
  onTransformChange?: (transform: FloorPlanTransform) => void;
  onDeviceDrop?: (deviceId: number, x: number, y: number) => void;
  onDeviceMove?: (deviceId: number, x: number, y: number) => void;
  onDeviceClick?: (deviceId: number) => void;
};

export function FloorplanCanvas({
  className,
  floor,
  transform,
  onTransformChange,
  onDeviceClick,
  onDeviceDrop,
  onDeviceMove,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 960, height: 560 });
  const { image, error } = useFloorplanImage(floor.floorplan_url);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toMapCoords = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top - transform.y) / transform.scale,
    };
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const deviceId = e.dataTransfer.getData("application/device-id");
    if (!deviceId) return;
    const coords = toMapCoords(e.clientX, e.clientY);
    if (coords) onDeviceDrop?.(Number(deviceId), coords.x, coords.y);
  };

  const imageScale = floor.scale_factor ? 50 / floor.scale_factor : 1;
  const devices = floor.devices ?? [];

  return (
    <div
      className={className}
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
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
            width={size.width}
            height={size.height}
            x={transform.x}
            y={transform.y}
            scaleX={transform.scale}
            scaleY={transform.scale}
            onDragEnd={(e) =>
              onTransformChange?.({
                x: e.target.x(),
                y: e.target.y(),
                scale: transform.scale,
              })
            }
            onWheel={(e) => {
              e.evt.preventDefault();
              const stage = e.target.getStage();
              const pointer = stage?.getPointerPosition();
              if (!stage || !pointer) return;
              const oldScale = transform.scale;
              const factor = e.evt.deltaY > 0 ? 1 / 1.05 : 1.05;
              const newScale = Math.min(5, Math.max(0.2, oldScale * factor));
              const origin = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
              };
              onTransformChange?.({
                x: pointer.x - origin.x * newScale,
                y: pointer.y - origin.y * newScale,
                scale: newScale,
              });
            }}
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
              <Group>
                <FloorplanGrid
                  transform={transform}
                  canvasWidth={size.width}
                  canvasHeight={size.height}
                />
              </Group>
              <Group>
                {devices.map((device) => {
                  const pos = getStrategy(device.device_type).resolvePosition(
                    device,
                    devices
                  );
                  if (!pos) return null;
                  return (
                    <FloorplanDeviceNode
                      key={device.uid}
                      device={device}
                      x={pos.x}
                      y={pos.y}
                      draggable={pos.draggable}
                      onMove={(x, y) => onDeviceMove?.(device.id, x, y)}
                      onClick={() => onDeviceClick?.(device.id)}
                    />
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
