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
      <section className="mb-8 grid gap-7 border-l-2 border-cyan/70 py-2 pl-5 md:grid-cols-[1fr_420px] md:items-end md:pl-7">
        <div>
          <p className="mb-2 text-sm font-semibold text-cyan">{builds.length} loadouts organizados por atividade</p>
          <h1 className="font-sans text-4xl font-semibold leading-none tracking-[-0.02em] sm:text-5xl">Escolha. Monte. Entre em combate.</h1>
          <p className="mt-3 max-w-2xl font-sans text-[17px] leading-relaxed text-muted">Encontre a configuração certa para o seu objetivo e veja, em ordem, o que ainda falta no inventário.</p>
        </div>
        <label className="group block">
          <span className="mb-2 block text-sm font-semibold text-ink">Qual build você procura?</span>
          <span className="flex border-b-2 border-line bg-[#07121a]/80 transition-colors group-focus-within:border-cyan">
            <span aria-hidden="true" className="grid w-12 shrink-0 place-items-center text-xl text-cyan">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Personagem, atividade ou autor" className="min-h-[52px] w-full bg-transparent px-1 pr-4 font-sans text-[17px] outline-none placeholder:text-muted/45" />
          </span>
        </label>
      </section>

      <button
        type="button"
        onClick={onOpenHot}
        className="group relative mb-8 flex min-h-[230px] w-full overflow-hidden bg-[#071018] text-left shadow-[0_20px_50px_#0008] transition-[filter] duration-300 [clip-path:polygon(0_0,calc(100%_-_28px)_0,100%_28px,100%_100%,28px_100%,0_calc(100%_-_28px))] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:min-h-[270px]"
        aria-label="Abrir Builds em Alta da Season 4"
      >
        <img
          src="/assets/characters-hd/raven-official-banner.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-75 transition-transform duration-700 group-hover:scale-[1.02] sm:object-center"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-[#071018] via-[#071018e8] to-[#07101828]" />
        <span className="absolute inset-y-0 left-0 w-1.5 bg-fire" />
        <span className="absolute bottom-0 left-0 h-px w-2/3 bg-gradient-to-r from-fire via-fire/35 to-transparent" />
        <span className="relative flex max-w-2xl flex-col justify-center p-6 pl-8 sm:p-10 sm:pl-12">
          <span className="mb-4 flex flex-wrap items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">
            <span className="text-fire">Season 4 / Agora</span>
            <span aria-hidden="true" className="h-3 w-px bg-white/30" />
            <span className="text-cyan">Raven em evolução</span>
          </span>
          <span className="font-sans text-3xl font-semibold leading-[0.98] tracking-[-0.02em] text-ink sm:text-[42px]">O meta da nova temporada<br className="hidden sm:block" /> está tomando forma.</span>
          <span className="mt-4 max-w-xl font-sans text-[16px] leading-relaxed text-muted sm:text-[18px]">Acompanhe personagens afetados pelo patch, configurações consolidadas e o que a comunidade ainda está descobrindo sobre Raven.</span>
          <span className="mt-6 inline-flex min-h-12 w-fit items-center gap-3 border-l-2 border-fire bg-white/[0.07] px-5 py-2.5 font-sans text-[16px] font-semibold text-ink transition-colors group-hover:bg-fire group-hover:text-[#170b05]">
            Ver análise da temporada <span aria-hidden="true" className="text-xl">›</span>
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
              className="group relative min-h-[360px] overflow-hidden rounded-md border border-white/10 bg-panel text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan/60 hover:shadow-[0_18px_42px_#000a]"
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
