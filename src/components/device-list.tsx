import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  LockIcon,
  MapPinIcon,
  PencilIcon,
  Trash2Icon,
  UnlockIcon,
} from "lucide-react";
import { useState } from "react";
import {
  deleteFloorDevice,
  getFloorDevices,
  getVegaDevices,
  updateFloorDevice,
} from "@/services";
import { useAppStore } from "@/stores/app";
import type { FloorDevice, VegaDevice } from "@/types/device";
import { AddFloorDeviceDialog } from "./dialog/add-floor-device";
import { UpdateFloorDeviceDialog } from "./dialog/update-floor-device";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

// last_data_ts is Unix epoch seconds; compare against Date.now() (ms)
const STALE_MS = 5 * 60 * 1000;
const isOnline = (lastDataTs: number | null): boolean => {
  if (!lastDataTs) return false;
  return Date.now() - lastDataTs * 1000 < STALE_MS;
};

type DeviceListItemProps = {
  device?: FloorDevice;
  name?: string | null;
  uid: string;
  rssi: number | null;
  snr: number | null;
  lastDataTs: number | null;
  isStationary?: boolean;
  x?: number | null;
  y?: number | null;
  onClick?: () => void;
  isSelected?: boolean;
};

export function DeviceListItem({
  device,
  uid,
  name,
  lastDataTs,
  rssi,
  snr,
  isStationary = false,
  x = 0,
  y = 0,
  onClick,
  isSelected = false,
}: DeviceListItemProps) {
  const queryClient = useQueryClient();
  const [updateOpen, setUpdateOpen] = useState(false);

  const deleteDeviceMutation = useMutation({
    mutationFn: () => deleteFloorDevice(device!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floor-devices"] });
      queryClient.invalidateQueries({ queryKey: ["selected-floor"] });
    },
  });

  const toggleStationary = useMutation({
    mutationFn: () =>
      updateFloorDevice(device!.id, {
        is_stationary: !device?.is_stationary,
        x: device?.x ?? 0,
        y: device?.y ?? 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floor-devices"] });
      queryClient.invalidateQueries({ queryKey: ["selected-floor"] });
    },
  });

  const online = isOnline(lastDataTs);

  const innerContent = (
    <div
      className={clsx(
        "rounded-lg border p-4 shadow-sm hover:cursor-pointer transition-colors",
        isSelected && "border-primary bg-primary/5"
      )}
      draggable={!!device}
      onClick={onClick}
      onDragStart={(e) => {
        if (device?.id) {
          e.dataTransfer.setData("application/device-id", device.id.toString());
        }
      }}
    >
      <div className="flex gap-2">
        <div>
          <p className="flex items-center gap-2 font-medium">
            {name ? name : uid}
            {isStationary && (
              <MapPinIcon className="text-muted-foreground size-4" />
            )}
          </p>
          <p className="text-muted-foreground">{name ? uid : ""}</p>
        </div>

        <div
          className={clsx(
            "ml-auto size-2 rounded-full",
            online ? "bg-green-600" : "bg-red-600"
          )}
        ></div>
      </div>

      <Separator className="my-2" />

      <div className="flex gap-2">
        <p>
          RSSI: {rssi ?? "—"} SNR: {snr ?? "—"}
        </p>
      </div>
      {isStationary && (
        <div className="flex gap-2">
          <p>
            Позиция: X: {x ?? 0}, Y: {y ?? 0}
          </p>
        </div>
      )}
    </div>
  );

  if (!device) return innerContent;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{innerContent}</ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem onClick={() => setUpdateOpen(true)}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Редактировать
          </ContextMenuItem>
          <ContextMenuItem onClick={() => toggleStationary.mutate()}>
            {isStationary ? (
              <>
                <UnlockIcon className="mr-2 h-4 w-4" /> Разблокировать позицию
              </>
            ) : (
              <>
                <LockIcon className="mr-2 h-4 w-4" /> Зафиксировать позицию
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem
            className="text-red-600"
            onClick={() => deleteDeviceMutation.mutate()}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Удалить
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <UpdateFloorDeviceDialog
        device={device}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
      />
    </>
  );
}

function FloorDeviceListItem({ device }: { device: FloorDevice }) {
  const { selectedDeviceId, setSelectedDeviceId } = useAppStore();
  const isSelected = selectedDeviceId === device.id;

  return (
    <DeviceListItem
      device={device}
      name={device.name}
      isStationary={device.is_stationary}
      uid={device.uid}
      lastDataTs={device.last_data_ts}
      rssi={device.rssi}
      snr={device.snr}
      x={device.x}
      y={device.y}
      isSelected={isSelected}
      onClick={() => setSelectedDeviceId(isSelected ? null : device.id)}
    />
  );
}

export function FloorDeviceList({ floorId }: { floorId: number }) {
  const { data, isPending } = useQuery<FloorDevice[]>({
    queryKey: ["floor-devices", floorId],
    queryFn: () => getFloorDevices(floorId),
  });

  const hasData = data && data.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Устройства на этаже</CardTitle>
        <CardAction>
          <AddFloorDeviceDialog floorId={floorId} />
        </CardAction>
      </CardHeader>

      {isPending && (
        <CardContent className="flex flex-col gap-2 items-center">
          <p>Загрузка...</p>
        </CardContent>
      )}

      {!isPending && !hasData && (
        <CardContent className="flex flex-col gap-2">
          <p>Список устройств пуст.</p>
          <p>Добавьте устройство чтобы оно отобразилось в списке.</p>
        </CardContent>
      )}

      {!isPending && hasData && (
        <CardContent className="grow h-0">
          <ScrollArea className="h-full w-full">
            <div className="space-y-2">
              {data?.map((device) => (
                <FloorDeviceListItem key={device.uid} device={device} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}

export function DeviceList() {
  const { data } = useQuery<VegaDevice[]>({
    queryKey: ["vega-devices"],
    queryFn: getVegaDevices,
  });

  return (
    <ScrollArea className="h-full w-auto rounded-md border shadow-sm bg-background">
      <div className="space-y-2 p-4">
        {data?.map((device) => (
          <DeviceListItem
            key={device.dev_eui}
            // no device prop — not a FloorDevice
            name={device.name}
            uid={device.dev_eui}
            rssi={device.rssi}
            snr={device.snr}
            lastDataTs={device.last_data_ts}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
