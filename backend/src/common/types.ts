export type DeviceType = 'fan' | 'light';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Room {
  id: string;
  name: string;
  created_at: string;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room_id: string;
  status: boolean;
  power_draw_watts: number;
  last_changed: string;
  created_at: string;
}

export interface DeviceWithRoom extends Device {
  room_name: string;
}

export interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  room_id: string | null;
  device_id: string | null;
  triggered_at: string;
  resolved_at: string | null;
  is_active: boolean;
}

export interface UsageLog {
  id: string;
  room_id: string | null;
  total_watts: number;
  timestamp: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface RoomUsage {
  room_name: string;
  total_watts: number;
  devices_on: number;
  devices_total: number;
}

export interface UsageResponse {
  total_watts: number;
  per_room: RoomUsage[];
  daily_kwh_estimate: number;
}

export interface RoomSummary {
  room_name: string;
  fans_on: number;
  fans_total: number;
  lights_on: number;
  lights_total: number;
}
