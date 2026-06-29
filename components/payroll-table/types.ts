/* ─────────────────────────────────────────────────────────
   Nested payroll table — 4-level hierarchy
   Country (Group) → Branch → Team → Employee
   These types are self-contained so the component is portable.
───────────────────────────────────────────────────────── */

export type PayStatus = "Received" | "Processed" | "Pending" | "Failed";

export interface Employee {
  id: string;
  name: string;
  amount: number;
  payPeriod: string;
  status: PayStatus;
  processedDate: string;
  avatarId: number;        // used to pick a portrait
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
