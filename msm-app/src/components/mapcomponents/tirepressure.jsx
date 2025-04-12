import { RadialBarChart, RadialBar, Tooltip } from "recharts";

function BatteryMonitor() {
  const batteryLevel = 76; // Example battery percentage
  const lowThreshold = 20;
  const highThreshold = 90;
  const isLow = batteryLevel < lowThreshold;
  const isHigh = batteryLevel > highThreshold;

  const data = [
    {
      name: "Battery Level",
      value: batteryLevel,
      fill: isLow || isHigh ? "#FF0000" : "#008000", // Red if out of range, green otherwise
    },
    {
      name: "Max",
      value: 100,
      fill: "#A9A9A9", // Reference gray bar
    },
  ];

  return (
    <div className="max-w-xs w-full bg-white rounded-lg p-2 relative">
      <h5 className="font-semibold text-center">Battery Monitor</h5>

      <div className="flex justify-center relative">
        <RadialBarChart
          width={200}
          height={200}
          innerRadius="70%"
          outerRadius="90%"
          barSize={8}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" />
          <Tooltip />
        </RadialBarChart>

        {/* Battery Level Display (Centered) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="font-bold">{batteryLevel}%</p>
        </div>
      </div>

      <p className="text-center font-bold">
        {isLow
          ? "⚠️ Low Battery!"
          : isHigh
          ? "⚠️ Charging Complete!"
          : "🔋 Normal"}
      </p>
    </div>
  );
}

export default BatteryMonitor;