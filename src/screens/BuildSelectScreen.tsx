import { useMemo, useState } from "react";
import { getAllBuilds } from "../lib/data";
import { useOwnership } from "../hooks/useOwnership";
import { buildCompletion } from "../lib/progress";
import { ProgressRing } from "../components/ProgressRing";
import { getDescendantImage } from "../lib/descendantImages";
import { ACTIVITY_LABELS, getBuildActivities, type Activity } from "../lib/buildActivities";
import { getBuildElement } from "../lib/buildElements";
import { ActivityFilter } from "../components/ActivityFilter";

export function BuildSelectScreen({ onSelect, onOpenHot }: { onSelect: (buildId: string) => void; onOpenHot: () => void }) {
  const builds = getAllBuilds();
  const { isOwned } = useOwnership();
  const [query, setQuery] = useState("");
  const [activity, setActivity] = useState<Activity>("all");
  const visibleBuilds = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return builds.filter((build) => {
      const matchesActivity = activity === "all" || getBuildActivities(build).includes(activity);
      const matchesQuery = !normalized || `${build.descendant} ${build.title} ${build.source.author}`.toLocaleLowerCase("pt-BR").includes(normalized);
      return matchesActivity && matchesQuery;
    });
  }, [builds, query, activity]);

  return (
    <div>
      <div className="mb-6 grid gap-5 overflow-hidden rounded-2xl border border-white/15 bg-panel/68 p-6 shadow-2xl backdrop-blur-md md:grid-cols-[1fr_360px] md:items-end">
        <div><p className="font-mono text-[12px] uppercase tracking-[0.22em] text-fire">Build library</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Encontre sua próxima build</h1><p className="mt-2 max-w-2xl text-[16px] text-muted">Compare seu inventário com loadouts completos e descubra exatamente o que falta farmar.</p></div>
        <label className="block"><span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">Buscar por personagem, build ou autor</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: Bunny, bossing, Alcast…" className="w-full border border-line bg-[#050d14] px-4 py-3 text-base outline-none transition-colors placeholder:text-muted/50 focus:border-cyan" /></label>
      </div>

      <button
        type="button"
        onClick={onOpenHot}
        className="group relative mb-6 flex min-h-[210px] w-full overflow-hidden rounded-2xl border border-fire/45 bg-[#111820] text-left shadow-[0_18px_44px_#0007] transition-all duration-300 hover:-translate-y-0.5 hover:border-fire hover:shadow-[0_22px_52px_#0009] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:min-h-[240px]"
        aria-label="Abrir Builds em Alta da Season 4"
      >
        <img
          src="/assets/characters-hd/raven-official-banner.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-75 transition-transform duration-700 group-hover:scale-[1.02] sm:object-center"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-[#071018] via-[#071018e8] to-[#07101835]" />
        <span className="relative flex max-w-2xl flex-col justify-center p-5 sm:p-8">
          <span className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-fire/60 bg-fire/15 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-fire">Season 4 · novo</span>
            <span className="rounded-full border border-cyan/35 bg-cyan/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-cyan">Raven em evolução</span>
          </span>
          <span className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">O que está mudando nesta temporada?</span>
          <span className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">Veja Raven, personagens afetados pelo patch e builds que merecem atenção — sempre com o nível de evidência visível.</span>
          <span className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-fire px-4 py-2.5 text-sm font-semibold text-[#170b05] transition-colors group-hover:bg-[#ffae55]">
            Explorar Builds em Alta <span aria-hidden="true">→</span>
          </span>
        </span>
      </button>

      <div className="mb-5">
        <ActivityFilter value={activity} onChange={setActivity} label="Filtrar builds por atividade" />
      </div>

      <div className="mb-3 flex items-center justify-between"><p className="text-lg font-semibold">Builds disponíveis</p><span className="font-mono text-[12px] text-muted">{visibleBuilds.length} resultados</span></div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleBuilds.map((build) => {
          const { done, total, percent } = buildCompletion(build, isOwned);
          const portrait = getDescendantImage(build.descendant);
          const element = getBuildElement(build.id);
          return (
            <button
              key={build.id}
              onClick={() => onSelect(build.id)}
              className="group relative min-h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-panel text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan/60 hover:shadow-[0_18px_42px_#000a]"
            >
              {portrait && (
                <img
                  src={portrait}
                  alt={build.descendant}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-[50%_12%] opacity-95 transition-transform duration-500 group-hover:scale-[1.025]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05090e] via-[#07101a3d] to-[#05090e1a]" />
              <div className={`absolute left-4 top-4 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 backdrop-blur-md ${element.tone}`}>
                <img src={element.icon} alt="" className="h-5 w-5" />
                <span className="text-[12px] font-semibold">{element.label}</span>
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-[#05090ecc] p-1 backdrop-blur-sm">
                <ProgressRing percent={percent} size={54} />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05090e] via-[#05090ef2] to-transparent px-5 pb-5 pt-20">
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-cyan">{build.descendant}</p>
                <h2 className="mt-1 break-words text-[20px] font-semibold leading-snug">{build.title}</h2>
                <p className="mt-1.5 text-[13px] text-muted">
                  {build.patch} · {done}/{total} itens · {build.source.author}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">{getBuildActivities(build).slice(0, 2).map((tag) => <span key={tag} className="rounded border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] text-cyan">{ACTIVITY_LABELS[tag]}</span>)}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
