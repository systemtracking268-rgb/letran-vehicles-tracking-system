import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, getDocs } from 'firebase/firestore';

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

function locationSpeedLimit(lat, long) {
  return DEFAULT_SPEED_LIMIT;
}

function overspeedingLocation(isOverspeeding, lat, long) {
  return isOverspeeding ? DEFAULT_OVERSPEEDING_LOCATION : null;
}

// Store latest telemetry
let latestTelemetryData = {
  latitude: null,
  longitude: null,
  speed: 0,
  speedLimit: locationSpeedLimit(null, null),
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
      const lat = telemetry["position.latitude"]?.value ?? null;
      const long = telemetry["position.longitude"]?.value ?? null;
      const speed = telemetry["position.speed"]?.value ?? 0;
      const speedLimitValue = locationSpeedLimit(lat, long);
      const isOverspeeding = speed > speedLimitValue;
      const batteryValue = telemetry["device.battery"]?.value ?? DEFAULT_BATTERY_VOLTAGE;
      
      // Update latest telemetry data
      latestTelemetryData = {
        latitude: lat,
        longitude: long,
        speed: speed,
        speedLimit: speedLimitValue,
        isOverspeeding: isOverspeeding,
        overspeedingLocation: overspeedingLocation(isOverspeeding, lat, long),
        engineStatus:
          typeof telemetry["engine.ignition.status"]?.value === "boolean"
            ? telemetry["engine.ignition.status"].value
              ? "On"
              : "Off"
            : "Unknown",
        deviceID: telemetry["device.id"]?.value ?? "N/A",
        timestamp: convertTimestampToDate(telemetry["timestamp"]?.value) ?? convertTimestampToDate(DEFAULT_TIMESTAMP),
        battery: batteryValue,
        isBatteryLow: batteryValue < LOW_BATTERY_THRESHOLD
      };

      // Save to Firebase
      // await saveTelemetryToFirebase(latestTelemetryData);

      // 🔥 Broadcast updated telemetry to all WebSocket clients
      broadcast(JSON.stringify(latestTelemetryData));
    }
  } catch (error) {
    console.error("Error fetching Flespi data:", error);
  }
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

// Fetch Flespi every 5 seconds
setInterval(fetchFlespiData, 5000);
