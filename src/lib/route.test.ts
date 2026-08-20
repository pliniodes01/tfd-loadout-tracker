import { describe, it, expect } from "vitest";
import { parseRoute } from "./route";

describe("parseRoute", () => {
  it("rota vazia vai pra seleção de builds", () => {
    expect(parseRoute("")).toEqual({ name: "select" });
  });

  it("qualquer hash não reconhecido cai em seleção de builds", () => {
    expect(parseRoute("#/qualquer-coisa")).toEqual({ name: "select" });
  });

  it("#/em-alta vai pra tela de builds em alta", () => {
    expect(parseRoute("#/em-alta")).toEqual({ name: "hot" });
  });

  it("#/build/<id> vai pra detalhe da build com o id decodificado", () => {
    expect(parseRoute("#/build/serena-archangel-onslaught")).toEqual({
      name: "detail",
      buildId: "serena-archangel-onslaught",
    });
  });

  it("decodifica URI encoding no id da build", () => {
    expect(parseRoute("#/build/kyle%20wall%20crasher")).toEqual({
      name: "detail",
      buildId: "kyle wall crasher",
    });
  });

  it("#/build/ sem id cai em seleção (não trava em detail com id vazio)", () => {
    expect(parseRoute("#/build/")).toEqual({ name: "select" });
  });
});
