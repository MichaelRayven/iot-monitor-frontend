import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { MapPinIcon } from "lucide-react";
import { AddFloorDeviceDialog } from "./dialog/add-floor-device";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  device_type?: string;
  is_stationary: boolean;
  x?: number;
  y?: number;
};

export type FloorDeviceData = FloorDevice & {
  data: { [item: string]: unknown };
};

type DeviceListItemProps = {
  name?: string;
  devEui: string;
  rssi: number;
  snr: number;
  lastOnline: number;
  isStationary?: boolean;
  x?: number;
  y?: number;
};

export function DeviceListItem({
  devEui,
  name,
  lastOnline,
  rssi,
  snr,
  isStationary = false,
  x = 0,
  y = 0,
}: DeviceListItemProps) {
  const FIVE_MINUTES = 1000 * 60 * 5;
  const isOnline = (timestamp: number) => Date.now() - timestamp < FIVE_MINUTES;

  return (
    <div className="rounded-lg border p-4 shadow-sm hover:cursor-pointer">
      <div className="flex gap-2">
        <div>
          <p className="flex items-center gap-2 font-medium">
            {name ? name : devEui}
            {isStationary && (
              <MapPinIcon className="text-muted-foreground size-4" />
            )}
          </p>
          <p className="text-muted-foreground">{name ? devEui : ""}</p>
        </div>

        <div
          className={clsx(
            "ml-auto size-2 rounded-full",
            isOnline(lastOnline) ? "bg-green-600" : "bg-red-600"
          )}
        ></div>
      </div>

      <Separator className="my-2" />

      <div className="flex gap-2">
        <p>
          RSSI: {rssi} SNR: {snr}
        </p>
      </div>
      {isStationary && (
        <div className="flex gap-2">
          <p>
            Позиция: X: {x}, Y: {y}
          </p>
        </div>
      )}
    </div>
  );
}

export function FloorDeviceList({ floorId }: { floorId: number }) {
  const { data, isPending } = useQuery<FloorDevice[]>({
    queryKey: ["floor-devices", floorId],
    queryFn: async () => {
      const response = await fetch(API_BASE_URL + `/floors/${floorId}/devices`);
      return await response.json();
    },
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
        <CardContent>
          <ScrollArea className="h-full w-full">
            <div className="space-y-2">
              {data?.map((device) => (
                <DeviceListItem
                  key={device.dev_eui}
                  name={device.name}
                  isStationary={device.is_stationary}
                  devEui={device.dev_eui}
                  lastOnline={device.last_data_ts}
                  rssi={device.rssi}
                  snr={device.snr}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}

export function DeviceList() {
  const { data } = useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: async () => {
      const response = await fetch(API_BASE_URL + "/devices");
      return await response.json();
    },
  });

  return (
    <ScrollArea className="h-full w-auto rounded-md border shadow-sm bg-background">
      <div className="space-y-2 p-4">
        {data?.map((device) => (
          <DeviceListItem
            key={device.dev_eui}
            name={device.name}
            devEui={device.dev_eui}
            rssi={device.rssi}
            snr={device.snr}
            lastOnline={device.last_data_ts}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
