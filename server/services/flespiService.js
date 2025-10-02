import fetch from "node-fetch";
import dotenv from "dotenv";
import { broadcast } from "../utils/websocket.js";
import { locationSpeedLimit, overspeedingLocation } from "./locationService.js";
import { handleTelemetryData } from "./semaphoreService.js";
import { saveTelemetryToFirebase } from "./firebaseService.js";
import { convertTimestampToDate } from "../utils/helpers.js";

dotenv.config();

const { FLESPI_API_URL, FLESPI_AUTH_TOKEN } = process.env;

const DEFAULT_TIMESTAMP = 946684800;
const DEFAULT_BATTERY_VOLTAGE = 12.5;
const LOW_BATTERY_THRESHOLD = 12.0;
const DEFAULT_SPEED_LIMIT = 60;

// State variable to track the last location that was saved to the database.
let lastSavedLocation = { latitude: null, longitude: null };

// Single source of truth for the latest telemetry data
let latestTelemetryData = {
    latitude: null,
    longitude: null,
    speed: 0,
    speedLimit: DEFAULT_SPEED_LIMIT,
    isOverspeeding: false,
    overspeedingLocation: null,
    engineStatus: "Off", // Initial status is now "Off"
    deviceID: "N/A",
    timestamp: convertTimestampToDate(DEFAULT_TIMESTAMP),
    battery: DEFAULT_BATTERY_VOLTAGE,
    isBatteryLow: false
};

export async function fetchAndProcessTelemetry() {
  try {
    const response = await fetch(FLESPI_API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: FLESPI_AUTH_TOKEN },
    });

    if (!response.ok) {
      console.error(`Flespi API error: ${response.status} - ${await response.text()}`);
      return;
    }

    const data = await response.json();
    const telemetry = data.result?.[0]?.telemetry;

    if (telemetry) {
      const lat = telemetry["position.latitude"]?.value ?? null;
      const long = telemetry["position.longitude"]?.value ?? null;

      // Check if location has not changed
      if (lat === lastSavedLocation.latitude && long === lastSavedLocation.longitude) {
          console.log("Location has not changed. Skipping database save and message check.");
          // Still broadcast to update clients even if the location is the same
          broadcast(JSON.stringify(latestTelemetryData));
          return;
      }

      // If location changed, update lastSavedLocation
      lastSavedLocation.latitude = lat;
      lastSavedLocation.longitude = long;

      const speed = telemetry["position.speed"]?.value ?? 0;
      const batteryValue = telemetry["device.battery"]?.value ?? DEFAULT_BATTERY_VOLTAGE;
      const speedLimitValue = await locationSpeedLimit(lat, long);
      const isOverspeeding = speed > speedLimitValue;
      const overspeedingLocationValue = await overspeedingLocation(isOverspeeding, lat, long);
      const engineStatus = typeof telemetry["engine.ignition.status"]?.value === "boolean"
        ? telemetry["engine.ignition.status"].value ? "On" : "Off"
        : "Off";

      latestTelemetryData = {
        latitude: lat,
        longitude: long,
        speed: speed,
        speedLimit: speedLimitValue,
        isOverspeeding: isOverspeeding,
        overspeedingLocation: overspeedingLocationValue,
        engineStatus: engineStatus,
        deviceID: telemetry["device.id"]?.value ?? "N/A",
        timestamp: convertTimestampToDate(telemetry["timestamp"]?.value) ?? convertTimestampToDate(DEFAULT_TIMESTAMP),
        battery: batteryValue,
        isBatteryLow: batteryValue < LOW_BATTERY_THRESHOLD,
      };

      // Call the handlers
      await handleTelemetryData(latestTelemetryData);
      await saveTelemetryToFirebase(latestTelemetryData);
      broadcast(JSON.stringify(latestTelemetryData));
    }
  } catch (error) {
    console.error("Error fetching Flespi data:", error);
  }
}

export const getLatestTelemetryData = () => latestTelemetryData;