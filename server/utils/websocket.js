import { WebSocketServer } from "ws";
import { getLatestTelemetryData } from "../services/flespiService.js";

let wss;

export function initializeWebSocket(server) {
  wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    console.log("New client connected");
    ws.send(JSON.stringify(getLatestTelemetryData()));
    ws.on("close", () => console.log("Client disconnected"));
  });
}

export function broadcast(message) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }
}