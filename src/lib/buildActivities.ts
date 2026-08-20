import type { Build } from "./types";

export type Activity = "all" | "onslaught" | "bossing" | "farming" | "dungeons" | "support" | "general";

export const ACTIVITY_LABELS: Record<Activity, string> = {
  all: "Todas",
  onslaught: "Onslaught",
  bossing: "Chefes & Colossi",
  farming: "Farm & Mobbing",
  dungeons: "Dungeons",
  support: "Suporte & Co-op",
  general: "Uso geral",
};

const BY_BUILD: Record<string, Activity[]> = {
  "ajax-support-debuffer": ["support", "bossing"],
  "bunny-onslaught-3-crit": ["onslaught", "farming"],
  "dia-onslaught-godlike": ["onslaught", "farming"],
  "freyna-supermassive-receptor-speed": ["dungeons", "farming"],
  "gley-onslaught-godmode": ["onslaught"],
  "hailey-godmode-bossing": ["bossing"],
  "harris-godmode-mobbing": ["farming", "general"],
  "ines-onslaught-plasma-bullet": ["onslaught"],
  "luna-bossing": ["bossing", "support"],
  "serena-archangel-onslaught": ["onslaught"],
  "viessa-onslaught-absolute-zero": ["onslaught"],
  "sharen-godmode-mobbing": ["farming", "dungeons"],
  "lepic-ultimate-mobbing": ["farming", "dungeons"],
  "valby-hydro-pressure-bomb": ["farming", "dungeons"],
  "blair-ultimate-mobbing": ["farming", "dungeons"],
  "yujin-allergic": ["farming", "support", "general"],
  "freyna-forbidden-sanctuary": ["dungeons", "bossing"],
  "bunny-400-infinite-sustain": ["farming", "dungeons"],
  "kyle-wall-crasher-nuke": ["bossing"],
  "valby-void-erosion-purge": ["farming", "dungeons"],
  "sharen-ultimate-ambush": ["bossing", "general"],
};

export function getBuildActivities(build: Build): Activity[] {
  return BY_BUILD[build.id] ?? ["general"];
}
