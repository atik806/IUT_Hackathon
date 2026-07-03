"use client";

import { LayoutDashboard } from "lucide-react";
import { Device, RoomSummary, Alert } from "@/lib/types";
import RoomLayout from "./RoomLayout";

interface OfficeLayoutProps {
  rooms: RoomSummary[];
  devices: Device[];
  alerts: Alert[];
}

export default function OfficeLayout({
  rooms,
  devices,
  alerts,
}: OfficeLayoutProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Office Layout
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rooms.map((room) => (
          <RoomLayout
            key={room.name}
            name={room.name}
            devices={devices.filter((d) => d.room === room.name)}
            power={room.power}
            alerts={alerts.filter((a) => a.room === room.name)}
          />
        ))}
      </div>
    </section>
  );
}
