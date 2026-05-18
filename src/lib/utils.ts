import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: number) {
  if (typeof ts === "number") {
    const date = new Date(ts > 10000000000 ? ts : ts * 1000);
    return format(date, "PPp");
  }
  return String(ts || "-");
}
