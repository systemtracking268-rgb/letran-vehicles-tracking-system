import { RadialBarChart, RadialBar, Tooltip } from "recharts";

function FuelConsumptionMonitor() {
  const consumedFuel = 73.87; // Example fuel consumed (in percentage)
  const totalFuel = 100; // Total fuel
  const remainingFuel = totalFuel - consumedFuel;

  const data = [
    { name: "Consumed", value: consumedFuel, fill: "#FF0000" }, // Red if consumed
    { name: "Remaining", value: remainingFuel, fill: "#008000" }, // Green for remaining
  ];

  return (
    <div className="w-full bg-white rounded-lg p-2 relative">
      <h5 className=" font-semibold text-center">Fuel Consumption</h5>

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

        {/* Display Consumed Fuel Percentage */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className=" font-bold">{consumedFuel}%</p>
        </div>
      </div>

      <p className="text-center font-bold">
        {consumedFuel >= 80 ? "⚠️ High Consumption!" : "✅ Consumption Normal"}
      </p>
    </div>
  );
}

export default FuelConsumptionMonitor;
