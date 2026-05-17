import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { FloorplanCanvas } from "@/components/floorplan-canvas";
import { API_BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FloorSchema } from "@/types/floor";
import type { Device, FloorDeviceWithData } from "./device-list";
import { Card, CardContent } from "./ui/card";

type FloorMapProps = {
  className?: string;
  floorId: number;
};

export function FloorMap({ floorId, className }: FloorMapProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 0.5,
  });

  const { data: deviceData } = useQuery<FloorDeviceWithData>({
    enabled: !!selectedDeviceId,
    queryKey: ["device-data", selectedDeviceId],
    queryFn: async () => {
      return fetch(API_BASE_URL + `/floors/devices/${selectedDeviceId}`).then(
        (res) => res.json()
      );
    },
  });

  const { isPending, data } = useQuery<FloorSchema>({
    queryKey: ["selected-floor", floorId],
    queryFn: async () => {
      return fetch(API_BASE_URL + `/floors/device/${floorId}`).then((res) =>
        res.json()
      );
    },
  });

  const updateFloorDevice = useMutation({
    mutationFn: async ({
      deviceId,
      ...values
    }: {
      deviceId: number;
      floorId?: number;
      deviceType?: string;
      isStationary?: boolean;
      x?: number;
      y?: number;
    }) => {
      const response = await fetch(
        API_BASE_URL + `/floors/devices/${deviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create floor");
      }

      return response.json();
    },
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
          devices: data.devices,
        }}
        transform={transform}
        onTransformChange={setTransform}
        onDeviceClick={(id) => {
          setSelectedDeviceId(id);
        }}
        onDeviceMove={async (id, x, y) => {
          await updateFloorDevice.mutateAsync({
            deviceId: id,
            x: x,
            y: y,
          });
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
