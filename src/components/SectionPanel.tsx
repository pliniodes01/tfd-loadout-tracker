import { useState } from "react";
import type { BuildItem, Section } from "../lib/types";
import { useOwnership } from "../hooks/useOwnership";
import { splitByOwnership } from "../lib/priority";
import { ItemRow } from "./ItemRow";

const MODULE_RAIL_SECTIONS = new Set(["descendantModules", "weaponModules"]);
// 220px garante ícone (96px) + nome + nota legíveis sem cortar; auto-fill ajusta o
// número de colunas ao espaço real em vez de degraus fixos por breakpoint.
const CARD_GRID = "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2";

function OwnedCollapse({ items, card = false }: { items: BuildItem[]; card?: boolean }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="min-h-11 font-mono text-[12px] tracking-wide text-green hover:text-green/80"
      >
        {open ? "▾" : "▸"} {items.length} item{items.length > 1 ? "s" : ""} que você já tem
      </button>
      {open && (
        <div className={card ? `mt-2 ${CARD_GRID} opacity-70` : "mt-2 grid gap-1.5 opacity-70"}>
          {items.map((item) => (
            <ItemRow key={item.id} item={item} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemList({ items, showModuleRail, card = false }: { items: BuildItem[]; showModuleRail: boolean; card?: boolean }) {
  const { isOwned } = useOwnership();
  if (card) {
    return (
      <div className={CARD_GRID}>
        {items.map((item) => (
          <ItemRow key={item.id} item={item} showModuleRail={showModuleRail} card />
        ))}
      </div>
    );
  }
  const { missing, owned } = splitByOwnership(items, isOwned);
  return (
    <>
      {missing.length > 0 ? (
        <div className={card ? CARD_GRID : "grid gap-1.5"}>
          {missing.map((item) => (
            <ItemRow key={item.id} item={item} showModuleRail={showModuleRail} card={card} />
          ))}
        </div>
      ) : (
        owned.length > 0 && <p className="text-[11.5px] text-green">Tudo aqui já está com você.</p>
      )}
      <OwnedCollapse items={owned} card={card} />
    </>
  );
}

export function SectionPanel({ section }: { section: Section }) {
  const showModuleRail = MODULE_RAIL_SECTIONS.has(section.type);
  const cardLayout = showModuleRail;

  return (
    <section className="overflow-hidden rounded-xl border border-white/15 bg-panel/70 shadow-[0_12px_30px_#0003] backdrop-blur-md">
      <header className="flex items-center justify-between border-b border-line bg-panel-2/70 px-3.5 py-2.5">
        <h3 className="text-[16px] font-semibold tracking-wide">{section.label}</h3>
        <span className="font-mono text-[11px] text-muted">{(section.items ?? section.groups?.flatMap((group) => group.items) ?? []).length} itens</span>
      </header>
      <div className="p-2">
        {section.sourceNote && (
          <div className={`mb-2 rounded-lg border px-3 py-2 text-[13px] ${section.sourceStatus === "notProvided" ? "border-gold/35 bg-gold/10 text-gold" : "border-cyan/20 bg-cyan/5 text-muted"}`}>
            <strong className="mr-1 text-ink">{section.sourceStatus === "notProvided" ? "Não informado:" : "Fonte confirmada:"}</strong>
            {section.sourceNote}
          </div>
        )}
        {section.groups ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {section.groups.map((group) => (
              <div key={group.slot}>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">
                  {group.setName} · {group.slot}
                </p>
                <ItemList items={group.items} showModuleRail={false} />
              </div>
            ))}
          </div>
        ) : (
          <ItemList items={section.items ?? []} showModuleRail={showModuleRail} card={cardLayout} />
        )}
      </div>
    </section>
  );
}
