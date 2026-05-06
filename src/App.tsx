import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import "./index.css";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DeviceList() {
  return <div className="p-4 border rounded-lg shadow-sm hover:cursor-pointer">
    <div className="flex gap-2">
    <div>
      <p className="font-medium">Smart 0101</p>
      <p className="text-muted-foreground">EDC72307FC53CFD</p>
    </div>
    <div className="bg-green-600 size-2 rounded-full ml-auto"></div>
  </div>
  <div>
    <p>RSSI: -12.32</p>
    <p>SNR: 2</p>
  </div>
  </div>
}

export function FloorCreationDialog() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Button variant="link" className="w-min"><ArrowLeftIcon/> Назад</Button>
        <CardTitle>Создание этажа</CardTitle>
        <CardDescription>
          Введите данные этажа.
        </CardDescription>
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
                <ImageInput
                  id="floor-image-field-1"                  
                  required
                />
                <FieldDescription>
                  Поддерживаемые форматы: .png, .jpg, .jpeg, .webp. Максимальный размер файла 5 MB.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="floor-image-field-1">
                  Список устройств
                </FieldLabel>
                <DeviceList/>
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
  )
}


export function FloorSelect() {
  return (
    <Select>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Select a floor" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Floor</SelectLabel>
          <SelectItem value="apple">Floor 1</SelectItem>
          <SelectItem value="banana">Floor 2</SelectItem>
          <SelectItem value="blueberry">Floor 3</SelectItem>
          <SelectItem value="grapes">Floor 4</SelectItem>
          <SelectItem value="pineapple">Floor 5</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const Header = () => {
  return <header className="w-full py-4 bg-background">
    <div className="wfull max-w-[calc(100vw-8rem)] mx-auto flex">

    <FloorSelect />
    <Button>New floor</Button>

    </div>
  </header>
}

const Footer = () => {
  return "Footer"
}
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { FloorPlanCanvas } from "./features/floor-plan/components/FloorPlanCanvas";
import { ArrowLeftIcon, ImageIcon } from "lucide-react"
import { ImageInput } from "./components/ui/image-input"

const Sidebar = () => {
  return (
    <div className="bg-red-100 max-w-64 p-4">
      <h3>Device list</h3>
      <ScrollArea className="h-72 w-48 rounded-md border p-2">
        <div>Device 1</div>
        <div>Device 2</div>
        <div>Device 3</div>
        <div>Device 4</div>
        <div>Device 5</div>
        <div>Device 6</div>
        <div>Device 7</div>
        <div>Device 8</div>
        <div>Device 9</div>
        <div>Device 10</div>
      </ScrollArea>
    </div>
  )
}

const Map = () => {
  return <div>
    <FloorPlanCanvas floorPlan={{
      id: "floor-1",
      name: "Floor 1",
      building: "5",
      scale_factor: 0.1,
      floorplan_url: "/floor-1.jpg",
      devices: []
    }} 
    transform={{
      x: 0,
      y: 0,
      scale: 0.5,
    }}/>
  </div>
}

const App = () => {
  return (<div>
    <Header></Header>
    <main>
      <div className="flex">

    <Sidebar></Sidebar>
    <Map></Map>
      </div>
    </main>
    <FloorCreationDialog />
    <Footer></Footer>
  </div>)
}

export default App;
