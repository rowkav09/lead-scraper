"use client";
import React, { useState, useEffect } from "react";

type Lead = {
  name: string;
  address: string;
  website: string;
  phone_number: string;
  reviews_count: number | null;
  reviews_average: number | null;
  store_shopping: string;
  in_store_pickup: string;
  store_delivery: string;
  place_type: string;
  opens_at: string;
  introduction: string;
};

const DISPLAY_COLUMNS: { key: keyof Lead; label: string }[] = [
  { key: "name", label: "Business Name" },
  { key: "phone_number", label: "Phone" },
  { key: "website", label: "Website" },
  { key: "reviews_average", label: "Rating" },
  { key: "reviews_count", label: "Reviews" },
  { key: "place_type", label: "Category" },
  { key: "address", label: "Address" },
  { key: "opens_at", label: "Hours" },
];

const LOADING_STEPS = [
  "Connecting to Google Maps\u2026",
  "Searching for businesses\u2026",
  "Scrolling through listings\u2026",
  "Extracting contact details\u2026",
  "Compiling results\u2026",
];

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}

function TableSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-800/40">
        <div className="flex gap-6">
          {[180, 120, 140, 80, 90, 100].map((w, i) => (
            <div key={i} className="h-3 bg-zinc-700 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border-b border-zinc-800/50 flex gap-6">
          {[180, 120, 140, 80, 90, 100].map((w, j) => (
            <div key={j} className="h-3 bg-zinc-800 rounded animate-pulse" style={{ width: w, opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [total, setTotal] = useState(10);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchLabel, setSearchLabel] = useState("");
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const timer = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setLeads([]);
    setSearchLabel("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location, total }),
      });
      const data = await res.json();
      if (res.ok) {
        setLeads(data.data ?? []);
        setSearchLabel(data.search ?? `${category} in ${location}`);
      } else {
        setError(data.error || "Scraping failed. Is the backend running?");
      }
    } catch {
      setError("Could not reach the scraper service. Make sure the Python backend is running.");
    }
    setLoading(false);
  };

  const downloadCsv = () => {
    if (!leads.length) return;
    const headers = Object.keys(leads[0]) as (keyof Lead)[];
    const rows = leads.map((lead) =>
      headers.map((h) => `"${String(lead[h] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${category.replace(/\s+/g, "_")}_${location.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatWebsite = (url: string) => {
    return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  };

  const websiteHref = (url: string) => {
    if (url.startsWith("http")) return url;
    return `https://${url}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <MapPinIcon />
          </div>
          <span className="text-lg font-bold tracking-tight">MapLeads</span>
          <span className="ml-auto text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
            Google Maps Scraper
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            Powered by Playwright
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-5 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent leading-tight">
            Find Business Leads<br />in Seconds
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Scrape verified business contacts — names, phones, websites, ratings — directly from Google Maps.
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-10 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Business Type
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  placeholder="e.g. Plumber, Dentist"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="e.g. New York, London"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Number of Results
              </label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow cursor-pointer"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                disabled={loading}
              >
                <option value={5}>5 results</option>
                <option value={10}>10 results</option>
                <option value={20}>20 results</option>
                <option value={50}>50 results — takes longer</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner />
                  {LOADING_STEPS[loadingStep]}
                </>
              ) : (
                <>
                  <SearchIcon />
                  Search for Leads
                </>
              )}
            </button>
          </form>
          {loading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Step {loadingStep + 1} of {LOADING_STEPS.length}</span>
                <span>{Math.round(((loadingStep + 1) / LOADING_STEPS.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-950/40 border border-red-800/60 rounded-xl px-5 py-4 mb-8 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <TableSkeleton />}

        {/* Results */}
        {!loading && leads.length > 0 && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{leads.length}</div>
                <div className="text-xs text-zinc-500 mt-1">Total Leads</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-emerald-400">
                  {leads.filter(l => l.phone_number).length}
                </div>
                <div className="text-xs text-zinc-500 mt-1">With Phone</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-indigo-400">
                  {leads.filter(l => l.website).length}
                </div>
                <div className="text-xs text-zinc-500 mt-1">With Website</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-400 flex items-center gap-1">
                  {(() => {
                    const r = leads.filter(l => l.reviews_average != null).map(l => l.reviews_average!);
                    return r.length ? (r.reduce((a, b) => a + b, 0) / r.length).toFixed(1) : "\u2014";
                  })()}
                  <span className="text-lg">\u2605</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">Avg Rating</div>
              </div>
            </div>

            {/* Results bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-zinc-400">
                Found{" "}
                <span className="text-white font-semibold">{leads.length} leads</span>
                {" "}for{" "}
                <span className="text-indigo-400 font-medium">&ldquo;{searchLabel}&rdquo;</span>
              </p>
              <button
                onClick={downloadCsv}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-md shadow-emerald-900/30"
              >
                <DownloadIcon />
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-800/50">
                      <th className="px-3 py-3.5 text-left text-xs font-semibold text-zinc-500 w-10">#</th>
                      {DISPLAY_COLUMNS.map(({ key, label }) => (
                        <th
                          key={key}
                          className="px-4 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <tr
                        key={i}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-3 py-3.5 text-zinc-600 text-xs font-mono">{i + 1}</td>
                        {DISPLAY_COLUMNS.map(({ key }) => {
                          const val = lead[key];

                          if (key === "name") {
                            return (
                              <td key={key} className="px-4 py-3.5 font-medium text-zinc-100 whitespace-nowrap max-w-[220px] truncate">
                                {val || "—"}
                              </td>
                            );
                          }

                          if (key === "website" && val) {
                            return (
                              <td key={key} className="px-4 py-3.5 whitespace-nowrap">
                                <a
                                  href={websiteHref(String(val))}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-2 transition-colors"
                                >
                                  {formatWebsite(String(val))}
                                </a>
                              </td>
                            );
                          }

                          if (key === "reviews_average" && val !== null) {
                            return (
                              <td key={key} className="px-4 py-3.5 whitespace-nowrap">
                                <span className="flex items-center gap-1">
                                  <span className="text-amber-400 text-base leading-none">★</span>
                                  <span className="text-zinc-200 font-medium">{val}</span>
                                </span>
                              </td>
                            );
                          }

                          if (key === "phone_number" && val) {
                            return (
                              <td key={key} className="px-4 py-3.5 whitespace-nowrap">
                                <a
                                  href={`tel:${String(val).replace(/\s/g, "")}`}
                                  className="text-zinc-300 hover:text-white font-mono text-xs transition-colors"
                                >
                                  {String(val)}
                                </a>
                              </td>
                            );
                          }

                          return (
                            <td key={key} className="px-4 py-3.5 text-zinc-400 max-w-[200px] truncate whitespace-nowrap">
                              {val !== null && val !== undefined && val !== "" ? String(val) : <span className="text-zinc-600">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <span className="text-xs text-zinc-500">{leads.length} records</span>
                <button
                  onClick={downloadCsv}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <DownloadIcon />
                  Download all as CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state after search */}
        {!loading && !error && leads.length === 0 && searchLabel && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg">No leads found for &ldquo;{searchLabel}&rdquo;</p>
            <p className="text-sm mt-2">Try a different business type or location.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900 py-8 mt-10">
        <p className="text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} MapLeads. All rights reserved.
        </p>
      </footer>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-emerald-900/40 flex items-center gap-2.5 animate-[slideUp_0.3s_ease-out] z-50 text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          CSV exported successfully
        </div>
      )}
    </div>
  );
}
