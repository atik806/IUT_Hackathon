"use client";

import { RefreshCw, Zap } from "lucide-react";
import { formatTimestamp, getRelativeTime } from "@/lib/utils";

interface DashboardHeaderProps {
  lastUpdated: string;
  onRefresh: () => void;
}

export default function DashboardHeader({
  lastUpdated,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-tight">
              Office Energy Monitor
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Live device and power monitoring dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
              <span className="font-medium text-emerald-400">Live</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="hidden sm:inline">
              Last updated: {formatTimestamp(lastUpdated)}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{getRelativeTime(lastUpdated)}</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
