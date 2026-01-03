import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a 24-hour time string (HH:MM) to 12-hour format with AM/PM
 * @param time - Time in "HH:MM" format
 * @returns Time in "h:MM AM/PM" format
 */
export function formatTime(time: string): string {
  if (!time) return time
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}
