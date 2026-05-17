"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPinIcon, PlusIcon } from "lucide-react";
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
import type { BaseFloorSchema } from "@/types/floor";
import { BuildingSelect } from "./building-select";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL!;

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Название этажа не может быть короче 1 символа.")
    .max(32, "Название этажа не может быть длиннее 32 символов."),
  building_id: z.string().min(1, "Выберите здание"),
  scale_factor: z.number().min(1, "Маштаб не может быть меньше 1 к 1."),
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
});

export function CreateFloorDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { upload } = useImageUpload();

  const createFloor = useMutation({
    mutationFn: async (newFloor: {
      name: string;
      building_id: number;
      floorplan_key: string;
      scale_factor: number;
    }) => {
      const response = await fetch(API_BASE_URL + "/floors", {
        method: "POST",
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
    onSuccess: async (data: BaseFloorSchema) => {
      queryClient.setQueryData(["floors"], (old: BaseFloorSchema[] = []) => {
        return [data, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ["floors"] });

      setOpen(false);
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      building_id: "",
      image: null as File | null,
      scale_factor: 1,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (value.image == null) return;

      const uploadResult = await upload([value.image]);

      await createFloor.mutateAsync({
        name: value.name,
        building_id: parseInt(value.building_id),
        floorplan_key: uploadResult[0].key,
        scale_factor: value.scale_factor,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label="Добавить этаж"
          size="icon"
          className="text-muted-foreground rounded-md"
        >
          <PlusIcon />
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
              {createFloor.isPending ? "Загрузка..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
