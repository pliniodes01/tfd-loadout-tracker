// Carrega builds e catálogo como imports estáticos do Vite — tudo empacotado em build
// time, nenhuma chamada de rede em runtime (critério de aceite do MVP).

import type { Build, CatalogItem } from "./types";
import itemsFile from "../../data/items.json";

const buildModules = import.meta.glob<{ default: Build }>("../../data/builds/*.json", {
  eager: true,
});

const builds: Build[] = Object.values(buildModules)
  .map((m) => m.default)
  .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

const buildsById = new Map(builds.map((b) => [b.id, b]));

const items: CatalogItem[] = (itemsFile as { items: CatalogItem[] }).items;
const itemsById = new Map(items.map((i) => [i.id, i]));

export function getAllBuilds(): Build[] {
  return builds;
}

export function getBuild(id: string): Build | undefined {
  return buildsById.get(id);
}

export function getAllItems(): CatalogItem[] {
  return items;
}

export function getItem(id: string): CatalogItem | undefined {
  return itemsById.get(id);
}
