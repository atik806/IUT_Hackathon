"use client";

import { Radio } from "lucide-react";
import { Device, RoomSummary } from "@/lib/types";
import RoomDeviceCard from "./RoomDeviceCard";

interface DeviceStatusPanelProps {
  devices: Device[];
  rooms: RoomSummary[];
}

export default function DeviceStatusPanel({
  devices,
  rooms,
}: DeviceStatusPanelProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Live Device Status
        </h2>
      </div>

      <div className="space-y-3">
        {rooms.map((room) => (
          <RoomDeviceCard
            key={room.name}
            room={room}
            devices={devices.filter((d) => d.room === room.name)}
          />
        ))}
      </div>
    </section>
  );
}
