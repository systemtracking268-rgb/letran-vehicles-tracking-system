import { useEffect, useState } from "react";
import axios from "axios";
import TirePressure from "../mapcomponents/tirepressure";
import OilChangeMonitor from "../mapcomponents/oilchange";
import Gps from "../mapcomponents/gps";
import SpeedMonitor from "../mapcomponents/speed";
import EngineStatus from "../mapcomponents/engineStatus";
import Header from "../mapcomponents/header";

function Driver({onLogout}) {
  const [telemetry, setTelemetry] = useState({
    latitude: null,
    longitude: null,
    speed: 0
  });

  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API_URL:", API_URL);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axios.get(API_URL);
        const { latitude, longitude, speed, engineStatus  } = res.data;

        setTelemetry({
          latitude: latitude || 14.5933,
          longitude: longitude || 120.9767,
          speed: speed || 0,
          engineStatus: engineStatus,


        });
      } catch (error) {
        console.error("Failed to fetch telemetry:", error);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <Header onLogout={onLogout} />
        <div className="relative">
            <Gps latitude={telemetry.latitude} longitude={telemetry.longitude} />
            <div className="absolute bottom-0 left-50 z-999"><SpeedMonitor speed={telemetry.speed} /></div>
            <div className="absolute z-999 left-50 top-0"><EngineStatus status={telemetry.engineStatus} /></div>
        </div>
    </div>
  );
}

export default Driver;
