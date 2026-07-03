import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Device, DeviceWithRoom, RoomSummary, RoomUsage } from '../common/types';
import { ROOMS, DEVICE_WATTAGE, DEVICES_PER_ROOM } from '../common/constants';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async getAllDevices(): Promise<DeviceWithRoom[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('devices')
      .select('*, rooms!inner(name)')
      .order('room_id')
      .order('name');

    if (error) {
      this.logger.error(`Failed to fetch devices: ${error.message}`);
      throw error;
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      room_id: d.room_id,
      status: d.status,
      power_draw_watts: d.power_draw_watts,
      last_changed: d.last_changed,
      created_at: d.created_at,
      room_name: d.rooms?.name ?? '',
    }));
  }

  async getDevicesByRoom(roomName: string): Promise<DeviceWithRoom[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('devices')
      .select('*, rooms!inner(name)')
      .eq('rooms.name', roomName)
      .order('name');

    if (error) {
      this.logger.error(`Failed to fetch devices for room ${roomName}: ${error.message}`);
      throw error;
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      room_id: d.room_id,
      status: d.status,
      power_draw_watts: d.power_draw_watts,
      last_changed: d.last_changed,
      created_at: d.created_at,
      room_name: d.rooms?.name ?? '',
    }));
  }

  async updateDeviceState(
    deviceId: string,
    status: boolean,
  ): Promise<void> {
    const wattage = await this.getDeviceWattage(deviceId);
    const power_draw_watts = status ? wattage : 0;

    const { error } = await this.supabase
      .getClient()
      .from('devices')
      .update({
        status,
        power_draw_watts,
        last_changed: new Date().toISOString(),
      })
      .eq('id', deviceId);

    if (error) {
      this.logger.error(`Failed to update device ${deviceId}: ${error.message}`);
      throw error;
    }
  }

  private async getDeviceWattage(deviceId: string): Promise<number> {
    const { data, error } = await this.supabase
      .getClient()
      .from('devices')
      .select('type')
      .eq('id', deviceId)
      .single();

    if (error || !data) {
      this.logger.error(`Failed to get device type for ${deviceId}`);
      return 0;
    }

    return DEVICE_WATTAGE[data.type as keyof typeof DEVICE_WATTAGE] ?? 0;
  }

  async getRoomSummary(): Promise<RoomSummary[]> {
    const allDevices = await this.getAllDevices();
    const summaries: RoomSummary[] = [];

    for (const roomName of ROOMS) {
      const roomDevices = allDevices.filter((d) => d.room_name === roomName);
      summaries.push({
        room_name: roomName,
        fans_on: roomDevices.filter((d) => d.type === 'fan' && d.status).length,
        fans_total: roomDevices.filter((d) => d.type === 'fan').length,
        lights_on: roomDevices.filter((d) => d.type === 'light' && d.status).length,
        lights_total: roomDevices.filter((d) => d.type === 'light').length,
      });
    }

    return summaries;
  }

  async getRoomUsage(): Promise<RoomUsage[]> {
    const allDevices = await this.getAllDevices();
    const usages: RoomUsage[] = [];

    for (const roomName of ROOMS) {
      const roomDevices = allDevices.filter((d) => d.room_name === roomName);
      usages.push({
        room_name: roomName,
        total_watts: roomDevices.reduce((sum, d) => sum + d.power_draw_watts, 0),
        devices_on: roomDevices.filter((d) => d.status).length,
        devices_total: roomDevices.length,
      });
    }

    return usages;
  }
}
