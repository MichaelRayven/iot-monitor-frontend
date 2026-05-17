import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { FloorDevice } from "@/types/device";
import { DeviceTypeSelect } from "../device-type-select";
import { Switch } from "../ui/switch";

const numericStringSchema = z
  .string()
  .regex(/^[+-]?\d+$/, "Пожалуйста введите число")
  .refine((val) => !(val === "+" || val === "-"), {
    message: "Пожалуйста введите число",
  });

const deviceSchema = z
  .object({
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

type UpdateFloorDeviceDialogProps = {
  device: FloorDevice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateFloorDeviceDialog({
  device,
  open,
  onOpenChange,
}: UpdateFloorDeviceDialogProps) {
  const queryClient = useQueryClient();

  const updateDevice = useMutation({
    mutationKey: ["update-floor-device", device.id],
    mutationFn: (updatedDevice: {
      floor_id: number;
      device_type: string;
      is_stationary: boolean;
      x?: number;
      y?: number;
    }) =>
      fetch(API_BASE_URL + `/floors/devices/${device.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDevice),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floor-devices"] });
      onOpenChange(false);
    },
  });

  const form = useForm({
    defaultValues: {
      deviceType: device.device_type ?? "",
      isStationary: device.is_stationary,
      x: device.x?.toString() ?? "",
      y: device.y?.toString() ?? "",
    },
    validators: {
      onSubmit: deviceSchema,
      onChange: deviceSchema,
    },
    onSubmit: async ({ value }) => {
      await updateDevice.mutateAsync({
        device_type: value.deviceType,
        floor_id: device.floor_id,
        is_stationary: value.isStationary,
        x: value.isStationary && value.x !== "" ? Number(value.x) : 0,
        y: value.isStationary && value.y !== "" ? Number(value.y) : 0,
      });
    },
  });

  const isCoordinatesDisabled = !useStore(
    form.store,
    (state) => state.values.isStationary
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Обновить устройство</DialogTitle>
          <DialogDescription>
            Измените параметры устройства {device.name ?? device.dev_eui}
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-device-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="deviceType"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Тип устройства</FieldLabel>
                    <DeviceTypeSelect
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      isInvalid={isInvalid}
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
                        className="w-full"
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
                        className="w-full"
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
            <Button type="submit" disabled={updateDevice.isPending}>
              {updateDevice.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
