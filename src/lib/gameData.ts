import type { CapacityRules, CapacityTable } from "./capacity";
import rulesFile from "../../data/rules/capacity.json";
import capacityFile from "../../data/game/tfdplanner-2024-08-10/capacity.json";

export const capacityRules = rulesFile as unknown as CapacityRules;
export const capacityTable = capacityFile as unknown as CapacityTable;

/** true enquanto os números de data/rules/capacity.json não foram conferidos no jogo. */
export const CAPACITY_RULES_VERIFIED = false;
