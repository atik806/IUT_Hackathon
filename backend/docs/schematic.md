# Electrical Schematic Guide — Tinkercad (Arduino Uno)

This guide describes how to build a representative circuit in Tinkercad for one room (Drawing Room) with 2 fans and 3 lights, including state sensing and current measurement.

## Overview

We simulate each fan and light as an LED (visual indicator) in series with a resistor. An Arduino Uno reads the ON/OFF state via voltage dividers and measures total current draw via an ACS712 current sensor module.

## Components (per room)

| Component | Quantity | Purpose |
|-----------|----------|---------|
| Arduino Uno R3 | 1 | Microcontroller |
| LED (any color) | 5 | Simulate fan/light ON state |
| Resistor 220Ω | 5 | Current limiting for LEDs |
| Resistor 10kΩ | 5 | Pull-down resistors for switch inputs |
| Push button (or switch) | 5 | Manually toggle each device |
| ACS712 (5A version) | 1 | Measure total current draw |
| Breadboard | 1 | Prototyping |
| Jumper wires | Many | Connections |

## Pin Mapping

| Arduino Pin | Connected To | Purpose |
|-------------|-------------|---------|
| D2 | Button 1 + LED 1 (Fan 1) | Fan 1 control + indicator |
| D3 | Button 2 + LED 2 (Fan 2) | Fan 2 control + indicator |
| D4 | Button 3 + LED 3 (Light 1) | Light 1 control + indicator |
| D5 | Button 4 + LED 4 (Light 2) | Light 2 control + indicator |
| D6 | Button 5 + LED 5 (Light 3) | Light 3 control + indicator |
| A0 | ACS712 VOUT | Analog current reading |
| 5V | ACS712 VCC, Button VCC | Power |
| GND | Common ground | Ground |

## Wiring Instructions

### 1. Each Device Circuit (repeat 5 times)

```
Arduino Pin (D2–D6) ──┬── 220Ω ── LED ── GND
                      │
                      10kΩ
                      │
                     GND
```

Actually, for a cleaner sensing setup, each device uses:

```
+5V ── Button ── 10kΩ ──┐
                        ├── Arduino Digital Pin (input mode)
                        │
                       GND
```

The LED is driven directly from the Arduino pin:

```
Arduino Pin ── 220Ω ── LED ── GND
```

When the button is pressed, the pin reads HIGH. The Arduino turns the LED ON and reports the state. The state data is then sent via Serial to the connected computer (which feeds into the NestJS backend simulation).

### 2. Current Sensor (ACS712)

```
ACS712 Module:
  VCC ── Arduino 5V
  OUT ── Arduino A0
  GND ── Arduino GND

Load Current Path:
  Power Supply + ── ACS712 IP+ ── ACS712 IP- ── All LED Anodes (via 220Ω) ── LED Cathodes ── GND
```

The ACS712 outputs 185mV per Amp. With 5 LEDs drawing ~20mA each when on, max current is ~100mA → output voltage change of ~18.5mV. This is a small signal, so you may need an instrumentation amplifier or simply simulate the current in software based on which LEDs are lit.

**Simplification for demo**: Rather than actually measuring current, the Arduino can calculate it in software:
- Fan (simulated as LED): 60W / 230V = ~260mA (use a 60W incandescent bulb model if available)
- Light (simulated as LED): 15W / 230V = ~65mA

In Tinkercad, since we use LEDs, just track which buttons are pressed and compute the equivalent power draw in the Arduino sketch.

### 3. Complete Schematic Layout (Top View)

```
                    ┌─────────────────────────┐
                    │      ARDUINO UNO        │
                    │                         │
                    │ D2 ──┬── 220Ω ── LED1   │  Fan 1
                    │      └── Button1 ── GND │
                    │                         │
                    │ D3 ──┬── 220Ω ── LED2   │  Fan 2
                    │      └── Button2 ── GND │
                    │                         │
                    │ D4 ──┬── 220Ω ── LED3   │  Light 1
                    │      └── Button3 ── GND │
                    │                         │
                    │ D5 ──┬── 220Ω ── LED4   │  Light 2
                    │      └── Button4 ── GND │
                    │                         │
                    │ D6 ──┬── 220Ω ── LED5   │  Light 3
                    │      └── Button5 ── GND │
                    │                         │
                    │ A0 ─── ACS712 OUT       │  Current sense
                    │ 5V ─── ACS712 VCC       │
                    │ GND ─── ACS712 GND      │
                    └─────────────────────────┘
```

## Arduino Sketch Logic

```cpp
const int devicePins[] = {2, 3, 4, 5, 6};
const int numDevices = 5;
const char* deviceNames[] = {"Fan1", "Fan2", "Light1", "Light2", "Light3"};
const float wattages[] = {60, 60, 15, 15, 15}; // Watts when ON

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < numDevices; i++) {
    pinMode(devicePins[i], INPUT_PULLUP);
  }
}

void loop() {
  float totalWatts = 0;

  for (int i = 0; i < numDevices; i++) {
    bool isOn = digitalRead(devicePins[i]) == LOW; // PULLUP: LOW = pressed/ON
    if (isOn) totalWatts += wattages[i];

    // Send state as JSON-like string
    Serial.print(deviceNames[i]);
    Serial.print(":");
    Serial.print(isOn ? "ON" : "OFF");
    Serial.print(" ");
  }

  Serial.print("| TOTAL_WATTS:");
  Serial.println(totalWatts);

  delay(2000); // Report every 2 seconds
}
```

## Scaling to 3 Rooms

For 3 rooms (18 devices), you need:
- 3 Arduino Unos (one per room) — or a single Arduino Mega with more pins
- 5 buttons + 5 LEDs + resistors per room
- 3 ACS712 modules (one per room) — or compute power in software

The host computer reads Serial from each Arduino and writes to Supabase via the NestJS API.

## Notes

- This is a **simulation/concept** — no real hardware required
- The actual NestJS backend generates simulated data without needing physical Arduino input
- In production, replace the serial reader with an ESP32 sending MQTT/HTTP data directly
- Tinkercad does not have a built-in serial monitor that connects to external apps, so the actual device state simulation in the NestJS backend is independent of this schematic
