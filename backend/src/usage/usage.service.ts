import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { DevicesService } from '../devices/devices.service';
import { UsageResponse, RoomUsage } from '../common/types';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    private readonly devicesService: DevicesService,
    private readonly supabase: SupabaseService,
  ) {}

  async getUsage(): Promise<UsageResponse> {
    const perRoom = await this.devicesService.getRoomUsage();
    const total_watts = perRoom.reduce((sum, r) => sum + r.total_watts, 0);

    const daily_kwh = total_watts > 0
      ? parseFloat(((total_watts * 24) / 1000).toFixed(2))
      : 0;

    return { total_watts, per_room: perRoom, daily_kwh_estimate: daily_kwh };
  }

  async getUsageHistory(hours: number = 24): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await this.supabase
      .getClient()
      .from('usage_logs')
      .select('*, rooms!inner(name)')
      .gte('timestamp', since)
      .order('timestamp', { ascending: false })
      .limit(500);

    if (error) {
      this.logger.error(`Failed to fetch usage history: ${error.message}`);
      throw error;
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      room_name: d.rooms?.name ?? 'Unknown',
      total_watts: d.total_watts,
      timestamp: d.timestamp,
    }));
  }
}
