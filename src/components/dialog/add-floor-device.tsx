import { useForm, useStore } from "@tanstack/react-form";
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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FloorDevice } from "../device-list";
import { DeviceSelect } from "../device-select";
import { Switch } from "../ui/switch";

const numericStringSchema = z
  .string()
  .regex(/^[+-]?\d+$/, "Пожалуйста введите число")
  .refine((val) => !(val === "+" || val === "-"), {
    message: "Пожалуйста введите число",
  });

const deviceSchema = z
  .object({
    devEui: z
      .string()
      .min(16, "EUI обязательное поле")
      .max(16, "EUI не может быть длиннее 16 символов"),
    deviceType: z.string().min(1, "Тип устройства обязательное поле"),
    isStationary: z.boolean(),
    x: z.string(),
    y: z.string(),
  })
  .superRefine((data, ctx) => {
    // Only validate coordinates when isStationary is true
    if (data.isStationary) {
      // Validate x
      const xResult = numericStringSchema.safeParse(data.x);
      if (!xResult.success) {
        xResult.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ["x"],
          });
        });
      }

      // Validate y
      const yResult = numericStringSchema.safeParse(data.y);
      if (!yResult.success) {
        yResult.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ["y"],
          });
        });
      }
    }
  });

const parseNumericInput = (input: string) => {
  const regex = /^[+-]?\d*$/;
  if (regex.test(input) || input === "" || input === "-" || input === "+") {
    return input;
  } else {
    return null;
  }
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function AddFloorDeviceDialog({ floorId }: { floorId: number }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const addDevice = useMutation({
    mutationKey: ["floor-devices"],
    mutationFn: (newDevice: {
      dev_eui: string;
      floor_id: number;
      device_type: string;
      is_stationary: boolean;
      x?: number;
      y?: number;
    }) =>
      fetch(API_BASE_URL + `/floors/${floorId}/devices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDevice),
      }).then((res) => res.json()),
    onSuccess: (data: FloorDevice) => {
      queryClient.setQueryData(["floor-devices"], (old: FloorDevice[] = []) => {
        return [data, ...old];
      });
      queryClient.invalidateQueries({ queryKey: ["floor-devices"] });

      setOpen(false);
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: {
      devEui: "",
      deviceType: "",
      isStationary: false,
      x: "",
      y: "",
    },
    validators: {
      onSubmit: deviceSchema,
      onChange: deviceSchema,
    },
    onSubmit: async ({ value }) => {
      await addDevice.mutateAsync({
        dev_eui: value.devEui,
        device_type: value.deviceType,
        floor_id: floorId,
        is_stationary: value.isStationary,
        ...(value.isStationary && {
          x: Number(value.x),
          y: Number(value.y),
        }),
      });
    },
  });

  const isCoordinatesDisabled = !useStore(
    form.store,
    (state) => state.values.isStationary
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label="Добавить устройство на этаж"
          size="icon"
          className="text-muted-foreground rounded-md"
        >
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить устройство</DialogTitle>
          <DialogDescription>
            Добавьте новое устройство на этаж
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-device-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="devEui"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Устройство</FieldLabel>
                    <DeviceSelect
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
              name="deviceType"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Тип устройства</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="MS0101"
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
              name="isStationary"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Стационарное</FieldLabel>
                      <FieldDescription>
                        Позиция стационарных устройств задается в ручную
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="x"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Координата x:
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        disabled={isCoordinatesDisabled}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const rawValue = parseNumericInput(e.target.value);
                          if (rawValue !== null) field.handleChange(rawValue);
                        }}
                        className="w-1/2"
                        aria-invalid={isInvalid}
                        placeholder="0"
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
                name="y"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Координата y:
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        disabled={isCoordinatesDisabled}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const rawValue = parseNumericInput(e.target.value);
                          if (rawValue !== null) field.handleChange(rawValue);
                        }}
                        className="w-1/2"
                        aria-invalid={isInvalid}
                        placeholder="0"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={addDevice.isPending}>
              {addDevice.isPending ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
