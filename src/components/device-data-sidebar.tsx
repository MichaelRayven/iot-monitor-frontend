import {
  BatteryIcon,
  ClockIcon,
  FileClockIcon,
  ThermometerIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getSmartBadgeReason,
  getSmartBadgeStatus,
  getSmartMS0101Reason,
  getSmartMS0101State,
  getSmartWB0101Mode,
} from "@/lib/device-status-mappings";
import { formatTimestamp } from "@/lib/utils";
import type { FloorDeviceWithData } from "@/types/device";
import { DeviceDataHistoryModal } from "./device-data-history-modal";

type DeviceDataSidebarProps = {
  deviceData: FloorDeviceWithData;
  onClose: () => void;
};

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
    <div className="flex justify-between items-center py-2 bg-secondary/20 rounded-md my-1">
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const latestData = deviceData.data[0];

  return (
    <>
      <aside className="absolute top-0 bottom-0 w-80 overflow-y-auto right-0 bg-background/95 backdrop-blur border-l shadow-lg">
        <div className="p-4 h-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold truncate">
                {deviceData.name || deviceData.dev_eui}
              </h2>
              <h4 className="text-muted-foreground truncate">
                {deviceData.name && deviceData.dev_eui}
              </h4>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {latestData ? (
              (() => {
                const item = latestData;

                // Common attributes
                const timestamp = item.device_timestamp as number | undefined;
                const battery = item.battery_percent as number | undefined;
                const temp = item.temperature_c as number | undefined;

                // Map Status attributes depending on device type
                let uiModeLabel: string | undefined = undefined;
                let uiReasonLabel: string | undefined = undefined;

                if (deviceData.device_type === "Smart Badge") {
                  uiReasonLabel = getSmartBadgeReason(item.reason as number);
                  uiModeLabel = getSmartBadgeStatus(item.state_raw as number);
                } else if (
                  deviceData.device_type === "Smart-WB0101" ||
                  deviceData.device_type === "alarm-button"
                ) {
                  uiModeLabel = getSmartWB0101Mode(item.mode as number);
                } else if (deviceData.device_type === "Smart-MS0101") {
                  uiReasonLabel = getSmartMS0101Reason(
                    item.send_reason as number
                  );
                  uiModeLabel = getSmartMS0101State(item.state as string);
                } else {
                  // Fallback
                  uiModeLabel = item.mode_label as string | undefined;
                  uiReasonLabel = item.send_reason_label as string | undefined;
                }

                return (
                  <>
                    {/* Common Info Header */}
                    <div className="flex gap-4 text-sm text-muted-foreground mb-2">
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
                        <div
                          className="flex items-center gap-1"
                          title="Battery"
                        >
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
                    {uiModeLabel && (
                      <StatusBadge
                        label="Статус"
                        value={uiModeLabel.replace(/_/g, " ")}
                      />
                    )}
                    {uiReasonLabel && (
                      <StatusBadge
                        label="Событие"
                        value={uiReasonLabel.replace(/_/g, " ")}
                      />
                    )}

                    {/* Beacons list for Smart Badge */}
                    {Array.isArray(item.beacons) && item.beacons.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-xs font-semibold mb-2">Маячки</h4>
                        <div className="flex flex-col gap-2">
                          {item.beacons.map(
                            (beacon: Record<string, unknown>, bIdx: number) => (
                              <div
                                key={bIdx}
                                className="bg-muted/50 p-2 rounded text-xs"
                              >
                                <InfoRow label="MAC" value={`${beacon.mac}`} />
                                <InfoRow
                                  label="Заряд"
                                  value={`${beacon.battery_percent}%`}
                                />
                                <InfoRow
                                  label="Температура"
                                  value={`${beacon.temperature_c}°C`}
                                />
                                <InfoRow
                                  label="Влажность"
                                  value={`${beacon.humidity_percent}%`}
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="text-center text-muted-foreground mt-10">
                No data available.
              </div>
            )}

            {deviceData.data.length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setHistoryOpen(true)}
              >
                <FileClockIcon className="mr-2 h-4 w-4" />
                Показать историю ({deviceData.data.length})
              </Button>
            )}
          </div>
        </div>
      </aside>
      <DeviceDataHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        deviceData={deviceData}
      />
    </>
  );
}
