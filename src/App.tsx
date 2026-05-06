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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import "./index.css";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DeviceListItemProps = {
  name: string;
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
            {name}
            {is_stationary && (
              <MapPinIcon className="text-muted-foreground size-4" />
            )}
          </p>
          <p className="text-muted-foreground">{dev_eui}</p>
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

export function DeviceList() {
  return (
    <ScrollArea className="h-full w-full rounded-md border shadow-sm">
      <div className="space-y-2 p-4">
        <DeviceListItem
          name="Smart 0101"
          is_stationary={true}
          dev_eui="EDC72307FC53CFD"
          rssi={10}
          snr={10}
        />
        <DeviceListItem
          name="Smart 0101"
          is_stationary={true}
          dev_eui="EDC72307FC53CFD"
          rssi={10}
          snr={10}
        />
        <DeviceListItem
          name="Smart 0101"
          is_stationary={false}
          dev_eui="EDC72307FC53CFD"
          rssi={10}
          snr={10}
        />
        <DeviceListItem
          name="Smart 0101"
          is_stationary={true}
          dev_eui="EDC72307FC53CFD"
          rssi={10}
          snr={10}
        />
      </div>
    </ScrollArea>
  );
}

export function FloorCreationDialog() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Button variant="link" className="w-min">
          <ArrowLeftIcon /> Назад
        </Button>
        <CardTitle>Создание этажа</CardTitle>
        <CardDescription>Введите данные этажа.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="floor-name-field-1">
                    Название этажа
                  </FieldLabel>
                  <Input
                    id="floor-name-field-1"
                    placeholder="1 этаж"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="floor-image-field-1">
                    Изображение этажа
                  </FieldLabel>
                  <ImageInput id="floor-image-field-1" required />
                  <FieldDescription>
                    Поддерживаемые форматы: .png, .jpg, .jpeg, .webp.
                    Максимальный размер файла 5 MB.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="floor-image-field-1">
                    Список устройств
                  </FieldLabel>
                  <DeviceList />
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Добавить этаж
        </Button>
      </CardFooter>
    </Card>
  );
}

export function FloorSelect() {
  return (
    <Select>
      <SelectTrigger className="w-full min-w-48">
        <SelectValue placeholder="Выберите этаж" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Выберите этаж</SelectLabel>
          <SelectItem value="apple">1 этаж</SelectItem>
          <SelectItem value="banana">2 этаж</SelectItem>
          <SelectItem value="blueberry">3 этаж</SelectItem>
          <SelectItem value="grapes">4 этаж</SelectItem>
          <SelectItem value="pineapple">5 этаж</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function BuildingSelect() {
  return (
    <Select>
      <SelectTrigger className="w-full min-w-48">
        <SelectValue placeholder="Выберите здание" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Выберите здание</SelectLabel>
          <SelectItem value="apple">1 этаж</SelectItem>
          <SelectItem value="banana">2 этаж</SelectItem>
          <SelectItem value="blueberry">3 этаж</SelectItem>
          <SelectItem value="grapes">4 этаж</SelectItem>
          <SelectItem value="pineapple">5 этаж</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const Header = () => {
  return (
    <header className="bg-background w-full py-4">
      <div className="mx-auto flex w-full max-w-[calc(100vw-8rem)]">
        <div className="flex flex-1 justify-center gap-8">
          <div className="flex gap-2">
            <BuildingSelect />
            <Button
              variant="outline"
              aria-label="Добавить здание"
              size="icon"
              className="text-muted-foreground rounded-md"
            >
              <PlusIcon />
            </Button>
          </div>
          <div className="flex gap-2">
            <FloorSelect />
            <Button
              variant="outline"
              aria-label="Добавить этаж"
              size="icon"
              className="text-muted-foreground rounded-md"
            >
              <PlusIcon />
            </Button>
          </div>
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

const App = () => {
  return (
    <div>
      <Header></Header>
      <main>
        <div className="flex">
          <Sidebar></Sidebar>
          <Map></Map>
        </div>
      </main>
      <FloorCreationDialog />
    </div>
  );
};

export default App;
