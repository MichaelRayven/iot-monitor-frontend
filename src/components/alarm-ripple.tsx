import Konva from "konva";
import React, { useEffect, useRef } from "react";
import { Circle } from "react-konva";

type RippleProps = {
  x?: number;
  y?: number;
  color: string;
};

export const AlarmRipple = ({ x = 0, y = 0, color }: RippleProps) => {
  const circleRef = useRef<Konva.Circle>(null);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;

      const time = frame.time / 1000; // in seconds
      const cycle = time % 1.5; // 1.5 second loop

      const scale = 1 + (cycle / 1.5) * 2; // scale from 1 to 3
      const opacity = 1 - cycle / 1.5; // fade from 1 to 0

      circle.scale({ x: scale, y: scale });
      circle.opacity(opacity);
    }, circle.getLayer());

    anim.start();
    return () => {
      anim.stop();
    };
  }, []);

  return (
    <Circle
      ref={circleRef}
      x={x}
      y={y}
      radius={16}
      stroke={color}
      strokeWidth={2}
      fillEnabled={false}
      listening={false}
    />
  );
};
