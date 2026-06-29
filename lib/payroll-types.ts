/* ─────────────────────────────────────────────────────────
   Enterprise Payroll — 4-level hierarchy
   Country (Group) → Branch → Team → Employee
───────────────────────────────────────────────────────── */

export type PayStatus = "Received" | "Pending" | "Failed" | "Processed";
export type RowKind = "country" | "branch" | "team" | "employee";

export interface Employee {
  id: string;
  name: string;
  amount: number;          // net salary
  payPeriod: string;       // e.g. "Nov 1 - Dec 15"
  status: PayStatus;
  processedDate: string;   // e.g. "Jan 15"
  avatarId: number;        // 1-70 for pravatar
}

export interface Team {
  id: string;
  name: string;
  amount: number;
  employeeCount: number;
  payPeriod: string;
  status: PayStatus;
  processedDate: string;
  employees: Employee[];
}

export interface Branch {
  id: string;
  name: string;
  amount: number;
  employeeCount: number;
  payPeriod: string;
  status: PayStatus;
  processedDate: string;
  teams: Team[];
}

export interface Country {
  id: string;
  name: string;
  amount: number;
  employeeCount: number;
  payPeriod: string;
  status: PayStatus;
  processedDate: string;
  branches: Branch[];
}

export interface SummaryMetrics {
  totalPayroll: number;
  totalTax: number;
  totalDeductions: number;
  netPayroll: number;
}
