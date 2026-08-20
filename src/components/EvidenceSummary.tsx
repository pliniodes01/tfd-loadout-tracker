import type { CommunityEvidence } from "../lib/community";

const TYPE_LABEL: Record<CommunityEvidence["type"], string> = {
  "community-build": "Build comunitária",
  official: "Fonte oficial",
  press: "Imprensa/guia",
  discussion: "Discussão",
};

export function EvidenceSummary({ evidence }: { evidence: CommunityEvidence[] }) {
  return (
    <ul className="grid gap-2">
      {evidence.map((item) => (
        <li key={item.url} className="rounded-lg border border-line bg-panel/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan">{TYPE_LABEL[item.type]}</span>
            <span className="text-[11px] text-muted">
              {item.author ? `${item.author} · ` : ""}
              {item.source}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug text-ink">{item.note}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            {item.publishedAt && <span>publicado {item.publishedAt}</span>}
            <span>conferido {item.observedAt}</span>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">
              abrir fonte ↗
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
