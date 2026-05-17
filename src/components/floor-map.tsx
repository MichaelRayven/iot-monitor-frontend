import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { FloorplanCanvas } from "@/components/floorplan-canvas";
import { cn } from "@/lib/utils";
import {
  getDeviceData,
  getFloor,
  getFloorDevices,
  updateFloorDevice,
} from "@/services";
import { useAppStore } from "@/stores/app";
import type { FloorDevice, FloorDeviceWithData } from "@/types/device";
import type { FloorSchema } from "@/types/floor";
import { Card, CardContent } from "./ui/card";

type FloorMapProps = {
  className?: string;
  floorId: number;
};

export function FloorMap({ floorId, className }: FloorMapProps) {
  const queryClient = useQueryClient();
  const { selectedDeviceId, setSelectedDeviceId } = useAppStore();
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 0.5,
  });

  const { data: deviceData } = useQuery<FloorDeviceWithData>({
    enabled: !!selectedDeviceId,
    queryKey: ["device-data", selectedDeviceId],
    queryFn: () => getDeviceData(selectedDeviceId!),
  });

  const { data: deviceList } = useQuery<FloorDevice[]>({
    queryKey: ["floor-devices", floorId],
    queryFn: () => getFloorDevices(floorId),
  });

  const { isPending, data } = useQuery<FloorSchema>({
    queryKey: ["selected-floor", floorId],
    queryFn: () => getFloor(floorId),
  });

  const updateFloorDeviceMutation = useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floor-devices"] });
    },
    mutationFn: async ({
      deviceId,
      ...values
    }: {
      deviceId: number;
      floor_id?: number;
      device_type?: string;
      is_stationary?: boolean;
      x?: number;
      y?: number;
    }) => updateFloorDevice(deviceId, values),
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        Загрузка...
      </div>
    );
  }

  return data ? (
    <div className={cn("relative", className)}>
      <FloorplanCanvas
        className="h-full"
        floor={{
          id: data.id,
          name: data.name,
          building_id: data.building_id,
          scale_factor: data.scale_factor,
          floorplan_url: data.floorplan_url,
          devices: deviceList || [],
        }}
        transform={transform}
        onTransformChange={setTransform}
        onDeviceClick={(id) => {
          setSelectedDeviceId(id);
        }}
        onDeviceDrop={async (id, x, y) => {
          const device = deviceList?.find((d) => d.id === id);
          if (device) {
            await updateFloorDeviceMutation.mutateAsync({
              deviceId: id,
              floor_id: device.floor_id ? Number(device.floor_id) : undefined,
              device_type: device.device_type ?? "",
              is_stationary: true,
              x: Math.round(x),
              y: Math.round(y),
            });
          }
        }}
        onDeviceMove={async (id, x, y) => {
          const device = data.devices?.find((d) => d.id === id);
          if (device) {
            await updateFloorDeviceMutation.mutateAsync({
              deviceId: id,
              floor_id: device.floor_id ? Number(device.floor_id) : undefined,
              device_type: device.device_type ?? "",
              is_stationary: true,
              x: Math.round(x),
              y: Math.round(y),
            });
          }
        }}
      />
      {deviceData && (
        <aside className="absolute top-0 bottom-0 w-80 overflow-y-auto right-0">
          <div className="p-4 h-full">
            <Card>
              <CardContent>
                {deviceData.data.map((item, idx) => (
                  <Fragment key={idx}>
                    {Object.entries(item).map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <p>{item[0]}</p>
                        <p>{String(item[1])}</p>
                      </div>
                    ))}
                    {idx !== deviceData.data.length - 1 && (
                      <hr className="w-4/5 h-0.5 bg-border mx-auto my-2" />
                    )}
                  </Fragment>
                ))}
              </CardContent>
            </Card>
          </div>
        </aside>
      )}
    </div>
  ) : (
    <div>Loading</div>
  );
}
