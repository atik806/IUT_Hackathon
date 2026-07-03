"use client";

import {
  AlertTriangle,
  Info,
  AlertOctagon,
  Clock,
  Lightbulb,
} from "lucide-react";
import { Alert, AlertSeverity } from "@/lib/types";
import { formatFullTimestamp } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
}

const severityConfig: Record<
  AlertSeverity,
  {
    icon: typeof AlertTriangle;
    border: string;
    bg: string;
    dot: string;
    label: string;
    labelBg: string;
    text: string;
  }
> = {
  critical: {
    icon: AlertOctagon,
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    dot: "bg-red-400",
    label: "Critical",
    labelBg: "bg-red-500/15 text-red-400",
    text: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    dot: "bg-amber-400",
    label: "Warning",
    labelBg: "bg-amber-500/15 text-amber-400",
    text: "text-amber-400",
  },
  info: {
    icon: Info,
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    dot: "bg-blue-400",
    label: "Info",
    labelBg: "bg-blue-500/15 text-blue-400",
    text: "text-blue-400",
  },
};

export default function AlertCard({ alert }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg} p-3.5 transition-all duration-300 ${
        alert.severity === "critical" ? "animate-[alertPulse_2s_ease-in-out_infinite]" : ""
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}
        >
          <Icon className={`w-4 h-4 ${config.text}`} />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${config.labelBg}`}
            >
              {config.label}
            </span>
            {alert.room && (
              <span className="text-[10px] text-slate-500">{alert.room}</span>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {alert.message}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatFullTimestamp(alert.timestamp)}
            </span>
          </div>

          {alert.recommendation && (
            <div className="flex items-start gap-1.5 pt-1">
              <Lightbulb className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-500 italic">
                {alert.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
