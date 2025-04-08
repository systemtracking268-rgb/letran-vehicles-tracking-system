import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { io } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const socket = io("http://localhost:5000");

// Fix missing marker icon issue
const customIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Component to move the map center dynamically
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom()); // Update map view when center changes
  }, [center, map]);

  return null;
}

export default function Gps() {
  const [position, setPosition] = useState([14.5933, 120.9767])

  useEffect(() => {
    socket.on("locationUpdate", (newPosition) => {
      setPosition(newPosition);
    });

    return () => socket.off("locationUpdate"); // Cleanup on unmount
  }, []);

  return (
    <MapContainer center={position} zoom={200} className="h-[35rem] w-[40rem] rounded-lg">
      <ChangeView center={position} /> {/* This moves the map when the position updates */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} icon={customIcon}>
        <Popup>Real-time Location</Popup>
      </Marker>
    </MapContainer>
  );
}
