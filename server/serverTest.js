import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, getDocs } from 'firebase/firestore';
import fs from 'fs/promises';

dotenv.config();

const {
  FLESPI_API_URL,
  FLESPI_AUTH_TOKEN,
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} = process.env;

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

// Get a reference to the Firestore service
const db = getFirestore(firebase);
// --- End Firebase Setup ---

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DEFAULT_TIMESTAMP = 946684800; // January 1, 2000
const DEFAULT_BATTERY_VOLTAGE = 12.5;
const LOW_BATTERY_THRESHOLD = 12.0;
const DEFAULT_SPEED_LIMIT = 60; // Default speed limit in km/h
const DEFAULT_OVERSPEEDING_LOCATION = "Manila"; // Default location when not overspeeding

function convertTimestampToDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

// 🚦 New function to determine speed limit based on location
async function locationSpeedLimit(lat, long) {
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
      
      // Read speed limits from the external JSON file
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

async function overspeedingLocation(isOverspeeding, lat, long) {
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

// Store latest telemetry
let latestTelemetryData = {
  latitude: null,
  longitude: null,
  speed: 0,
  speedLimit: DEFAULT_SPEED_LIMIT,
  isOverspeeding: false,
  overspeedingLocation: null,
  engineStatus: "Unknown",
  deviceID: "N/A",
  timestamp: convertTimestampToDate(DEFAULT_TIMESTAMP),
  battery: DEFAULT_BATTERY_VOLTAGE,
  isBatteryLow: false
};

// Function to save telemetry data to Firebase
async function saveTelemetryToFirebase(data) {
  try {
    const docRef = await addDoc(collection(db, "telemetry-data"), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Function to read all tracking data from a collection
async function getAllTelemetryData() {
  console.log("Starting to fetch all documents from Firestore...");
  
  const telemetryCollectionRef = collection(db, "telemetry-data");
  
  try {
    const querySnapshot = await getDocs(telemetryCollectionRef);
    
    if (querySnapshot.empty) {
      console.log("No documents found in the collection.");
      return [];
    }
    
    const extractedData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Extract only the desired attributes
      extractedData.push({
        id: doc.id,
        deviceID: data.deviceID,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        timestamp: data.timestamp,
      });
    });
    
    console.log("Successfully fetched documents:");
    // console.log(extractedData);
    
    return extractedData;
    
  } catch (error) {
    console.error("Error getting documents:", error);
    return [];
  }
}

/**
 * 🧪 New function to test the location logic with mock data.
 * This replaces the Flespi fetching for testing purposes.
 */
const testLocationLogic = async () => {
  console.log("--- Starting mock data test ---");

  // Mock data for C. M. Recto Avenue
  const mockLat1 = 14.6010007;
  const mockLong1 = 120.9901214;

  // Case 1: Overspeeding on C. M. Recto Avenue (speed > 60)
  const speed1 = 75;
  const speedLimit1 = await locationSpeedLimit(mockLat1, mockLong1);
  const isOverspeeding1 = speed1 > speedLimit1;
  const overspeedingLocation1 = await overspeedingLocation(isOverspeeding1, mockLat1, mockLong1);
  console.log(`Test Case 1: C. M. Recto Avenue`);
  console.log(`Speed: ${speed1} km/h, Speed Limit: ${speedLimit1} km/h`);
  console.log(`Is Overspeeding: ${isOverspeeding1}, Location: ${overspeedingLocation1}`);

  console.log("\n");

  // Case 2: Not overspeeding on C. M. Recto Avenue (speed <= 60)
  const speed2 = 50;
  const speedLimit2 = await locationSpeedLimit(mockLat1, mockLong1);
  const isOverspeeding2 = speed2 > speedLimit2;
  const overspeedingLocation2 = await overspeedingLocation(isOverspeeding2, mockLat1, mockLong1);
  console.log(`Test Case 2: C. M. Recto Avenue`);
  console.log(`Speed: ${speed2} km/h, Speed Limit: ${speedLimit2} km/h`);
  console.log(`Is Overspeeding: ${isOverspeeding2}, Location: ${overspeedingLocation2}`);

  console.log("\n");

  // Mock data for a different location not in your JSON
  // Example: Intramuros area
  const mockLat3 = 14.5917;
  const mockLong3 = 120.9767;

  // Case 3: Vehicle on a different road, overspeeding (should use default)
  const speed3 = 60;
  const speedLimit3 = await locationSpeedLimit(mockLat3, mockLong3);
  const isOverspeeding3 = speed3 > speedLimit3;
  const overspeedingLocation3 = await overspeedingLocation(isOverspeeding3, mockLat3, mockLong3);
  console.log(`Test Case 3: Other road (Intramuros)`);
  console.log(`Speed: ${speed3} km/h, Speed Limit: ${speedLimit3} km/h`);
  console.log(`Is Overspeeding: ${isOverspeeding3}, Location: ${overspeedingLocation3}`);

  console.log("--- Test finished ---");
};

// --- Historical Data Endpoint---
app.get('/api/telemetry', async (req, res) => {
  try {
    const allData = await getAllTelemetryData();
    res.json(allData);
  } catch (error) {
    console.error("Error fetching telemetry data from API:", error);
    res.status(500).json({ error: "Failed to fetch telemetry data." });
  }
});
// --- End New Endpoint ---

// --- Login Endpoint ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  try {
    const usersRef = collection(db, "user");
    const snapshot = await getDocs(usersRef);

    let foundUser = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.username === username && data.password === password) {
        foundUser = { id: doc.id, ...data };
      }
    });

    if (foundUser) {
      return res.json({ success: true, user: foundUser });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- End Login Endpoint ---

// --- Register Endpoint ---
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const usersRef = collection(db, "user");
    const snapshot = await getDocs(usersRef);

    let exists = false;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.username === username) exists = true;
    });

    if (exists) {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }

    const newUser = { username, password, email };
    await addDoc(usersRef, newUser);

    return res.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  // Call the test function here when the server starts
  testLocationLogic();
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

// Comment out the Flespi fetch interval for testing
// setInterval(fetchFlespiData, 5000);