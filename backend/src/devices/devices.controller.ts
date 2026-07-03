import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { ROOMS } from '../common/constants';

@Controller('api/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async getAllDevices() {
    return this.devicesService.getAllDevices();
  }

  @Get('room/:roomName')
  async getDevicesByRoom(@Param('roomName') roomName: string) {
    const normalized = this.normalizeRoomName(roomName);
    if (!normalized) {
      throw new NotFoundException(`Room "${roomName}" not found`);
    }
    return this.devicesService.getDevicesByRoom(normalized);
  }

  private normalizeRoomName(input: string): string | null {
    const lower = input.toLowerCase().replace(/\s+/g, ' ');
    for (const room of ROOMS) {
      if (room.toLowerCase() === lower) return room;
      if (lower === 'drawing' && room === 'Drawing Room') return room;
      if (lower === 'work1' && room === 'Work Room 1') return room;
      if (lower === 'work2' && room === 'Work Room 2') return room;
      if (lower === 'work room 1' && room === 'Work Room 1') return room;
      if (lower === 'work room 2' && room === 'Work Room 2') return room;
    }
    return null;
  }
}
