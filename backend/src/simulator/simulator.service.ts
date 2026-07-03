import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { DevicesService } from '../devices/devices.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ROOMS, SIMULATOR_INTERVAL_MIN_MS, SIMULATOR_INTERVAL_MAX_MS, DEVICES_TO_TOGGLE_PER_TICK, DEVICE_WATTAGE } from '../common/constants';

@Injectable()
export class SimulatorService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(SimulatorService.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private readonly devicesService: DevicesService,
    private readonly supabase: SupabaseService,
  ) {}

  onApplicationBootstrap(): void {
    this.logger.log('Starting device simulator...');
    this.running = true;
    this.scheduleTick();
  }

  onApplicationShutdown(): void {
    this.running = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
    }
  }

  private scheduleTick(): void {
    if (!this.running) return;

    const delay =
      SIMULATOR_INTERVAL_MIN_MS +
      Math.random() * (SIMULATOR_INTERVAL_MAX_MS - SIMULATOR_INTERVAL_MIN_MS);

    this.intervalId = setTimeout(async () => {
      await this.tick();
      this.scheduleTick();
    }, delay);
  }

  private async tick(): Promise<void> {
    try {
      const devices = await this.devicesService.getAllDevices();
      if (devices.length === 0) return;

      const count =
        DEVICES_TO_TOGGLE_PER_TICK.min +
        Math.floor(Math.random() * (DEVICES_TO_TOGGLE_PER_TICK.max - DEVICES_TO_TOGGLE_PER_TICK.min + 1));

      const shuffled = [...devices].sort(() => Math.random() - 0.5);
      const toToggle = shuffled.slice(0, Math.min(count, shuffled.length));

      for (const device of toToggle) {
        const newStatus = !device.status;
        await this.devicesService.updateDeviceState(device.id, newStatus);
      }

      await this.logUsage(devices, toToggle);
    } catch (error) {
      this.logger.error(`Simulator tick error: ${(error as Error).message}`);
    }
  }

  private async logUsage(
    allDevices: Awaited<ReturnType<DevicesService['getAllDevices']>>,
    toggled: Awaited<ReturnType<DevicesService['getAllDevices']>>,
  ): Promise<void> {
    const totals: { room_id: string; total_watts: number }[] = [];

    for (const roomName of ROOMS) {
      const roomDevices = allDevices.filter((d) => d.room_name === roomName);
      const room = await this.getRoomId(roomName);
      if (!room) continue;

      const total_watts = roomDevices.reduce((sum, d) => {
        const wasToggled = toggled.find((t) => t.id === d.id);
        const effectiveStatus = wasToggled ? !wasToggled.status : d.status;
        const wattage = effectiveStatus
          ? DEVICE_WATTAGE[d.type]
          : 0;
        return sum + wattage;
      }, 0);

      totals.push({ room_id: room.id, total_watts });
    }

    for (const t of totals) {
      await this.supabase
        .getClient()
        .from('usage_logs')
        .insert({ room_id: t.room_id, total_watts: t.total_watts });
    }
  }

  private roomIdCache: Record<string, string> = {};

  private async getRoomId(roomName: string): Promise<{ id: string } | null> {
    if (this.roomIdCache[roomName]) {
      return { id: this.roomIdCache[roomName] };
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('rooms')
      .select('id')
      .eq('name', roomName)
      .single();

    if (error || !data) {
      this.logger.error(`Failed to get room ID for ${roomName}: ${error?.message}`);
      return null;
    }

    this.roomIdCache[roomName] = data.id;
    return data;
  }
}
