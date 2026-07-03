"use client";

import { DeviceStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: DeviceStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isOn = status === "on";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 ${
        isOn
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOn ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-slate-500"
        }`}
      />
      {isOn ? "ON" : "OFF"}
    </span>
  );
}
