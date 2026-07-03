"use client";

import { Building2 } from "lucide-react";
import { RoomSummary } from "@/lib/types";
import { formatPower } from "@/lib/utils";

interface RoomPowerBreakdownProps {
  rooms: RoomSummary[];
  totalPower: number;
}

function getBarColor(power: number): string {
  if (power === 0) return "bg-slate-700";
  if (power < 100) return "bg-blue-500";
  if (power < 200) return "bg-emerald-500";
  if (power < 300) return "bg-amber-500";
  return "bg-red-500";
}

function getLabelColor(power: number): string {
  if (power === 0) return "text-slate-500";
  if (power < 100) return "text-blue-400";
  if (power < 200) return "text-emerald-400";
  if (power < 300) return "text-amber-400";
  return "text-red-400";
}

export default function RoomPowerBreakdown({
  rooms,
  totalPower,
}: RoomPowerBreakdownProps) {
  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const pct = totalPower > 0 ? (room.power / totalPower) * 100 : 0;

        return (
          <div key={room.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400 font-medium">{room.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-semibold ${getLabelColor(room.power)}`}
                >
                  {formatPower(room.power)}
                </span>
                <span className="text-slate-600 w-8 text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getBarColor(room.power)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
