import { useEffect, useState } from "react";
import BatteryMonitor from "../mapcomponents/BatteryMonitor";
import OilChangeMonitor from "../mapcomponents/oilchange";
import Gps from "../mapcomponents/gps";
import SpeedMonitor from "../mapcomponents/speed";
import EngineStatus from "../mapcomponents/engineStatus";
import Header from "../mapcomponents/header";

function Driver({ onLogout }) {
  const [telemetry, setTelemetry] = useState({
    latitude: null,
    longitude: null,
    speed: 0,
    engineStatus: "Unknown",
  });

  const [activeButton, setActiveButton] = useState("v1");
  const [loading, setLoading] = useState(true);

  const WS_URL = import.meta.env.VITE_WS_URL; // e.g. ws://localhost:5000

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTelemetry(data);
      setLoading(false);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => socket.close();
  }, [activeButton]);

  return (
    <div className="flex flex-col w-full">
      <Header onLogout={onLogout} />
      <div className="flex items-center gap-4 px-50 mb-4">
        <button
          onClick={() => setActiveButton("v1")}
          className={`${
            activeButton === "v1" ? "bg-green-500 text-white" : "bg-white"
          } rounded px-4 py-2`}
        >
          Vehicle 1
        </button>
        <button
          onClick={() => setActiveButton("v2")}
          className={`${
            activeButton === "v2" ? "bg-green-500 text-white" : "bg-white"
          } rounded px-4 py-2`}
        >
          Vehicle 2
        </button>
      </div>
      <div className="relative">
        {loading ? (
          <div className="flex justify-center items-center h-full w-full bg-white">
            <div className="h-10 w-10 absolute top-0 left-50 z-999 animate-spin border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <Gps latitude={telemetry.latitude} longitude={telemetry.longitude} />
            <div className="absolute bottom-0 left-50 z-999">
              <SpeedMonitor speed={telemetry.speed} />
            </div>
            <div className="absolute bottom-0 left-84 z-999">
              <BatteryMonitor battery={76} />
            </div>
            <div className="absolute z-999 left-50 top-0">
              <EngineStatus status={telemetry.engineStatus} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Driver;
