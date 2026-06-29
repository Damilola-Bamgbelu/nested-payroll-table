"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import type { SummaryMetrics } from "@/lib/payroll-types";
import { formatCurrency } from "@/lib/format";

const INTER = { fontFamily: "Inter, system-ui, -apple-system, sans-serif", letterSpacing: "-0.2px" } as const;

/* 7-bar sparkline — each card a distinct shape + a different black bar.
   Card 1: rising ramp · Card 2: falling ramp · Card 3: mountain (peak mid) ·
   Card 4: valley (dip mid) */
const WAVES: { heights: number[]; black: number }[] = [
  { heights: [10, 14, 19, 24, 29, 34, 38], black: 6 },  // rising
  { heights: [38, 33, 28, 23, 18, 14, 10], black: 0 },  // falling
  { heights: [12, 20, 30, 38, 30, 20, 12], black: 3 },  // mountain
  { heights: [34, 24, 16, 11, 16, 24, 34], black: 3 },  // valley
];

function Sparkline({ heights, black }: { heights: number[]; black: number }) {
  return (
    <div className="flex items-end gap-[3px]" style={{ height: 34 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full flex-shrink-0"
          style={{ height: h, background: i === black ? "#0e121b" : "#d9d9d9" }}
        />
      ))}
    </div>
  );
}

interface CardDef { label: string; value: string; wave: { heights: number[]; black: number }; change: number; }

function MetricCard({ label, value, wave, change }: CardDef) {
  const up = change >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  const trendColor = up ? "#1a8245" : "#d92d20";
  return (
    /* Grey outer tray — 2px padding + subtle #ededed stroke */
    <div className="flex flex-col rounded-[12px]" style={{ background: "#f8f8f8", padding: 2, border: "0.3px solid #ededed" }}>
      {/* White inner card */}
      <div className="flex items-start justify-between gap-3 rounded-[10px] bg-white px-4 py-4">
        <div className="flex flex-col gap-2.5 min-w-0 flex-1">
          <span className="text-[12px] font-normal uppercase tracking-[0.04em]" style={{ ...INTER, color: "#99a0ae" }}>
            {label}
          </span>
          <span className="text-[24px] font-medium leading-none tabular-nums" style={{ ...INTER, color: "#0e121b", letterSpacing: "-0.5px" }}>
            {value}
          </span>
        </div>
        <Sparkline heights={wave.heights} black={wave.black} />
      </div>

      {/* Footer on grey */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full" style={{ background: "#e6e5e2" }}>
          <Arrow size={11} style={{ color: trendColor }} strokeWidth={2.5} />
        </span>
        <span className="text-[13px]" style={INTER}>
          <span className="font-semibold" style={{ color: trendColor }}>
            {up ? "+" : ""}{change.toFixed(2)}%
          </span>
          <span style={{ color: "#99a0ae" }}> last year</span>
        </span>
      </div>
    </div>
  );
}

export function PayrollSummaryCards({ metrics }: { metrics: SummaryMetrics }) {
  const cards: CardDef[] = [
    { label: "Total Payroll",    value: formatCurrency(metrics.totalPayroll),    wave: WAVES[0], change:  8.42 },
    { label: "Total Tax",        value: formatCurrency(metrics.totalTax),        wave: WAVES[1], change: -2.13 },
    { label: "Total Deductions", value: formatCurrency(metrics.totalDeductions), wave: WAVES[2], change:  3.78 },
    { label: "Net Payroll",      value: formatCurrency(metrics.netPayroll),      wave: WAVES[3], change: 11.05 },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((c) => <MetricCard key={c.label} {...c} />)}
    </div>
  );
}
