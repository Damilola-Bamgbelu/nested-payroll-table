import type { Country, Team, Branch, Employee, PayStatus, SummaryMetrics } from "./payroll-types";

/* Deterministic pseudo-random so server & client render identically */
let _seed = 20260216;
function rand() {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
}
function pick<T>(arr: readonly T[]): T { return arr[Math.floor(rand() * arr.length)]; }

const STATUSES: PayStatus[] = ["Received", "Processed", "Pending", "Failed"];
const STATUS_WEIGHTS = [0.5, 0.25, 0.15, 0.1];
function weightedStatus(): PayStatus {
  const r = rand();
  let c = 0;
  for (let i = 0; i < STATUS_WEIGHTS.length; i++) {
    c += STATUS_WEIGHTS[i];
    if (r < c) return STATUSES[i];
  }
  return "Received";
}

const PERIODS = [
  "Jun 24 - Oct 28", "Jan 5 - Mar 20", "Nov 1 - Dec 15",
  "Apr 10 - Jun 18", "Jul 2 - Sep 30", "Jan 16 - Jan 31",
  "Feb 1 - Feb 15", "Mar 1 - Mar 31",
];
const PROCESSED_DATES = ["Mar 05", "Feb 15", "Jan 15", "Apr 02", "May 12", "Jun 08"];

const FIRST = ["Alex","Jordan","Taylor","Casey","Morgan","Riley","Jamie","Avery","Quinn","Drew","Skyler","Reese","Cameron","Devon","Harper","Emery"];
const LAST  = ["Morgan","Lee","Smith","Johnson","Brown","Davis","Wilson","Clarke","Bello","Okafor","Adeyemi","Nwosu","Obi","Eze","Bakare","Coker"];

let _emp = 1000;
function makeEmployee(): Employee {
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  return {
    id: `EMP-${++_emp}`,
    name,
    amount: Math.round((2200 + rand() * 9800)),
    payPeriod: pick(PERIODS),
    status: weightedStatus(),
    processedDate: pick(PROCESSED_DATES),
    avatarId: (_emp % 70) + 1,
  };
}

const TEAM_NAMES = ["Sales Team", "Product Team", "PR Team", "Finance Team", "Ops Team", "Design Team", "Eng Team", "HR Team"];
function makeTeam(name: string, empCount: number): Team {
  const employees = Array.from({ length: empCount }, makeEmployee);
  const amount = employees.reduce((s, e) => s + e.amount, 0);
  return {
    id: `TEAM-${name}-${_emp}`,
    name,
    amount,
    employeeCount: empCount,
    payPeriod: pick(PERIODS),
    status: weightedStatus(),
    processedDate: pick(PROCESSED_DATES),
    employees,
  };
}

function makeBranch(name: string, teamCount: number): Branch {
  const chosen = TEAM_NAMES.slice(0, teamCount);
  const teams = chosen.map((tn) => makeTeam(tn, 3 + Math.floor(rand() * 6)));
  const amount = teams.reduce((s, t) => s + t.amount, 0);
  const employeeCount = teams.reduce((s, t) => s + t.employeeCount, 0);
  return {
    id: `BR-${name}`,
    name,
    amount,
    employeeCount,
    payPeriod: pick(PERIODS),
    status: weightedStatus(),
    processedDate: pick(PROCESSED_DATES),
    teams,
  };
}

function makeCountry(name: string, branchDefs: { name: string; teams: number }[]): Country {
  const branches = branchDefs.map((b) => makeBranch(b.name, b.teams));
  const amount = branches.reduce((s, b) => s + b.amount, 0);
  const employeeCount = branches.reduce((s, b) => s + b.employeeCount, 0);
  return {
    id: `CO-${name}`,
    name,
    amount,
    employeeCount,
    payPeriod: pick(PERIODS),
    status: weightedStatus(),
    processedDate: pick(PROCESSED_DATES),
    branches,
  };
}

export const payrollData: Country[] = [
  makeCountry("Nigeria", [
    { name: "Lagos Branch", teams: 3 },
    { name: "Abuja Branch", teams: 2 },
    { name: "PH Branch",    teams: 3 },
  ]),
  makeCountry("Kenya", [
    { name: "Nairobi Branch",  teams: 2 },
    { name: "Mombasa Branch",  teams: 2 },
  ]),
  makeCountry("Ghana", [
    { name: "Accra Branch",   teams: 3 },
    { name: "Kumasi Branch",  teams: 2 },
  ]),
  makeCountry("South Africa", [
    { name: "Cape Town Branch",     teams: 2 },
    { name: "Johannesburg Branch",  teams: 3 },
  ]),
  makeCountry("Egypt", [
    { name: "Cairo Branch", teams: 2 },
  ]),
  makeCountry("Morocco", [
    { name: "Casablanca Branch", teams: 2 },
    { name: "Rabat Branch",      teams: 2 },
  ]),
  makeCountry("Tanzania", [
    { name: "Dar es Salaam Branch", teams: 3 },
  ]),
  makeCountry("Uganda", [
    { name: "Kampala Branch", teams: 2 },
  ]),
  makeCountry("Senegal", [
    { name: "Dakar Branch", teams: 2 },
  ]),
  makeCountry("Rwanda", [
    { name: "Kigali Branch", teams: 2 },
  ]),
];

/* ── Derived summary metrics ── */
const grossPayroll = payrollData.reduce((s, c) => s + c.amount, 0);
const totalEmployees = payrollData.reduce((s, c) => s + c.employeeCount, 0);

export const summaryMetrics: SummaryMetrics = {
  totalPayroll:    grossPayroll,
  totalTax:        Math.round(grossPayroll * 0.18),
  totalDeductions: Math.round(grossPayroll * 0.07),
  netPayroll:      Math.round(grossPayroll * 0.75),
};

export const totalEmployeeCount = totalEmployees;
