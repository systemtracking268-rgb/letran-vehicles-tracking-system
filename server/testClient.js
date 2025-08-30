// testClient.js
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:5000");

ws.on("open", () => console.log("Connected to server"));
ws.on("message", (msg) => console.log("Received:", msg.toString()));
