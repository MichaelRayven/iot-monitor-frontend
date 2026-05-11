import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { FloorPlanCanvas } from "@/features/floor-plan/components/FloorPlanCanvas";
import type { FloorSchema } from "@/features/floor-plan/types";
import { API_BASE_URL } from "@/lib/constants";
import type { Device, FloorDeviceWithData } from "./device-list";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

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
      return fetch(API_BASE_URL + `/floors/devices/${selectedDeviceId}`).then((res) =>
        res.json()
      );
    },
  });

  const { isPending, data } = useQuery<FloorSchema>({
    queryKey: ["selected-floor", floorId],
    queryFn: async () => {
      return fetch(API_BASE_URL + `/floors/${floorId}`).then((res) =>
        res.json()
      );
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
      <FloorPlanCanvas
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
      />
      {deviceData && (<aside className="absolute top-0 bottom-0 w-80 overflow-y-auto right-0">
        <div className="p-4 h-full">
          <Card>
            <CardContent>
              {deviceData.data.map((item, idx) => <Fragment key={idx}>
                {Object.entries(item).map((item, idx) =>
                  <div key={idx} className="flex gap-2">
                    <p>{item[0]}</p>
                    <p>{String(item[1])}</p>
                  </div>
                )}
                {idx !== deviceData.data.length - 1 && <hr className="w-4/5 h-0.5 bg-border mx-auto my-2" />}
              </Fragment>)}
            </CardContent>
          </Card>

        </div>
      </aside>)}
    </div>

  ) : (
    <div>Loading</div>
  );
}
