// server.js (ES module syntax)
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const FLESPI_API_URL = 'https://flespi.io/gw/devices/6578123/telemetry/all';
const FLESPI_AUTH_TOKEN = 'FlespiToken JYMvA6dfZF1Aydwgc96q08kbUSS8i1G26JuPmW12d3hVWMshKWirUFHLJIP3gJZY';

app.get('/api/telemetry', async (req, res) => {
  try {
    const response = await fetch(FLESPI_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': FLESPI_AUTH_TOKEN
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Flespi API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ message: 'Failed to fetch data from Flespi API', details: errorText });
    }

    const data = await response.json();

    const telemetry = data.result && data.result.length > 0 ? data.result[0].telemetry : null;

    if (telemetry) {
      const driverData = {
        latitude: telemetry['position.latitude'] ? telemetry['position.latitude'].value : null,
        longitude: telemetry['position.longitude'] ? telemetry['position.longitude'].value : null,
        speed: telemetry['position.speed'] ? telemetry['position.speed'].value : 0,
        engineStatus: typeof telemetry['engine.ignition.status']?.value === 'boolean' ? (telemetry['engine.ignition.status'].value ? 'On' : 'Off') : 'Unknown',
        deviceName: telemetry['device.name'] ? telemetry['device.name'].value : 'N/A'
      };
      // console.log('Processed driver data:', driverData);
      res.json(driverData);
    } else {
      res.status(404).json({ message: 'Telemetry data not found in Flespi response.' });
    }
  } catch (error) {
    console.error('Error fetching telemetry data:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
