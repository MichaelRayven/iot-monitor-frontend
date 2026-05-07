import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaseFloorSchema } from "@/features/floor-plan/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL!;

type FloorSelectProps = {
  buildingId: number;
};

export function FloorSelect({ buildingId }: FloorSelectProps) {
  const { isPending, error, data } = useQuery<BaseFloorSchema[]>({
    queryKey: ["floors"],
    queryFn: () =>
      fetch(API_BASE_URL + `/floors/building/${buildingId}`).then((res) =>
        res.json()
      ),
  });

  const isDisabled = isPending || !!error || data?.length == 0;

  return (
    <Select disabled={isDisabled}>
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
