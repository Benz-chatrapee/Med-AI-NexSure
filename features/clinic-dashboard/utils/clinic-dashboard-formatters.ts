export const bahtFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export function formatBaht(value: number) {
  return bahtFormatter.format(value);
}

export function statusLabel(status: string) {
  if (status === "good") return "Good";
  if (status === "warning") return "Attention";
  if (status === "critical") return "Critical";
  return "Normal";
}
