import type { Priority } from "../lib/types";

const STYLES: Record<string, string> = {
  P0: "text-fire2 border-fire2/50 bg-fire2/10",
  P1: "text-gold border-gold/40 bg-gold/10",
  P2: "text-cyan border-cyan/30 bg-cyan/10",
  ALT: "text-muted border-muted/40 bg-transparent border-dashed",
};

const LABELS: Record<string, string> = {
  P0: "Comece por aqui",
  P1: "Próximo upgrade",
  P2: "Ajuste final",
  ALT: "Alternativa",
};

export function PriorityBadge({ priority }: { priority: Priority; compact?: boolean }) {
  if (!priority) return null;
  return (
    <span
      title={`${priority} — ${LABELS[priority]}`}
      aria-label={`${priority}: ${LABELS[priority]}`}
      className={`shrink-0 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold tracking-wide ${STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
