import { type StandardSchemaV1, useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";
import * as z from "zod";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ImageInput } from "@/components/ui/image-input";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { BaseFloorSchema, FloorSchema } from "@/types/floor";
import { BuildingSelect } from "./building-select";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type FormValues = {
  name: string | undefined;
  building_id: string | undefined;
  image: File | null;
  scale_factor: number | undefined;
};

const formSchema: StandardSchemaV1<FormValues> = z.object({
  name: z
    .string()
    .min(1, "Название этажа не может быть короче 1 символа.")
    .max(32, "Название этажа не может быть длиннее 32 символов.")
    .optional(),
  building_id: z.string().min(1, "Выберите здание").optional(),
  scale_factor: z
    .number()
    .min(1, "Маштаб не может быть меньше 1 к 1.")
    .optional(),
  image: z
    .instanceof(File, { message: "План этажа обязательное поле." })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Размер изображения не должен превышать 5MB."
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file?.type),
      "Формат изображения не поддерживается."
    )
    .nullable(),
}) as StandardSchemaV1<FormValues>;

export function UpdateFloorDialog({ floorId }: { floorId: number }) {
  const { data } = useQuery<FloorSchema>({
    queryKey: ["selected-floor", floorId],
    queryFn: async () => {
      return fetch(API_BASE_URL + `/floors/${floorId}`).then((res) =>
        res.json()
      );
    },
  });

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { upload } = useImageUpload();

  const updateFloor = useMutation({
    mutationFn: async (newFloor: {
      name?: string;
      building_id?: number;
      floorplan_key?: string;
      scale_factor?: number;
    }) => {
      const response = await fetch(API_BASE_URL + `/floors/${floorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFloor),
      });

      if (!response.ok) {
        throw new Error("Failed to create floor");
      }

      return response.json();
    },
    onSuccess: async (data: FloorSchema) => {
      queryClient.setQueryData(["selected-floor"], data);
      queryClient.setQueriesData(
        { queryKey: ["floors"] },
        (old: BaseFloorSchema[] = []): BaseFloorSchema[] => {
          return [
            ...old.filter((item) => item.id !== data.id),
            {
              id: data.id,
              name: data.name,
            },
          ];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["selected-floor"] });

      setOpen(false);
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: {
      name: data?.name,
      building_id: data?.building_id?.toString(),
      image: null as File | null,
      scale_factor: data?.scale_factor,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      let floorplan_key = undefined;

      if (value.image) {
        const uploadResult = await upload([value.image]);
        floorplan_key = uploadResult[0].key;
      }

      await updateFloor.mutateAsync({
        name: value.name,
        building_id: value.building_id ? Number(value.building_id) : undefined,
        floorplan_key: floorplan_key,
        scale_factor: value.scale_factor,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label="Настройки этажа"
          size="icon"
          className="text-muted-foreground rounded-md"
        >
          <SettingsIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать этаж</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form
          id="create-floor-form"
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
                    <FieldLabel htmlFor={field.name}>Название этажа</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="1 этаж"
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
              name="building_id"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Здание</FieldLabel>
                    <BuildingSelect
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      isInvalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="image"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>План этажа</FieldLabel>
                    <ImageInput
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={async (e) =>
                        field.handleChange(e.target.files?.[0] ?? null)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <FieldDescription>
                      Поддерживаемые форматы: .png, .jpg, .jpeg, .webp.
                      Максимальный размер файла 5 MB.
                    </FieldDescription>
                  </Field>
                );
              }}
            />
            <form.Field
              name="scale_factor"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Маштаб</FieldLabel>
                    <FieldDescription>
                      Маштаб изображения в формате X пикселей к 1 метру.
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value);
                        if (e.target.value && (isNaN(value) || value < 1))
                          return;
                        else field.handleChange(value);
                      }}
                      aria-invalid={isInvalid}
                      type="number"
                      placeholder="100"
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
            <Button type="submit" disabled={false}>
              {updateFloor.isPending ? "Загрузка..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
