import { Button } from "@/components/ui/button";
import { FloorPlanCanvas } from "./features/floor-plan/components/FloorPlanCanvas";
import {
  CogIcon,
} from "lucide-react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { FloorSelect } from "./components/floor-select";
import {
  CreateFloorDialog,
} from "./components/create-floor-dialog";
import { BuildingSelect } from "./components/building-select";
import { useEffect, useState } from "react";
import { CreateBuildingDialog } from "./components/create-building-dialog";
import type { FloorSchema } from "./features/floor-plan/types";
import "./index.css";
import { DeviceList, FloorDeviceList } from "./components/device-list";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function Map({ floorId, className }: { className?: string, floorId: number }) {
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 0.5,
  })

  const queryClient = useQueryClient()
  const { isPending, error, data } = useQuery<FloorSchema>({
    queryKey: ["selected-floor"],
    queryFn: async () => {
      console.log("Test");

      return fetch(API_BASE_URL + `/floors/${floorId}`).then((res) => res.json())
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["selected-floor"]
    })
  }, [floorId])

  return (data ?
    <FloorPlanCanvas
      className={className}
      floorPlan={{
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
    : <div>Loading</div>)
}

const queryClient = new QueryClient();

const App = () => {
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [floorId, setFloorId] = useState<number | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="bg-background w-full py-4 flex-shrink-0">
          <div className="mx-auto flex w-full max-w-[calc(100vw-8rem)]">
            <div className="flex flex-1 justify-center gap-8">
              <div className="flex gap-2">
                <BuildingSelect onValueChange={(value) => setBuildingId(value)} />
                <CreateBuildingDialog />
              </div>
              {buildingId && (
                <div className="flex gap-2">
                  <FloorSelect onValueChange={(value) => setFloorId(value)} buildingId={Number.parseInt(buildingId)} />
                  <CreateFloorDialog />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                aria-label="Настройки этажа"
                size="icon"
                className="text-muted-foreground rounded-md"
              >
                <CogIcon />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden min-h-0">
          <aside className="w-80 flex-shrink-0 overflow-y-auto border-r">
            <div className="p-4">
              <DeviceList />
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
              {floorId && (
                <Map
                  className="h-full w-full border-2 rounded-sm shadow-md"
                  floorId={floorId}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default App;
