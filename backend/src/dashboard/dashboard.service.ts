import { Injectable, Logger } from '@nestjs/common';
import { DevicesService } from '../devices/devices.service';
import { UsageService } from '../usage/usage.service';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly devicesService: DevicesService,
    private readonly usageService: UsageService,
    private readonly alertsService: AlertsService,
  ) {}

  async getDashboardData() {
    const [deviceRows, usageResponse, alertRows] = await Promise.all([
      this.devicesService.getAllDevices(),
      this.usageService.getUsage(),
      this.alertsService.getActiveAlerts(),
    ]);

    const roomMap = new Map<string, string>();
    for (const d of deviceRows) {
      if (d.room_id && !roomMap.has(d.room_id)) {
        roomMap.set(d.room_id, d.room_name);
      }
    }

    const devices = deviceRows.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      room: d.room_name,
      status: d.status ? 'on' as const : 'off' as const,
      powerDraw: d.power_draw_watts,
      lastChanged: d.last_changed,
    }));

    const rooms = usageResponse.per_room.map((r) => ({
      name: r.room_name,
      power: r.total_watts,
      devicesOn: r.devices_on,
      devicesOff: r.devices_total - r.devices_on,
    }));

    const devicesOn = usageResponse.per_room.reduce((s, r) => s + r.devices_on, 0);
    const devicesOff = usageResponse.per_room.reduce((s, r) => s + (r.devices_total - r.devices_on), 0);

    const alerts = alertRows.map((a) => ({
      id: a.id,
      severity: a.severity,
      room: a.room_id ? roomMap.get(a.room_id) : undefined,
      message: a.message,
      timestamp: a.triggered_at,
      recommendation:
        a.severity === 'critical'
          ? 'Immediate attention required. Devices may have been forgotten.'
          : a.severity === 'warning'
            ? 'Please check the room before leaving.'
            : 'Consider reviewing device schedules.',
    }));

    return {
      devices,
      summary: {
        totalPower: usageResponse.total_watts,
        devicesOn,
        devicesOff,
        todayUsageKwh: usageResponse.daily_kwh_estimate,
        rooms,
      },
      alerts,
      lastUpdated: new Date().toISOString(),
    };
  }
}
