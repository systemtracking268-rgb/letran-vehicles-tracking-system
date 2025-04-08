import { RadialBarChart, RadialBar, Tooltip } from "recharts";

function TirePressure() {
  const pressure = 32; // Example PSI value
  const minPressure = 30; // Minimum safe PSI
  const maxPressure = 40; // Maximum safe PSI
  const isLow = pressure < minPressure;
  const isHigh = pressure > maxPressure;

  const data = [
    { name: "Pressure", value: pressure, fill: isLow || isHigh ? "#FF0000" : "#008000" }, // Red if out of range, Green otherwise
    { name: "Max", value: maxPressure, fill: "#A9A9A9" }, // Gray for reference
  ];

  return (
    <div className="max-w-xs w-full bg-white rounded-lg p-2 relative">
      <h5 className=" font-semibold text-center">Tire Pressure</h5>

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

        {/* Pressure Display (Centered) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className=" font-bold">{pressure} PSI</p>
        </div>
      </div>

      <p className="text-center  font-bold">
        {isLow ? "⚠️ Low Pressure!" : isHigh ? "⚠️ Overinflated!" : "✅ Normal"}
      </p>
    </div>
  );
}

export default TirePressure;