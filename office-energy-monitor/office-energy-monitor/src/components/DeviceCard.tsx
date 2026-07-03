"use client";

import { Fan, Lightbulb, Clock } from "lucide-react";
import { Device } from "@/lib/types";
import { getRelativeTime } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const isOn = device.status === "on";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${
        isOn
          ? "bg-slate-800/80 border-slate-700"
          : "bg-slate-800/40 border-slate-800"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
          device.type === "fan"
            ? isOn
              ? "bg-blue-500/15 text-blue-400"
              : "bg-slate-800 text-slate-600"
            : isOn
              ? "bg-amber-500/15 text-amber-400"
              : "bg-slate-800 text-slate-600"
        }`}
      >
        {device.type === "fan" ? (
          <Fan
            className={`w-5 h-5 ${
              isOn ? "animate-[spin_2s_linear_infinite]" : ""
            }`}
          />
        ) : (
          <Lightbulb
            className={`w-5 h-5 ${
              isOn ? "fill-amber-400/20" : "fill-none"
            }`}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200 truncate">
            {device.name}
          </span>
          <StatusBadge status={device.status} />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-slate-500 font-mono">
            {device.powerDraw}W
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-600">
            <Clock className="w-3 h-3" />
            {getRelativeTime(device.lastChanged)}
          </span>
        </div>
      </div>
    </div>
  );
}
