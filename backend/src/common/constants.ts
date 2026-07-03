export const ROOMS = [
  'Drawing Room',
  'Work Room 1',
  'Work Room 2',
] as const;

export type RoomName = (typeof ROOMS)[number];

export const DEVICES_PER_ROOM = {
  fans: 2,
  lights: 3,
} as const;

export const DEVICE_WATTAGE = {
  fan: 60,
  light: 15,
} as const;

export const OFFICE_HOURS_START = 9;
export const OFFICE_HOURS_END = 17;

export const ALERT_CHECK_INTERVAL_MS = 60_000;
export const SIMULATOR_INTERVAL_MIN_MS = 60_000;
export const SIMULATOR_INTERVAL_MAX_MS = 60_000;
export const DEVICES_TO_TOGGLE_PER_TICK = { min: 1, max: 3 };

export const CONTINUOUS_ON_THRESHOLD_MS = 2 * 60 * 60 * 1000;

export const DISCORD_COMMAND_PREFIX = '!';
