import { RadialBarChart, RadialBar, Tooltip } from "recharts";

function SpeedMonitor() {
  const currentSpeed = 82.5;
  const speedLimit = 60;
  const isOverSpeed = currentSpeed > speedLimit;

  const data = [
    { name: "Speed", value: currentSpeed, fill: isOverSpeed ? "#FF0000" : "#008000" }, // Red if overspeed, Green otherwise
    { name: "Limit", value: speedLimit, fill: "#A9A9A9" }, // Gray for speed limit
  ];

  return (
    <div className="max-w-xs w-full bg-white rounded-lg p-2 relative">
      <h5 className=" font-semibold text-center">Speed Monitor</h5>

      <div className="flex justify-center relative">
        <RadialBarChart 
          width={200} height={200}  // 🔹 Smaller size
          innerRadius="70%" outerRadius="90%" // 🔹 Adjusted radius for a compact look
          barSize={8} // 🔹 Thinner bars
          data={data} startAngle={90} endAngle={-270}
        >
          <RadialBar dataKey="value" />
          <Tooltip />
        </RadialBarChart>

        {/* Speed Display (Centered) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className=" font-bold">{currentSpeed} km/h</p>
        </div>
      </div>

      <p className="text-center font-bold">
        {isOverSpeed ? "⚠️ Over Speed!" : "✅ Within Limit"}
      </p>
    </div>
  );
}

export default SpeedMonitor;
