import { Controller, Get, Query } from '@nestjs/common';
import { UsageService } from './usage.service';

@Controller('api/usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  async getUsage() {
    return this.usageService.getUsage();
  }

  @Get('history')
  async getHistory(@Query('hours') hours?: string) {
    const h = hours ? parseInt(hours, 10) : 24;
    return this.usageService.getUsageHistory(h);
  }
}
