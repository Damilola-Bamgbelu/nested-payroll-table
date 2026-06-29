"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getExpandedRowModel,
  type ColumnDef, type SortingState, type ExpandedState, flexRender, type Row,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, MoreVertical,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import type { Country, Branch, Team, Employee, PayStatus } from "./types";
import { StatusBadge } from "./status-badge";
import { Checkbox } from "./checkbox";

const INTER: React.CSSProperties = { fontFamily: "Inter, system-ui, -apple-system, sans-serif", letterSpacing: "-0.2px" };

/** Default value formatter (USD, no decimals). Override via the `formatValue` prop. */
const defaultFormat = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/* ── Row union ── */
type TRow =
  | { kind: "country";  data: Country;  subRows: TRow[] }
  | { kind: "branch";   data: Branch;   subRows: TRow[] }
  | { kind: "team";     data: Team;     subRows: TRow[] }
  | { kind: "employee"; data: Employee; subRows: never[] };

function build(countries: Country[]): TRow[] {
  return countries.map((c) => ({
    kind: "country" as const, data: c,
    subRows: c.branches.map((b) => ({
      kind: "branch" as const, data: b,
      subRows: b.teams.map((t) => ({
        kind: "team" as const, data: t,
        subRows: t.employees.map((e) => ({ kind: "employee" as const, data: e, subRows: [] })),
      })),
    })),
  }));
}

/* ── Recursive search filter ── */
function filterRows(rows: TRow[], q: string): TRow[] {
  if (!q) return rows;
  const lq = q.toLowerCase();
  return rows.flatMap((r) => {
    const self = r.data.name.toLowerCase().includes(lq);
    if (r.kind === "employee") return self ? [r] : [];
    const subs = filterRows(r.subRows, q);
    if (subs.length > 0) return [{ ...r, subRows: subs } as TRow];
    return self ? [r] : [];
  });
}

/* ── Ancestor-is-last (for connector continuity) ── */
function ancestorIsLast(row: Row<TRow>): boolean[] {
  const out: boolean[] = [];
  let cur: Row<TRow> = row;
  while (cur.depth > 0) {
    const p = cur.getParentRow();
    if (!p) break;
    const sib = p.subRows as Row<TRow>[];
    out.unshift(sib[sib.length - 1]?.id === cur.id);
    cur = p as Row<TRow>;
  }
  return out;
}

/* ── Reddit-style rounded tree connectors ── */
const PAD = 16, SLOT = 28, CARET_R = 8, RADIUS = 10;
const STROKE = "1.5px solid #e1e4ea";
const LEVEL_BG: Record<number, string> = { 0: "#ffffff", 1: "#fcfcfd", 2: "#f9fafb", 3: "#f6f7f9" };

function Connectors({ depth, lasts, expanded }: { depth: number; lasts: boolean[]; expanded: boolean }) {
  if (depth === 0 && !expanded) return null;
  const selfX = PAD + depth * SLOT + CARET_R;
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {Array.from({ length: depth }).map((_, lvl) => {
        const isLast = lasts[lvl];
        const isCur  = lvl === depth - 1;
        const x      = PAD + lvl * SLOT + CARET_R;
        const armW   = PAD + depth * SLOT - x;
        if (isCur) {
          return (
            <React.Fragment key={lvl}>
              <span
                className="absolute"
                style={
                  isLast
                    ? { left: x, top: -1, height: `calc(50% - ${RADIUS - 1}px)`, borderLeft: STROKE }
                    : { left: x, top: -1, bottom: -1, borderLeft: STROKE }
                }
              />
              <span
                className="absolute"
                style={{ left: x, top: `calc(50% - ${RADIUS}px)`, height: RADIUS, width: armW, borderLeft: STROKE, borderBottom: STROKE, borderBottomLeftRadius: RADIUS }}
              />
            </React.Fragment>
          );
        }
        return !isLast ? <span key={lvl} className="absolute" style={{ left: x, top: -1, bottom: -1, borderLeft: STROKE }} /> : null;
      })}
      {expanded && (
        <span className="absolute" style={{ left: selfX, top: "50%", bottom: -1, borderLeft: STROKE }} />
      )}
    </div>
  );
}

/* ── Expand toggle ── */
function ExpandToggle({ expanded, onClick }: { expanded: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={expanded ? "Collapse" : "Expand"}
      className="flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-full transition-colors mr-2.5"
      style={
        expanded
          ? { border: "0.5px solid #1a1d24", background: "#f3f4f6", color: "#0e121b" }
          : { border: "1px solid #e1e4ea", background: "#fff", color: "#99a0ae" }
      }
    >
      {expanded ? <ChevronUp size={10} strokeWidth={2.5} /> : <ChevronDown size={10} strokeWidth={2} />}
    </button>
  );
}

/* ── Employee avatar — close-up portraits, override via `avatarUrl` prop ── */
const PORTRAITS = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce",
  "https://images.unsplash.com/photo-1463453091185-61582044d556",
  "https://images.unsplash.com/photo-1509967419530-da38b4704bc6",
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004",
];
const defaultAvatar = (id: number) =>
  `${PORTRAITS[id % PORTRAITS.length]}?w=80&h=80&fit=crop&crop=faces&auto=format&q=70`;

function Avatar({ avatarId, avatarUrl }: { avatarId: number; avatarUrl: (id: number) => string }) {
  return (
    <img
      src={avatarUrl(avatarId)}
      alt=""
      loading="lazy"
      className="h-[20px] w-[20px] flex-shrink-0 rounded-full object-cover mr-2.5"
      style={{ border: "1px solid #fff", boxShadow: "0 0 0 1px #e1e4ea" }}
    />
  );
}

function SortIcon({ s }: { s: false | "asc" | "desc" }) {
  if (!s) return <ChevronsUpDown size={12} style={{ color: "#cacfd8" }} className="ml-1" />;
  return s === "asc"
    ? <ChevronUp size={12} style={{ color: "#525866" }} className="ml-1" />
    : <ChevronDown size={12} style={{ color: "#525866" }} className="ml-1" />;
}

/* ── Public props ── */
export interface PayrollTableProps {
  /** Top-level data (countries → branches → teams → employees). */
  countries: Country[];
  /** Search query — filters by name across all levels. */
  search?: string;
  /** Format the Amount column. Defaults to USD with no decimals. */
  formatValue?: (n: number) => string;
  /** Resolve an employee avatar URL from its avatarId. */
  avatarUrl?: (id: number) => string;
  /** Column header labels. */
  labels?: Partial<Record<"group" | "amount" | "employees" | "period" | "status" | "processed", string>>;
  /** Called when a row's action (⋯) menu is clicked. */
  onRowAction?: (kind: TRow["kind"], id: string) => void;
  /** Top-level groups per page. Set to 0 to disable pagination. Default 6. */
  pageSize?: number;
}

/* ── Page-number list with ellipsis ── */
function pageList(current: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);
  const out: (number | "…")[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(count - 2, current + 1);
  if (start > 1) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < count - 2) out.push("…");
  out.push(count - 1);
  return out;
}

export function PayrollTable({
  countries,
  search = "",
  formatValue = defaultFormat,
  avatarUrl = defaultAvatar,
  labels,
  onRowAction,
  pageSize = 6,
}: PayrollTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [gotoVal, setGotoVal] = useState("");

  const allRows = useMemo(() => build(countries), [countries]);
  const filtered = useMemo(() => filterRows(allRows, search), [allRows, search]);

  /* Pagination over the top-level groups */
  const paginate = pageSize > 0;
  const pageCount = paginate ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const rows = useMemo(
    () => (paginate ? filtered.slice(safePage * pageSize, safePage * pageSize + pageSize) : filtered),
    [filtered, paginate, safePage, pageSize],
  );

  /* When the page changes, collapse rows so expansion ids don't carry across pages */
  const goToPage = (p: number) => { setExpanded({}); setPage(Math.max(0, Math.min(p, pageCount - 1))); };
  /* Reset to first page when the search query changes */
  const searchRef = React.useRef(search);
  if (searchRef.current !== search) { searchRef.current = search; if (page !== 0) { setPage(0); } }

  const L = {
    group: "Group", amount: "Amount", employees: "Employees",
    period: "Pay Period", status: "Status", processed: "Processed Date",
    ...labels,
  };

  const columns = useMemo<ColumnDef<TRow>[]>(() => [
    {
      id: "select", enableSorting: false, size: 40,
      header: () => {
        const top = allRows.map((_, i) => String(i));
        const all = top.length > 0 && top.every((id) => selected.has(id));
        return (
          <Checkbox checked={all} onChange={() => setSelected((p) => { const n = new Set(p); top.forEach((id) => all ? n.delete(id) : n.add(id)); return n; })} />
        );
      },
      cell: ({ row }) => row.depth === 0 ? (
        <Checkbox checked={selected.has(row.id)} onChange={() => setSelected((p) => { const n = new Set(p); n.has(row.id) ? n.delete(row.id) : n.add(row.id); return n; })} />
      ) : null,
    },
    {
      id: "group", header: L.group,
      accessorFn: (r) => r.data.name,
      cell: ({ row }) => {
        const r = row.original;
        const can = row.getCanExpand();
        const exp = row.getIsExpanded();
        const isEmp = r.kind === "employee";
        return (
          <>
            <Connectors depth={row.depth} lasts={ancestorIsLast(row)} expanded={exp} />
            <div className="relative flex items-center" style={{ minWidth: 0, paddingLeft: row.depth * SLOT }}>
              {can
                ? <ExpandToggle expanded={exp} onClick={(e) => { e.stopPropagation(); row.toggleExpanded(); }} />
                : isEmp ? <Avatar avatarId={(r.data as Employee).avatarId} avatarUrl={avatarUrl} /> : <span className="w-[16px] mr-2.5 flex-shrink-0" />}
              <span className="truncate" style={{ ...INTER, fontSize: 14, fontWeight: exp ? 600 : 400, color: r.kind === "employee" ? "#525866" : "#0e121b" }}>
                {r.data.name}
              </span>
            </div>
          </>
        );
      },
      size: 300,
    },
    {
      id: "amount", header: L.amount,
      accessorFn: (r) => r.data.amount,
      cell: ({ getValue, row }) => (
        <span className="tabular-nums" style={{ ...INTER, fontSize: 14, fontWeight: row.getIsExpanded() ? 600 : 400, color: "#0e121b" }}>
          {formatValue(getValue() as number)}
        </span>
      ),
    },
    {
      id: "employees", header: L.employees,
      accessorFn: (r) => (r.kind === "employee" ? null : (r.data as Country | Branch | Team).employeeCount),
      cell: ({ getValue, row }) => {
        const v = getValue() as number | null;
        return <span className="tabular-nums" style={{ ...INTER, fontSize: 14, fontWeight: row.getIsExpanded() ? 600 : 400, color: v === null ? "#cacfd8" : "#525866" }}>{v === null ? "—" : v}</span>;
      },
    },
    {
      id: "period", header: L.period, enableSorting: false,
      accessorFn: (r) => r.data.payPeriod,
      cell: ({ getValue, row }) => <span style={{ ...INTER, fontSize: 14, fontWeight: row.getIsExpanded() ? 600 : 400, color: "#525866" }}>{getValue() as string}</span>,
    },
    {
      id: "status", header: L.status,
      accessorFn: (r) => r.data.status,
      cell: ({ getValue }) => <StatusBadge status={getValue() as PayStatus} />,
    },
    {
      id: "processed", header: L.processed,
      accessorFn: (r) => r.data.processedDate,
      cell: ({ getValue, row }) => <span style={{ ...INTER, fontSize: 14, fontWeight: row.getIsExpanded() ? 600 : 400, color: "#525866" }}>{getValue() as string}</span>,
    },
    {
      id: "actions", header: "", enableSorting: false, size: 44,
      cell: ({ row }) => (
        <button
          onClick={() => onRowAction?.(row.original.kind, row.id)}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
          aria-label="Actions"
        >
          <MoreVertical size={15} style={{ color: "#99a0ae" }} />
        </button>
      ),
    },
  ], [selected, allRows, formatValue, avatarUrl, onRowAction, L.amount, L.employees, L.group, L.period, L.processed, L.status]);

  const table = useReactTable({
    data: rows, columns,
    state: { sorting, expanded },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (r) => r.subRows as TRow[],
    enableSorting: true,
  });

  return (
    <div className="w-full overflow-x-auto" style={INTER}>
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid #eaecf0", background: "#fff" }}>
            {table.getFlatHeaders().map((h) => {
              const canSort = h.column.getCanSort();
              const sep = h.column.id !== "actions";
              return (
                <th
                  key={h.id}
                  onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                  className={`px-4 py-3.5 select-none ${canSort ? "cursor-pointer" : ""}`}
                  style={{ ...INTER, borderRight: sep ? "1px solid #f2f4f7" : undefined }}
                >
                  <span className="inline-flex items-center text-[12px] font-medium uppercase tracking-[0.03em]" style={{ color: "#98a2b3" }}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {canSort && <SortIcon s={h.column.getIsSorted()} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-14 text-center text-[13px]" style={{ ...INTER, color: "#99a0ae" }}>No records found.</td></tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition-colors" style={{ borderBottom: "1px solid #f2f4f7", background: LEVEL_BG[row.depth] ?? "#f4f5f7" }}>
                {row.getVisibleCells().map((cell) => {
                  const isGroup = cell.column.id === "group";
                  const sep = cell.column.id !== "actions";
                  return (
                    <td key={cell.id} className={`px-4 py-4 align-middle ${isGroup ? "relative" : ""}`} style={{ ...INTER, borderRight: sep ? "1px solid #f2f4f7" : undefined }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Pagination ── left: page count · center: pager · right: go-to ── */}
      {paginate && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-4 px-4 py-3" style={{ ...INTER, borderTop: "1px solid #f2f4f7" }}>
          {/* Left — page count */}
          <span className="text-[13px] whitespace-nowrap" style={{ color: "#525866" }}>
            Page {safePage + 1} of {pageCount}
          </span>

          {/* Center — first / prev / numbers / next / last */}
          <nav className="flex items-center gap-1" aria-label="pagination">
            <ChevBtn disabled={safePage === 0} onClick={() => goToPage(0)} aria-label="First page">
              <ChevronsLeft size={15} />
            </ChevBtn>
            <ChevBtn disabled={safePage === 0} onClick={() => goToPage(safePage - 1)} aria-label="Previous page">
              <ChevronLeft size={15} />
            </ChevBtn>
            {pageList(safePage, pageCount).map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-[13px]" style={{ color: "#cacfd8" }}>…</span>
              ) : (
                <NumBtn key={p} active={p === safePage} onClick={() => goToPage(p)} aria-current={p === safePage ? "page" : undefined}>
                  {p + 1}
                </NumBtn>
              ),
            )}
            <ChevBtn disabled={safePage >= pageCount - 1} onClick={() => goToPage(safePage + 1)} aria-label="Next page">
              <ChevronRight size={15} />
            </ChevBtn>
            <ChevBtn disabled={safePage >= pageCount - 1} onClick={() => goToPage(pageCount - 1)} aria-label="Last page">
              <ChevronsRight size={15} />
            </ChevBtn>
          </nav>

          {/* Right — go to page */}
          <form
            className="flex items-center gap-2 whitespace-nowrap"
            onSubmit={(e) => {
              e.preventDefault();
              const n = parseInt(gotoVal, 10);
              if (!Number.isNaN(n)) goToPage(n - 1);
              setGotoVal("");
            }}
          >
            <span className="text-[13px]" style={{ color: "#525866" }}>Go to page</span>
            <input
              type="number"
              min={1}
              max={pageCount}
              value={gotoVal}
              onChange={(e) => setGotoVal(e.target.value)}
              placeholder="00"
              aria-label="Go to page number"
              className="h-8 w-12 rounded-[8px] text-center text-[13px] outline-none focus:ring-2 focus:ring-[#335cff]/20"
              style={{ ...INTER, border: "1px solid #e1e4ea", color: "#0e121b" }}
            />
            <button
              type="submit"
              aria-label="Go"
              className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-[#f8f8f8]"
              style={{ border: "1px solid #e1e4ea", color: "#525866" }}
            >
              <ChevronRight size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── Plain chevron nav button (borderless) ── */
function ChevBtn({ children, onClick, disabled, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-[#f8f8f8] disabled:opacity-40 disabled:pointer-events-none"
      style={{ color: "#525866" }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── Numbered page button (bordered box; active = blue) ── */
function NumBtn({ children, onClick, active, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 min-w-8 items-center justify-center rounded-[8px] px-2 text-[13px] font-medium transition-colors"
      style={{
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        letterSpacing: "-0.2px",
        border: active ? "1px solid #335cff" : "1px solid #e1e4ea",
        background: active ? "#335cff" : "#fff",
        color: active ? "#fff" : "#0e121b",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#f8f8f8"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#fff"; }}
      {...rest}
    >
      {children}
    </button>
  );
}
