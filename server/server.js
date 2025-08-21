// server.js (ES module syntax)
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const FLESPI_API_URL = process.env.FLESPI_API_URL;
const FLESPI_AUTH_TOKEN = process.env.FLESPI_AUTH_TOKEN;

// Variable to store the latest telemetry data, initialized with default values
let latestTelemetryData = {
    latitude: null,
    longitude: null,
    speed: 0,
    engineStatus: 'Unknown',
    deviceName: 'N/A'
};

// Function to fetch telemetry data from Flespi API and update the stored data
const fetchFlespiData = async () => {
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
            return; // Exit if API call fails
        }

        const data = await response.json();

        const telemetry = data.result && data.result.length > 0 ? data.result[0].telemetry : null;
      
        if (telemetry) {
            latestTelemetryData = {
                latitude: telemetry['position.latitude'] ? telemetry['position.latitude'].value : null,
                longitude: telemetry['position.longitude'] ? telemetry['position.longitude'].value : null,
                speed: telemetry['position.speed'] ? telemetry['position.speed'].value : 0,
                engineStatus: typeof telemetry['engine.ignition.status']?.value === 'boolean' ? (telemetry['engine.ignition.status'].value ? 'On' : 'Off') : 'Unknown',
                deviceName: telemetry['device.name'] ? telemetry['device.name'].value : 'N/A'
            };
            console.log('Telemetry data updated by background fetch:', latestTelemetryData);
        } else {
            console.warn('Telemetry data not found in Flespi response during background fetch.');
        }
    } catch (error) {
        console.error('Error during background Flespi data fetch:', error);
    }
};

// --- Start continuous data fetching ---
// Perform an initial fetch immediately when the server starts
fetchFlespiData();

// Set up a recurring interval to fetch data every 10 seconds (10000 milliseconds)
// This ensures that 'latestTelemetryData' is always kept up-to-date.
setInterval(fetchFlespiData, 1000); // Adjust this interval as needed (e.g., 5000 for 5 seconds)
// --- End continuous data fetching ---


// Endpoint to serve the latest telemetry data to the frontend
// This endpoint now simply returns the 'latestTelemetryData' that is updated by the setInterval.
app.get('/api/telemetry', (req, res) => {
    // Return the last fetched data without making a new API call to Flespi
    res.json(latestTelemetryData);
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('Flespi data will be fetched and updated every second.');
});

