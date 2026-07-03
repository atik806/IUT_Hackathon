"use client";

import { Gauge, Zap } from "lucide-react";
import { DashboardSummary } from "@/lib/types";
import { formatPower, getEnergyStatus } from "@/lib/utils";
import RoomPowerBreakdown from "./RoomPowerBreakdown";

interface PowerMeterProps {
  summary: DashboardSummary;
}

export default function PowerMeter({ summary }: PowerMeterProps) {
  const energyStatus = getEnergyStatus(summary.totalPower);
  const maxLoad = 1000;
  const loadPct = Math.min((summary.totalPower / maxLoad) * 100, 100);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Power Consumption
          </h2>
        </div>
        <span
          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
            energyStatus.label === "Normal"
              ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
              : energyStatus.label === "Low"
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : energyStatus.label === "Moderate"
                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                  : "text-red-400 border-red-500/30 bg-red-500/10"
          }`}
        >
          {energyStatus.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            summary.totalPower > 500
              ? "bg-amber-500/15"
              : summary.totalPower > 0
                ? "bg-emerald-500/15"
                : "bg-slate-800"
          }`}
        >
          <Zap
            className={`w-7 h-7 ${
              summary.totalPower > 0
                ? "text-emerald-400"
                : "text-slate-600"
            }`}
          />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-100">
            {formatPower(summary.totalPower)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Total current load
            {summary.todayUsageKwh > 0 && (
              <span className="ml-2 text-slate-600">
                · Today: {summary.todayUsageKwh.toFixed(1)} kWh
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Load intensity</span>
          <span>{loadPct.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              loadPct > 80
                ? "bg-gradient-to-r from-amber-500 to-red-500"
                : loadPct > 50
                  ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                  : "bg-gradient-to-r from-blue-500 to-emerald-500"
            }`}
            style={{ width: `${loadPct}%` }}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800">
        <RoomPowerBreakdown
          rooms={summary.rooms}
          totalPower={summary.totalPower}
        />
      </div>
    </section>
  );
}
