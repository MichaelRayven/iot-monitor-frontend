import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createBuilding } from "@/services";
import type { BuildingSchema } from "@/types/building";

const buildingSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(255, "Название не может быть длиннее 255 символов"),
  address: z
    .string()
    .min(1, "Адрес обязателен")
    .max(255, "Адрес не может быть длиннее 255 символов"),
});

export function CreateBuildingDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const createBuildingMutation = useMutation({
    mutationKey: ["buildings"],
    mutationFn: (newBuilding: { name: string; address: string }) =>
      createBuilding(newBuilding.name, newBuilding.address),
    onSuccess: (data: BuildingSchema) => {
      queryClient.setQueryData(["buildings"], (old: BuildingSchema[] = []) => {
        return [data, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ["buildings"] });

      setOpen(false);
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
    },
    validators: {
      onSubmit: buildingSchema,
    },
    onSubmit: async ({ value }) => {
      await createBuildingMutation.mutateAsync({
        name: value.name,
        address: value.address,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label="Добавить здание"
          size="icon"
          className="text-muted-foreground rounded-md"
        >
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать здание</DialogTitle>
          <DialogDescription>Добавьте новое здание в систему</DialogDescription>
        </DialogHeader>
        <form
          id="create-building-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Название здания
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Главный корпус"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="address"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Адрес</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="ул. Примерная, д. 1"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={createBuildingMutation.isPending}>
              {createBuildingMutation.isPending ? "Загрузка..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
