import { useEffect, useRef, useState } from "react";
import { Circle, Image as KonvaImage, Layer, Line, Stage } from "react-konva";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Point = { x: number; y: number };

type ScaleToolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onScaleDetermined: (scaleFactor: number) => void;
};

export function ScaleToolDialog({
  open,
  onOpenChange,
  imageUrl,
  onScaleDetermined,
}: ScaleToolDialogProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [distanceMeters, setDistanceMeters] = useState<string>("");
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!open) {
      setPoints([]);
      setDistanceMeters("");
      return;
    }

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });

        // Auto scale to fit inside container
        const scaleX = width / img.width;
        const scaleY = height / img.height;
        setScale(Math.min(scaleX, scaleY, 1)); // don't scale up past 1x
      }
    };
  }, [imageUrl, open]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setCanvasSize({ width, height });
      if (image) {
        const scaleX = width / image.width;
        const scaleY = height / image.height;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [image]);

  const handleStageClick = (
    e: import("konva/lib/Node").KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const offsetX = image ? (canvasSize.width - image.width * scale) / 2 : 0;
    const offsetY = image ? (canvasSize.height - image.height * scale) / 2 : 0;

    const newPoint = {
      x: (pointerPos.x - offsetX) / scale,
      y: (pointerPos.y - offsetY) / scale,
    };

    if (points.length >= 2) {
      // Reset if already have 2 points
      setPoints([newPoint]);
      return;
    }

    setPoints([...points, newPoint]);
  };

  const handleConfirm = () => {
    if (points.length !== 2 || !distanceMeters) return;

    const meters = parseFloat(distanceMeters);
    if (isNaN(meters) || meters <= 0) return;

    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);

    const scaleFactor = Math.round(pixelDistance / meters);
    onScaleDetermined(Math.max(1, scaleFactor));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Настройка масштаба</DialogTitle>
          <DialogDescription>
            Кликните две точки на плане, чтобы нарисовать линию, затем укажите
            реальное расстояние в метрах.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={containerRef}
          className="w-full h-[60vh] bg-muted relative rounded-md overflow-hidden flex items-center justify-center cursor-crosshair border"
        >
          {canvasSize.width > 0 && image && (
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleStageClick}
              onTouchStart={handleStageClick}
            >
              <Layer>
                <KonvaImage
                  image={image}
                  scaleX={scale}
                  scaleY={scale}
                  x={(canvasSize.width - image.width * scale) / 2}
                  y={(canvasSize.height - image.height * scale) / 2}
                />
              </Layer>
              <Layer>
                {/* Adjust points to stage offset for drawing */}
                {points.map((p, i) => (
                  <Circle
                    key={i}
                    x={
                      p.x * scale + (canvasSize.width - image.width * scale) / 2
                    }
                    y={
                      p.y * scale +
                      (canvasSize.height - image.height * scale) / 2
                    }
                    radius={5}
                    fill="red"
                  />
                ))}
                {points.length === 2 && (
                  <Line
                    points={[
                      points[0].x * scale +
                        (canvasSize.width - image.width * scale) / 2,
                      points[0].y * scale +
                        (canvasSize.height - image.height * scale) / 2,
                      points[1].x * scale +
                        (canvasSize.width - image.width * scale) / 2,
                      points[1].y * scale +
                        (canvasSize.height - image.height * scale) / 2,
                    ]}
                    stroke="red"
                    strokeWidth={2}
                  />
                )}
              </Layer>
            </Stage>
          )}
          {!image && (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              Загрузка изображения...
            </div>
          )}
        </div>

        <div className="flex items-end gap-4 mt-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">
              Расстояние (в метрах)
            </label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Например: 5"
              value={distanceMeters}
              onChange={(e) => setDistanceMeters(e.target.value)}
              disabled={points.length < 2}
            />
          </div>
          <Button
            onClick={handleConfirm}
            disabled={
              points.length < 2 ||
              !distanceMeters ||
              parseFloat(distanceMeters) <= 0
            }
          >
            Применить масштаб
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
