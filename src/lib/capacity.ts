/**
 * Motor de cálculo de capacidade de módulo.
 *
 * Funções puras — não leem localStorage nem fazem fetch. Quem chama passa os dados já
 * carregados (capacityTable vem de data/game/<snapshot>/capacity.json, rules vem de
 * data/rules/capacity.json). Ver README de data/rules/capacity.json: os valores
 * numéricos das regras são placeholders não conferidos contra o jogo.
 */

export interface CapacityByLevelEntry {
  level: number;
  capacity: number;
}

export interface CapacityTable {
  [itemId: string]: { nexonId?: string; byLevel: CapacityByLevelEntry[] };
}

export interface CapacityRules {
  socketTypeMatchDiscount: number;
  baseCapacityByLevel: {
    descendant: CapacityByLevelEntry[];
    weapon: CapacityByLevelEntry[];
  };
  energyActivator: {
    bonusCapacity: number;
    appliesOncePerTarget: boolean;
  };
}

export interface ModuleSelection {
  /** id do item no catálogo (data/items.json) */
  itemId: string;
  /** nível de aprimoramento que o módulo está (ou a build pede) */
  level: number;
  /** true se o socket onde o módulo está encaixado é do mesmo tipo/cor do módulo */
  socketTypeMatches: boolean;
}

export type CapacityTarget = "descendant" | "weapon";

/** Custo de capacidade de UM módulo num nível/socket específico. */
export function getModuleCapacityCost(
  selection: ModuleSelection,
  capacityTable: CapacityTable,
  rules: CapacityRules
): number | null {
  const entry = capacityTable[selection.itemId];
  if (!entry) return null; // sem dado de capacidade ingerido pra esse item ainda (pendente)

  const byLevel = entry.byLevel;
  if (byLevel.length === 0) return null;

  // pega o nível exato, ou o mais próximo abaixo dele (níveis de módulo não pulam).
  const exact = byLevel.find((l) => l.level === selection.level);
  const fallback: CapacityByLevelEntry = byLevel[0]!;
  const atLevel =
    exact ??
    [...byLevel].sort((a, b) => b.level - a.level).find((l) => l.level <= selection.level) ??
    fallback;

  const base = atLevel.capacity;
  if (!selection.socketTypeMatches) return base;
  return Math.floor(base * rules.socketTypeMatchDiscount);
}

/** Soma o custo de todos os módulos selecionados. Ignora itens sem dado de capacidade
 *  (retorna também a lista de ids pendentes, pra UI poder avisar "capacidade incompleta"). */
export function calculateRequiredCapacity(
  selections: ModuleSelection[],
  capacityTable: CapacityTable,
  rules: CapacityRules
): { required: number; pendingItemIds: string[] } {
  let required = 0;
  const pendingItemIds: string[] = [];
  for (const sel of selections) {
    const cost = getModuleCapacityCost(sel, capacityTable, rules);
    if (cost === null) {
      pendingItemIds.push(sel.itemId);
      continue;
    }
    required += cost;
  }
  return { required, pendingItemIds };
}

/** Interpola linearmente a capacidade base disponível num nível de descendant/arma,
 *  a partir da tabela esparsa de pontos-âncora em capacity.json. */
export function interpolateBaseCapacity(level: number, anchors: CapacityByLevelEntry[]): number {
  const sorted = [...anchors].sort((a, b) => a.level - b.level);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return 0;
  if (level <= first.level) return first.capacity;
  if (level >= last.level) return last.capacity;

  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i]!;
    const hi = sorted[i + 1]!;
    if (level >= lo.level && level <= hi.level) {
      const span = hi.level - lo.level;
      const progress = span === 0 ? 0 : (level - lo.level) / span;
      return Math.round(lo.capacity + (hi.capacity - lo.capacity) * progress);
    }
  }
  return last.capacity;
}

export function getAvailableCapacity(
  level: number,
  energyActivatorUsed: boolean,
  target: CapacityTarget,
  rules: CapacityRules
): number {
  const base = interpolateBaseCapacity(level, rules.baseCapacityByLevel[target]);
  const bonus = energyActivatorUsed ? rules.energyActivator.bonusCapacity : 0;
  return base + bonus;
}

export interface CapacityVerdict {
  required: number;
  available: number;
  fits: boolean;
  deficit: number; // 0 se fits
  pendingItemIds: string[];
}

export function calculateCapacityVerdict(
  selections: ModuleSelection[],
  capacityTable: CapacityTable,
  rules: CapacityRules,
  level: number,
  energyActivatorUsed: boolean,
  target: CapacityTarget
): CapacityVerdict {
  const { required, pendingItemIds } = calculateRequiredCapacity(selections, capacityTable, rules);
  const available = getAvailableCapacity(level, energyActivatorUsed, target, rules);
  const fits = required <= available;
  return { required, available, fits, deficit: fits ? 0 : required - available, pendingItemIds };
}

export interface CatalystSuggestion {
  itemId: string;
  currentCost: number;
  costIfCatalyzed: number;
  savings: number;
}

/**
 * Sugere em que ordem catalisar sockets (atribuir o tipo certo) pra fechar o déficit de
 * capacidade mais rápido: maior economia primeiro (guloso), até a soma cobrir o déficit.
 * Só considera módulos que HOJE não estão em socket do tipo certo (senão catalisar não
 * ajudaria) e para os quais existe dado de capacidade.
 */
export function suggestCatalystOrder(
  selections: ModuleSelection[],
  capacityTable: CapacityTable,
  rules: CapacityRules,
  deficit: number
): CatalystSuggestion[] {
  if (deficit <= 0) return [];

  const candidates: CatalystSuggestion[] = [];
  for (const sel of selections) {
    if (sel.socketTypeMatches) continue; // já catalisado corretamente, nada a ganhar
    const currentCost = getModuleCapacityCost(sel, capacityTable, rules);
    const costIfCatalyzed = getModuleCapacityCost(
      { ...sel, socketTypeMatches: true },
      capacityTable,
      rules
    );
    if (currentCost === null || costIfCatalyzed === null) continue;
    const savings = currentCost - costIfCatalyzed;
    if (savings > 0) candidates.push({ itemId: sel.itemId, currentCost, costIfCatalyzed, savings });
  }

  candidates.sort((a, b) => b.savings - a.savings);

  const result: CatalystSuggestion[] = [];
  let covered = 0;
  for (const c of candidates) {
    if (covered >= deficit) break;
    result.push(c);
    covered += c.savings;
  }
  return result;
}
