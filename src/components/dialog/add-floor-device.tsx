import { useForm, useStore } from "@tanstack/react-form";
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
import { useAddFloorDevice } from "@/hooks/useAddFloorDevice";
import { DeviceSelect } from "../device-select";
import { DeviceTypeSelect } from "../device-type-select";
import { Switch } from "../ui/switch";
import { MoveDeviceConfirmDialog } from "./move-device-confirm-dialog";

const BEACON_TYPE = "Beacon";

const numericStringSchema = z
  .string()
  .regex(/^[+-]?\d+$/, "Пожалуйста введите число")
  .refine((val) => !(val === "+" || val === "-"), {
    message: "Пожалуйста введите число",
  });

const deviceSchema = z
  .object({
    uid: z.string().min(1, "UID обязательное поле"),
    deviceType: z.string().min(1, "Тип устройства обязательное поле"),
    name: z.string(),
    isStationary: z.boolean(),
    x: z.string(),
    y: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.deviceType === BEACON_TYPE && data.name.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Название обязательно для маячка",
        path: ["name"],
      });
    }

    if (data.isStationary) {
      const xResult = numericStringSchema.safeParse(data.x);
      if (!xResult.success) {
        xResult.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ["x"] });
        });
      }
      const yResult = numericStringSchema.safeParse(data.y);
      if (!yResult.success) {
        yResult.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ["y"] });
        });
      }
    }
  });

const parseNumericInput = (input: string) => {
  const regex = /^[+-]?\d*$/;
  if (regex.test(input) || input === "" || input === "-" || input === "+") {
    return input;
  }
  return null;
};

export function AddFloorDeviceDialog({ floorId }: { floorId: number }) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      uid: "",
      deviceType: "",
      name: "",
      isStationary: false,
      x: "",
      y: "",
    },
    validators: {
      onSubmit: deviceSchema,
      onChange: deviceSchema,
    },
    onSubmit: async ({ value }) => {
      await addMutation.mutateAsync({
        uid: value.uid,
        device_type: value.deviceType,
        floor_id: floorId,
        is_stationary: value.isStationary,
        ...(value.name.trim() ? { name: value.name.trim() } : {}),
        ...(value.isStationary && {
          x: Number(value.x),
          y: Number(value.y),
        }),
      });
    },
  });

  const { addMutation, moveMutation, conflict, dismissConflict } =
    useAddFloorDevice(floorId, () => {
      setOpen(false);
      form.reset();
    });

  const isCoordinatesDisabled = !useStore(
    form.store,
    (state) => state.values.isStationary
  );

  const isBeacon = useStore(
    form.store,
    (state) => state.values.deviceType === BEACON_TYPE
  );

  return (
    <>
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
                name="deviceType"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Тип устройства
                      </FieldLabel>
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
              {/* Vega device picker — shown for non-beacon types */}
              {!isBeacon && (
                <form.Field
                  name="uid"
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
              )}
              {/* Beacon UID (MAC) and name — shown only for beacons */}
              {isBeacon && (
                <>
                  <form.Field
                    name="uid"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            MAC-адрес маячка
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="AA:BB:CC:DD:EE:FF"
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
                    name="name"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Название маячка
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Вход — Зона A"
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </>
              )}
              <form.Field
                name="isStationary"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field orientation="horizontal" data-invalid={isInvalid}>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Стационарное
                        </FieldLabel>
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
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Создание..." : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <MoveDeviceConfirmDialog
        open={conflict !== null}
        isPending={moveMutation.isPending}
        onConfirm={() => moveMutation.mutate()}
        onCancel={dismissConflict}
      />
    </>
  );
}
