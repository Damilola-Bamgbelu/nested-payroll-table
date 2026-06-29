"use client";

import { Search, ListFilter, Plus } from "lucide-react";

const INTER = { fontFamily: "Inter, system-ui, -apple-system, sans-serif", letterSpacing: "-0.2px" };

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
}

export function PayrollFilters({ search, onSearchChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* Search with ⌘1 kbd */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#99a0ae" }} />
        <input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-56 rounded-[10px] pl-9 pr-12 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#335cff]/15 transition"
          style={{ ...INTER, background: "#fff", border: "1px solid #e1e4ea", color: "#0e121b" }}
        />
        <kbd
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[4px] px-1.5 py-0.5 text-[10px] font-medium"
          style={{ ...INTER, background: "#fff", border: "1px solid #e1e4ea", color: "#99a0ae" }}
        >
          ⌘1
        </kbd>
      </div>

      {/* Vertical divider separating search from Filter / CTA */}
      <span className="h-6 w-px" style={{ background: "#e1e4ea" }} />

      {/* Filter */}
      <button
        className="flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-medium transition-colors hover:bg-gray-50"
        style={{ ...INTER, background: "#fff", border: "1px solid #e1e4ea", color: "#344054" }}
      >
        <ListFilter size={15} style={{ color: "#525866" }} />
        Filter
      </button>

      {/* New payroll — dark primary */}
      <button
        className="flex h-9 items-center gap-1.5 rounded-[10px] px-4 text-[13px] font-semibold text-white transition-colors"
        style={{ ...INTER, background: "#0e121b" }}
      >
        <Plus size={16} />
        New payroll
      </button>
    </div>
  );
}
