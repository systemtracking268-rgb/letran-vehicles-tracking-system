import { RadialBarChart, RadialBar, Tooltip } from "recharts";

function BatteryMonitor({ battery, isBatteryLow }) {
  const batteryVolts = battery;

  // The fill color is now determined directly by the isBatteryLow prop.
  // The threshold logic is handled by the parent component, which passes the boolean.
  const fillColor = isBatteryLow ? "#FF0000" : "#008000";

  const data = [
    {
      name: "Battery Level",
      value: batteryVolts,
      fill: fillColor,
    },
    {
      name: "Max",
      value: 14.5, // A typical maximum voltage for a car battery
      fill: "#A9A9A9", // Reference gray bar
    },
  ];

  return (
    <div className="max-w-xs w-full bg-white rounded-lg p-2 relative">
      <h5 className="font-semibold text-center">Battery Monitor</h5>

      <div className="flex justify-center relative">
        <RadialBarChart
          width={100}
          height={100}
          innerRadius="70%"
          outerRadius="90%"
          barSize={8}
          data={data}
          startAngle={90}
          endAngle={-360}
        >
          <RadialBar dataKey="value" />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.9)' }} />
        </RadialBarChart>

        {/* Battery Level Display (Centered) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="font-bold">{batteryVolts}V</p>
        </div>
      </div>

      <p className="text-center font-bold">
        {isBatteryLow ? "⚠️ Low Battery!" : "🔋 Normal"}
      </p>
    </div>
  );
}

export default BatteryMonitor;