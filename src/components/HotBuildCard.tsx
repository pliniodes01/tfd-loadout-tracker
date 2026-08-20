import type { HotBuildEntry } from "../lib/community";
import { getBuild } from "../lib/data";
import { getDescendantImage } from "../lib/descendantImages";
import { getBuildElement } from "../lib/buildElements";
import { ACTIVITY_LABELS } from "../lib/buildActivities";
import { CommunityStatusBadge } from "./CommunityStatusBadge";
import { ConfidenceIndicator } from "./ConfidenceIndicator";

/**
 * Card grande de build em alta — não é um card normal com badge colado. O motivo
 * editorial (hotReason) e a maturidade (status + confiança) ficam sempre visíveis,
 * nunca só num tooltip.
 */
export function HotBuildCard({ entry, onOpenBuild }: { entry: HotBuildEntry; onOpenBuild: (buildId: string) => void }) {
  const build = entry.buildId ? getBuild(entry.buildId) : undefined;
  const portrait = getDescendantImage(entry.descendant);
  const element = entry.buildId ? getBuildElement(entry.buildId) : null;

  const content = (
    <>
      <div className="relative h-44 overflow-hidden sm:h-52">
        {portrait ? (
          <img src={portrait} alt={entry.descendant} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_10%]" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-panel-2 text-[12px] text-muted">Retrato indisponível</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05090e] via-[#05090e33] to-transparent" />
        {element && (
          <div className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border px-2 py-1 backdrop-blur-md ${element.tone}`}>
            <img src={element.icon} alt="" className="h-4 w-4" />
            <span className="text-[11px] font-semibold">{element.label}</span>
          </div>
        )}
        <div className="absolute right-3 top-3">
          <CommunityStatusBadge status={entry.communityStatus} />
        </div>
      </div>

      <div className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">{entry.descendant}</p>
        <h3 className="mt-0.5 break-words text-[18px] font-semibold leading-snug">{build?.title ?? `${entry.descendant} — cobertura pendente`}</h3>

        {entry.activities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.activities.map((a) => (
              <span key={a} className="rounded border border-white/10 bg-black/30 px-2 py-0.5 text-[11px] text-cyan">
                {ACTIVITY_LABELS[a]}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 text-[13px] leading-relaxed text-muted">{entry.hotReason}</p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <ConfidenceIndicator confidence={entry.confidence} />
          <span className="text-[11px] text-muted">verificado {entry.lastVerifiedAt}</span>
        </div>

        {entry.patchCaveat && (
          <p className="mt-2 rounded-md border border-gold/30 bg-gold/[0.06] px-2.5 py-2 text-[12px] leading-snug text-gold">{entry.patchCaveat}</p>
        )}
      </div>
    </>
  );

  if (!entry.buildId) {
    return <article className="overflow-hidden rounded-2xl border border-white/10 bg-panel text-left">{content}</article>;
  }

  return (
    <button
      onClick={() => onOpenBuild(entry.buildId!)}
      className="overflow-hidden rounded-2xl border border-white/10 bg-panel text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan/60 hover:shadow-[0_18px_42px_#000a]"
    >
      {content}
    </button>
  );
}
