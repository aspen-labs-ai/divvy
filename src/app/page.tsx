"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [showForm, setShowForm] = useState(false);
  const [tripName, setTripName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) return;
    console.log("Creating trip:", tripName);
    router.push("/trip/demo");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="8" width="24" height="18" rx="3" stroke="#22c55e" strokeWidth="2" />
            <path d="M10 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="#22c55e" strokeWidth="2" />
            <path d="M16 14v6M13 17h6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-7xl font-black tracking-tight leading-none">
          <span className="text-white">Di</span>
          <span className="text-[#22c55e]">vvy</span>
        </h1>
        <p className="text-[#a1a1aa] text-xl mt-4 font-medium">
          Split expenses. Stay friends.
        </p>

        {/* CTA */}
        <div className="mt-10">
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
                disabled={!tripName.trim()}
                className="w-full bg-[#22c55e] text-black font-bold text-lg rounded-2xl py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16a34a] active:scale-[0.98] transition-all shadow-lg shadow-[#22c55e]/20"
              >
                Create Trip →
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTripName("");
                }}
                className="text-[#a1a1aa] text-sm hover:text-white transition-colors py-1"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <p className="text-[#a1a1aa] text-sm mt-10">
          No sign up · No credit card · Just split
        </p>
      </div>
    </main>
  );
}
