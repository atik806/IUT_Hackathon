import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { env } from '../config/env';

@Injectable()
export class SupabaseService implements OnApplicationShutdown {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  subscribeToTable(
    table: string,
    event: '*' | 'INSERT' | 'UPDATE' | 'DELETE',
    callback: (payload: any) => void,
  ): RealtimeChannel {
    const channel = this.client
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        (payload) => callback(payload),
      )
      .subscribe();

    return channel;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.removeAllChannels();
  }
}
