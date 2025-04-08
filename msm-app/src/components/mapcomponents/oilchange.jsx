import { RadialBarChart, RadialBar, Tooltip } from "recharts";

function OilChangeMonitor() {
  const oilChangeInterval = 5000; // Example interval (miles or hours)
  const milesDriven = 3000; // Example miles driven since the last oil change
  const remainingMiles = oilChangeInterval - milesDriven;
  const percentageUsed = (milesDriven / oilChangeInterval) * 100;

  const data = [
    { name: "Used", value: percentageUsed, fill: "#FF0000" }, // Red for used
    { name: "Remaining", value: 100 - percentageUsed, fill: "#008000" }, // Green for remaining
  ];

  return (
    <div className="max-w-xs w-full bg-white rounded-lg p-2 relative">
      <h5 className="font-semibold text-center">Oil Change</h5>

      <div className="flex justify-center relative">
        <RadialBarChart 
          width={200} height={200}
          innerRadius="70%" outerRadius="90%"
          barSize={8}
          data={data} startAngle={90} endAngle={-270}
        >
          <RadialBar dataKey="value" />
          <Tooltip />
        </RadialBarChart>

        {/* Display Oil Change Percentage */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="font-bold">{percentageUsed.toFixed(2)}%</p>
        </div>
      </div>

      <p className="text-center font-bold">
        {milesDriven >= oilChangeInterval ? "⚠️ Oil Change!" : "✅ Interval Remaining"}
      </p>
    </div>
  );
}

export default OilChangeMonitor;
