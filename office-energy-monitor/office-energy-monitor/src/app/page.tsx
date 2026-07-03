"use client";

import { useState, useEffect, useCallback } from "react";
import { getDashboardData } from "@/lib/api";
import { DashboardData } from "@/lib/types";
import DashboardHeader from "@/components/DashboardHeader";
import SummaryCards from "@/components/SummaryCards";
import OfficeLayout from "@/components/OfficeLayout";
import DeviceStatusPanel from "@/components/DeviceStatusPanel";
import PowerMeter from "@/components/PowerMeter";
import AlertsPanel from "@/components/AlertsPanel";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await getDashboardData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await getDashboardData();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch dashboard data"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    const interval = setInterval(run, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DashboardHeader
        lastUpdated={data.lastUpdated}
        onRefresh={fetchData}
      />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-12">
        <SummaryCards
          summary={data.summary}
          alertsCount={data.alerts.length}
        />
        <OfficeLayout
          rooms={data.summary.rooms}
          devices={data.devices}
          alerts={data.alerts}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceStatusPanel
            devices={data.devices}
            rooms={data.summary.rooms}
          />
          <div className="space-y-6">
            <PowerMeter summary={data.summary} />
            <AlertsPanel alerts={data.alerts} />
          </div>
        </div>
      </main>
    </div>
  );
}
