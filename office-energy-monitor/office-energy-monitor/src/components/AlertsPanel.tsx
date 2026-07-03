"use client";

import { Bell, CheckCircle2 } from "lucide-react";
import { Alert } from "@/lib/types";
import AlertCard from "./AlertCard";

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const hasAlerts = alerts.length > 0;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Active Alerts
          </h2>
        </div>
        {hasAlerts && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
            {alerts.length} active
          </span>
        )}
      </div>

      {hasAlerts ? (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-300">No active alerts</p>
          <p className="text-xs text-slate-500 mt-1">
            Everything looks good.
          </p>
        </div>
      )}
    </section>
  );
}
