export function formatCurrencyTHB(value: number) {
  if (Math.abs(value) >= 1_000_000) return `฿${(value / 1_000_000).toFixed(2)}M`;
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(value);
}

export function formatPercentage(value: number) {
  return `${value}%`;
}

export function formatPercentagePoint(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value} pp`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
