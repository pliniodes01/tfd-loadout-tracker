import type { Build } from "./types";
import { flattenSectionItems } from "./types";

export function buildCompletion(build: Build, isOwned: (id: string) => boolean): { done: number; total: number; percent: number } {
  const all = build.sections.flatMap(flattenSectionItems);
  const done = all.filter((item) => isOwned(item.id)).length;
  const total = all.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
