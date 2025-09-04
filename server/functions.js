import dotenv from "dotenv";

dotenv.config();

// A helper function to format a Unix timestamp into a readable date string.
const convertTimestampToDate = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Handles sending a message via the Semaphore API.
 * @param {string} message The message content to send.
 */
async function sendSemaphoreMessage(message) {
  // IMPORTANT: Replace these with your actual credentials and mobile number.
  const SEMAPHORE_API_KEY = "152eb0043cbcd7a4eca949a899fe2a1f";
  const MOBILE_NUMBER = "09123456789"; 

  // Skip sending if API key or number is not configured
  if (SEMAPHORE_API_KEY === "YOUR_SEMAPHORE_API_KEY" || MOBILE_NUMBER === "YOUR_MOBILE_NUMBER") {
    console.warn("Skipping message send: API key or mobile number is not configured.");
    return;
  }
  
  const url = 'https://semaphore.co/api/v4/messages';
  const formData = new URLSearchParams();
  formData.append('apikey', SEMAPHORE_API_KEY);
  formData.append('number', MOBILE_NUMBER);
  formData.append('message', message);

  console.log("Attempting to send message:", message);
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API call failed with status ${response.status}:`, errorText);
    } else {
      const data = await response.json();
      console.log('Message sent successfully:', data);
    }
  } catch (error) {
    console.error('An error occurred while sending the message:', error);
  }
}

/**
 * Checks for specific telemetry conditions and sends a message if any are true.
 * @param {object} telemetryData The telemetry data object to check.
 */
async function handleTelemetryData(telemetryData) {
  let messageToSend = null;

  // Condition 1: Check for overspeeding
  if (telemetryData.isOverspeeding) {
    messageToSend = `Vehicle ${telemetryData.deviceID} is exceeding the speed limit for its location. Current Speed: ${telemetryData.speed} km/h. Limit: ${telemetryData.speedLimit} km/h.`;
  }
  // Condition 2: Check for engine status
  else if (telemetryData.engineStatus === "On" || telemetryData.engineStatus === "Off") {
    const formattedTimestamp = convertTimestampToDate(telemetryData.timestamp);
    messageToSend = `Ignition ${telemetryData.engineStatus} for Vehicle ${telemetryData.deviceID} at ${formattedTimestamp}.`;
  }
  // Condition 3: Check for low battery
  else if (telemetryData.isBatteryLow) {
    messageToSend = `Low Battery Alert for Vehicle ${telemetryData.deviceID}: Voltage is ${telemetryData.battery}V.`;
  }

  // If a message was constructed, send it.
  if (messageToSend) {
    await sendSemaphoreMessage(messageToSend);
  } else {
    console.log("No conditions met. Skipping message send.");
  }
}

// Example usage:
const DEFAULT_SPEED_LIMIT = 80;
const DEFAULT_BATTERY_VOLTAGE = 12.5;

// Example data for overspeeding
const telemetryOverspeeding = {
  latitude: 14.65,
  longitude: 121.05,
  speed: 95,
  isOverspeeding: true,
  overspeedingLocation: "Manila",
  speedLimit: DEFAULT_SPEED_LIMIT,
  engineStatus: "On",
  deviceID: "XYZ-123",
  positionDirection: 0,
  vehicleStateBitmask: "Unknown",
  timestamp: 1756777940,
  battery: 13.5,
  isBatteryLow: false
};

// Example data for engine status
const telemetryEngineStatus = {
  latitude: 14.65,
  longitude: 121.05,
  speed: 70,
  isOverspeeding: false,
  overspeedingLocation: null,
  speedLimit: DEFAULT_SPEED_LIMIT,
  engineStatus: "Off",
  deviceID: "XYZ-123",
  positionDirection: 0,
  vehicleStateBitmask: "Unknown",
  timestamp: 1756777940,
  battery: 13.5,
  isBatteryLow: false
};

// Example data for low battery
const telemetryLowBattery = {
  latitude: 14.65,
  longitude: 121.05,
  speed: 70,
  isOverspeeding: false,
  overspeedingLocation: null,
  speedLimit: DEFAULT_SPEED_LIMIT,
  engineStatus: "On",
  deviceID: "ABC-456",
  positionDirection: 0,
  vehicleStateBitmask: "Unknown",
  timestamp: 1756777940,
  battery: 11.8,
  isBatteryLow: true
};

// Example data with no conditions met
const telemetryNormal = {
  latitude: 14.65,
  longitude: 121.05,
  speed: 70,
  isOverspeeding: false,
  overspeedingLocation: null,
  speedLimit: DEFAULT_SPEED_LIMIT,
  engineStatus: "On",
  deviceID: "DEF-789",
  positionDirection: 0,
  vehicleStateBitmask: "Unknown",
  timestamp: 1756777940,
  battery: 13.0,
  isBatteryLow: false
};

// Uncomment one of the following lines to test:
handleTelemetryData(telemetryOverspeeding);
handleTelemetryData(telemetryEngineStatus);
handleTelemetryData(telemetryLowBattery);
handleTelemetryData(telemetryNormal);