import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import telemetryRoutes from "./routes/telemetryRoutes.js";
import { initializeWebSocket } from "./utils/websocket.js";
import { fetchAndProcessTelemetry } from "./services/flespiService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', authRoutes);
app.use('/api', telemetryRoutes);

const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

// Initialize WebSocket and set up Flespi polling
initializeWebSocket(server);

// Fetch Flespi data every 5 seconds
setInterval(fetchAndProcessTelemetry, 5000);