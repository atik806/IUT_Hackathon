import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase/supabase.module';
import { SeedModule } from './seed/seed.module';
import { DevicesModule } from './devices/devices.module';
import { SimulatorModule } from './simulator/simulator.module';
import { UsageModule } from './usage/usage.module';
import { AlertsModule } from './alerts/alerts.module';
import { EmployeesModule } from './employees/employees.module';
import { DiscordModule } from './discord/discord.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    SupabaseModule,
    SeedModule,
    DevicesModule,
    SimulatorModule,
    UsageModule,
    AlertsModule,
    EmployeesModule,
    DiscordModule,
    DashboardModule,
  ],
})
export class AppModule {}
