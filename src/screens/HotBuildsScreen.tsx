import { useState } from "react";
import {
  getSpotlightOnlyEntries,
  getHotEntriesWithBuild,
  getHotBuildsGeneratedAt,
  groupEntriesByStatus,
  entryMatchesActivity,
  STATUS_SECTION_TITLE,
  STATUS_DESCRIPTION,
  type CommunityStatus,
} from "../lib/community";
import { getBuildActivities, type Activity } from "../lib/buildActivities";
import { getBuild } from "../lib/data";
import { RavenSpotlight } from "../components/RavenSpotlight";
import { HotBuildCard } from "../components/HotBuildCard";
import { ActivityFilter } from "../components/ActivityFilter";
import { CoverageMatrix } from "../components/CoverageMatrix";

const SECTION_ORDER: CommunityStatus[] = ["rising", "under-review", "established"];

export function HotBuildsScreen({ onSelectBuild }: { onSelectBuild: (buildId: string) => void }) {
  const [activity, setActivity] = useState<Activity>("all");
  const spotlight = getSpotlightOnlyEntries();
  const raven = spotlight.find((e) => e.descendant === "Raven");
  const withBuild = getHotEntriesWithBuild();
  const hasRisingEvidence = withBuild.some((e) => e.communityStatus === "rising");

  const grouped = groupEntriesByStatus(withBuild);

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-2xl border border-white/15 bg-panel/68 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-fire">Builds em alta</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Builds em alta</h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">
          {hasRisingEvidence
            ? "Configurações que estão ganhando espaço na comunidade nesta temporada."
            : "Builds, personagens e arquétipos que merecem atenção nesta temporada."}
        </p>
        <p className="mt-3 text-[12.5px] text-muted">Atualizado em {getHotBuildsGeneratedAt()}</p>
        <p className="mt-3 max-w-2xl rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] leading-snug text-muted">
          Popularidade não significa build definitiva, nem "melhor". Cada card mostra a maturidade real da configuração e a
          evidência por trás dela.
        </p>
      </div>

      {raven && (
        <div className="mb-8">
          <RavenSpotlight entry={raven} />
        </div>
      )}

      <div className="mb-6">
        <ActivityFilter value={activity} onChange={setActivity} label="Explorar builds em alta por atividade" />
      </div>

      {SECTION_ORDER.map((status) => {
        const entries = grouped[status].filter((entry) => {
          const build = getBuild(entry.buildId!);
          return entryMatchesActivity(entry, activity, build ? getBuildActivities(build) : undefined);
        });

        return (
          <section key={status} className="mb-8">
            <div className="mb-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">Temporal · S4</p>
              <h2 className="text-xl font-semibold">{STATUS_SECTION_TITLE[status]}</h2>
              <p className="mt-1 max-w-2xl text-[13px] text-muted">{STATUS_DESCRIPTION[status]}</p>
            </div>

            {entries.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line bg-panel/30 p-4 text-[13px] text-muted">
                {status === "rising"
                  ? "Nenhuma build com evidência real de crescimento (votos, views, discussão) ainda nesta temporada — assim que houver, entra aqui. Não preenchemos isso com suposição."
                  : "Nenhuma build nessa categoria ainda para essa atividade."}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {entries.map((entry) => (
                  <HotBuildCard key={entry.buildId} entry={entry} onOpenBuild={onSelectBuild} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <section>
        <div className="mb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">Cobertura</p>
          <h2 className="text-xl font-semibold">Cobertura da comunidade</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted">
            Personagem × atividade. Lacunas aparecem como lacunas — nada aqui foi preenchido com configuração inventada.
          </p>
        </div>
        <div className="mb-4 mt-4 grid max-w-4xl gap-2 sm:grid-cols-3">
            <p className="rounded-lg border border-white/10 bg-panel/55 px-4 py-3 text-[13px] leading-snug text-muted"><strong className="mb-1 block text-ink">1. Escolha o personagem</strong>Procure o nome na primeira coluna.</p>
            <p className="rounded-lg border border-white/10 bg-panel/55 px-4 py-3 text-[13px] leading-snug text-muted"><strong className="mb-1 block text-ink">2. Encontre a atividade</strong>Compare bossing, farm, dungeons e outros usos.</p>
            <p className="rounded-lg border border-cyan/25 bg-cyan/[0.06] px-4 py-3 text-[13px] leading-snug text-muted"><strong className="mb-1 block text-cyan">3. Abra a build</strong>Clique em qualquer status colorido para ver o loadout.</p>
        </div>
        <CoverageMatrix onOpenBuild={onSelectBuild} />
      </section>
    </div>
  );
}
