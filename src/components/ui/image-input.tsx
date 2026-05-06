import { CameraIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useEffect, useId, useState } from "react"

type ImageUploadInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
>

export function ImageInput({
  id,
  className,
  onChange,
  ...props
}: ImageUploadInputProps) {
  const inputId = useId()
  const finalId = id ?? inputId

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }

    onChange?.(event)
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <div className={cn("w-full", className)}>
      <Input
        id={finalId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        {...props}
      />

      <label
        htmlFor={finalId}
        className="relative flex aspect-5/2 w-full cursor-pointer flex-col items-center justify-center shadow-xs overflow-hidden rounded-lg border border-dashed border-input bg-background text-muted-foreground transition-colors hover:bg-muted/50"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Предпросмотр изображения"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-sm font-semibold">Загрузить изображение</span>
            <CameraIcon
                className="h-8 w-8" strokeWidth={1.4}/>
          </div>
        )}
      </label>
    </div>
  )
}