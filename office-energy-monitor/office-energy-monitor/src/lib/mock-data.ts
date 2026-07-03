import {
  DashboardData,
  Device,
  Alert,
  RoomSummary,
  DashboardSummary,
} from "./types";

const ROOMS = ["Drawing Room", "Work Room 1", "Work Room 2"];
const ROOM_IDS = ["drawing", "work1", "work2"];

function createInitialDevices(): Device[] {
  const devices: Device[] = [];
  const now = new Date();

  const initialStatuses: Record<string, "on" | "off"> = {
    "drawing-fan-1": "on",
    "drawing-fan-2": "on",
    "drawing-light-1": "on",
    "drawing-light-2": "on",
    "drawing-light-3": "off",
    "work1-fan-1": "off",
    "work1-fan-2": "off",
    "work1-light-1": "off",
    "work1-light-2": "off",
    "work1-light-3": "off",
    "work2-fan-1": "on",
    "work2-fan-2": "on",
    "work2-light-1": "on",
    "work2-light-2": "on",
    "work2-light-3": "on",
  };

  ROOMS.forEach((room, ri) => {
    const roomId = ROOM_IDS[ri];
    for (let i = 1; i <= 2; i++) {
      const id = `${roomId}-fan-${i}`;
      const status = initialStatuses[id];
      devices.push({
        id,
        name: `Fan ${i}`,
        type: "fan",
        room,
        status,
        powerDraw: status === "on" ? 60 : 0,
        lastChanged: new Date(
          now.getTime() - Math.random() * 7200000
        ).toISOString(),
      });
    }
    for (let i = 1; i <= 3; i++) {
      const id = `${roomId}-light-${i}`;
      const status = initialStatuses[id];
      devices.push({
        id,
        name: `Light ${i}`,
        type: "light",
        room,
        status,
        powerDraw: status === "on" ? 15 : 0,
        lastChanged: new Date(
          now.getTime() - Math.random() * 7200000
        ).toISOString(),
      });
    }
  });

  return devices;
}

let devices = createInitialDevices();

function computeSummary(): DashboardSummary {
  const rooms: RoomSummary[] = ROOMS.map((room) => {
    const roomDevices = devices.filter((d) => d.room === room);
    const devicesOn = roomDevices.filter((d) => d.status === "on").length;
    const devicesOff = roomDevices.filter((d) => d.status === "off").length;
    const power = roomDevices.reduce((sum, d) => sum + d.powerDraw, 0);
    return { name: room, power, devicesOn, devicesOff };
  });

  const totalPower = rooms.reduce((sum, r) => sum + r.power, 0);
  const totalOn = rooms.reduce((sum, r) => sum + r.devicesOn, 0);
  const totalOff = rooms.reduce((sum, r) => sum + r.devicesOff, 0);

  return {
    totalPower,
    devicesOn: totalOn,
    devicesOff: totalOff,
    todayUsageKwh: parseFloat(((totalPower * 0.001 * 8)).toFixed(1)),
    rooms,
  };
}

function computeAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  const hour = now.getHours();
  const isLateNight = hour >= 22 || hour < 6;

  if (hour >= 17 || hour < 9) {
    ROOMS.forEach((room) => {
      const roomDevices = devices.filter((d) => d.room === room);
      const onDevices = roomDevices.filter((d) => d.status === "on");
      if (onDevices.length > 0) {
        const fanCount = onDevices.filter((d) => d.type === "fan").length;
        const lightCount = onDevices.filter((d) => d.type === "light").length;

        if (isLateNight && onDevices.length >= 4) {
          alerts.push({
            id: `alert-critical-${room}`,
            severity: "critical",
            room,
            message: `${room} has ${onDevices.length} devices ON late at night.`,
            timestamp: now.toISOString(),
            recommendation:
              "Immediate attention required. Devices may have been forgotten.",
          });
        } else {
          alerts.push({
            id: `alert-afterhours-${room}`,
            severity: onDevices.length >= 4 ? "warning" : "info",
            room,
            message: `${room} still has ${onDevices.length} device${onDevices.length > 1 ? "s" : ""} (${fanCount} fan${fanCount > 1 ? "s" : ""}, ${lightCount} light${lightCount > 1 ? "s" : ""}) ON after office hours.`,
            timestamp: now.toISOString(),
            recommendation: "Please check the room before leaving.",
          });
        }
      }
    });
  }

  const CONTINUOUS_ON_MS = 2 * 60 * 60 * 1000;
  ROOMS.forEach((room) => {
    const roomDevices = devices.filter((d) => d.room === room);
    const onDevices = roomDevices.filter((d) => d.status === "on");
    if (onDevices.length === roomDevices.length && onDevices.length > 0) {
      const earliestChanged = new Date(
        Math.min(...onDevices.map((d) => new Date(d.lastChanged).getTime())),
      );
      const durationMs = now.getTime() - earliestChanged.getTime();
      if (durationMs >= CONTINUOUS_ON_MS) {
        const hoursOn = (durationMs / (1000 * 60 * 60)).toFixed(1);
        alerts.push({
          id: `alert-continuous-${room}`,
          severity: "critical",
          room,
          message: `${room} has had all devices ON for ${hoursOn} hours continuously!`,
          timestamp: now.toISOString(),
          recommendation: "Check if devices are still needed or if someone forgot to turn them off.",
        });
      }
    }
  });

  return alerts;
}

function simulateChange(): void {
  if (Math.random() > 0.2) return;

  const onDevices = devices.filter((d) => d.status === "on");
  const offDevices = devices.filter((d) => d.status === "off");
  const pool = onDevices.length > offDevices.length ? onDevices : offDevices;
  if (pool.length === 0) return;

  const device = pool[Math.floor(Math.random() * pool.length)];
  device.status = device.status === "on" ? "off" : "on";
  device.powerDraw =
    device.status === "on" ? (device.type === "fan" ? 60 : 15) : 0;
  device.lastChanged = new Date().toISOString();
}

export function getMockDashboardData(): DashboardData {
  simulateChange();

  const summary = computeSummary();
  const alerts = computeAlerts();

  return {
    devices: devices.map((d) => ({ ...d })),
    summary,
    alerts,
    lastUpdated: new Date().toISOString(),
  };
}

export function resetMockData(): void {
  devices = createInitialDevices();
}
