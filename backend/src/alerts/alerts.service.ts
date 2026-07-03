import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { DevicesService } from '../devices/devices.service';
import { ROOMS, OFFICE_HOURS_START, OFFICE_HOURS_END, CONTINUOUS_ON_THRESHOLD_MS, ALERT_CHECK_INTERVAL_MS } from '../common/constants';
import { Alert } from '../common/types';

@Injectable()
export class AlertsService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AlertsService.name);
  private checkIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly devicesService: DevicesService,
  ) {}

  onApplicationBootstrap(): void {
    this.logger.log('Starting alert checker...');
    this.checkIntervalId = setInterval(() => this.checkAlerts(), ALERT_CHECK_INTERVAL_MS);
  }

  onApplicationShutdown(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
  }

  async getActiveAlerts(): Promise<Alert[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('alerts')
      .select('*, rooms!inner(name)')
      .eq('is_active', true)
      .order('triggered_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to fetch alerts: ${error.message}`);
      throw error;
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      message: a.message,
      severity: a.severity,
      room_id: a.room_id,
      device_id: a.device_id,
      triggered_at: a.triggered_at,
      resolved_at: a.resolved_at,
      is_active: a.is_active,
    }));
  }

  private async checkAlerts(): Promise<void> {
    try {
      const devices = await this.devicesService.getAllDevices();
      const now = new Date();
      const currentHour = now.getHours();
      const isAfterHours = currentHour < OFFICE_HOURS_START || currentHour >= OFFICE_HOURS_END;

      for (const roomName of ROOMS) {
        const roomDevices = devices.filter((d) => d.room_name === roomName);
        const onDevices = roomDevices.filter((d) => d.status);

        if (onDevices.length === 0) {
          await this.resolveAllRoomAlerts(roomDevices[0]?.room_id);
          continue;
        }

        // Rule 1: After-hours devices
        if (isAfterHours) {
          const deviceNames = onDevices.map((d) => d.name).join(', ');
          const message = `${roomName} still has ${onDevices.length} device(s) ON after hours (${deviceNames}). Time: ${now.toLocaleTimeString()}`;
          await this.createAlert(message, 'warning', roomDevices[0]?.room_id);
        }

        // Rule 2: Room all-on for >2 hours
        if (onDevices.length === roomDevices.length) {
          const earliestChanged = new Date(
            Math.min(...onDevices.map((d) => new Date(d.last_changed).getTime())),
          );
          const durationMs = now.getTime() - earliestChanged.getTime();

          if (durationMs >= CONTINUOUS_ON_THRESHOLD_MS) {
            const hoursOn = (durationMs / (1000 * 60 * 60)).toFixed(1);
            const message = `${roomName} has had all devices ON for ${hoursOn} hours continuously!`;
            await this.createAlert(message, 'critical', roomDevices[0]?.room_id);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Alert check error: ${(error as Error).message}`);
    }
  }

  private async createAlert(
    message: string,
    severity: 'info' | 'warning' | 'critical',
    roomId: string | null | undefined,
  ): Promise<void> {
    if (!roomId) return;

    const { data: existing } = await this.supabase
      .getClient()
      .from('alerts')
      .select('id')
      .eq('message', message)
      .eq('is_active', true)
      .limit(1);

    if (existing && existing.length > 0) {
      return;
    }

    await this.supabase
      .getClient()
      .from('alerts')
      .insert({
        message,
        severity,
        room_id: roomId,
      });
  }

  private async resolveAllRoomAlerts(roomId: string | null | undefined): Promise<void> {
    if (!roomId) return;

    await this.supabase
      .getClient()
      .from('alerts')
      .update({ is_active: false, resolved_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('is_active', true);
  }
}
