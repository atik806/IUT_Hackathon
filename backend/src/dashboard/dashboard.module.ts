import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DevicesModule } from '../devices/devices.module';
import { UsageModule } from '../usage/usage.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [DevicesModule, UsageModule, AlertsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
