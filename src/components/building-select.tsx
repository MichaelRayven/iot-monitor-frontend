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
import { getBuildings } from "@/services";
import { useAppStore } from "@/stores/app";
import type { BuildingSchema } from "@/types/building";

type BuildingSelectProps = {
  id?: string;
  isInvalid?: boolean;
} & React.ComponentProps<typeof SelectPrimitive.Root>;

export function BuildingSelect({
  id,
  isInvalid,
  onValueChange,
  ...props
}: BuildingSelectProps) {
  const { setBuildingId } = useAppStore();
  const { isPending, error, data } = useQuery<BuildingSchema[]>({
    queryKey: ["buildings"],
    queryFn: getBuildings,
  });

  const isDisabled = isPending || !!error || data?.length == 0;

  return (
    <Select
      disabled={isDisabled}
      onValueChange={(val) => {
        setBuildingId(val ? Number(val) : null);
        if (onValueChange) onValueChange(val);
      }}
      {...props}
    >
      <SelectTrigger
        id={id}
        aria-invalid={isInvalid}
        className="w-full min-w-48"
      >
        {isPending ? (
          <div className="flex items-center gap-2">
            <Loader2Icon className="size-4 animate-spin" />
            <span>Загрузка...</span>
          </div>
        ) : (
          <SelectValue placeholder="Выберите здание" />
        )}
      </SelectTrigger>
      <SelectContent>
        {isPending ? (
          <div className="w-full">Загрузка...</div>
        ) : (
          <SelectGroup>
            <SelectLabel>Выберите здание</SelectLabel>
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
