import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BuildingSelect } from "./components/building-select";
import { CreateBuildingDialog } from "./components/create-building-dialog";
import { CreateFloorDialog } from "./components/create-floor-dialog";
import { FloorDeviceList } from "./components/device-list";
import { FloorSelect } from "./components/floor-select";
import { FloorMap } from "./components/floor-map";
import "./index.css";
import { UpdateFloorDialog } from "./components/update-floor-dialog";

const queryClient = new QueryClient();

const App = () => {
  const [buildingId, setBuildingId] = useState<number | null>(null);
  const [floorId, setFloorId] = useState<number | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="bg-background w-full py-4 shrink-0">
          <div className="mx-auto flex w-full max-w-[calc(100vw-8rem)]">
            <div className="flex flex-1 justify-center gap-8">
              <div className="flex gap-2">
                <BuildingSelect
                  onValueChange={(value) => setBuildingId(value)}
                />
                <CreateBuildingDialog />
              </div>
              {buildingId && (
                <div className="flex gap-2">
                  <FloorSelect
                    onValueChange={(value) => setFloorId(value)}
                    buildingId={Number.parseInt(buildingId)}
                  />
                  <CreateFloorDialog />
                </div>
              )}
            </div>
            {floorId && (
              <div className="flex gap-2">
                <UpdateFloorDialog floorId={floorId} />
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden min-h-0">
          <aside className="w-80 shrink-0 overflow-y-auto border-r">
            <div className="p-4 h-full">
              {floorId && <FloorDeviceList floorId={floorId} />}
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
              {floorId && (
                <FloorMap
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
