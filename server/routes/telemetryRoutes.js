import { Router } from 'express';
import { getAllTelemetryData } from "../services/firebaseService.js";

const router = Router();

router.get('/telemetry', async (req, res) => {
  try {
    const allData = await getAllTelemetryData();
    res.json(allData);
  } catch (error) {
    console.error("Error fetching telemetry data from API:", error);
    res.status(500).json({ error: "Failed to fetch telemetry data." });
  }
});

export default router;