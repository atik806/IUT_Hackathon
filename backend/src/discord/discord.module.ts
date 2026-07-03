import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DevicesModule } from '../devices/devices.module';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [DevicesModule, UsageModule],
  providers: [DiscordService],
})
export class DiscordModule {}
