import fetch from "node-fetch";
import dotenv from "dotenv";
import { convertTimestampToDate } from "../utils/helpers.js";

dotenv.config();

const { SEMAPHORE_API_KEY, MOBILE_NUMBER } = process.env;

// State variable to prevent repeated engine status messages
let lastNotifiedEngineStatus = "Off"; 

async function sendSemaphoreMessage(message) {
  const url = 'https://semaphore.co/api/v4/messages';
  const formData = new URLSearchParams();
  if (!SEMAPHORE_API_KEY || !MOBILE_NUMBER) {
    console.warn("Skipping message send: SEMAPHORE_API_KEY or MOBILE_NUMBER is not configured in .env.");
    return;
  }
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

export async function handleTelemetryData(telemetryData) {
  // Condition 1: Check for overspeeding
  if (telemetryData.isOverspeeding) {
    const message = `Vehicle ${telemetryData.deviceID} is exceeding the speed limit for its location. Current Speed: ${telemetryData.speed} km/h. Limit: ${telemetryData.speedLimit} km/h.`;
    await sendSemaphoreMessage(message);
  }
  
  // Condition 2: Check for engine status
  // Only send a message if the engine status changes to "On"
  if (telemetryData.engineStatus === "On" && telemetryData.engineStatus !== lastNotifiedEngineStatus) {
    const message = `Ignition ${telemetryData.engineStatus} for Vehicle ${telemetryData.deviceID} at ${telemetryData.timestamp}.`;
    await sendSemaphoreMessage(message);
    lastNotifiedEngineStatus = telemetryData.engineStatus;
  } else if (telemetryData.engineStatus === "Off" && telemetryData.engineStatus !== lastNotifiedEngineStatus) {
      // You can add logic here if you want to also notify when the ignition turns off
      // For now, this condition updates the lastNotifiedEngineStatus to prevent re-notifying
      lastNotifiedEngineStatus = telemetryData.engineStatus;
  }
  
  // Condition 3: Check for low battery
  if (telemetryData.isBatteryLow) {
    const message = `Low Battery Alert for Vehicle ${telemetryData.deviceID}: Voltage is ${telemetryData.battery}V.`;
    await sendSemaphoreMessage(message);
  }

  // Log if no conditions were met
  if (!telemetryData.isOverspeeding && !telemetryData.isBatteryLow && (telemetryData.engineStatus !== "On" && telemetryData.engineStatus !== "Off")) {
    console.log("No conditions met. Skipping message send.");
  }
}
