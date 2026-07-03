import { DashboardData, Device, DashboardSummary, Alert } from "./types";
import { getMockDashboardData } from "./mock-data";

const USE_MOCK = true;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDashboardData(): Promise<DashboardData> {
  if (USE_MOCK) {
    await delay(150 + Math.random() * 150);
    return getMockDashboardData();
  }
  const res = await fetch(`${API_BASE}/api/dashboard`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}

export async function getDevices(): Promise<Device[]> {
  if (USE_MOCK) {
    await delay(100 + Math.random() * 100);
    return getMockDashboardData().devices;
  }
  const res = await fetch(`${API_BASE}/api/dashboard/devices`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch devices");
  return res.json();
}

export async function getSummary(): Promise<DashboardSummary> {
  if (USE_MOCK) {
    await delay(100 + Math.random() * 100);
    return getMockDashboardData().summary;
  }
  const res = await fetch(`${API_BASE}/api/dashboard/summary`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function getAlerts(): Promise<Alert[]> {
  if (USE_MOCK) {
    await delay(100 + Math.random() * 100);
    return getMockDashboardData().alerts;
  }
  const res = await fetch(`${API_BASE}/api/dashboard/alerts`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}
