import { useMemo, useState } from "react";
import { getAllBuilds } from "../lib/data";
import { descendantImages } from "../lib/descendantImages";
import { ACTIVITY_LABELS, type Activity } from "../lib/buildActivities";
import { getAllHotEntries, getHotBuildsSeason } from "../lib/community";
import { getCoverageCell, COVERAGE_STATE_LABEL, type CoverageCellState } from "../lib/coverage";

const ACTIVITIES = Object.keys(ACTIVITY_LABELS).filter((a) => a !== "all") as Activity[];

const STATE_ICON: Record<CoverageCellState, string> = {
  "verified-season": "✓",
  "under-review": "!",
  tracked: "✓",
  none: "—",
};

const STATE_CLASS: Record<CoverageCellState, string> = {
  "verified-season": "border-green/50 bg-green/10 text-green",
  "under-review": "border-gold/50 bg-gold/10 text-gold",
  tracked: "border-cyan/40 bg-cyan/[0.08] text-cyan",
  none: "border-line/60 text-muted/40",
};

/**
 * Personagem × atividade. Tabela compacta (não card por combinação) com busca. Cada
 * célula com build é clicável e abre a build correspondente — mais de uma build na
 * mesma célula vira mais de um botão, não escondido atrás de hover.
 */
export function CoverageMatrix({ onOpenBuild }: { onOpenBuild: (buildId: string) => void }) {
  const [query, setQuery] = useState("");
  const builds = getAllBuilds();
  const hotEntries = getAllHotEntries();
  const season = getHotBuildsSeason();

  const roster = useMemo(() => {
    const names = new Set(Object.keys(descendantImages));
    for (const entry of hotEntries) names.add(entry.descendant);
    return [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [hotEntries]);

  const visibleRoster = roster.filter((name) => name.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")));

  return (
    <div>
      <label className="mb-3 block max-w-sm">
        <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">Buscar personagem</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: Bunny, Raven…"
          className="w-full rounded-md border border-line bg-[#050d14] px-3.5 py-2.5 text-[14px] outline-none transition-colors placeholder:text-muted/50 focus:border-cyan"
        />
      </label>

      <p className="mb-3 max-w-3xl text-[14px] leading-relaxed text-muted">
        Esta matriz mostra <strong className="text-ink">builds disponíveis no tracker</strong>, não builds comunitárias
        verificadas para a Season 4 — a maioria ainda carrega conteúdo de temporadas anteriores. Um <span className="text-green">✓</span> verde
        só aparece quando a própria build já está marcada com o patch da season atual.
      </p>

      <div className="mb-4 flex flex-wrap gap-2 text-[12px]">
        <span className="rounded-md border border-green/35 bg-green/10 px-3 py-2 text-green">✓ Atualizada para a temporada</span>
        <span className="rounded-md border border-gold/35 bg-gold/10 px-3 py-2 text-gold">! Precisa ser revisada</span>
        <span className="rounded-md border border-cyan/30 bg-cyan/[0.08] px-3 py-2 text-cyan">✓ Disponível, temporada anterior</span>
        <span className="rounded-md border border-line px-3 py-2 text-muted">— Ainda não temos build</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[760px] border-collapse text-[14px]">
          <thead>
            <tr className="bg-panel-2/80">
              <th scope="col" className="sticky left-0 z-10 bg-panel-2 px-4 py-4 text-left text-[15px] font-semibold text-ink">
                Personagem
              </th>
              {ACTIVITIES.map((a) => (
                <th key={a} scope="col" className="px-3 py-4 text-center font-mono text-[12px] font-semibold uppercase tracking-wide text-muted">
                  {ACTIVITY_LABELS[a]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRoster.map((descendant) => (
              <tr key={descendant} className="border-t border-line/70 odd:bg-panel/40">
                <th scope="row" className="sticky left-0 z-10 bg-panel px-4 py-3.5 text-left font-medium text-ink odd:bg-[#0f1e28]">
                  {descendant}
                </th>
                {ACTIVITIES.map((activity) => {
                  const cell = getCoverageCell(descendant, activity, builds, hotEntries, season);
                  return (
                    <td key={activity} className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        {cell.matches.length === 0 ? (
                          <span
                            aria-label={`${descendant}: ${COVERAGE_STATE_LABEL.none} para ${ACTIVITY_LABELS[activity]}`}
                            className="inline-block text-muted/40"
                          >
                            —
                          </span>
                        ) : (
                          cell.matches.map((m) => (
                            <button
                              key={m.buildId}
                              onClick={() => onOpenBuild(m.buildId)}
                              title={`${m.title} — ${COVERAGE_STATE_LABEL[m.state]}`}
                              aria-label={`Abrir ${m.title} (${COVERAGE_STATE_LABEL[m.state]})`}
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border text-[16px] font-bold transition-all hover:scale-105 hover:brightness-125 ${STATE_CLASS[m.state]}`}
                            >
                              {STATE_ICON[m.state]}
                            </button>
                          ))
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
