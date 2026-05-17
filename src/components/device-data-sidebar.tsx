import { BatteryIcon, ClockIcon, ThermometerIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FloorDeviceWithData } from "@/types/device";

type DeviceDataSidebarProps = {
  deviceData: FloorDeviceWithData;
  onClose: () => void;
};

function formatTimestamp(ts: unknown) {
  if (typeof ts === "number") {
    // Determine if it's seconds or milliseconds. Assume seconds if very small
    const date = new Date(ts > 10000000000 ? ts : ts * 1000);
    return date.toLocaleString();
  }
  return String(ts);
}

// Generic component to show a label and a value
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

// Component to highlight important status text
function StatusBadge({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2 bg-secondary/20 rounded-md px-3 my-1">
      <span className="text-sm font-semibold text-secondary-foreground">
        {label}
      </span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

export function DeviceDataSidebar({
  deviceData,
  onClose,
}: DeviceDataSidebarProps) {
  return (
    <aside className="absolute top-0 bottom-0 w-80 overflow-y-auto right-0 bg-background/95 backdrop-blur border-l shadow-lg">
      <div className="p-4 h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold truncate">
            {deviceData.name || deviceData.dev_eui}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {deviceData.data.map((item, idx) => {
            const isLatest = idx === 0;

            // Common attributes
            const packetType = item.packet as string | undefined;
            const timestamp = item.device_timestamp as number | undefined;
            const battery = item.battery_percent as number | undefined;
            const temp = item.temperature_c as number | undefined;

            // Status attributes
            const modeLabel = item.mode_label as string | undefined;
            const sendReasonLabel = item.send_reason_label as
              | string
              | undefined;

            // Exclude these from the generic "rest" rendering
            const knownKeys = new Set([
              "device",
              "packet",
              "device_timestamp",
              "battery_percent",
              "temperature_c",
              "mode_label",
              "send_reason_label",
              "mode",
              "send_reason",
              "beacons",
            ]);

            return (
              <Card
                key={idx}
                className={
                  isLatest ? "border-primary/50 shadow-md" : "opacity-80"
                }
              >
                {packetType && (
                  <CardHeader className="py-3 px-4 bg-muted/30">
                    <CardTitle className="text-sm font-semibold capitalize tracking-tight">
                      {packetType.replace(/_/g, " ")}
                    </CardTitle>
                  </CardHeader>
                )}
                <CardContent className="p-4 flex flex-col gap-2">
                  {/* Common Info Header */}
                  <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                    {timestamp && (
                      <div
                        className="flex items-center gap-1"
                        title="Timestamp"
                      >
                        <ClockIcon className="h-3 w-3" />
                        {formatTimestamp(timestamp)}
                      </div>
                    )}
                    {battery !== undefined && (
                      <div className="flex items-center gap-1" title="Battery">
                        <BatteryIcon className="h-3 w-3" />
                        {battery}%
                      </div>
                    )}
                    {temp !== undefined && (
                      <div
                        className="flex items-center gap-1"
                        title="Temperature"
                      >
                        <ThermometerIcon className="h-3 w-3" />
                        {temp}°C
                      </div>
                    )}
                  </div>

                  {/* Statuses */}
                  {modeLabel && (
                    <StatusBadge
                      label="Mode"
                      value={modeLabel.replace(/_/g, " ")}
                    />
                  )}
                  {sendReasonLabel && (
                    <StatusBadge
                      label="Reason"
                      value={sendReasonLabel.replace(/_/g, " ")}
                    />
                  )}

                  {/* Other Data */}
                  <div className="mt-2 flex flex-col gap-1">
                    {Object.entries(item).map(([key, value]) => {
                      if (knownKeys.has(key)) return null;
                      if (typeof value === "object" && value !== null)
                        return null; // handled separately if needed
                      return (
                        <InfoRow
                          key={key}
                          label={key.replace(/_/g, " ")}
                          value={String(value)}
                        />
                      );
                    })}
                  </div>

                  {/* Beacons list for Smart Badge */}
                  {Array.isArray(item.beacons) && item.beacons.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold mb-2">Beacons</h4>
                      <div className="flex flex-col gap-2">
                        {item.beacons.map(
                          (beacon: Record<string, unknown>, bIdx: number) => (
                            <div
                              key={bIdx}
                              className="bg-muted/50 p-2 rounded text-xs"
                            >
                              <InfoRow
                                label="MAC/ID"
                                value={beacon.mac_or_id}
                              />
                              <InfoRow
                                label="Battery"
                                value={`${beacon.battery_percent}%`}
                              />
                              <InfoRow
                                label="Temp/Hum"
                                value={`${beacon.temperature_c}°C / ${beacon.humidity_percent}%`}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {deviceData.data.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            No data available.
          </div>
        )}
      </div>
    </aside>
  );
}
