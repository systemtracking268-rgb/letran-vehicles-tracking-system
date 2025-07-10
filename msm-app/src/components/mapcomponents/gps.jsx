import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const FLESPI_URL = "https://flespi.io/gw/devices/6578123/telemetry/all";
const FLESPI_TOKEN = "JYMvA6dfZF1Aydwgc96q08kbUSS8i1G26JuPmW12d3hVWMshKWirUFHLJIP3gJZY"; // Don't expose this in production

axios.get(FLESPI_URL, {
  headers: {
    Authorization: `FlespiToken ${FLESPI_TOKEN}`,
  },
})
.then(res => {
  console.log(res.data);
})
.catch(err => {
  console.error(err);
});

const customIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

export default function Gps() {
  const [position, setPosition] = useState([14.5933, 120.9767]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get(FLESPI_URL, {
          headers: {
            Authorization: `FlespiToken ${FLESPI_TOKEN}`,
          },
        });

        const telemetry = res.data.result[0]?.telemetry;
        const lat = telemetry["position.latitude"]?.value;
        const lng = telemetry["position.longitude"]?.value;

        if (lat && lng) {
          setPosition([lat, lng]);
        }
      } catch (err) {
        console.error("Error fetching Flespi data:", err);
      }
    };

    fetchLocation();                         // Initial fetch
    const interval = setInterval(fetchLocation, 3000); // Repeat every 3 sec

    return () => clearInterval(interval);    // Clean up on unmount
  }, []);

  return (
    <MapContainer center={position} zoom={200} className="h-[35rem] w-[40rem] rounded-lg">
      <ChangeView center={position} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} icon={customIcon}>
        <Popup>Live GPS Location</Popup>
      </Marker>
    </MapContainer>
  );
}
