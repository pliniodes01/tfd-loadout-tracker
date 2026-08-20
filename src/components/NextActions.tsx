import type { Build } from "../lib/types";
import { flattenSectionItems } from "../lib/types";
import { useOwnership } from "../hooks/useOwnership";
import { sortByPriority } from "../lib/priority";
import { PriorityBadge } from "./PriorityBadge";

export function NextActions({ build }: { build: Build }) {
  const { isOwned } = useOwnership();

  const allMissing = build.sections
    .flatMap((s) => flattenSectionItems(s).map((item) => ({ item, sectionLabel: s.label })))
    .filter(({ item }) => !isOwned(item.id));

  const top = sortByPriority(allMissing.map((x) => x.item)).slice(0, 5);
  const sectionByItemId = new Map(allMissing.map(({ item, sectionLabel }) => [item.id, sectionLabel]));

  return (
    <aside className="min-w-0 rounded-lg border border-white/10 bg-panel/75 backdrop-blur-sm">
      <header className="border-b border-line bg-panel-2/60 px-3.5 py-2.5">
        <h3 className="text-[16px] font-semibold tracking-wide text-fire">Rota de progressão</h3>
        <p className="text-[13px] text-muted">siga esta ordem para ativar a build mais cedo</p>
      </header>
      <div className="grid gap-2 p-3">
        {top.length === 0 ? (
          <p className="text-[12px] text-green">Nada faltando — build completa. 🎯</p>
        ) : (
          top.map((item, i) => (
            <div key={item.id} className={`flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors ${i === 0 ? "border-fire/60 bg-fire/[0.08] shadow-[inset_3px_0_0_var(--color-fire)]" : "border-line bg-panel hover:border-cyan/30"}`}>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold ${i === 0 ? "bg-fire text-[#170b02]" : "bg-white/5 text-muted"}`}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <strong className="min-w-[12rem] flex-1 break-words text-[14px] leading-snug">{item.name}</strong>
                  <span className="shrink-0"><PriorityBadge priority={item.priority} compact /></span>
                </div>
                <span className={`mt-1 block break-words text-[11px] leading-snug ${i === 0 ? "font-semibold text-fire" : "text-muted"}`}>{i === 0 ? "COMECE POR ESTE ITEM" : sectionByItemId.get(item.id)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
