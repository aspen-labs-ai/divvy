"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTrip, getRecentTrips } from "@/lib/storage";
import type { TripIndex } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomePage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [tripName, setTripName] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentTrips, setRecentTrips] = useState<TripIndex[]>([]);

  useEffect(() => {
    setRecentTrips(getRecentTrips());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim() || loading) return;
    setLoading(true);
    const trip = createTrip(tripName.trim());
    router.push(`/trip/${trip.code}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="18" rx="3" stroke="#22c55e" strokeWidth="2" />
              <path d="M10 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="#22c55e" strokeWidth="2" />
              <path d="M16 14v6M13 17h6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-7xl font-black tracking-tight leading-none">
            <span className="text-white">Di</span>
            <span className="text-[#22c55e]">vvy</span>
          </h1>
          <p className="text-[#a1a1aa] text-xl mt-4 font-medium">
            Split expenses. Stay friends.
          </p>
        </div>

        {/* CTA */}
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-[#22c55e] text-black font-bold text-lg rounded-2xl py-4 hover:bg-[#16a34a] active:scale-[0.98] transition-all shadow-lg shadow-[#22c55e]/20"
            >
              Start a Trip →
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Trip name (e.g. Coachella 2025)"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                autoFocus
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-[#22c55e] text-lg transition-colors"
              />
              <button
                type="submit"
                disabled={!tripName.trim() || loading}
                className="w-full bg-[#22c55e] text-black font-bold text-lg rounded-2xl py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16a34a] active:scale-[0.98] transition-all shadow-lg shadow-[#22c55e]/20"
              >
                {loading ? "Creating…" : "Create Trip →"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setTripName(""); }}
                className="text-[#a1a1aa] text-sm hover:text-white transition-colors py-1 w-full"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Recent trips */}
        {recentTrips.length > 0 && (
          <div className="mt-8">
            <p className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider mb-3">
              Recent trips
            </p>
            <div className="space-y-2">
              {recentTrips.slice(0, 5).map((trip) => (
                <button
                  key={trip.code}
                  onClick={() => router.push(`/trip/${trip.code}`)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 flex items-center justify-between hover:border-[#3a3a3a] transition-colors text-left group"
                >
                  <div>
                    <p className="text-white font-medium group-hover:text-[#22c55e] transition-colors">
                      {trip.name}
                    </p>
                    <p className="text-xs text-[#52525b] mt-0.5">{formatDate(trip.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#52525b] font-mono bg-[#0a0a0a] px-2 py-1 rounded-lg border border-[#2a2a2a]">
                      {trip.code}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#a1a1aa] transition-colors">
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-[#a1a1aa] text-sm text-center mt-10">
          No sign up · No credit card · Just split
        </p>
      </div>
    </main>
  );
}
