"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint } from "@/lib/payroll-types";
import { useState } from "react";

interface Props { data: ChartDataPoint[]; }

function formatY(v: number) {
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}k`;
  return `₦${v}`;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2.5 shadow-sm text-xs font-mono">
      <p className="font-semibold text-gray-700 mb-1.5 uppercase tracking-wide text-[10px]">{label} 2026</p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: e.color }} />
            {e.name}
          </span>
          <span className="font-semibold text-gray-900">{formatY(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

const VIEWS = ["Weekly", "Monthly", "Yearly"] as const;

export function PayrollChart({ data }: Props) {
  const [view, setView] = useState<"Weekly" | "Monthly" | "Yearly">("Monthly");

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
      {/* Sales Trend – main chart */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 font-mono">Payroll Trend</p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-gray-200 p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors font-mono ${
                  view === v ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Total Payroll:</span>
            <span className="text-lg font-bold font-mono text-gray-900 tabular-nums">
              {formatY(data[data.length - 1]?.grossPayroll ?? 0)}
            </span>
            <div className="flex items-center gap-3 ml-2">
              <span className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                <span className="inline-block h-2 w-2 rounded-sm bg-gray-300" /> Net Pay
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                <span className="inline-block h-2 w-2 rounded-sm bg-gray-800" /> Gross
              </span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 4 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#9ca3af", fontFamily: "var(--font-inter)", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v} •`}
            />
            <YAxis
              tickFormatter={formatY}
              tick={{ fontSize: 10, fill: "#9ca3af", fontFamily: "var(--font-inter)" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="netPayroll" name="Net Pay" fill="#d1d5db" radius={[2, 2, 0, 0]} maxBarSize={24} />
            <Bar dataKey="grossPayroll" name="Gross" fill="#374151" radius={[2, 2, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Breakdown – right panel */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 font-mono">Payroll Breakdown</p>
        </div>
        <div className="px-5 pt-4">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Net Payroll</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-gray-900 mt-0.5">
            {formatY(data[data.length - 1]?.netPayroll ?? 0)}
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
            <span className="text-[9px] text-gray-400 font-mono">✦</span>
            <p className="text-[11px] text-gray-500 font-mono">AI insight: payroll grew 8.4% MoM</p>
          </div>
        </div>

        {/* Mini bar chart */}
        <div className="px-4 pb-2 pt-3">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={1}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} />
              <Bar dataKey="tax" name="Tax" fill="#d1d5db" radius={[2, 2, 0, 0]} maxBarSize={20} />
              <Bar dataKey="netPayroll" name="Net" fill="#374151" radius={[2, 2, 0, 0]} maxBarSize={20} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-gray-400">
            <span>1 JAN</span>
            <span>· · ·</span>
            <span>JUN 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
