// Metadados comunitários/editoriais (status "em alta") — camada separada da build.
// Nunca duplica módulos/rolls; só referencia buildId e guarda evidência + status.

import type { Activity } from "./buildActivities";
import hotBuildsFile from "../../data/community/hot-builds.json";

export type CommunityStatus = "new-evolving" | "rising" | "established" | "under-review";
export type Confidence = "low" | "medium" | "high";
export type EvidenceType = "community-build" | "official" | "press" | "discussion";

export interface CommunityEvidence {
  type: EvidenceType;
  source: string;
  url: string;
  author: string | null;
  publishedAt: string | null;
  observedAt: string;
  note: string;
}

export interface ComplementaryLink {
  source: string;
  url: string;
  note: string;
}

export interface HotBuildEntry {
  buildId: string | null;
  descendant: string;
  activities: Activity[];
  communityStatus: CommunityStatus;
  confidence: Confidence;
  season: string;
  lastVerifiedAt: string;
  hotReason: string;
  patchCaveat: string | null;
  evidence: CommunityEvidence[];
  complementaryLinks?: ComplementaryLink[];
  goalAchieved?: boolean;
}

export interface HotBuildsFile {
  season: string;
  generatedAt: string;
  entries: HotBuildEntry[];
}

const hotBuilds = hotBuildsFile as unknown as HotBuildsFile;

export function getHotBuildsSeason(): string {
  return hotBuilds.season;
}

export function getHotBuildsGeneratedAt(): string {
  return hotBuilds.generatedAt;
}

export function getAllHotEntries(): HotBuildEntry[] {
  return hotBuilds.entries;
}

/** Entradas que já têm uma build publicada (excluem spotlights sem buildId, como Raven no dia 1). */
export function getHotEntriesWithBuild(): (HotBuildEntry & { buildId: string })[] {
  return hotBuilds.entries.filter((e): e is HotBuildEntry & { buildId: string } => e.buildId !== null);
}

/** Entradas sem build ainda — personagem em spotlight editorial (ex.: Raven). */
export function getSpotlightOnlyEntries(): HotBuildEntry[] {
  return hotBuilds.entries.filter((e) => e.buildId === null);
}

export function getHotEntryForBuild(buildId: string): HotBuildEntry | undefined {
  return hotBuilds.entries.find((e) => e.buildId === buildId);
}

/** Agrupa por status pra exibição separada — nunca misturar em alta/consolidada/em revisão numa lista só. */
export function groupEntriesByStatus(entries: HotBuildEntry[]): Record<CommunityStatus, HotBuildEntry[]> {
  const groups: Record<CommunityStatus, HotBuildEntry[]> = {
    "new-evolving": [],
    rising: [],
    established: [],
    "under-review": [],
  };
  for (const entry of entries) groups[entry.communityStatus].push(entry);
  return groups;
}

/** Uma entrada "casa" com uma atividade de filtro se ela mesma declara isso OU a build referenciada declara. */
export function entryMatchesActivity(
  entry: HotBuildEntry,
  activity: Activity | "all",
  buildActivities: Activity[] | undefined
): boolean {
  if (activity === "all") return true;
  if (entry.activities.includes(activity)) return true;
  return buildActivities?.includes(activity) ?? false;
}

export const STATUS_LABEL: Record<CommunityStatus, string> = {
  "new-evolving": "NOVA · EM EVOLUÇÃO",
  rising: "EM ASCENSÃO",
  established: "CONSOLIDADA",
  "under-review": "EM REVISÃO",
};

export const STATUS_SECTION_TITLE: Record<CommunityStatus, string> = {
  "new-evolving": "Novas · em evolução",
  rising: "Em ascensão",
  established: "Consolidadas",
  "under-review": "Afetadas pelo patch",
};

export const STATUS_DESCRIPTION: Record<CommunityStatus, string> = {
  "new-evolving": "Personagem, arma ou patch recém-lançado. Pouca amostragem ainda — pode mudar rápido.",
  rising: "Ganhando interesse recente da comunidade, com sinais verificáveis. Não é meta consolidado.",
  established: "Configuração usada e referenciada há tempo suficiente, com fonte completa.",
  "under-review": "Build anterior afetada por patch ou balanceamento — ainda não re-verificada.",
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  low: "Confiança baixa",
  medium: "Confiança média",
  high: "Confiança alta",
};

// ---- validação (compartilhada entre scripts/validate-data.ts e os testes) ----

export interface HotBuildsValidationContext {
  buildIds: Set<string>;
  /** buildId -> campo `patch` da build (ex. "S3E4"). */
  buildPatchById: Map<string, string>;
}

/** Regras de negócio da camada comunitária. Retorna a lista de mensagens de erro
 *  (vazia = válido). Função pura pra poder ser testada sem tocar disco. */
export function validateHotBuildsFile(file: HotBuildsFile, ctx: HotBuildsValidationContext): string[] {
  const errors: string[] = [];
  const seenBuildIds = new Set<string>();

  for (const [i, entry] of file.entries.entries()) {
    const label = `entry[${i}] (${entry.descendant})`;

    if (entry.buildId !== null) {
      if (!ctx.buildIds.has(entry.buildId)) {
        errors.push(`${label}: buildId "${entry.buildId}" não existe em data/builds/`);
      }
      if (seenBuildIds.has(entry.buildId)) {
        errors.push(`${label}: buildId duplicado "${entry.buildId}"`);
      }
      seenBuildIds.add(entry.buildId);
    } else if (!entry.descendant) {
      errors.push(`${label}: sem buildId, precisa de descendant`);
    }

    // Raven não pode ser apresentada como consolidada nesta entrega — regra de negócio explícita.
    if (entry.descendant === "Raven" && entry.communityStatus === "established") {
      errors.push(`${label}: Raven não pode ter communityStatus "established" nesta entrega`);
    }

    // build de temporada anterior referenciada na season atual precisa de ressalva explícita.
    if (entry.buildId) {
      const buildPatch = ctx.buildPatchById.get(entry.buildId);
      const buildSeason = buildPatch?.slice(0, 2);
      const entrySeason = entry.season?.slice(0, 2);
      if (buildPatch && buildSeason && entrySeason && buildSeason !== entrySeason) {
        if (!entry.patchCaveat || !entry.patchCaveat.trim()) {
          errors.push(
            `${label}: build referenciada usa patch "${buildPatch}" (temporada ${buildSeason}) mas a entrada é da season "${entry.season}" — patchCaveat é obrigatório e não pode ficar vazio`
          );
        }
      }
    }

    if (entry.evidence.length === 0) {
      errors.push(`${label}: precisa de pelo menos 1 evidência`);
    }
  }

  return errors;
}
