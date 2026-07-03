export type DeviceType = "fan" | "light";
export type DeviceStatus = "on" | "off";
export type AlertSeverity = "info" | "warning" | "critical";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room: string;
  status: DeviceStatus;
  powerDraw: number;
  lastChanged: string;
}

export interface RoomSummary {
  name: string;
  power: number;
  devicesOn: number;
  devicesOff: number;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  room?: string;
  message: string;
  timestamp: string;
  recommendation?: string;
}

export interface DashboardSummary {
  totalPower: number;
  devicesOn: number;
  devicesOff: number;
  todayUsageKwh: number;
  rooms: RoomSummary[];
}

export interface DashboardData {
  devices: Device[];
  summary: DashboardSummary;
  alerts: Alert[];
  lastUpdated: string;
}
