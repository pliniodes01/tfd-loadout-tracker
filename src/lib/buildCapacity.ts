// Liga o motor puro (src/lib/capacity.ts) aos dados de uma build + estado de posse.
// Duas budgets separadas no jogo: capacidade do descendant e capacidade da arma.

import type { Build, BuildItem } from "./types";
import type { OwnershipState } from "./ownership";
import { getItemOwnership } from "./ownership";
import {
  calculateCapacityVerdict,
  suggestCatalystOrder,
  type CapacityRules,
  type CapacityTable,
  type CapacityVerdict,
  type ModuleSelection,
  type CapacityTarget,
} from "./capacity";

const DEFAULT_LEVEL = 40; // suposição de endgame — ajustável pelo jogador na tela.

function levelForItem(item: BuildItem, capacityTable: CapacityTable): number {
  if (item.targetLevel != null) return item.targetLevel;
  const entry = capacityTable[item.id];
  if (!entry || entry.byLevel.length === 0) return 0;
  return Math.max(...entry.byLevel.map((l) => l.level));
}

function toSelections(
  items: BuildItem[],
  ownership: OwnershipState,
  capacityTable: CapacityTable
): ModuleSelection[] {
  return items.map((item) => ({
    itemId: item.id,
    level: levelForItem(item, capacityTable),
    socketTypeMatches: getItemOwnership(ownership, item.id).socketTypeMatches,
  }));
}

export interface BuildCapacitySummary {
  descendant: (CapacityVerdict & { target: CapacityTarget; targetName: string }) | null;
  weapon: (CapacityVerdict & { target: CapacityTarget; targetName: string }) | null;
}

export function calculateBuildCapacity(
  build: Build,
  ownership: OwnershipState,
  rules: CapacityRules,
  capacityTable: CapacityTable
): BuildCapacitySummary {
  const descendantSection = build.sections.find((s) => s.type === "descendantModules");
  const weaponSection = build.sections.find((s) => s.type === "weaponModules");
  const weaponItemSection = build.sections.find((s) => s.type === "weapon");
  const weaponName = weaponItemSection?.items?.[0]?.name ?? build.descendant;

  const descendantLevel = ownership.levels[build.descendant] ?? DEFAULT_LEVEL;
  const descendantActivator = ownership.activators[build.descendant] ?? false;
  const weaponLevel = ownership.levels[weaponName] ?? DEFAULT_LEVEL;
  const weaponActivator = ownership.activators[weaponName] ?? false;

  const descendant = descendantSection
    ? {
        ...calculateCapacityVerdict(
          toSelections(descendantSection.items ?? [], ownership, capacityTable),
          capacityTable,
          rules,
          descendantLevel,
          descendantActivator,
          "descendant"
        ),
        target: "descendant" as const,
        targetName: build.descendant,
      }
    : null;

  const weapon = weaponSection
    ? {
        ...calculateCapacityVerdict(
          toSelections(weaponSection.items ?? [], ownership, capacityTable),
          capacityTable,
          rules,
          weaponLevel,
          weaponActivator,
          "weapon"
        ),
        target: "weapon" as const,
        targetName: weaponName,
      }
    : null;

  return { descendant, weapon };
}

export function catalystSuggestionsFor(
  build: Build,
  ownership: OwnershipState,
  rules: CapacityRules,
  capacityTable: CapacityTable,
  target: CapacityTarget,
  deficit: number
) {
  const sectionType = target === "descendant" ? "descendantModules" : "weaponModules";
  const section = build.sections.find((s) => s.type === sectionType);
  if (!section) return [];
  return suggestCatalystOrder(
    toSelections(section.items ?? [], ownership, capacityTable),
    capacityTable,
    rules,
    deficit
  );
}
