import { Circle, Group, Text } from "react-konva";
import { getStrategy } from "@/lib/device-strategies";
import { STALE_TIMEOUT_SECONDS } from "@/lib/settings";
import type { FloorDevice } from "@/types/device";
import { AlarmRipple } from "./alarm-ripple";

type Props = {
  device: FloorDevice;
  x: number;
  y: number;
  draggable: boolean;
  onMove: (x: number, y: number) => void;
  onClick: () => void;
};

function isStale(device: FloorDevice): boolean {
  if (!device.last_data_ts) return true;
  return Date.now() / 1000 - device.last_data_ts > STALE_TIMEOUT_SECONDS;
}

export function FloorplanDeviceNode({
  device,
  x,
  y,
  draggable,
  onMove,
  onClick,
}: Props) {
  const label = device.name ?? device.uid;
  const strategy = getStrategy(device.device_type);
  const stale = isStale(device);

  const decoded = device as FloorDevice & Record<string, unknown>;

  return (
    <Group
      key={device.uid}
      draggable={draggable}
      x={x}
      y={y}
      opacity={stale ? 0.35 : 1}
      onDragEnd={(e) => {
        e.cancelBubble = true;
        onMove(e.target.x(), e.target.y());
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        onClick();
      }}
    >
      {strategy.isInAlarm(decoded) && (
        <AlarmRipple x={0} y={0} color="#dc2626" />
      )}
      {strategy.hasActivityPulse(stale) && (
        <AlarmRipple x={0} y={0} color="#22d3ee" />
      )}
      <Circle fill={strategy.color} radius={16} />
      <Text fontSize={16} fill="#111827" text={label} x={24} y={-8} />
    </Group>
  );
}
