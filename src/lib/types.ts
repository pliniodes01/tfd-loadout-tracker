// Espelha data/build.schema.json e o formato de data/items.json.
// Mantido à mão (sem gerador) porque o schema ainda é pequeno — se crescer muito,
// considerar gerar isso a partir do JSON Schema.

export type Priority = "P0" | "P1" | "P2" | "ALT" | null;

export interface BuildItem {
  id: string;
  name: string;
  priority: Priority;
  note: string | null;
  targetRoll: string | null;
  targetLevel: number | null;
  capacityCost: number | null;
  altOf: string | null;
  quantity: number;
}

export interface ComponentGroup {
  slot: string;
  setName: string;
  items: BuildItem[];
}

export type SectionType =
  | "weapon"
  | "descendantModules"
  | "trigger"
  | "weaponModules"
  | "weaponTargetRolls"
  | "weaponCores"
  | "reactor"
  | "externalComponents"
  | "archeTuning"
  | "mutantCells"
  | "inversion"
  | "fellow";

export interface Section {
  type: SectionType;
  label: string;
  items?: BuildItem[];
  groups?: ComponentGroup[];
}

export interface BuildSource {
  author: string;
  url: string;
  type: "video" | "article" | "other";
  publishedAt?: string;
}

export interface Build {
  id: string;
  descendant: string;
  title: string;
  patch: string;
  updatedAt: string;
  source: BuildSource;
  sections: Section[];
}

export interface CatalogItem {
  id: string;
  name: string;
  kind: string;
  socketType: string | null;
  note?: string;
  tier?: string;
  nexonId?: string;
  imagePath?: string;
}

/** Todo item de uma seção, achatado (resolve o caso `items` vs `groups`). */
export function flattenSectionItems(section: Section): BuildItem[] {
  if (section.items) return section.items;
  if (section.groups) return section.groups.flatMap((g) => g.items);
  return [];
}
