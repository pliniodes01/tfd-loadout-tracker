// Estado de cobertura da matriz personagem × atividade — função pura, sem React, pra
// poder ser testada e reaproveitada. Distingue 4 situações reais (nenhuma delas é
// "validado pra Season 4" por padrão — isso só acontece quando o patch da build bate
// com a season atual e nenhuma entrada de hot-builds sinalizou revisão).

import type { Build } from "./types";
import { getBuildActivities, type Activity } from "./buildActivities";
import type { HotBuildEntry } from "./community";

export type CoverageCellState = "verified-season" | "under-review" | "tracked" | "none";

export interface CoverageMatch {
  buildId: string;
  title: string;
  state: CoverageCellState;
}

export interface CoverageCell {
  state: CoverageCellState;
  matches: CoverageMatch[];
}

function buildState(build: Build, hotEntries: HotBuildEntry[], currentSeason: string): CoverageCellState {
  const entry = hotEntries.find((e) => e.buildId === build.id);
  if (entry?.communityStatus === "under-review") return "under-review";
  if (build.patch.startsWith(currentSeason)) return "verified-season";
  return "tracked";
}

const STATE_PRIORITY: Record<CoverageCellState, number> = {
  "under-review": 0,
  "verified-season": 1,
  tracked: 2,
  none: 3,
};

/** Estado (e as builds correspondentes) pra uma célula personagem × atividade. */
export function getCoverageCell(
  descendant: string,
  activity: Activity,
  builds: Build[],
  hotEntries: HotBuildEntry[],
  currentSeason: string
): CoverageCell {
  const matchingBuilds = builds.filter((b) => b.descendant === descendant && getBuildActivities(b).includes(activity));
  if (matchingBuilds.length === 0) return { state: "none", matches: [] };

  const matches: CoverageMatch[] = matchingBuilds
    .map((b) => ({ buildId: b.id, title: b.title, state: buildState(b, hotEntries, currentSeason) }))
    .sort((a, b) => STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state]);

  return { state: matches[0]!.state, matches };
}

export const COVERAGE_STATE_LABEL: Record<CoverageCellState, string> = {
  "verified-season": "Build com patch da season atual",
  "under-review": "Build em revisão nesta temporada",
  tracked: "Build cadastrada (de temporada anterior, sem revisão sinalizada)",
  none: "Ainda sem build comunitária confiável",
};
