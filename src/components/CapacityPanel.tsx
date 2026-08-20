import type { Build } from "../lib/types";
import { useOwnership } from "../hooks/useOwnership";
import { calculateBuildCapacity, catalystSuggestionsFor } from "../lib/buildCapacity";
import { capacityRules, capacityTable, CAPACITY_RULES_VERIFIED } from "../lib/gameData";
import { getItem } from "../lib/data";

function VerdictRow({
  label,
  target,
  targetName,
  required,
  available,
  fits,
  deficit,
  pendingItemIds,
  onSuggest,
}: {
  label: string;
  target: "descendant" | "weapon";
  targetName: string;
  required: number;
  available: number;
  fits: boolean;
  deficit: number;
  pendingItemIds: string[];
  onSuggest: () => { itemId: string; savings: number }[];
}) {
  const { state, setLevel, setActivator } = useOwnership();
  const level = state.levels[targetName] ?? 40;
  const activator = state.activators[targetName] ?? false;
  const suggestions = fits ? [] : onSuggest();

  return (
    <article className={`rounded-xl border p-4 shadow-lg backdrop-blur-sm ${fits ? "border-green/25 bg-green/[0.05]" : "border-fire/35 bg-panel/80"}`}>
      <div className="flex items-center justify-between gap-2">
        <div><p className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</p><h3 className="text-[16px] font-semibold">{targetName}</h3></div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${fits ? "border-green/35 bg-green/10 text-green" : "border-fire/45 bg-fire/10 text-fire"}`}>{fits ? "Pronto" : "Precisa de ajuste"}</span>
      </div>

      <p className={`mt-3 text-[14px] leading-snug ${fits ? "text-green" : "text-ink"}`}>{fits ? `A configuração usa ${required} de ${available} pontos e cabe como está.` : `A configuração ultrapassa o limite em ${deficit} pontos.`}</p>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full ${fits ? "bg-green" : "bg-fire2"}`}
          style={{ width: `${Math.min(100, (required / Math.max(available, 1)) * 100)}%` }}
        />
      </div>

      {!fits && suggestions.length > 0 && (
        <div className="mt-4 rounded-lg border border-gold/25 bg-gold/[0.05] p-3">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gold">Próximo passo recomendado</p>
          <ol className="grid gap-2 text-[13px]">
            {suggestions.map((s, i) => {
              const catalogItem = getItem(s.itemId);
              return (
                <li key={s.itemId} className="flex items-center justify-between gap-2">
                  <span><b className="mr-2 text-gold">{i + 1}</b>{catalogItem?.name ?? s.itemId}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted">economiza {s.savings}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <details className="mt-3 border-t border-white/10 pt-3">
        <summary className="cursor-pointer text-[12px] font-semibold text-muted transition-colors hover:text-cyan">Ver cálculo e configurações</summary>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-muted">
          <span><b className="text-ink">{required}</b> usados de <b className="text-ink">{available}</b></span>
          <label className="flex items-center gap-1.5">Nível<input type="number" min={1} max={40} value={level} onChange={(e) => setLevel(targetName, Number(e.target.value) || 1)} className="w-14 rounded border border-line bg-panel px-2 py-1 text-ink" /></label>
          <button onClick={() => setActivator(targetName, !activator)} className={`rounded border px-2.5 py-1.5 ${activator ? "border-fire bg-fire/15 text-fire" : "border-line text-muted"}`}>Energy Activator: {activator ? "usado" : "não usado"}</button>
        </div>
        {pendingItemIds.length > 0 && <p className="mt-2 text-[11px] text-purple">Estimativa parcial: {pendingItemIds.length} módulo(s) ainda não possuem custo cadastrado.</p>}
      </details>
    </article>
  );
}

export function CapacityPanel({ build }: { build: Build }) {
  const { state } = useOwnership();
  const summary = calculateBuildCapacity(build, state, capacityRules, capacityTable);

  if (!summary.descendant && !summary.weapon) return null;

  return (
    <section aria-labelledby="capacity-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Planejamento</p><h2 id="capacity-title" className="text-lg font-semibold">A build cabe?</h2></div>{!CAPACITY_RULES_VERIFIED && <span className="rounded-full border border-purple/30 bg-purple/10 px-3 py-1 text-[11px] text-purple">Valores estimados</span>}</div>
      {!CAPACITY_RULES_VERIFIED && (
        <p className="mb-3 text-[12px] text-muted">Use esta seção como orientação de montagem; os parâmetros ainda aguardam conferência dentro do jogo.</p>
      )}
      <div className="grid items-start gap-3 lg:grid-cols-2">
        {summary.descendant && (
          <VerdictRow
            label="Descendant"
            {...summary.descendant}
            onSuggest={() => catalystSuggestionsFor(build, state, capacityRules, capacityTable, "descendant", summary.descendant!.deficit)}
          />
        )}
        {summary.weapon && (
          <VerdictRow
            label="Arma"
            {...summary.weapon}
            onSuggest={() => catalystSuggestionsFor(build, state, capacityRules, capacityTable, "weapon", summary.weapon!.deficit)}
          />
        )}
      </div>
    </section>
  );
}
