"use client";

import { useState } from "react";
import {
  LayoutDashboard, Users, Wallet, FileText, TrendingUp, MessageSquare,
  Receipt, Clock, Timer, LifeBuoy, HelpCircle, Settings,
  ChevronDown, Search, Bell, FolderClosed,
  Calendar, Download, ChevronsUpDown,
} from "lucide-react";
import { payrollData, summaryMetrics } from "@/lib/payroll-data";
import { PayrollSummaryCards } from "@/components/payroll/payroll-summary-cards";
import { PayrollFilters }      from "@/components/payroll/payroll-filters";
import { PayrollTable }        from "@/components/payroll-table";

const INTER = { fontFamily: "Inter, system-ui, -apple-system, sans-serif", letterSpacing: "-0.2px" } as const;

/* ── Nav config ── */
const MAIN = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Users,           label: "Employees" },
  { icon: Wallet,          label: "Payroll", active: true },
  { icon: FileText,        label: "Invoices" },
  { icon: TrendingUp,      label: "Performance" },
  { icon: MessageSquare,   label: "Chat" },
];
const FAVS = [
  { icon: Receipt, label: "Reimbursements" },
  { icon: Clock,   label: "Timesheet" },
  { icon: Timer,   label: "Time logs" },
];
const SETTINGS = [
  { icon: LifeBuoy,  label: "Customer support" },
  { icon: HelpCircle,label: "Help center" },
  { icon: Settings,  label: "System settings" },
];

function NavItem({ icon: Icon, label, active }: { icon: React.ElementType; label: string; active?: boolean }) {
  return (
    <button
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] transition-colors"
      style={{
        ...INTER,
        background: active ? "#ffffff" : "transparent",
        color: active ? "#0e121b" : "#525866",
        fontWeight: active ? 600 : 400,
        boxShadow: active ? "0 1px 2px rgba(10,13,20,0.06)" : undefined,
        border: active ? "1px solid #ededec" : "1px solid transparent",
      }}
    >
      <Icon size={18} style={{ color: active ? "#0e121b" : "#99a0ae", flexShrink: 0 }} />
      {label}
    </button>
  );
}

function NavGroup({ title, items }: { title: string; items: typeof MAIN }) {
  return (
    <div className="mt-5">
      <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ ...INTER, color: "#cacfd8" }}>{title}</p>
      <div className="flex flex-col gap-0.5">
        {items.map((it) => <NavItem key={it.label} {...it} />)}
      </div>
    </div>
  );
}

export default function PayrollDashboard() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex h-screen overflow-hidden" style={{ ...INTER, background: "#ffffff" }}>

      {/* ════ SIDEBAR (grey) ════ */}
      <aside className="flex w-[238px] flex-shrink-0 flex-col" style={{ background: "#f8f8f8", borderRight: "1px solid #ededec" }}>
        {/* Brand */}
        <div className="flex h-[64px] flex-shrink-0 items-center gap-2.5 px-4" style={{ borderBottom: "1px solid #e5e4e1" }}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[14px] font-bold text-white" style={{ background: "#0e121b" }}>D.</div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] leading-none" style={{ ...INTER, color: "#99a0ae" }}>Agency</p>
            <p className="text-[14px] font-semibold leading-tight truncate" style={{ ...INTER, color: "#0e121b" }}>Delion Team</p>
          </div>
          <ChevronsUpDown size={14} style={{ color: "#99a0ae" }} className="flex-shrink-0" />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <NavGroup title="Main Menu" items={MAIN} />
          <NavGroup title="Favourites" items={FAVS} />
          <NavGroup title="Settings" items={SETTINGS} />
        </nav>

        {/* User */}
        <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderTop: "1px solid #e5e4e1" }}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white" style={{ background: "#f04438" }}>EW</div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold leading-tight truncate" style={{ ...INTER, color: "#0e121b" }}>Emma wright</p>
            <p className="text-[11px] leading-tight truncate" style={{ ...INTER, color: "#99a0ae" }}>emma.wright@acme.com</p>
          </div>
          <ChevronDown size={14} style={{ color: "#99a0ae" }} className="flex-shrink-0" />
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex h-[64px] flex-shrink-0 items-center justify-between bg-white px-6" style={{ borderBottom: "1px solid #e1e4ea" }}>
          {/* Page title */}
          <h1 className="text-[15px] font-semibold" style={{ ...INTER, color: "#0e121b" }}>Payroll</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#99a0ae" }} />
              <input placeholder="Search..." className="h-9 w-56 rounded-lg pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#335cff]/15"
                style={{ ...INTER, background: "#ffffff", border: "1px solid #e1e4ea", color: "#0e121b" }} />
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-50" style={{ border: "1px solid #e1e4ea" }}>
              <FolderClosed size={16} style={{ color: "#525866" }} />
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-50" style={{ border: "1px solid #e1e4ea" }}>
              <Bell size={16} style={{ color: "#525866" }} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full border border-white" style={{ background: "#f04438" }} />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold text-white" style={{ background: "#335cff" }}>EW</div>
          </div>
        </header>

        {/* Scroll body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* Toolbar row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* This week dropdown */}
              <button className="flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-[13px] font-medium transition-colors hover:bg-gray-50" style={{ ...INTER, border: "1px solid #e1e4ea", color: "#0e121b" }}>
                This week
                <ChevronDown size={14} style={{ color: "#99a0ae" }} />
              </button>
              {/* Date range */}
              <div className="flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-[13px]" style={{ ...INTER, border: "1px solid #e1e4ea", color: "#525866" }}>
                <Calendar size={14} style={{ color: "#99a0ae" }} />
                Feb 16 - Feb 22 2026
              </div>
            </div>
            {/* Export */}
            <button className="flex h-9 items-center gap-2 rounded-lg bg-white px-3.5 text-[13px] font-medium transition-colors hover:bg-gray-50" style={{ ...INTER, border: "1px solid #e1e4ea", color: "#0e121b" }}>
              <Download size={14} style={{ color: "#525866" }} />
              Export
              <ChevronDown size={14} style={{ color: "#99a0ae" }} />
            </button>
          </div>

          {/* Metric cards */}
          <PayrollSummaryCards metrics={summaryMetrics} />

          {/* Table — grey tray (#f8f8f8), 2px frame + subtle #ededed stroke */}
          <div className="rounded-[14px]" style={{ background: "#f8f8f8", padding: 2, border: "0.3px solid #ededed" }}>
            {/* Toolbar — transparent, reflects the grey tray */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-1.5">
              <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ ...INTER, color: "#98a2b3" }}>Processed Payroll</span>
              <PayrollFilters search={search} onSearchChange={setSearch} />
            </div>
            {/* White table card — 2px below the toolbar */}
            <div className="rounded-[10px] bg-white overflow-hidden" style={{ border: "1px solid #ededec", marginTop: 2 }}>
              <PayrollTable countries={payrollData} search={search} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
