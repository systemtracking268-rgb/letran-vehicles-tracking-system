import fetch from "node-fetch";
import fs from 'fs/promises';

const DEFAULT_SPEED_LIMIT = 60;
const DEFAULT_OVERSPEEDING_LOCATION = "Manila";

export async function locationSpeedLimit(lat, long) {
  if (!lat || !long) {
    console.log("Latitude or Longitude not provided. Using default speed limit.");
    return DEFAULT_SPEED_LIMIT;
  }
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    const response = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'YourAppName/1.0 (YourEmail@example.com)' }
    });
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} - ${await response.text()}`);
      return DEFAULT_SPEED_LIMIT;
    }
    const data = await response.json();
    const roadName = data?.address?.road;
    if (roadName) {
      console.log(`Road detected: ${roadName}`);
      const speedLimitsData = await fs.readFile('./speed_limits.json', 'utf8');
      const { speedLimits, default: defaultSpeed } = JSON.parse(speedLimitsData);
      const matchedRoad = speedLimits.find(limit => limit.road === roadName);
      if (matchedRoad) {
        console.log(`Found speed limit for ${roadName}: ${matchedRoad.speedLimit}`);
        return matchedRoad.speedLimit;
      } else {
        console.log(`No specific speed limit found for ${roadName}. Using default.`);
        return defaultSpeed || DEFAULT_SPEED_LIMIT;
      }
    }
  } catch (error) {
    console.error("Error fetching location data for speed limit:", error);
  }
  return DEFAULT_SPEED_LIMIT;
}

export async function overspeedingLocation(isOverspeeding, lat, long) {
  if (!isOverspeeding) return null;
  if (!lat || !long) return "Unknown Location";
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    const response = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'YourAppName/1.0 (YourEmail@example.com)' }
    });
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} - ${await response.text()}`);
      return DEFAULT_OVERSPEEDING_LOCATION;
    }
    const data = await response.json();
    const location = data?.address?.road || data?.address?.city || DEFAULT_OVERSPEEDING_LOCATION;
    return location;
  } catch (error) {
    console.error("Error fetching overspeeding location:", error);
    return DEFAULT_OVERSPEEDING_LOCATION;
  }
}