import { describe, it, expect } from "vitest";
import {
  getModuleCapacityCost,
  calculateRequiredCapacity,
  interpolateBaseCapacity,
  getAvailableCapacity,
  calculateCapacityVerdict,
  suggestCatalystOrder,
  type CapacityTable,
  type CapacityRules,
} from "./capacity";

const rules: CapacityRules = {
  socketTypeMatchDiscount: 0.5,
  baseCapacityByLevel: {
    descendant: [
      { level: 1, capacity: 26 },
      { level: 10, capacity: 32 },
      { level: 40, capacity: 100 },
    ],
    weapon: [
      { level: 1, capacity: 22 },
      { level: 40, capacity: 100 },
    ],
  },
  energyActivator: { bonusCapacity: 10, appliesOncePerTarget: true },
};

const capacityTable: CapacityTable = {
  "mod-a": {
    byLevel: [
      { level: 0, capacity: 6 },
      { level: 1, capacity: 7 },
      { level: 7, capacity: 13 },
    ],
  },
  "mod-b": {
    byLevel: [{ level: 0, capacity: 10 }],
  },
};

describe("getModuleCapacityCost", () => {
  it("retorna o custo cheio quando o socket não é do tipo certo", () => {
    expect(getModuleCapacityCost({ itemId: "mod-a", level: 0, socketTypeMatches: false }, capacityTable, rules)).toBe(6);
  });

  it("aplica o desconto quando o socket é do tipo certo, arredondando pra baixo", () => {
    // nível 1 custa 7 -> metade = 3.5 -> arredonda pra 3
    expect(getModuleCapacityCost({ itemId: "mod-a", level: 1, socketTypeMatches: true }, capacityTable, rules)).toBe(3);
  });

  it("usa o nível mais próximo abaixo quando o nível exato não existe na tabela", () => {
    // nível 5 não existe -> cai pro nível 1 (13 é só no 7, não deve usar)
    expect(getModuleCapacityCost({ itemId: "mod-a", level: 5, socketTypeMatches: false }, capacityTable, rules)).toBe(7);
  });

  it("retorna null quando o item não tem dado de capacidade ingerido", () => {
    expect(getModuleCapacityCost({ itemId: "mod-desconhecido", level: 0, socketTypeMatches: false }, capacityTable, rules)).toBeNull();
  });
});

describe("calculateRequiredCapacity", () => {
  it("soma o custo de vários módulos e lista os pendentes separadamente", () => {
    const result = calculateRequiredCapacity(
      [
        { itemId: "mod-a", level: 0, socketTypeMatches: false }, // 6
        { itemId: "mod-b", level: 0, socketTypeMatches: false }, // 10
        { itemId: "mod-sem-dado", level: 0, socketTypeMatches: false }, // pendente
      ],
      capacityTable,
      rules
    );
    expect(result.required).toBe(16);
    expect(result.pendingItemIds).toEqual(["mod-sem-dado"]);
  });
});

describe("interpolateBaseCapacity", () => {
  it("retorna o valor exato num ponto-âncora", () => {
    expect(interpolateBaseCapacity(10, rules.baseCapacityByLevel.descendant)).toBe(32);
  });

  it("interpola linearmente entre dois pontos-âncora", () => {
    // entre nível 10 (32) e 40 (100): metade do caminho (nível 25) = 66
    expect(interpolateBaseCapacity(25, rules.baseCapacityByLevel.descendant)).toBe(66);
  });

  it("satura no primeiro ponto abaixo do mínimo", () => {
    expect(interpolateBaseCapacity(0, rules.baseCapacityByLevel.descendant)).toBe(26);
  });

  it("satura no último ponto acima do máximo", () => {
    expect(interpolateBaseCapacity(999, rules.baseCapacityByLevel.descendant)).toBe(100);
  });
});

describe("getAvailableCapacity", () => {
  it("soma o bônus do Energy Activator quando usado", () => {
    expect(getAvailableCapacity(1, true, "descendant", rules)).toBe(26 + 10);
  });

  it("não soma bônus quando não usado", () => {
    expect(getAvailableCapacity(1, false, "descendant", rules)).toBe(26);
  });
});

describe("calculateCapacityVerdict", () => {
  it("indica que a build cabe quando required <= available", () => {
    const v = calculateCapacityVerdict(
      [{ itemId: "mod-a", level: 0, socketTypeMatches: false }],
      capacityTable,
      rules,
      1,
      false,
      "descendant"
    );
    expect(v.required).toBe(6);
    expect(v.fits).toBe(true);
    expect(v.deficit).toBe(0);
  });

  it("indica déficit quando a build não cabe", () => {
    const heavySelections = Array.from({ length: 10 }, () => ({
      itemId: "mod-b" as const,
      level: 0,
      socketTypeMatches: false,
    }));
    const v = calculateCapacityVerdict(heavySelections, capacityTable, rules, 1, false, "descendant");
    expect(v.required).toBe(100); // 10 x mod-b (10 cada)
    expect(v.fits).toBe(false);
    expect(v.deficit).toBe(v.required - v.available);
  });
});

describe("suggestCatalystOrder", () => {
  it("não sugere nada se não há déficit", () => {
    expect(suggestCatalystOrder([{ itemId: "mod-a", level: 0, socketTypeMatches: false }], capacityTable, rules, 0)).toEqual([]);
  });

  it("ordena por maior economia primeiro e ignora quem já está catalisado certo", () => {
    const selections = [
      { itemId: "mod-a", level: 0, socketTypeMatches: false }, // economia: 6 -> 3 = 3
      { itemId: "mod-b", level: 0, socketTypeMatches: false }, // economia: 10 -> 5 = 5
      { itemId: "mod-b", level: 0, socketTypeMatches: true }, // já catalisado, ignorar
    ];
    const suggestion = suggestCatalystOrder(selections, capacityTable, rules, 4);
    expect(suggestion[0]?.itemId).toBe("mod-b");
    expect(suggestion[0]?.savings).toBe(5);
    // cobriu o déficit de 4 já no primeiro item, não deve incluir o segundo
    expect(suggestion.length).toBe(1);
  });

  it("acumula sugestões até cobrir o déficit inteiro", () => {
    const selections = [
      { itemId: "mod-a", level: 0, socketTypeMatches: false }, // economia 3
      { itemId: "mod-b", level: 0, socketTypeMatches: false }, // economia 5
    ];
    const suggestion = suggestCatalystOrder(selections, capacityTable, rules, 7);
    expect(suggestion.length).toBe(2);
    expect(suggestion.reduce((s, c) => s + c.savings, 0)).toBeGreaterThanOrEqual(7);
  });
});
