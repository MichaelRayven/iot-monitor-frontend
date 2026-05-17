import { useQuery } from "@tanstack/react-query";
import { Select as SelectPrimitive } from "radix-ui";
import { getDevices } from "@/services";
import type { Device } from "@/types/device";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type DeviceSelectProps = {
  id?: string;
  isInvalid?: boolean;
} & React.ComponentProps<typeof SelectPrimitive.Root>;

export function DeviceSelect({ id, isInvalid, ...props }: DeviceSelectProps) {
  const { isPending, data } = useQuery<Device[]>({
    queryKey: ["devices"],
    queryFn: getDevices,
  });

  return (
    <Select {...props}>
      <SelectTrigger id={id} aria-invalid={isInvalid}>
        <SelectValue></SelectValue>
      </SelectTrigger>
      <SelectContent>
        {isPending ? (
          <div className="w-full">Загрузка...</div>
        ) : (
          <SelectGroup>
            <SelectLabel>Выберите устройство</SelectLabel>
            {data?.map((item) => (
              <SelectItem key={item.dev_eui} value={item.dev_eui}>
                {`${item.name || "Без названия"} - [${item.dev_eui}]`}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
