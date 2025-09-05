import React, { useState, useMemo } from "react";

const History = ({ data }) => {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("timestamp");
  const [sortAsc, setSortAsc] = useState(false);

  // Directly use the data prop without strict filtering
  const formattedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  const fmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const filtered = useMemo(() => {
    return formattedData.filter(
      (row) =>
        (row.id && row.id.toLowerCase().includes(query.toLowerCase())) ||
        (row.deviceID && row.deviceID.toString().toLowerCase().includes(query.toLowerCase())) ||
        (row.speed && row.speed.toString().includes(query)) ||
        (row.latitude && row.latitude.toString().includes(query)) ||
        (row.longitude && row.longitude.toString().includes(query)) ||
        (row.timestamp && row.timestamp.includes(query))
    );
  }, [query, formattedData]);

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
        <div className="h-96 overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2">{headerBtn("Device ID", "deviceID")}</th>
                <th className="px-3 py-2">{headerBtn("Latitude", "latitude")}</th>
                <th className="px-3 py-2">{headerBtn("Longitude", "longitude")}</th>
                <th className="px-3 py-2">{headerBtn("Speed", "speed")}</th>
                <th className="px-3 py-2">{headerBtn("Timestamp", "timestamp")}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0 ? (
                sorted.map((row, index) => (
                  <tr key={row.id || index} className="border-t">
                    <td className="px-3 py-2 truncate">
                      {row.deviceID === 6578123 ? "Vehicle 1" : row.deviceID || 'N/A'}
                    </td>
                    <td className="px-3 py-2">{row.latitude || 'N/A'}</td>
                    <td className="px-3 py-2">{row.longitude || 'N/A'}</td>
                    <td className="px-3 py-2">{row.speed !== undefined && row.speed !== null ? `${row.speed} km/h` : 'N/A'}</td>
                    <td className="px-3 py-2">{row.timestamp ? fmt.format(new Date(row.timestamp)) : 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
