import React, { useState, useMemo } from "react";

const History = () => {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortAsc, setSortAsc] = useState(false);

  // Mock static data (replace with DB fetch later)
  const data = [
    { id: 1, vehicleName: "Honda Click", speed: 60, date: "2025-08-30" },
    { id: 2, vehicleName: "Sedan", speed: 90, date: "2025-08-28" },
    { id: 3, vehicleName: "Honda Click", speed: 110, date: "2025-08-25" },
  ];

  const fmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const filtered = useMemo(() => {
    return data.filter(
      (row) =>
        row.vehicleName.toLowerCase().includes(query.toLowerCase()) ||
        row.speed.toString().includes(query) ||
        row.date.includes(query)
    );
  }, [query, data]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (x < y) return sortAsc ? -1 : 1;
      if (x > y) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortAsc]);

  const headerBtn = (label, key) => (
    <button
      onClick={() =>
        setSortKey((prev) => {
          if (prev === key) setSortAsc(!sortAsc);
          return key;
        })
      }
      className="flex items-center gap-1"
    >
      {label}
      {sortKey === key && (sortAsc ? "▲" : "▼")}
    </button>
  );

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">History</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="rounded-lg border px-3 py-1 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">{headerBtn("Vehicle Name", "vehicleName")}</th>
              <th className="px-3 py-2">{headerBtn("Speed", "speed")}</th>
              <th className="px-3 py-2">{headerBtn("Date", "date")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">{row.vehicleName}</td>
                <td className="px-3 py-2">{row.speed} km/h</td>
                <td className="px-3 py-2">{fmt.format(new Date(row.date))}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
