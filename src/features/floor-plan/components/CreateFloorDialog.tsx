import type { FormEvent } from "react";
import { useState } from "react";
import type { CreateFloorInput } from "../api";

type CreateFloorDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateFloorInput) => Promise<void>;
};

export function CreateFloorDialog({
  isOpen,
  onClose,
  onCreate,
}: CreateFloorDialogProps) {
  const [name, setName] = useState("");
  const [building, setBuilding] = useState("");
  const [scaleFactor, setScaleFactor] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();
    const nextScaleFactor = Number(scaleFactor);

    if (!nextName || nextScaleFactor <= 0) {
      setError("Enter a floor name and a positive scale factor.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onCreate({
        name: nextName,
        building: building.trim() || null,
        scale_factor: nextScaleFactor,
      });
      setName("");
      setBuilding("");
      setScaleFactor("1");
      onClose();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Failed to create floor"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <dialog className="dialog" open={isOpen}>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <div className="dialog-header">
          <h2>Create Floor</h2>
          <button type="button" className="icon-button" onClick={onClose}>
            x
          </button>
        </div>
        <label className="form-field">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="form-field">
          Building
          <input
            value={building}
            onChange={(event) => setBuilding(event.target.value)}
          />
        </label>
        <label className="form-field">
          Scale factor
          <input
            min="0.01"
            step="0.01"
            type="number"
            value={scaleFactor}
            onChange={(event) => setScaleFactor(event.target.value)}
            required
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
