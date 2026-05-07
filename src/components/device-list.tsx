import { MapPinIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type DeviceListItemProps = {
    name?: string;
    dev_eui: string;
    rssi: number;
    snr: number;
    is_stationary: boolean;
    x?: number;
    y?: number;
};

export function DeviceListItem({
    name,
    is_stationary,
    rssi,
    snr,
    dev_eui,
    x = 0,
    y = 0,
}: DeviceListItemProps) {
    return (
        <div className="rounded-lg border p-4 shadow-sm hover:cursor-pointer">
            <div className="flex gap-2">
                <div>
                    <p className="flex items-center gap-2 font-medium">
                        {name ? name : dev_eui}
                        {is_stationary && (
                            <MapPinIcon className="text-muted-foreground size-4" />
                        )}
                    </p>
                    <p className="text-muted-foreground">{name ? dev_eui : ""}</p>
                </div>

                <div className="ml-auto size-2 rounded-full bg-green-600"></div>
            </div>

            <Separator className="my-2" />

            <div className="flex gap-2">
                <p>
                    RSSI: {rssi} SNR: {snr}
                </p>
            </div>
            {is_stationary && (
                <div className="flex gap-2">
                    <p>
                        Позиция: X: {x}, Y: {y}
                    </p>
                </div>
            )}
        </div>
    );
}

type FloorDevice = {
    id: number
    name?: string
    dev_eui: string
    floor_id: number
    device_type?: string
    is_stationary: boolean
    x?: number
    y?: number
}

export function FloorDeviceList({ floorId }: { floorId?: number }) {
    const { data } = useQuery<FloorDevice[]>({
        queryKey: ["floor-devices"],
        queryFn: async () => {
            const response = await fetch(API_BASE_URL + `/${floorId}/devices`)
            return await response.json()
        }
    })

    return (
        <ScrollArea className="h-full w-auto rounded-md border shadow-sm bg-background">
            <div className="space-y-2 p-4">
                {data?.map(device => <DeviceListItem
                    name={device.name}
                    is_stationary={device.is_stationary}
                    dev_eui={device.dev_eui}
                    rssi={0}
                    snr={0}
                    key={device.id}
                />)}


            </div>
        </ScrollArea>
    )
}

type ExtendedDeviceSchema = {
    name?: string
    dev_eui: string
    floor_id: number
    device_type?: string
    is_stationary: boolean
    x?: number
    y?: number
    rssi?: number
    snr?: number
    data: { [item: string]: any }
}

export function DeviceList() {
    const { data } = useQuery<ExtendedDeviceSchema[]>({
        queryKey: ["devices"],
        queryFn: async () => {
            const response = await fetch(API_BASE_URL + "/devices")
            return await response.json()
        }
    })

    return (
        <ScrollArea className="h-full w-auto rounded-md border shadow-sm bg-background">
            <div className="space-y-2 p-4">
                {data?.map(device => <DeviceListItem
                    name={device.name}
                    is_stationary={device.is_stationary}
                    dev_eui={device.dev_eui}
                    rssi={device.rssi}
                    snr={device.snr}
                    key={device.dev_eui}
                />)}


            </div>
        </ScrollArea>
    )
}
