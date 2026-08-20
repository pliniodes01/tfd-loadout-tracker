import { describe, it, expect } from "vitest";
import {
  getAllHotEntries,
  getHotEntriesWithBuild,
  getSpotlightOnlyEntries,
  getHotEntryForBuild,
  groupEntriesByStatus,
  entryMatchesActivity,
  validateHotBuildsFile,
  type HotBuildsFile,
  type HotBuildEntry,
} from "./community";

describe("loader de hot-builds (dados reais)", () => {
  it("carrega pelo menos uma entrada", () => {
    expect(getAllHotEntries().length).toBeGreaterThan(0);
  });

  it("separa entradas com build das que são só spotlight (sem buildId)", () => {
    const withBuild = getHotEntriesWithBuild();
    const spotlightOnly = getSpotlightOnlyEntries();
    expect(withBuild.every((e) => typeof e.buildId === "string")).toBe(true);
    expect(spotlightOnly.every((e) => e.buildId === null)).toBe(true);
    expect(withBuild.length + spotlightOnly.length).toBe(getAllHotEntries().length);
  });

  it("Raven existe como entrada spotlight-only", () => {
    const raven = getSpotlightOnlyEntries().find((e) => e.descendant === "Raven");
    expect(raven).toBeDefined();
    expect(raven?.communityStatus).toBe("new-evolving");
  });

  it("acha uma entrada pelo buildId", () => {
    const entry = getHotEntryForBuild("kyle-wall-crasher-nuke");
    expect(entry?.communityStatus).toBe("under-review");
  });

  it("retorna undefined pra buildId sem entrada, sem lançar erro", () => {
    expect(getHotEntryForBuild("build-que-nao-existe")).toBeUndefined();
  });

  it("agrupa por status cobrindo os 4 buckets, mesmo os vazios", () => {
    const groups = groupEntriesByStatus(getHotEntriesWithBuild());
    expect(Object.keys(groups).sort()).toEqual(["established", "new-evolving", "rising", "under-review"].sort());
    // soma das entradas agrupadas bate com o total (nenhuma entrada perdida ou duplicada)
    const total = Object.values(groups).reduce((sum, list) => sum + list.length, 0);
    expect(total).toBe(getHotEntriesWithBuild().length);
  });
});

describe("entryMatchesActivity", () => {
  const baseEntry: HotBuildEntry = {
    buildId: "x",
    descendant: "X",
    activities: ["bossing"],
    communityStatus: "rising",
    confidence: "low",
    season: "S4",
    lastVerifiedAt: "2026-08-20",
    hotReason: "teste",
    patchCaveat: null,
    evidence: [{ type: "press", source: "s", url: "https://example.com", author: null, publishedAt: null, observedAt: "2026-08-20", note: "n" }],
  };

  it("'all' sempre casa", () => {
    expect(entryMatchesActivity(baseEntry, "all", undefined)).toBe(true);
  });

  it("casa quando a própria entrada declara a atividade", () => {
    expect(entryMatchesActivity(baseEntry, "bossing", undefined)).toBe(true);
  });

  it("não casa quando nem a entrada nem a build declaram a atividade", () => {
    expect(entryMatchesActivity(baseEntry, "dungeons", ["farming"])).toBe(false);
  });

  it("casa via atividade da build quando a entrada não declara diretamente", () => {
    const entry = { ...baseEntry, activities: [] as HotBuildEntry["activities"] };
    expect(entryMatchesActivity(entry, "farming", ["farming", "dungeons"])).toBe(true);
  });
});

describe("validateHotBuildsFile", () => {
  function makeEntry(overrides: Partial<HotBuildEntry> = {}): HotBuildEntry {
    return {
      buildId: "known-build",
      descendant: "Alguém",
      activities: [],
      communityStatus: "rising",
      confidence: "low",
      season: "S4",
      lastVerifiedAt: "2026-08-20",
      hotReason: "teste",
      patchCaveat: null,
      evidence: [{ type: "press", source: "s", url: "https://example.com", author: null, publishedAt: null, observedAt: "2026-08-20", note: "n" }],
      ...overrides,
    };
  }

  const ctx = {
    buildIds: new Set(["known-build"]),
    buildPatchById: new Map([["known-build", "S4E1"]]),
  };

  function file(entries: HotBuildEntry[]): HotBuildsFile {
    return { season: "S4", generatedAt: "2026-08-20", entries };
  }

  it("aceita um arquivo válido sem erros", () => {
    expect(validateHotBuildsFile(file([makeEntry()]), ctx)).toEqual([]);
  });

  it("rejeita buildId órfão", () => {
    const errors = validateHotBuildsFile(file([makeEntry({ buildId: "nao-existe" })]), ctx);
    expect(errors.some((e) => e.includes("nao-existe") && e.includes("não existe em data/builds/"))).toBe(true);
  });

  it("rejeita Raven com status established", () => {
    const errors = validateHotBuildsFile(
      file([makeEntry({ descendant: "Raven", buildId: null, communityStatus: "established" })]),
      ctx
    );
    expect(errors.some((e) => e.includes("Raven") && e.includes("established"))).toBe(true);
  });

  it("permite Raven com outros status", () => {
    const errors = validateHotBuildsFile(
      file([makeEntry({ descendant: "Raven", buildId: null, communityStatus: "new-evolving" })]),
      ctx
    );
    expect(errors).toEqual([]);
  });

  it("exige patchCaveat quando a build referenciada é de temporada anterior à season da entrada", () => {
    const ctxOldBuild = { buildIds: new Set(["known-build"]), buildPatchById: new Map([["known-build", "S3E4"]]) };
    const errors = validateHotBuildsFile(file([makeEntry({ season: "S4", patchCaveat: null })]), ctxOldBuild);
    expect(errors.some((e) => e.includes("patchCaveat"))).toBe(true);
  });

  it("aceita quando patchCaveat está preenchido pra build de temporada anterior", () => {
    const ctxOldBuild = { buildIds: new Set(["known-build"]), buildPatchById: new Map([["known-build", "S3E4"]]) };
    const errors = validateHotBuildsFile(file([makeEntry({ season: "S4", patchCaveat: "build é da S3E4, não re-verificada" })]), ctxOldBuild);
    expect(errors).toEqual([]);
  });

  it("rejeita entrada sem nenhuma evidência", () => {
    const errors = validateHotBuildsFile(file([makeEntry({ evidence: [] })]), ctx);
    expect(errors.some((e) => e.includes("pelo menos 1 evidência"))).toBe(true);
  });

  it("rejeita buildId duplicado entre entradas", () => {
    const errors = validateHotBuildsFile(file([makeEntry(), makeEntry()]), ctx);
    expect(errors.some((e) => e.includes("duplicado"))).toBe(true);
  });
});
