# PayrollTable

A self-contained, 4-level nested tree table (Country → Branch → Team → Employee)
with expand/collapse, Reddit-style connector lines, sorting, search filtering,
row selection, status pills, and employee avatars.

Built with **React + Tailwind CSS + TanStack Table v8 + lucide-react**. No
design-system dependency (the checkbox is inlined).

## Install peer dependencies

```bash
npm install @tanstack/react-table lucide-react
```

You also need React 18+ and Tailwind CSS already set up in the host project.

## Usage

```tsx
import { PayrollTable, type Country } from "@/components/payroll-table";

const data: Country[] = [/* ... */];

export default function Page() {
  const [search, setSearch] = useState("");
  return (
    <PayrollTable
      countries={data}
      search={search}
      formatValue={(n) => `₦${n.toLocaleString()}`}   // optional
      onRowAction={(kind, id) => console.log(kind, id)} // optional
    />
  );
}
```

## Props

| Prop          | Type                                   | Default            | Description                                  |
| ------------- | -------------------------------------- | ------------------ | -------------------------------------------- |
| `countries`   | `Country[]`                            | —                  | Hierarchical data.                           |
| `search`      | `string`                               | `""`               | Filters by name across all levels.           |
| `formatValue` | `(n: number) => string`                | USD, no decimals   | Formats the Amount column.                   |
| `avatarUrl`   | `(id: number) => string`               | Unsplash portraits | Resolves an employee avatar URL.             |
| `labels`      | `Partial<Record<colId, string>>`       | English defaults   | Override column header text.                 |
| `onRowAction` | `(kind, id) => void`                   | —                  | Fires when a row's `⋯` action is clicked.    |

## Data shape

See [`types.ts`](./types.ts). Each level carries `amount`, `payPeriod`,
`status`, `processedDate`; parents also carry `employeeCount` and their children
array (`branches` / `teams` / `employees`). Employees carry an `avatarId`.

## Files

```
payroll-table/
├── payroll-table.tsx   # the component
├── status-badge.tsx    # status pill
├── checkbox.tsx        # inlined checkbox (no external dep)
├── types.ts            # data types
├── index.ts            # barrel export
└── README.md
```

To reuse elsewhere, copy this whole folder, install the peer deps, and import
from the folder's `index.ts`.
