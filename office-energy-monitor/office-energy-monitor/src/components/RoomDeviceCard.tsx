"use client";

import { Building2, Zap } from "lucide-react";
import { Device, RoomSummary } from "@/lib/types";
import { formatPower } from "@/lib/utils";
import DeviceCard from "./DeviceCard";

interface RoomDeviceCardProps {
  room: RoomSummary;
  devices: Device[];
}

export default function RoomDeviceCard({
  room,
  devices,
}: RoomDeviceCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-200">{room.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {room.devicesOn} ON · {room.devicesOff} OFF
          </span>
          <span className="flex items-center gap-1 text-xs font-mono text-slate-300">
            <Zap className="w-3 h-3 text-amber-400" />
            {formatPower(room.power)}
          </span>
        </div>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}
