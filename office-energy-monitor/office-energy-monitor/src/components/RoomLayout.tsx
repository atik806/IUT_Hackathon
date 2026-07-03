"use client";

import { Fan, Lightbulb, DoorOpen } from "lucide-react";
import { Device, Alert } from "@/lib/types";
import { formatPower } from "@/lib/utils";

interface RoomLayoutProps {
  name: string;
  devices: Device[];
  power: number;
  alerts?: Alert[];
}

export default function RoomLayout({
  name,
  devices,
  power,
  alerts = [],
}: RoomLayoutProps) {
  const hasAlerts = alerts.length > 0;
  const allOff = devices.every((d) => d.status === "off");
  const fans = devices.filter((d) => d.type === "fan");
  const lights = devices.filter((d) => d.type === "light");

  return (
    <div
      className={`relative rounded-2xl border p-4 transition-all duration-500 ${
        hasAlerts
          ? "border-amber-500/40 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
          : allOff
            ? "border-slate-800/30 bg-slate-950/40"
            : "border-slate-700/50 bg-slate-900/60"
      }`}
    >
      {hasAlerts && (
        <div className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">!</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              allOff ? "bg-slate-600" : hasAlerts ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <h3 className="text-sm font-semibold text-slate-200">{name}</h3>
        </div>
        <span className="text-xs font-mono font-medium text-slate-400">
          {formatPower(power)}
        </span>
      </div>

      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-center gap-3">
            {fans.map((fan) => (
              <div
                key={fan.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                  fan.status === "on"
                    ? "bg-blue-500/10"
                    : "bg-slate-800/50"
                }`}
              >
                <div
                  className={`transition-all duration-300 ${
                    fan.status === "on"
                      ? "text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]"
                      : "text-slate-600"
                  }`}
                >
                  <Fan
                    className={`w-5 h-5 ${
                      fan.status === "on" ? "animate-[spin_2s_linear_infinite]" : ""
                    }`}
                  />
                </div>
                <span
                  className={`text-[9px] font-medium ${
                    fan.status === "on" ? "text-blue-400/80" : "text-slate-600"
                  }`}
                >
                  {fan.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            {lights.map((light) => (
              <div
                key={light.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                  light.status === "on"
                    ? "bg-amber-500/10"
                    : "bg-slate-800/50"
                }`}
              >
                <div
                  className={`transition-all duration-300 ${
                    light.status === "on"
                      ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                      : "text-slate-600"
                  }`}
                >
                  <Lightbulb
                    className={`w-4 h-4 ${
                      light.status === "on" ? "fill-amber-400/30" : "fill-none"
                    }`}
                  />
                </div>
                <span
                  className={`text-[9px] font-medium ${
                    light.status === "on" ? "text-amber-400/80" : "text-slate-600"
                  }`}
                >
                  {light.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 pt-1">
          <DoorOpen className="w-4 h-4 text-slate-600" />
          <span className="text-[8px] text-slate-700 font-medium">DOOR</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800">
        <span
          className={`text-[10px] font-medium ${
            allOff ? "text-slate-600" : "text-slate-400"
          }`}
        >
          {devices.filter((d) => d.status === "on").length} ON ·{" "}
          {devices.filter((d) => d.status === "off").length} OFF
        </span>
      </div>
    </div>
  );
}
