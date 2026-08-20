import type { BuildItem } from "../lib/types";
import { useOwnership } from "../hooks/useOwnership";
import { PriorityBadge } from "./PriorityBadge";
import { getItem as getCatalogItem } from "../lib/data";

export function ItemRow({ item, showModuleRail = false, card = false }: { item: BuildItem; showModuleRail?: boolean; card?: boolean }) {
  const { isOwned, getItem, setOwned, setMaxed, setSocketTypeMatches } = useOwnership();
  const owned = isOwned(item.id);
  const ownership = getItem(item.id);
  const catalogItem = getCatalogItem(item.id);

  return (
    <div
      className={`group rounded-lg border transition-all duration-200 ${card ? "relative min-h-52 overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_12px_22px_#0007]" : ""} ${
        owned ? "border-green/60 bg-green/[0.09] shadow-[inset_0_2px_0_var(--color-green)]" : item.priority === "P0" ? "border-fire/55 bg-[#2a2117]/75 hover:border-fire/80" : "border-line bg-panel/75 hover:border-cyan/55 hover:bg-panel-2/90"
      }`}
    >
      <button
        onClick={() => setOwned(item.id, !owned)}
        aria-pressed={owned}
        className={card ? "flex h-full w-full flex-col items-stretch p-2.5 text-left" : "flex w-full items-center gap-2.5 p-2 text-left"}
      >
        {card && item.priority && <span className="absolute left-2 top-2 z-10"><PriorityBadge priority={item.priority} /></span>}
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-sm border text-[11px] font-bold transition-colors ${card ? "absolute right-2 top-2 z-10" : ""} ${
            owned ? "border-green bg-green text-[#03140e]" : "border-line/70 bg-panel text-transparent"
          }`}
        >
          ✓
        </span>
        {catalogItem?.imagePath ? (
          <span className={card ? "mx-auto mt-2 grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-line/70 bg-[radial-gradient(circle,#173044_0,#050d14_72%)] p-2 shadow-[0_8px_18px_#0008]" : "grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-line/80 bg-[#050d14] p-1.5"}>
            <img
              src={catalogItem.imagePath}
              alt=""
              loading="lazy"
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </span>
        ) : (
          <span className={card ? "mx-auto mt-2 grid h-24 w-24 shrink-0 place-items-center rounded-lg border border-dashed border-line/60 bg-panel-2 text-muted/35" : "grid h-16 w-16 shrink-0 place-items-center rounded-md border border-line/50 bg-panel-2 font-mono text-[12px] text-muted/50"}>
            {card ? <FallbackIcon /> : item.name.slice(0, 2).toUpperCase()}
          </span>
        )}
          <span className={card ? "mt-3 min-w-0 flex-1 px-1 text-center" : "min-w-0 flex-1"}>
          <span className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
            <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
              <strong className="break-words text-[14px] leading-tight">{item.name}</strong>
              {item.quantity > 1 && <span className="font-mono text-[11px] text-muted">×{item.quantity}</span>}
            </span>
            {!card && <PriorityBadge priority={item.priority} />}
          </span>
          {item.note && <span className={`mt-1 block break-words leading-snug text-muted ${card ? "text-[12px]" : "text-[13px]"}`}>{item.note}</span>}
          {item.targetRoll && (
            <span className={`mt-2 flex flex-wrap gap-1 ${card ? "justify-center" : ""}`}>
              {item.targetRoll.split("·").map((roll) => (
                <span key={roll} className="rounded-full border border-cyan/25 bg-cyan/[0.06] px-2 py-1 font-mono text-[10px] leading-tight text-cyan">
                  {roll.trim()}
                </span>
              ))}
            </span>
          )}
        </span>
      </button>

      {showModuleRail && (
        <div className={`flex items-center gap-3 border-t border-line/50 px-3 py-1.5 ${card ? "justify-center" : "pl-[5.7rem]"} ${owned ? "" : "pointer-events-none opacity-25"}`}>
          <RailStep
            label="MAX"
            active={ownership.maxed}
            onClick={() => setMaxed(item.id, !ownership.maxed)}
          />
          <RailStep
            label="SOCKET CERTO"
            active={ownership.socketTypeMatches}
            onClick={() => setSocketTypeMatches(item.id, !ownership.socketTypeMatches)}
          />
        </div>
      )}
    </div>
  );
}

function RailStep({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 font-mono text-[10px] tracking-wide ${active ? "text-fire" : "text-muted"}`}
    >
      <span
        className={`block h-2 w-2 rounded-full border ${active ? "border-fire bg-fire shadow-[0_0_6px_var(--color-fire)]" : "border-line bg-panel"}`}
      />
      {label}
    </button>
  );
}

function FallbackIcon() {
  return <svg viewBox="0 0 48 48" aria-hidden="true" className="h-9 w-9" fill="none"><path d="M24 5 43 24 24 43 5 24 24 5Z" stroke="currentColor" strokeWidth="2"/><path d="m17 24 5 5 10-11" stroke="currentColor" strokeWidth="2"/></svg>;
}
