import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FloorPlanCanvas } from "@/features/floor-plan/components/FloorPlanCanvas";
import type { FloorSchema } from "@/features/floor-plan/types";
import { API_BASE_URL } from "@/lib/constants";

type FloorMapProps = {
  className?: string;
  floorId: number;
};

export function FloorMap({ floorId, className }: FloorMapProps) {
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 0.5,
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
    <FloorPlanCanvas
      className={className}
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
    />
  ) : (
    <div>Loading</div>
  );
}
