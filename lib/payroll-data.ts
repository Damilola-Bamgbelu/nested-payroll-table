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

/* Roll a parent's status up from its children:
   • all Received                 → Received   (fully confirmed)
   • any Failed                   → Failed     (needs attention)
   • all Received/Processed       → Processed  (sent, awaiting confirmation)
   • otherwise (something Pending)→ Pending    (still in progress) */
function rollUpStatus(statuses: PayStatus[]): PayStatus {
  if (statuses.length === 0) return "Pending";
  if (statuses.every((s) => s === "Received")) return "Received";
  if (statuses.some((s) => s === "Failed")) return "Failed";
  if (statuses.every((s) => s === "Received" || s === "Processed")) return "Processed";
  return "Pending";
}

const MONTHS: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
function dateRank(d: string): number { const [m, day] = d.split(" "); return MONTHS[m] * 100 + parseInt(day, 10); }
/** Latest (most recent) date among children — the parent's processing date. */
function latestDate(dates: string[]): string {
  return dates.reduce((a, b) => (dateRank(b) > dateRank(a) ? b : a));
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
    status: rollUpStatus(employees.map((e) => e.status)),
    processedDate: latestDate(employees.map((e) => e.processedDate)),
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
    status: rollUpStatus(teams.map((t) => t.status)),
    processedDate: latestDate(teams.map((t) => t.processedDate)),
    teams,
  };
}

/* ── Scenario-driven generation ──
   Each country gets a target status, then its employees are shaped to be
   consistent with it. This keeps parent↔child status coherent while still
   giving a realistic spread across the table.                              */
const SCENARIOS: PayStatus[]  = ["Received", "Processed", "Pending", "Failed"];
const SCENARIO_WEIGHTS = [0.30, 0.35, 0.20, 0.15];
function pickScenario(): PayStatus {
  const r = rand();
  let c = 0;
  for (let i = 0; i < SCENARIO_WEIGHTS.length; i++) { c += SCENARIO_WEIGHTS[i]; if (r < c) return SCENARIOS[i]; }
  return "Received";
}

function allEmployees(c: Country): Employee[] {
  return c.branches.flatMap((b) => b.teams.flatMap((t) => t.employees));
}

/** Reshape leaf statuses so the country rolls up to `target`. */
function enforceScenario(c: Country, target: PayStatus) {
  const emps = allEmployees(c);
  if (emps.length === 0) return;
  if (target === "Received") {
    emps.forEach((e) => (e.status = "Received"));
  } else if (target === "Processed") {
    emps.forEach((e) => { if (e.status === "Failed" || e.status === "Pending") e.status = "Processed"; });
    if (!emps.some((e) => e.status === "Processed")) emps[0].status = "Processed";
  } else if (target === "Pending") {
    emps.forEach((e) => { if (e.status === "Failed") e.status = "Processed"; });
    if (!emps.some((e) => e.status === "Pending")) emps[Math.floor(rand() * emps.length)].status = "Pending";
  } else { /* Failed */
    if (!emps.some((e) => e.status === "Failed")) emps[Math.floor(rand() * emps.length)].status = "Failed";
  }
}

/** Recompute every parent's status + processedDate from the (final) leaves. */
function recompute(c: Country) {
  c.branches.forEach((b) => {
    b.teams.forEach((t) => {
      t.status = rollUpStatus(t.employees.map((e) => e.status));
      t.processedDate = latestDate(t.employees.map((e) => e.processedDate));
    });
    b.status = rollUpStatus(b.teams.map((t) => t.status));
    b.processedDate = latestDate(b.teams.map((t) => t.processedDate));
  });
  c.status = rollUpStatus(c.branches.map((b) => b.status));
  c.processedDate = latestDate(c.branches.map((b) => b.processedDate));
}

function makeCountry(name: string, branchDefs: { name: string; teams: number }[]): Country {
  const branches = branchDefs.map((b) => makeBranch(b.name, b.teams));
  const amount = branches.reduce((s, b) => s + b.amount, 0);
  const employeeCount = branches.reduce((s, b) => s + b.employeeCount, 0);
  const country: Country = {
    id: `CO-${name}`,
    name,
    amount,
    employeeCount,
    payPeriod: pick(PERIODS),
    status: "Pending",
    processedDate: PROCESSED_DATES[0],
    branches,
  };
  enforceScenario(country, pickScenario());
  recompute(country);
  return country;
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
