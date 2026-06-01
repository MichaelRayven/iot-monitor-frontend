import type { FloorDevice } from "@/types/device";

type DerivedStatus = {
  modeLabel?: string;
  reasonLabel?: string;
};

export abstract class DeviceStrategy {
  abstract readonly color: string;

  abstract isInAlarm(data: Record<string, unknown>): boolean;

  abstract hasActivityPulse(isStale: boolean): boolean;

  abstract deriveStatus(data: Record<string, unknown>): DerivedStatus;

  resolvePosition(
    device: FloorDevice,
    _allDevices: FloorDevice[]
  ): { x: number; y: number; draggable: boolean } | null {
    if (!device.is_stationary) return null;
    return { x: device.x ?? 0, y: device.y ?? 0, draggable: true };
  }
}

class BeaconStrategy extends DeviceStrategy {
  readonly color = "#2563eb";

  isInAlarm() {
    return false;
  }

  hasActivityPulse(isStale: boolean) {
    return !isStale;
  }

  deriveStatus(): DerivedStatus {
    return {};
  }
}

class SmartBadgeStrategy extends DeviceStrategy {
  readonly color = "#8b5cf6";

  isInAlarm() {
    return false;
  }

  hasActivityPulse() {
    return false;
  }

  deriveStatus(data: Record<string, unknown>): DerivedStatus {
    const reason = data.reason as number | undefined;
    const stateRaw = data.state_raw as number | undefined;

    let reasonLabel: string | undefined;
    switch (reason) {
      case 0:
        reasonLabel = "По времени";
        break;
      case 1:
        reasonLabel = "Обнаружено движение";
        break;
      case 2:
        reasonLabel = "Движение прекращено";
        break;
      case 3:
        reasonLabel = "Обнаружен отрыв";
        break;
      case 4:
        reasonLabel = "Обнаружен удар";
        break;
      case 5:
        reasonLabel = "Активированна тревога (поиск)";
        break;
      case 6:
        reasonLabel = "Активированна тревога (потеря СИЗ)";
        break;
    }

    let modeLabel: string | undefined;
    switch (stateRaw) {
      case 1:
        modeLabel = "Вызов";
        break;
      case 2:
        modeLabel = "Предупреждение";
        break;
      case 3:
        modeLabel = "Поиск";
        break;
      default:
        modeLabel = "Ожидание";
        break;
    }

    return { modeLabel, reasonLabel };
  }

  resolvePosition(
    device: FloorDevice,
    allDevices: FloorDevice[]
  ): { x: number; y: number; draggable: boolean } | null {
    const decoded = device as FloorDevice & Record<string, unknown>;
    const beacons = decoded["beacons"] as Record<string, unknown>[] | undefined;
    if (!beacons?.length) return null;

    let sumX = 0,
      sumY = 0,
      count = 0;
    for (const b of beacons) {
      const mac = b["mac_or_id"] as string | undefined;
      const anchor = allDevices.find(
        (d) =>
          d.is_stationary &&
          d.device_type === "Beacon" &&
          d.uid.toLowerCase() === mac?.toLowerCase()
      );
      if (anchor && anchor.x !== null && anchor.y !== null) {
        sumX += anchor.x;
        sumY += anchor.y;
        count++;
      }
    }

    if (count === 0) return null;
    return { x: sumX / count, y: sumY / count, draggable: false };
  }
}

class SmartWB0101Strategy extends DeviceStrategy {
  readonly color = "#dc2626";

  isInAlarm(data: Record<string, unknown>) {
    const mode = data["mode"] as number | undefined;
    return typeof mode === "number" && mode >= 2 && mode <= 5;
  }

  hasActivityPulse() {
    return false;
  }

  deriveStatus(data: Record<string, unknown>): DerivedStatus {
    const mode = data.mode as number | undefined;
    let modeLabel: string | undefined;
    switch (mode) {
      case 2:
      case 3:
        modeLabel = "Тревога";
        break;
      case 5:
        modeLabel = "Тревога принята";
        break;
      case 6:
        modeLabel = "Тестирование";
        break;
      default:
        modeLabel = "Ожидание";
        break;
    }
    return { modeLabel };
  }
}

class SmartMS0101Strategy extends DeviceStrategy {
  readonly color = "#16a34a";

  isInAlarm(data: Record<string, unknown>) {
    return data["send_reason"] === 1;
  }

  hasActivityPulse() {
    return false;
  }

  deriveStatus(data: Record<string, unknown>): DerivedStatus {
    const reason = data.send_reason as number | undefined;
    const state = data.state as string | undefined;

    const reasonLabel = reason === 1 ? "Замечено движение" : "Ожидание";

    let modeLabel: string | undefined;
    if (state === "Guard") modeLabel = "Охрана";
    else if (state === "Neutral") modeLabel = "Нейтральный";

    return { modeLabel, reasonLabel };
  }
}

class DefaultStrategy extends DeviceStrategy {
  readonly color = "#16a34a";

  isInAlarm() {
    return false;
  }

  hasActivityPulse() {
    return false;
  }

  deriveStatus(data: Record<string, unknown>): DerivedStatus {
    return {
      modeLabel: data.mode_label as string | undefined,
      reasonLabel: data.send_reason_label as string | undefined,
    };
  }
}

const strategies: Record<string, DeviceStrategy> = {
  Beacon: new BeaconStrategy(),
  "Smart Badge": new SmartBadgeStrategy(),
  "Smart-WB0101": new SmartWB0101Strategy(),
  "Smart-MS0101": new SmartMS0101Strategy(),
};

const defaultStrategy = new DefaultStrategy();

export function getStrategy(deviceType: string): DeviceStrategy {
  return strategies[deviceType] ?? defaultStrategy;
}
