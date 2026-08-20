import { describe, it, expect } from "vitest";
import { getCoverageCell } from "./coverage";
import type { Build } from "./types";
import type { HotBuildEntry } from "./community";

function makeBuild(overrides: Partial<Build> = {}): Build {
  return {
    id: "b1",
    descendant: "Testia",
    title: "Build de teste",
    patch: "S3E4",
    updatedAt: "2026-01-01",
    source: { author: "x", url: "https://example.com", type: "article" },
    sections: [{ type: "descendantModules", label: "Módulos", items: [] }],
    ...overrides,
  };
}

function makeHotEntry(overrides: Partial<HotBuildEntry> = {}): HotBuildEntry {
  return {
    buildId: "b1",
    descendant: "Testia",
    activities: [],
    communityStatus: "under-review",
    confidence: "medium",
    season: "S4",
    lastVerifiedAt: "2026-08-20",
    hotReason: "teste",
    patchCaveat: "x",
    evidence: [{ type: "official", source: "s", url: "https://example.com", author: null, publishedAt: null, observedAt: "2026-08-20", note: "n" }],
    ...overrides,
  };
}

// nota: getBuildActivities usa um mapa fixo em src/lib/buildActivities.ts baseado no
// build.id — "b1" não está nesse mapa, então cai no fallback ["general"]. Os testes
// abaixo usam a atividade "general" por causa disso.
describe("getCoverageCell", () => {
  it("retorna 'none' quando não há build nenhuma pro personagem/atividade", () => {
    const cell = getCoverageCell("Ninguém", "general", [], [], "S4");
    expect(cell.state).toBe("none");
    expect(cell.matches).toEqual([]);
  });

  it("retorna 'verified-season' quando a build já é da season atual e não está em revisão", () => {
    const build = makeBuild({ patch: "S4E1" });
    const cell = getCoverageCell("Testia", "general", [build], [], "S4");
    expect(cell.state).toBe("verified-season");
  });

  it("retorna 'tracked' quando a build é de temporada anterior e não está em revisão", () => {
    const build = makeBuild({ patch: "S3E4" });
    const cell = getCoverageCell("Testia", "general", [build], [], "S4");
    expect(cell.state).toBe("tracked");
  });

  it("retorna 'under-review' quando existe entrada hot-builds em revisão pra essa build, mesmo com patch atual", () => {
    const build = makeBuild({ patch: "S4E1" });
    const hotEntry = makeHotEntry({ communityStatus: "under-review" });
    const cell = getCoverageCell("Testia", "general", [build], [hotEntry], "S4");
    expect(cell.state).toBe("under-review");
  });

  it("under-review tem prioridade sobre verified-season quando há múltiplas builds na mesma célula", () => {
    const buildOk = makeBuild({ id: "b2", patch: "S4E1" });
    const buildReview = makeBuild({ id: "b1", patch: "S4E1" });
    const hotEntry = makeHotEntry({ buildId: "b1", communityStatus: "under-review" });
    const cell = getCoverageCell("Testia", "general", [buildOk, buildReview], [hotEntry], "S4");
    expect(cell.state).toBe("under-review");
    expect(cell.matches).toHaveLength(2);
    expect(cell.matches[0]!.buildId).toBe("b1"); // em revisão ordenado primeiro
  });

  it("não confunde builds de personagens diferentes", () => {
    const build = makeBuild({ descendant: "Outra" });
    const cell = getCoverageCell("Testia", "general", [build], [], "S4");
    expect(cell.state).toBe("none");
  });
});
