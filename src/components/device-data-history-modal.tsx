import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getSmartBadgeReason,
  getSmartBadgeStatus,
  getSmartMS0101Reason,
  getSmartMS0101State,
  getSmartWB0101Mode,
} from "@/lib/device-status-mappings";
import type { FloorDeviceWithData } from "@/types/device";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceData: FloorDeviceWithData;
};

function formatTimestamp(ts: unknown) {
  if (typeof ts === "number") {
    const date = new Date(ts > 10000000000 ? ts : ts * 1000);
    return format(date, "PPpp");
  }
  return String(ts || "-");
}

function getDerivedStatus(deviceType: string, item: Record<string, unknown>) {
  let uiModeLabel: string | undefined = undefined;
  let uiReasonLabel: string | undefined = undefined;

  if (deviceType === "Smart Badge") {
    uiReasonLabel = getSmartBadgeReason(item.reason as number);
    uiModeLabel = getSmartBadgeStatus(item.state_raw as number);
  } else if (deviceType === "Smart-WB0101" || deviceType === "alarm-button") {
    uiModeLabel = getSmartWB0101Mode(item.mode as number);
  } else if (deviceType === "Smart-MS0101") {
    uiReasonLabel = getSmartMS0101Reason(item.send_reason as number);
    uiModeLabel = getSmartMS0101State(item.state as string);
  } else {
    uiModeLabel = item.mode_label as string | undefined;
    uiReasonLabel = item.send_reason_label as string | undefined;
  }

  const parts = [uiModeLabel, uiReasonLabel].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "-";
}

export function DeviceDataHistoryModal({
  open,
  onOpenChange,
  deviceData,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(90vw-2rem)]! w-full max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            История: {deviceData.name || deviceData.dev_eui}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Тип пакета</TableHead>
                <TableHead>Событие / Статус</TableHead>
                <TableHead>Заряд</TableHead>
                <TableHead>Детали</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceData.data.map((item, i) => {
                const ts = item.device_timestamp;
                const battery = item.battery_percent;
                const packet = item.packet as string;

                const statusStr = getDerivedStatus(
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
