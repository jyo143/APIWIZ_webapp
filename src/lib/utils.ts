import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rgbToHex(rgb: string): string | null {
  if (!rgb || typeof rgb !== "string") return null;
  if (rgb.startsWith("#")) return rgb.toLowerCase();

  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return null;

  const r = parseInt(result[0], 10);
  const g = parseInt(result[1], 10);
  const b = parseInt(result[2], 10);

  const hex =
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
  return hex;
}
