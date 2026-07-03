export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatFullTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function formatPower(watts: number): string {
  return `${watts}W`;
}

export function getEnergyStatus(totalPower: number): {
  label: string;
  color: string;
} {
  if (totalPower === 0) return { label: "Idle", color: "text-slate-400" };
  if (totalPower < 200)
    return { label: "Low", color: "text-emerald-400" };
  if (totalPower < 500)
    return { label: "Normal", color: "text-blue-400" };
  if (totalPower < 1000)
    return { label: "Moderate", color: "text-amber-400" };
  return { label: "High", color: "text-red-400" };
}

export const OFFICE_HOURS = { start: 9, end: 17 };

export function isAfterHours(): boolean {
  const hour = new Date().getHours();
  return hour < OFFICE_HOURS.start || hour >= OFFICE_HOURS.end;
}
