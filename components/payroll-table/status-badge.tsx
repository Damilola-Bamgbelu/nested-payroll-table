"use client";

import type { PayStatus } from "./types";

/* Colored dot, neutral text, light bordered pill */
const DOT: Record<PayStatus, string> = {
  Received:  "#12B76A",
  Processed: "#335cff",
  Pending:   "#F79009",
  Failed:    "#F04438",
};

export function StatusBadge({ status }: { status: PayStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[13px] font-medium whitespace-nowrap"
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        letterSpacing: "-0.2px",
        color: "#344054",
        border: "1px solid #e1e4ea",
        background: "#fff",
      }}
    >
      <span className="h-[7px] w-[7px] rounded-full flex-shrink-0" style={{ background: DOT[status] ?? DOT.Pending }} />
      {status}
    </span>
  );
}
