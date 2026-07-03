import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ROOMS, DEVICES_PER_ROOM, DEVICE_WATTAGE } from '../common/constants';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedRooms();
    await this.seedEmployees();
  }

  private async seedRooms(): Promise<void> {
    const { data: existing } = await this.supabase
      .getClient()
      .from('rooms')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      this.logger.log('Rooms already seeded, skipping.');
      return;
    }

    this.logger.log('Seeding rooms and devices...');

    for (const roomName of ROOMS) {
      const { data: room, error: roomError } = await this.supabase
        .getClient()
        .from('rooms')
        .insert({ name: roomName })
        .select()
        .single();

      if (roomError || !room) {
        this.logger.error(`Failed to create room ${roomName}: ${roomError?.message}`);
        continue;
      }

      const devices: { name: string; type: 'fan' | 'light'; room_id: string; status: boolean; power_draw_watts: number }[] = [];

      for (let i = 1; i <= DEVICES_PER_ROOM.fans; i++) {
        devices.push({
          name: `Fan ${i}`,
          type: 'fan',
          room_id: room.id,
          status: false,
          power_draw_watts: 0,
        });
      }

      for (let i = 1; i <= DEVICES_PER_ROOM.lights; i++) {
        devices.push({
          name: `Light ${i}`,
          type: 'light',
          room_id: room.id,
          status: false,
          power_draw_watts: 0,
        });
      }

      const { error: devicesError } = await this.supabase
        .getClient()
        .from('devices')
        .insert(devices);

      if (devicesError) {
        this.logger.error(`Failed to seed devices for ${roomName}: ${devicesError.message}`);
      }
    }

    this.logger.log('Rooms and devices seeded successfully.');
  }

  private async seedEmployees(): Promise<void> {
    const { data: existing } = await this.supabase
      .getClient()
      .from('employees')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      this.logger.log('Employees already seeded, skipping.');
      return;
    }

    this.logger.log('Seeding employees...');

    const employees = [
      { name: 'Nafisa Rahman', email: 'nafisa.rahman@yahoo.com', phone: '+8801812345678' },
      { name: 'Tanvir Hossain', email: 'tanvir.hossain@yahoo.com', phone: '+8801912345678' },
    ];

    const { error } = await this.supabase
      .getClient()
      .from('employees')
      .insert(employees);

    if (error) {
      this.logger.error(`Failed to seed employees: ${error.message}`);
    } else {
      this.logger.log('Employees seeded successfully.');
    }
  }
}
