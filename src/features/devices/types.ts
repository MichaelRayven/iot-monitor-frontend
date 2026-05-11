export type DeviceSchema = {
  id: number;
  dev_eui: string;
  name?: string;
  device_type: string;
  rssi?: number | null;
  snr?: number | null;
  floor_id?: string | null;
  is_stationary?: boolean | null;
  x?: number | null;
  y?: number | null;
  data?: Record<string, unknown> | null;
};
