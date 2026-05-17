import { useQuery } from "@tanstack/react-query";
import { Select as SelectPrimitive } from "radix-ui";
import { getDeviceTypes } from "@/services";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type DeviceTypeSelectProps = {
  id?: string;
  isInvalid?: boolean;
} & React.ComponentProps<typeof SelectPrimitive.Root>;

export function DeviceTypeSelect({
  id,
  isInvalid,
  ...props
}: DeviceTypeSelectProps) {
  const { isPending, data } = useQuery<string[]>({
    queryKey: ["device-types"],
    queryFn: getDeviceTypes,
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
            <SelectLabel>Выберите тип устройства</SelectLabel>
            {data?.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
