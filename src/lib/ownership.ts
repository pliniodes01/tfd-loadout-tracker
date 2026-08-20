// Estado de posse do jogador — a única coisa que muda em runtime. Global por item id,
// nunca por build (é o ganho principal do produto sobre marcar checkbox num guia).
// Guardado em localStorage; export/import via string codificada pra mandar pra um amigo.

export type OwnershipSource = "manual" | "imported";

export interface ItemOwnership {
  owned: boolean;
  maxed: boolean;
  socketTypeMatches: boolean;
  source: OwnershipSource;
}

export interface OwnershipState {
  items: Record<string, ItemOwnership>;
  /** Energy Activator usado, por descendant (nome) ou arma (item id) — é conta, não build. */
  activators: Record<string, boolean>;
  /** Nível do descendant/arma, mesma chave de `activators`. */
  levels: Record<string, number>;
}

const STORAGE_KEY = "tfd-tracker:ownership:v1";
const MAX_ITEMS = 5_000;
const MAX_KEY_LENGTH = 200;
const MAX_LEVEL = 40;

export function emptyState(): OwnershipState {
  return { items: {}, activators: {}, levels: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeEntries(value: unknown): [string, unknown][] {
  if (!isRecord(value)) return [];
  return Object.entries(value)
    .filter(([key]) => key.length > 0 && key.length <= MAX_KEY_LENGTH)
    .slice(0, MAX_ITEMS);
}

/** Normaliza toda entrada externa antes que ela chegue ao estado da aplicação. */
export function normalizeOwnershipState(value: unknown, source?: OwnershipSource): OwnershipState {
  if (!isRecord(value)) throw new Error("Dados de progresso inválidos.");

  const items: Record<string, ItemOwnership> = Object.create(null) as Record<string, ItemOwnership>;
  for (const [id, candidate] of safeEntries(value.items)) {
    if (!isRecord(candidate)) continue;
    const owned = candidate.owned === true;
    items[id] = {
      owned,
      maxed: owned && candidate.maxed === true,
      socketTypeMatches: owned && candidate.socketTypeMatches === true,
      source: source ?? (candidate.source === "imported" ? "imported" : "manual"),
    };
  }

  const activators: Record<string, boolean> = Object.create(null) as Record<string, boolean>;
  for (const [key, candidate] of safeEntries(value.activators)) {
    activators[key] = candidate === true;
  }

  const levels: Record<string, number> = Object.create(null) as Record<string, number>;
  for (const [key, candidate] of safeEntries(value.levels)) {
    if (typeof candidate !== "number" || !Number.isFinite(candidate)) continue;
    levels[key] = Math.min(MAX_LEVEL, Math.max(0, Math.trunc(candidate)));
  }

  return { items, activators, levels };
}

export function loadState(): OwnershipState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return normalizeOwnershipState(JSON.parse(raw));
  } catch {
    return emptyState();
  }
}

export function saveState(state: OwnershipState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponível (modo privado, quota) — segue sem persistir.
  }
}

export function getItemOwnership(state: OwnershipState, itemId: string): ItemOwnership {
  return state.items[itemId] ?? { owned: false, maxed: false, socketTypeMatches: false, source: "manual" };
}

export function isOwned(state: OwnershipState, itemId: string): boolean {
  return state.items[itemId]?.owned ?? false;
}

export function withItemOwnership(
  state: OwnershipState,
  itemId: string,
  patch: Partial<ItemOwnership>
): OwnershipState {
  const current = getItemOwnership(state, itemId);
  const next: ItemOwnership = { ...current, ...patch };
  // desmarcar posse reseta maxed/socket — não faz sentido "maxado" num item que não se tem.
  if (patch.owned === false) {
    next.maxed = false;
    next.socketTypeMatches = false;
  }
  return { ...state, items: { ...state.items, [itemId]: next } };
}

export function withActivator(state: OwnershipState, target: string, used: boolean): OwnershipState {
  return { ...state, activators: { ...state.activators, [target]: used } };
}

export function withLevel(state: OwnershipState, target: string, level: number): OwnershipState {
  return { ...state, levels: { ...state.levels, [target]: level } };
}
