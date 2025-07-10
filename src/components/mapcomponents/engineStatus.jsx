import React from "react";

function EngineStatus({ status }) {
    console.log("EngineStatus prop:", status);
    
  const statusColors = {
    On: "text-green-500",
    Off: "text-red-500",
    Unknown: "text-gray-400"
  };

  const statusText = {
    On: "🟢 Engine is On",
    Off: "🔴 Engine is Off",
    Unknown: "⚪ Engine Status Unknown"
  };

  const color = statusColors[status] || statusColors.Unknown;
  const text = statusText[status] || statusText.Unknown;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-64 text-center">
      <h5 className="font-semibold text-lg mb-2">Engine Status</h5>
      <p className={`text-xl font-bold ${color}`}>{text}</p>
    </div>
  );
}

export default EngineStatus;
