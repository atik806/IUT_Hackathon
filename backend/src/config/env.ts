import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  supabaseUrl: required('SUPABASE_URL'),
  supabaseAnonKey: required('SUPABASE_ANON_KEY'),
  discordBotToken: optional('DISCORD_BOT_TOKEN', ''),
  discordAlertChannelId: optional('DISCORD_ALERT_CHANNEL_ID', ''),
  groqApiKey: optional('GROQ_API_KEY', ''),
  port: parseInt(optional('PORT', '3000'), 10),
};
