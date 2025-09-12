import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from "../config/firebase.js"; 

export async function saveTelemetryToFirebase(data) {
  try {
    const docRef = await addDoc(collection(db, "telemetry-data"), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function getAllTelemetryData() {
  const telemetryCollectionRef = collection(db, "telemetry-data");
  try {
    const querySnapshot = await getDocs(telemetryCollectionRef);
    if (querySnapshot.empty) {
      return [];
    }
    const extractedData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      extractedData.push({
        id: doc.id,
        deviceID: data.deviceID,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        timestamp: data.timestamp,
      });
    });
    return extractedData;
  } catch (error) {
    console.error("Error getting documents:", error);
    return [];
  }
}

export async function loginUser(username, password) {
  const usersRef = collection(db, "user");
  try {
    const snapshot = await getDocs(usersRef);
    let foundUser = null;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.username === username && data.password === password) {
        foundUser = { id: doc.id, ...data };
      }
    });
    if (foundUser) {
      return { success: true, user: foundUser };
    } else {
      return { success: false, message: "Invalid credentials", status: 401 };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Server error", status: 500 };
  }
}

export async function registerUser(username, password, email) {
  const usersRef = collection(db, "user");
  try {
    const snapshot = await getDocs(usersRef);
    let exists = false;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.username === username) exists = true;
    });
    if (exists) {
      return { success: false, message: "Username already taken", status: 409 };
    }
    const newUser = { username, password, email };
    await addDoc(usersRef, newUser);
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "Server error", status: 500 };
  }
}