import { ACTIVITY_LABELS, type Activity } from "../lib/buildActivities";

export function ActivityFilter({
  value,
  onChange,
  label = "Filtrar por atividade",
}: {
  value: Activity;
  onChange: (next: Activity) => void;
  label?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/15 bg-panel/70 backdrop-blur-md">
      <nav aria-label={label} className="flex gap-2 overflow-x-auto p-2">
        {(Object.entries(ACTIVITY_LABELS) as [Activity, string][]).map(([option, optionLabel]) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`flex min-h-11 shrink-0 items-center rounded-lg px-4 text-[13px] font-semibold transition-colors ${
              value === option ? "bg-cyan text-[#041117] shadow-[0_0_18px_#55d9e833]" : "text-muted hover:bg-white/5 hover:text-ink"
            }`}
          >
            {optionLabel}
          </button>
        ))}
      </nav>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-panel/90 to-transparent sm:hidden" />
    </div>
  );
}
