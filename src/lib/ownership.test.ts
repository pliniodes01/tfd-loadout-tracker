import { describe, expect, it } from "vitest";
import { normalizeOwnershipState } from "./ownership";

describe("normalizeOwnershipState", () => {
  it("mantém somente campos e tipos conhecidos", () => {
    const state = normalizeOwnershipState({
      items: {
        valid: { owned: true, maxed: true, socketTypeMatches: true, source: "manual", extra: "ignored" },
        malformed: "yes",
      },
      activators: { Hailey: true, invalid: "true" },
      levels: { Hailey: 99, invalid: "40" },
      unknown: "ignored",
    }, "imported");

    expect(state.items.valid).toEqual({ owned: true, maxed: true, socketTypeMatches: true, source: "imported" });
    expect(state.items.malformed).toBeUndefined();
    expect(state.activators).toEqual({ Hailey: true, invalid: false });
    expect(state.levels).toEqual({ Hailey: 40 });
  });

  it("remove flags dependentes quando o item não é possuído", () => {
    const state = normalizeOwnershipState({
      items: { item: { owned: false, maxed: true, socketTypeMatches: true } },
    });

    expect(state.items.item).toMatchObject({ owned: false, maxed: false, socketTypeMatches: false });
  });

  it("rejeita uma raiz que não seja objeto", () => {
    expect(() => normalizeOwnershipState([])).toThrow("Dados de progresso inválidos");
  });
});
