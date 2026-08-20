import type { Section } from "../lib/types";
import { getItem as getCatalogItem } from "../lib/data";
import { useOwnership } from "../hooks/useOwnership";
import { PriorityBadge } from "./PriorityBadge";

export function WeaponShowcase({ section }: { section: Section }) {
  const { isOwned, setOwned } = useOwnership();
  const weapons = section.items ?? [];

  return (
    <section className="overflow-hidden rounded-xl border border-white/15 bg-panel/75 shadow-[0_12px_30px_#0003] backdrop-blur-md">
      <header className="flex items-center justify-between border-b border-line bg-panel-2/70 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Arsenal principal</p>
          <h3 className="text-[17px] font-semibold tracking-wide">{section.label}</h3>
        </div>
        <span className="font-mono text-[11px] text-muted">{weapons.length} {weapons.length === 1 ? "arma" : "armas"}</span>
      </header>

      <div className="grid gap-3 p-3">
        {weapons.map((weapon) => {
          const catalogItem = getCatalogItem(weapon.id);
          const owned = isOwned(weapon.id);
          return (
            <article key={weapon.id} className={`grid overflow-hidden rounded-xl border transition-colors lg:grid-cols-[minmax(420px,0.95fr)_minmax(300px,1.05fr)] ${owned ? "border-green/55 bg-green/[0.07]" : weapon.priority === "P0" ? "border-fire/50 bg-[#211b15]/70" : "border-line bg-[#07111ad9]"}`}>
              <div className="relative grid min-h-[190px] place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#17384a_0,#07111a_68%)] p-5 sm:min-h-[230px] sm:p-7 lg:min-h-[260px]">
                <div className="absolute inset-0 opacity-30 [background:linear-gradient(#ffffff08_1px,transparent_1px),linear-gradient(90deg,#ffffff08_1px,transparent_1px)] [background-size:28px_28px]" />
                {catalogItem?.imagePath ? (
                  <img src={catalogItem.imagePath} alt={`${weapon.name} — arma da build`} loading="lazy" width="1024" height="304" className="relative z-10 h-auto max-h-[210px] w-full object-contain drop-shadow-[0_18px_22px_#000c] transition-transform duration-300 hover:scale-[1.02]" />
                ) : (
                  <p className="relative z-10 text-sm text-muted">Imagem oficial indisponível</p>
                )}
              </div>

              <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">Arma da configuração</p>
                    <h4 className="mt-1 break-words text-2xl font-semibold leading-tight sm:text-3xl">{weapon.name}</h4>
                  </div>
                  <PriorityBadge priority={weapon.priority} />
                </div>
                {weapon.note && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{weapon.note}</p>}
                {weapon.targetRoll && <div className="mt-4 flex flex-wrap gap-1.5">{weapon.targetRoll.split("·").map((roll) => <span key={roll} className="rounded-full border border-cyan/25 bg-cyan/[0.06] px-2.5 py-1.5 font-mono text-[11px] text-cyan">{roll.trim()}</span>)}</div>}
                <button onClick={() => setOwned(weapon.id, !owned)} aria-pressed={owned} className={`mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-semibold transition-colors sm:w-fit ${owned ? "border-green bg-green/15 text-green" : "border-cyan/40 bg-cyan/[0.07] text-cyan hover:bg-cyan hover:text-[#031016]"}`}>
                  <span aria-hidden="true">{owned ? "✓" : "+"}</span>{owned ? "Arma no inventário" : "Marcar como possuída"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
