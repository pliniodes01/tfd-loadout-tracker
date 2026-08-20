import type { BuildItem, Priority } from "./types";

const RANK: Record<NonNullable<Priority>, number> = { P0: 0, P1: 1, P2: 2, ALT: 3 };

export function priorityRank(p: Priority): number {
  if (!p) return 4;
  return RANK[p];
}

export function sortByPriority(items: BuildItem[]): BuildItem[] {
  return [...items].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
}

export interface SplitItems {
  missing: BuildItem[];
  owned: BuildItem[];
}

/** Separa itens de uma seção em faltantes (ordenados por prioridade) e já possuídos. */
export function splitByOwnership(items: BuildItem[], isOwned: (id: string) => boolean): SplitItems {
  const missing: BuildItem[] = [];
  const owned: BuildItem[] = [];
  for (const item of items) {
    (isOwned(item.id) ? owned : missing).push(item);
  }
  return { missing: sortByPriority(missing), owned: sortByPriority(owned) };
}
