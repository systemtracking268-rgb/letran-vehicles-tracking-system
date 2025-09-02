import { useEffect, useState } from "react";
import BatteryMonitor from "../mapcomponents/BatteryMonitor";
import OilChangeMonitor from "../mapcomponents/oilchange";
import Gps from "../mapcomponents/gps";
import SpeedMonitor from "../mapcomponents/speed";
import EngineStatus from "../mapcomponents/engineStatus";
import Header from "../mapcomponents/header";
import HistoryComponent from "../mapcomponents/history";
import Login from "./login";

function Driver({ onLogout }) {
  const [telemetry, setTelemetry] = useState({
    latitude: null,
    longitude: null,
    speed: 0,
    engineStatus: "Unknown",
  });

  const [activeButton, setActiveButton] = useState('v1');
  const [loading, setloading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API_URL:", API_URL);

  const handleLogout = () => {
      localStorage.removeItem('loggedInUser');
      onLogout();
  };

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
      <Header/>
        <div className="relative mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-full w-full bg-white">
              <div className="h-10 w-10
              absolute top-0 left-50 z-999 animate-spin border-4 border-blue-500 
              border-t-transparent rounded-full">
              </div>
            </div>

          ) : (
            <>
            <div className="flex justify-center px-10">
              <div className="block w-full">
                <Gps latitude={telemetry.latitude} longitude={telemetry.longitude} />
                <div className="flex flex-wrap w-full justify-center items-center gap-4 mt-4">
                  <div className=" z-999 left-50 top-0"><EngineStatus status={telemetry.engineStatus} /></div>        
                  <div className=" bottom-0 left-50 z-999"><SpeedMonitor speed={telemetry.speed} /></div>
                  <div className=" bottom-0 left-84 z-999"><BatteryMonitor battery={76} /></div>
                </div>
              </div>

              <div className="block w-1/4 ml-4">
                <div className="flex items-center gap-4 mb-4">
 <button
    onClick={() => setActiveButton('v1')}
    className={`px-5 py-2.5 font-medium rounded-xl shadow-sm transition-all duration-200 
      ${activeButton === 'v1' 
        ? 'bg-green-500 text-white shadow-md' 
        : 'bg-slate-900 text-white hover:bg-green-500'
      } truncate`}
  >
    Sedan
  </button>

  <button
    onClick={() => setActiveButton('v2')}
    className={`px-5 py-2.5 font-medium rounded-xl shadow-sm transition-all duration-200 
      ${activeButton === 'v2' 
        ? 'bg-green-500 text-white shadow-md' 
        : 'bg-slate-900 text-white hover:bg-green-500'
      } truncate max-w-[140px]`}
  >
    Honda Clickasdasdas
  </button>

  <button
    onClick={() => handleLogout()}
    className={`border-1 border-red-500 bg-red-100 text-red-600 hover:bg-red-300 px-5 py-2.5 font-medium rounded-xl shadow-sm transition-all duration-200 truncate`}
  >
    Logout
  </button> </div>
                <HistoryComponent/>
              </div>
            </div>
            </>
          )}
        </div>
    </div>
  );
}

export default Driver;
