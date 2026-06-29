"use client";

import { Check } from "lucide-react";

/* Self-contained checkbox (no design-system dependency) */
export function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] transition-colors"
      style={{
        border: `1px solid ${checked ? "#335cff" : "#d0d5dd"}`,
        background: checked ? "#335cff" : "#fff",
      }}
    >
      {checked && <Check size={11} strokeWidth={3} color="#fff" />}
    </button>
  );
}
