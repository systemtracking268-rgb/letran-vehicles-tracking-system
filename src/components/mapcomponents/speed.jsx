import { RadialBarChart, RadialBar, Tooltip } from "recharts";

function SpeedMonitor({ speed }) {
  const currentSpeed = typeof speed === "number" ? speed : 0;
  const speedLimit = 60;
  const isOverSpeed = currentSpeed > speedLimit;

  const data = [
    { name: "Speed", value: currentSpeed, fill: isOverSpeed ? "#FF0000" : "#008000" },
    { name: "Limit", value: speedLimit, fill: "#A9A9A9" },
  ];

  return (
    <div className="max-w-xs w-full rounded-lg bg-white p-2 relative">
      <h5 className="font-semibold text-center">Speed Monitor</h5>

      <div className="flex justify-center relative">
        <RadialBarChart
          width={100}
          height={100}
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

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="font-bold">{currentSpeed} km/h</p>
        </div>
      </div>

      <p className="text-center font-bold">
        {isOverSpeed ? "⚠️ Over Speed!" : "✅ Within Limit"}
      </p>
    </div>
  );
}

export default SpeedMonitor;