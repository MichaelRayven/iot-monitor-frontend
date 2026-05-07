import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "./index.css";

const Header = () => {
  const [buildingId, setBuildingId] = useState<string | null>(null);

  return (
    <header className="bg-background w-full py-4">
      <div className="mx-auto flex w-full max-w-[calc(100vw-8rem)]">
        <div className="flex flex-1 justify-center gap-8">
          <div className="flex gap-2">
            <BuildingSelect onValueChange={(value) => setBuildingId(value)} />
            <CreateBuildingDialog />
          </div>
          {buildingId && (
            <div className="flex gap-2">
              <FloorSelect buildingId={Number.parseInt(buildingId)} />
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
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span>User</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FloorPlanCanvas } from "./features/floor-plan/components/FloorPlanCanvas";
import {
  ArrowLeftIcon,
  CogIcon,
  ImageIcon,
  MapPinIcon,
  MapPinnedIcon,
  PlusIcon,
} from "lucide-react";
import { ImageInput } from "./components/ui/image-input";
import { Separator } from "./components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FloorSelect } from "./components/floor-select";
import {
  CreateFloorDialog,
  DeviceList,
} from "./components/create-floor-dialog";
import { BuildingSelect } from "./components/building-select";
import { useState } from "react";
import { CreateBuildingDialog } from "./components/create-building-dialog";

const Sidebar = () => {
  return (
    <Card className="m-4 w-full max-w-sm">
      <CardHeader>
        <CardTitle>Список устройств</CardTitle>
      </CardHeader>
      <CardContent>
        <DeviceList />
      </CardContent>
    </Card>
  );
};

const Map = () => {
  return (
    <div>
      <FloorPlanCanvas
        floorPlan={{
          id: "floor-1",
          name: "Floor 1",
          building: "5",
          scale_factor: 0.1,
          floorplan_url: "/floor-1.jpg",
          devices: [],
        }}
        transform={{
          x: 0,
          y: 0,
          scale: 0.5,
        }}
      />
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Header></Header>
        <main>
          <div className="flex">
            <Sidebar></Sidebar>
            <Map></Map>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default App;
