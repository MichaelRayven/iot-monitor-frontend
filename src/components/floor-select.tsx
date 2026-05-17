import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFloorsByBuilding } from "@/services";
import type { BaseFloorSchema } from "@/types/floor";

type FloorSelectProps = {
  buildingId: number;
} & React.ComponentProps<typeof SelectPrimitive.Root>;

import { useAppStore } from "@/stores/app";

export function FloorSelect({
  buildingId,
  onValueChange,
  ...props
}: FloorSelectProps) {
  const { setFloorId } = useAppStore();
  const { isPending, error, data } = useQuery<BaseFloorSchema[]>({
    queryKey: ["floors", buildingId],
    queryFn: () => getFloorsByBuilding(buildingId),
  });

  const isDisabled = isPending || !!error || data?.length == 0;

  return (
    <Select
      disabled={isDisabled}
      onValueChange={(val) => {
        setFloorId(val ? Number(val) : null);
        if (onValueChange) onValueChange(val);
      }}
      {...props}
    >
      <SelectTrigger className="w-full min-w-48">
        {isPending ? (
          <div className="flex items-center gap-2">
            <Loader2Icon className="size-4 animate-spin" />
            <span>Загрузка...</span>
          </div>
        ) : (
          <SelectValue placeholder="Выберите этаж" />
        )}
      </SelectTrigger>
      <SelectContent>
        {isPending ? (
          <div className="w-full">Загрузка...</div>
        ) : (
          <SelectGroup>
            <SelectLabel>Выберите этаж</SelectLabel>
            {data?.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
