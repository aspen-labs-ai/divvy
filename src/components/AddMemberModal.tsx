"use client";

import { useState, useRef, useEffect } from "react";

interface AddMemberModalProps {
  onAdd: (name: string) => void;
  onClose: () => void;
}

export default function AddMemberModal({ onAdd, onClose }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#1a1a1a] border border-[#2a2a2a] rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-lg font-semibold mb-4">Add Member</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-[#a1a1aa] focus:outline-none focus:border-[#22c55e] transition-colors text-base"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2a2a2a] text-white rounded-xl py-3 font-medium hover:bg-[#333] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-[#22c55e] text-black rounded-xl py-3 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16a34a] transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
