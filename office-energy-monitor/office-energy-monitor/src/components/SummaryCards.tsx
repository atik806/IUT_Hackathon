"use client";

import { Zap, Power, PowerOff, Bell } from "lucide-react";
import { DashboardSummary } from "@/lib/types";
import { formatPower, getEnergyStatus } from "@/lib/utils";

interface SummaryCardsProps {
  summary: DashboardSummary;
  alertsCount: number;
}

export default function SummaryCards({
  summary,
  alertsCount,
}: SummaryCardsProps) {
  const energyStatus = getEnergyStatus(summary.totalPower);

  const cards = [
    {
      icon: Zap,
      label: "Total Current Power",
      value: formatPower(summary.totalPower),
      helper: `${summary.rooms.length} rooms active`,
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    {
      icon: Power,
      label: "Devices ON",
      value: summary.devicesOn.toString(),
      helper: `${summary.devicesOn + summary.devicesOff > 0 ? ((summary.devicesOn / (summary.devicesOn + summary.devicesOff)) * 100).toFixed(0) : 0}% of total`,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
    {
      icon: PowerOff,
      label: "Devices OFF",
      value: summary.devicesOff.toString(),
      helper: `${summary.devicesOn + summary.devicesOff > 0 ? ((summary.devicesOff / (summary.devicesOn + summary.devicesOff)) * 100).toFixed(0) : 0}% of total`,
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
      text: "text-slate-400",
    },
    {
      icon: Bell,
      label: "Active Alerts",
      value: alertsCount.toString(),
      helper: alertsCount === 0 ? "All clear" : "Requires attention",
      bg: alertsCount === 0 ? "bg-slate-500/10" : "bg-rose-500/10",
      border: alertsCount === 0 ? "border-slate-500/20" : "border-rose-500/20",
      text: alertsCount === 0 ? "text-slate-400" : "text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl ${card.bg} ${card.border} border p-4 transition-all duration-300 hover:border-opacity-50`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold ${card.text}`}>
                  {card.value}
                </p>
                <p className="text-xs text-slate-500">{card.helper}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${card.text}`} />
              </div>
            </div>
            {card.label === "Total Current Power" && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold uppercase ${energyStatus.color}`}
                  >
                    {energyStatus.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        summary.totalPower > 500
                          ? "bg-amber-500"
                          : summary.totalPower > 200
                            ? "bg-emerald-500"
                            : "bg-blue-500"
                      }`}
                      style={{
                        width: `${Math.min((summary.totalPower / 1000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {card.label === "Active Alerts" && alertsCount > 0 && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-[10px] text-rose-400/80 font-medium">
                  {alertsCount} alert{alertsCount > 1 ? "s" : ""} active
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
