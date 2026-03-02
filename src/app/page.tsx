"use client";
import React, { useState } from "react";

export default function Home() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [csv, setCsv] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCsv("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location }),
      });
      const data = await res.json();
      if (res.ok) {
        setCsv(data.csv);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Request failed");
    }
    setLoading(false);
  };

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${category}_${location}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTable = () => {
    if (!csv) return null;
    const rows = csv.trim().split("\n").map((row) => row.split(","));
    return (
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr>
              {rows[0].map((cell, i) => (
                <th key={i} className="px-4 py-2 bg-gray-100 border-b border-gray-300">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 border-b border-gray-200">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={downloadCsv} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">Download CSV</button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 mt-12">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Lead Scraper</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Company Category</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g. Plumber, Restaurant"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Area</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. New York, London"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Scraping..." : "Scrape Leads"}
          </button>
        </form>
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
        {renderTable()}
      </div>
      <footer className="mt-12 text-gray-400 text-sm">&copy; {new Date().getFullYear()} Lead Scraper. All rights reserved.</footer>
    </main>
  );
}
