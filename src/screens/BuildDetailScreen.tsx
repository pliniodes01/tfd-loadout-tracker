import { getBuild } from "../lib/data";
import { useOwnership } from "../hooks/useOwnership";
import { buildCompletion } from "../lib/progress";
import { ProgressRing } from "../components/ProgressRing";
import { SectionPanel } from "../components/SectionPanel";
import { NextActions } from "../components/NextActions";
import { CapacityPanel } from "../components/CapacityPanel";
import { getDescendantImage } from "../lib/descendantImages";
import type { ReactNode } from "react";
import { getBuildProfile } from "../lib/buildProfiles";

const SOURCE_TYPE_LABEL: Record<string, string> = { video: "vídeo", article: "artigo", other: "fonte" };

export function BuildDetailScreen({ buildId, onBack }: { buildId: string; onBack: () => void }) {
  const build = getBuild(buildId);
  const { isOwned } = useOwnership();

  if (!build) {
    return (
      <div>
        <button onClick={onBack} className="font-mono text-[11px] text-cyan hover:underline">
          ← voltar
        </button>
        <p className="mt-4 text-fire2">Build "{buildId}" não encontrada.</p>
      </div>
    );
  }

  const { done, total, percent } = buildCompletion(build, isOwned);
  const portrait = getDescendantImage(build.descendant);
  const profile = getBuildProfile(build.id);
  const descendantModules = build.sections.find((section) => section.type === "descendantModules");
  const weaponModules = build.sections.find((section) => section.type === "weaponModules");
  const findSection = (type: string) => build.sections.find((section) => section.type === type);
  const equipmentSections = [findSection("trigger"), findSection("weapon"), findSection("reactor")].filter(Boolean);
  const weaponDetailSections = [findSection("weaponTargetRolls"), findSection("weaponCores")].filter(Boolean);
  const externalComponents = findSection("externalComponents");
  const progressionSections = [findSection("archeTuning"), findSection("mutantCells"), findSection("inversion"), findSection("fellow")].filter(Boolean);

  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted transition-colors hover:bg-white/5 hover:text-ink">
        <span aria-hidden="true">←</span> Todas as builds
      </button>

      <div className="mb-5 rounded-xl border border-white/15 bg-[#10232ed1] px-5 py-4 shadow-xl backdrop-blur-md sm:flex sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-cyan">{build.descendant} // {build.patch}</p>
          <h1 className="mt-1 text-2xl font-semibold leading-snug">{build.title}</h1>
        </div>
        <p className="mt-2 text-[13px] text-muted sm:mt-0">
          Atualizada em {build.updatedAt} ·{" "}
          <a href={build.source.url} target="_blank" rel="noopener" className="text-cyan hover:underline">
            {SOURCE_TYPE_LABEL[build.source.type] ?? build.source.type} de {build.source.author}
          </a>
        </p>
      </div>

      <section className="grid overflow-hidden rounded-2xl border border-white/15 bg-[#0b1b25]/82 shadow-2xl backdrop-blur-sm lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative z-10 flex min-h-[420px] flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div className="max-w-xl">
            <p className="font-mono text-[12px] uppercase tracking-[0.25em] text-cyan">Build overview</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{build.title}</h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted">{profile.purpose}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <BuildTrait label="Foco" value={profile.focus} />
              <BuildTrait label="Ideal para" value={profile.playstyle} />
            </div>
          </div>
          <div className="grid w-full max-w-3xl gap-3 xl:grid-cols-[minmax(280px,1fr)_minmax(340px,0.9fr)]">
            <div className="flex items-center gap-4 border border-line bg-[#07111ae8] p-4 backdrop-blur-sm">
              <ProgressRing percent={percent} size={70} />
              <div className="min-w-0 flex-1"><div className="flex justify-between text-xs"><strong>Conclusão da build</strong><span className="font-mono text-cyan">{done}/{total}</span></div><div className="mt-3 h-1.5 bg-line"><div className="h-full bg-gradient-to-r from-cyan to-green" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-[10px] text-muted">Progresso global sincronizado.</p></div>
            </div>
            <NextActions build={build} />
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden">
            <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_50%_43%,#17485b_0,transparent_34%),linear-gradient(#ffffff05_1px,transparent_1px),linear-gradient(90deg,#ffffff05_1px,transparent_1px)] [background-size:auto,34px_34px,34px_34px]" />
            <div className="absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/20" />
            {portrait && (
              <img src={portrait} alt={build.descendant} className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_18px_32px_#000]" />
            )}
        </div>
      </section>

      <PriorityLegend />

      <div className="mt-5 grid gap-5">
        {descendantModules && <SectionPanel section={descendantModules} />}
        {weaponModules && <SectionPanel section={weaponModules} />}
      </div>

      <div className="mt-6"><CapacityPanel build={build} /></div>

      {equipmentSections.length > 0 && <SectionGroup eyebrow="Essenciais" title="Equipamento principal"><div className="grid items-start gap-4 lg:grid-cols-3">{equipmentSections.map((section) => <SectionPanel key={section!.type} section={section!} />)}</div></SectionGroup>}

      {weaponDetailSections.length > 0 && <SectionGroup eyebrow="Arsenal" title="Rolls e cores da arma"><div className="grid items-start gap-4 lg:grid-cols-2">{weaponDetailSections.map((section) => <SectionPanel key={section!.type} section={section!} />)}</div></SectionGroup>}

      {externalComponents && <SectionGroup eyebrow="Equipment" title="Componentes externos"><SectionPanel section={externalComponents} /></SectionGroup>}

      {progressionSections.length > 0 && <SectionGroup eyebrow="Endgame" title="Sistemas de progressão"><div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">{progressionSections.map((section) => <SectionPanel key={section!.type} section={section!} />)}</div></SectionGroup>}
    </div>
  );
}

function SectionGroup({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="mt-7"><ColumnTitle eyebrow={eyebrow} title={title} count={0} /><div className="mt-3">{children}</div></section>;
}

function BuildTrait({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"><span className="mr-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan">{label}</span><strong className="text-[13px] text-ink">{value}</strong></div>;
}

function PriorityLegend() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-white/10 bg-panel/70 px-4 py-3 text-[13px] text-muted backdrop-blur-sm">
      <strong className="mr-1 text-ink">Ordem de montagem</strong>
      <LegendItem code="P0" label="essencial" tone="text-fire2" />
      <LegendItem code="P1" label="melhoria importante" tone="text-gold" />
      <LegendItem code="P2" label="otimização final" tone="text-cyan" />
      <LegendItem code="ALT" label="alternativa" tone="text-muted" />
    </div>
  );
}

function LegendItem({ code, label, tone }: { code: string; label: string; tone: string }) {
  return <span className="flex items-center gap-1.5"><b className={`font-mono ${tone}`}>{code}</b><span>{label}</span></span>;
}

function ColumnTitle({ eyebrow, title, count }: { eyebrow: string; title: string; count: number }) {
  return (
    <div className="flex items-end justify-between border-b border-line pb-2">
      <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">{eyebrow}</p><h2 className="text-lg font-semibold uppercase tracking-wider">{title}</h2></div>
      {count > 0 && <span className="font-mono text-[9px] text-muted">{count} seções</span>}
    </div>
  );
}
