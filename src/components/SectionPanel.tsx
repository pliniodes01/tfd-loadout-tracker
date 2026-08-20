import { useState } from "react";
import type { BuildItem, Section } from "../lib/types";
import { useOwnership } from "../hooks/useOwnership";
import { splitByOwnership } from "../lib/priority";
import { ItemRow } from "./ItemRow";

const MODULE_RAIL_SECTIONS = new Set(["descendantModules", "weaponModules"]);

function OwnedCollapse({ items, card = false }: { items: BuildItem[]; card?: boolean }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-[12px] tracking-wide text-green hover:text-green/80"
      >
        {open ? "▾" : "▸"} {items.length} item{items.length > 1 ? "s" : ""} que você já tem
      </button>
      {open && (
        <div className={card ? "mt-2 grid grid-cols-2 gap-2 opacity-70 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6" : "mt-2 grid gap-1.5 opacity-70"}>
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
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
        <div className={card ? "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" : "grid gap-1.5"}>
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
