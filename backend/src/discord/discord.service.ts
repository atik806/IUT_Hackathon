import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import { env } from '../config/env';
import { DevicesService } from '../devices/devices.service';
import { UsageService } from '../usage/usage.service';
import { SupabaseService } from '../supabase/supabase.service';
import { DISCORD_COMMAND_PREFIX, ROOMS } from '../common/constants';

@Injectable()
export class DiscordService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(DiscordService.name);
  private client: Client | null = null;

  constructor(
    private readonly devicesService: DevicesService,
    private readonly usageService: UsageService,
    private readonly supabase: SupabaseService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!env.discordBotToken) {
      this.logger.warn('DISCORD_BOT_TOKEN not set — Discord bot disabled.');
      return;
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.once(Events.ClientReady, (c) => {
      this.logger.log(`Discord bot logged in as ${c.user.tag}`);
      this.setupRealtimeAlerts();
    });

    this.client.on(Events.MessageCreate, (message) => {
      if (message.author.bot) return;
      this.handleCommand(message);
    });

    try {
      await this.client.login(env.discordBotToken);
    } catch (error) {
      this.logger.error(`Discord login failed: ${(error as Error).message}. Bot disabled.`);
      this.client.destroy();
      this.client = null;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
    }
  }

  private async handleCommand(message: any): Promise<void> {
    const content = message.content.trim();
    if (!content.startsWith(DISCORD_COMMAND_PREFIX)) return;

    const args = content.slice(DISCORD_COMMAND_PREFIX.length).trim().split(/\s+/);
    const command = args[0]?.toLowerCase();
    const rest = args.slice(1).join(' ');

    try {
      switch (command) {
        case 'status':
          await this.cmdStatus(message);
          break;
        case 'room':
          await this.cmdRoom(message, rest);
          break;
        case 'usage':
          await this.cmdUsage(message);
          break;
        default:
          await message.reply(`Unknown command. Try \`!status\`, \`!room <name>\`, or \`!usage\`.`);
      }
    } catch (error) {
      this.logger.error(`Command error: ${(error as Error).message}`);
      await message.reply('Sorry, something went wrong. Try again later.');
    }
  }

  private async cmdStatus(message: any): Promise<void> {
    const summaries = await this.devicesService.getRoomSummary();
    const lines = summaries.map((s) => {
      const parts: string[] = [];
      if (s.fans_on > 0) parts.push(`${s.fans_on} fan${s.fans_on > 1 ? 's' : ''} ON`);
      else parts.push('all fans OFF');
      if (s.lights_on > 0) parts.push(`${s.lights_on} light${s.lights_on > 1 ? 's' : ''} ON`);
      else parts.push('all lights OFF');
      return `**${s.room_name}**: ${parts.join(', ')}.`;
    });

    const responseText = lines.join('\n');
    await message.reply(await this.humanize(`Provide a friendly office status summary: ${responseText}`));
  }

  private async cmdRoom(message: any, roomInput: string): Promise<void> {
    if (!roomInput) {
      await message.reply('Please specify a room name. Try `!room drawing`, `!room work1`, or `!room work2`.');
      return;
    }

    const normalized = this.normalizeRoomName(roomInput);
    if (!normalized) {
      await message.reply(`Couldn't find a room matching "${roomInput}". Try: Drawing Room, Work Room 1, Work Room 2.`);
      return;
    }

    const devices = await this.devicesService.getDevicesByRoom(normalized);
    if (!devices || devices.length === 0) {
      await message.reply(`No devices found for "${normalized}".`);
      return;
    }

    const onDevices = devices.filter((d) => d.status);
    const roomName = devices[0].room_name;

    if (onDevices.length === 0) {
      await message.reply(await this.humanize(`All devices in ${roomName} are OFF.`));
      return;
    }

    const details = onDevices.map((d) => `${d.name} (${d.power_draw_watts}W)`).join(', ');
    const totalW = onDevices.reduce((s, d) => s + d.power_draw_watts, 0);
    const text = `${roomName} has ${onDevices.length} device(s) ON: ${details}. Total: ${totalW}W.`;
    await message.reply(await this.humanize(text));
  }

  private async cmdUsage(message: any): Promise<void> {
    const usage = await this.usageService.getUsage();
    const text = `Total power: ${usage.total_watts}W. Per room: ${usage.per_room.map((r) => `${r.room_name}: ${r.total_watts}W`).join(', ')}. Estimated daily: ${usage.daily_kwh_estimate} kWh.`;
    await message.reply(await this.humanize(text));
  }

  private async humanize(context: string): Promise<string> {
    if (!env.groqApiKey || env.groqApiKey.startsWith('your-')) return this.fallbackTemplate(context);

    try {
      const { default: Groq } = await import('groq-sdk');
      const groq = new Groq({ apiKey: env.groqApiKey });

      const completion = await groq.chat.completions.create({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly office assistant responding on a Discord bot. Keep responses concise (2-3 sentences), conversational, and human. Use emojis sparingly. Never mention that you are an AI.',
          },
          {
            role: 'user',
            content: context,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content?.trim() ?? this.fallbackTemplate(context);
    } catch (error) {
      this.logger.warn(`LLM call failed: ${(error as Error).message}. Using fallback.`);
      return this.fallbackTemplate(context);
    }
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

  private fallbackTemplate(context: string): string {
    const summaryPrefix = 'Provide a friendly office status summary: ';
    if (context.startsWith(summaryPrefix)) {
      return context.slice(summaryPrefix.length).replace(/\. /g, '.\n');
    }
    return context.replace(/\*\*(.*?)\*\*/g, '$1');
  }

  private setupRealtimeAlerts(): void {
    if (!env.discordAlertChannelId) {
      this.logger.warn('DISCORD_ALERT_CHANNEL_ID not set — proactive alerts disabled.');
      return;
    }

    this.supabase.subscribeToTable('alerts', 'INSERT', async (payload) => {
      const alert = payload.new as any;
      if (!alert.is_active) return;

      const channel = this.client?.channels.cache.get(env.discordAlertChannelId) as TextChannel;
      if (!channel) {
        this.logger.warn(`Alert channel ${env.discordAlertChannelId} not found.`);
        return;
      }

      const emoji = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';
      await channel.send(`${emoji} **Alert**: ${alert.message}`);
    });

    this.logger.log('Realtime alert subscription active.');
  }
}
