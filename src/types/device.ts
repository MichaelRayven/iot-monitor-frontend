export type Device = {
  dev_eui: string;
  name?: string;
  rssi: number;
  snr: number;
  last_data_ts: number;
};

export type FloorDevice = Device & {
  id: number;
  floor_id: number;
  device_type: string;
  is_stationary: boolean;
  x?: number;
  y?: number;
  // Dynamic payload from websocket that can indicate alarms
  send_reason?: number;
  mode?: number;
  // Payload for Smart Badge positioning
  beacons?: {
    mac_or_id: string;
    battery_percent: number;
    temperature_c: number;
    humidity_percent: number;
  }[];
};

export type FloorDeviceWithData = FloorDevice & {
  data: { [item: string]: unknown }[];
};

export type DeviceType = string;
