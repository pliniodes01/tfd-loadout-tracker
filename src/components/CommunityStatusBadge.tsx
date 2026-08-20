import { STATUS_LABEL, STATUS_DESCRIPTION, type CommunityStatus } from "../lib/community";

const STYLES: Record<CommunityStatus, string> = {
  "new-evolving": "border-purple/50 bg-purple/10 text-purple",
  rising: "border-gold/50 bg-gold/10 text-gold",
  established: "border-green/50 bg-green/10 text-green",
  "under-review": "border-fire2/50 bg-fire2/10 text-fire2",
};

const DOT: Record<CommunityStatus, string> = {
  "new-evolving": "bg-purple",
  rising: "bg-gold",
  established: "bg-green",
  "under-review": "bg-fire2",
};

/**
 * Nunca usar só como tooltip — o texto do status e a explicação de 1 frase ficam
 * sempre visíveis, não escondidos atrás de hover/foco.
 */
export function CommunityStatusBadge({ status, showDescription = false }: { status: CommunityStatus; showDescription?: boolean }) {
  return (
    <div className="inline-flex flex-col gap-1">
      <span className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide ${STYLES[status]}`}>
        <span aria-hidden="true" className={`block h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
        {STATUS_LABEL[status]}
      </span>
      {showDescription && <p className="max-w-xs text-[12px] leading-snug text-muted">{STATUS_DESCRIPTION[status]}</p>}
    </div>
  );
}
