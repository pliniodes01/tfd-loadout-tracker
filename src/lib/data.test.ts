import { describe, it, expect } from "vitest";
import { getAllBuilds, getBuild, getAllItems, getItem } from "./data";
import { flattenSectionItems } from "./types";

describe("data loader", () => {
  it("carrega todos os arquivos de data/builds/", () => {
    expect(getAllBuilds().length).toBeGreaterThanOrEqual(11);
  });

  it("acha uma build por id", () => {
    const b = getBuild("serena-archangel-onslaught");
    expect(b?.descendant).toBe("Serena");
  });

  it("retorna undefined pra id de build inexistente, sem lançar erro", () => {
    expect(getBuild("nao-existe")).toBeUndefined();
  });

  it("carrega o catálogo inteiro de items.json", () => {
    expect(getAllItems().length).toBeGreaterThan(200);
  });

  it("toda referência de item nas builds resolve no catálogo (mesma checagem do validate-data, agora em teste)", () => {
    const items = getAllItems();
    const catalog = new Set(items.map((i) => i.id));
    for (const build of getAllBuilds()) {
      for (const section of build.sections) {
        for (const it of flattenSectionItems(section)) {
          expect(catalog.has(it.id), `${build.id}: item órfão "${it.id}"`).toBe(true);
        }
      }
    }
  });

  it("acha um item do catálogo por id", () => {
    expect(getItem("mod-nimble-fingers")?.name).toBe("Nimble Fingers");
  });
});
