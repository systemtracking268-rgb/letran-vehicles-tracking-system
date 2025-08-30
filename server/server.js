// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const FLESPI_API_URL = process.env.FLESPI_API_URL;
const FLESPI_AUTH_TOKEN = process.env.FLESPI_AUTH_TOKEN;

// Store latest telemetry
let latestTelemetryData = {
  latitude: null,
  longitude: null,
  speed: 0,
  engineStatus: "Unknown",
  deviceName: "N/A",
};

// Function to fetch Flespi telemetry
const fetchFlespiData = async () => {
  try {
    const response = await fetch(FLESPI_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: FLESPI_AUTH_TOKEN,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Flespi API error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    const telemetry =
      data.result && data.result.length > 0 ? data.result[0].telemetry : null;

    if (telemetry) {
      latestTelemetryData = {
        latitude: telemetry["position.latitude"]?.value ?? null,
        longitude: telemetry["position.longitude"]?.value ?? null,
        speed: telemetry["position.speed"]?.value ?? 0,
        engineStatus:
          typeof telemetry["engine.ignition.status"]?.value === "boolean"
            ? telemetry["engine.ignition.status"].value
              ? "On"
              : "Off"
            : "Unknown",
        deviceName: telemetry["device.name"]?.value ?? "N/A",
      };

      // 🔥 Broadcast updated telemetry to all WebSocket clients
      broadcast(JSON.stringify(latestTelemetryData));
    }
  } catch (error) {
    console.error("Error fetching Flespi data:", error);
  }
};

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

// --- WebSocket Setup ---
const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  console.log("New client connected");

  // Send the latest telemetry immediately on connect
  ws.send(JSON.stringify(latestTelemetryData));

  ws.on("close", () => console.log("Client disconnected"));
});

// Helper: broadcast data to all connected clients
function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// Fetch Flespi every 1 second
setInterval(fetchFlespiData, 1000);
