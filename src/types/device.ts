// Raw Vega server device (from GET /devices/vega)
export type VegaDevice = {
  dev_eui: string;
  name: string | null;
  rssi: number | null;
  snr: number | null;
  last_data_ts: number | null; // Unix epoch seconds
};

export type NearbyBadge = {
  badge_uid: string;
  badge_name: string | null;
  timestamp: number | null; // Unix epoch seconds
  rssi: number | null;
  battery_percent: number | null;
  temperature_c: number | null;
};

// Device placed on a floor (both Vega sensors and Beacons)
export type FloorDevice = {
  id: number;
  floor_id: number;
  uid: string; // dev_eui for Vega sensors; MAC address for Beacons
  name: string | null;
  device_type: string; // "Beacon" | "Smart Badge" | "Smart-WB0101" | "Smart-MS0101"
  is_stationary: boolean;
  x: number | null;
  y: number | null;
  // Vega signal quality — null for beacons
  rssi: number | null;
  snr: number | null;
  last_data_ts: number | null; // Unix epoch seconds
};

export type FloorDeviceWithData = FloorDevice & {
  // Vega sensors: last 50 decoded payloads
  data: Record<string, unknown>[];
  // Beacons: Smart Badge devices that recently saw this beacon
  nearby_badges: NearbyBadge[];
};

export type DeviceType = string;
