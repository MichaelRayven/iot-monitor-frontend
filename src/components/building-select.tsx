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
import type { BuildingSchema } from "@/types/building";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL!;

type BuildingSelectProps = {
  id?: string;
  isInvalid?: boolean;
} & React.ComponentProps<typeof SelectPrimitive.Root>;

export function BuildingSelect({
  id,
  isInvalid,
  ...props
}: BuildingSelectProps) {
  const { isPending, error, data } = useQuery<BuildingSchema[]>({
    queryKey: ["buildings"],
    queryFn: () => fetch(API_BASE_URL + "/buildings").then((res) => res.json()),
  });

  const isDisabled = isPending || !!error || data?.length == 0;

  return (
    <Select disabled={isDisabled} {...props}>
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
