import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStrategy } from "@/lib/device-strategies";
import { formatTimestamp } from "@/lib/utils";
import type { FloorDeviceWithData } from "@/types/device";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceData: FloorDeviceWithData;
};

function getDerivedStatusLabel(
  deviceType: string,
  item: Record<string, unknown>
): string {
  const { modeLabel, reasonLabel } = getStrategy(deviceType).deriveStatus(item);
  const parts = [modeLabel, reasonLabel].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "-";
}

export function DeviceDataHistoryModal({
  open,
  onOpenChange,
  deviceData,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[calc(90vw-2rem)]! flex! flex-col w-full max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            История: {deviceData.name || deviceData.uid}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 mt-4 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Тип пакета</TableHead>
                <TableHead>Статус / Событие</TableHead>
                <TableHead>Заряд</TableHead>
                <TableHead>Детали</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceData.data.map((item, i) => {
                const ts = item.device_timestamp as number;
                const battery = item.battery_percent;
                const packet = item.packet as string;

                const statusStr = getDerivedStatusLabel(
                  deviceData.device_type,
                  item
                );

                // Filter out standard keys to show raw details
                const detailEntries = Object.entries(item).filter(([k]) => {
                  return ![
                    "device",
                    "packet",
                    "device_timestamp",
                    "battery_percent",
                    "temperature_c",
                    "mode_label",
                    "send_reason_label",
                    "mode",
                    "send_reason",
                    "reason",
                    "state_raw",
                    "state",
                  ].includes(k);
                });

                return (
                  <TableRow key={i}>
                    <TableCell className="whitespace-nowrap">
                      {formatTimestamp(ts)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {packet ? packet.replace(/_/g, " ") : "-"}
                    </TableCell>
                    <TableCell>{statusStr}</TableCell>
                    <TableCell>
                      {battery !== undefined ? `${battery}%` : "-"}
                    </TableCell>
                    <TableCell
                      className="text-xs text-muted-foreground max-w-xs truncate"
                      title={JSON.stringify(Object.fromEntries(detailEntries))}
                    >
                      {detailEntries.length > 0
                        ? detailEntries
                            .map(
                              ([k, v]) =>
                                `${k}: ${typeof v === "object" ? "..." : v}`
                            )
                            .join(", ")
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
