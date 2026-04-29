import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (val: number | string | null | undefined) => {
  if (val === null || val === undefined || isNaN(Number(val))) return "0";
  return new Intl.NumberFormat("ko-KR").format(Number(val));
};

export const formatPrice = (price: number, status: string) => {
  const s = String(status);
  const symbol = s === '2' || s === '1' || s === '상승' ? "▲" : s === '5' || s === '4' || s === '하락' ? "▼" : "-";
  return `${symbol} ${formatNumber(price)}`;
};
