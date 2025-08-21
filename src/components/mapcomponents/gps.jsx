import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

export default function Gps({ latitude, longitude }) {
  const defaultPosition = [14.5933, 120.9767];
  const position =
    typeof latitude === "number" && typeof longitude === "number"
      ? [latitude, longitude]
      : defaultPosition;

  return (
    <div className="w-full z-999 px-50 ">
      <MapContainer center={position} zoom={16} className="h-[32rem] w-full rounded-lg">
        <ChangeView center={position} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={customIcon}>
          <Popup>Live GPS Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
