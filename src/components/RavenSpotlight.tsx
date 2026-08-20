import type { HotBuildEntry } from "../lib/community";
import { CommunityStatusBadge } from "./CommunityStatusBadge";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { EvidenceSummary } from "./EvidenceSummary";

/**
 * Área editorial dedicada à Raven. Imagem oficial (banner do patch notes da Nexon,
 * baixada e guardada localmente — ver public/assets/characters-hd/raven-official-banner.jpg).
 * Formato de banner, não de retrato — por isso o layout aqui é diferente do
 * HotBuildCard normal, não força um recorte que não existe na fonte.
 */
export function RavenSpotlight({ entry }: { entry: HotBuildEntry }) {
  const goalAchieved = entry.goalAchieved ?? true;

  return (
    <section className="overflow-hidden rounded-2xl border border-purple/30 bg-gradient-to-br from-[#1b1030] via-[#0f0f1c] to-[#0b1520] shadow-2xl">
      <div className="relative h-40 overflow-hidden sm:h-52">
        <img
          src="/assets/characters-hd/raven-official-banner.jpg"
          alt="Raven, nova Descendant da Season 4 — banner oficial da Nexon"
          className="absolute inset-0 h-full w-full object-cover object-[78%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1520] via-[#0b152040] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1520cc] via-transparent to-transparent" />
      </div>

      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-purple">Raven chegou com a Season 4</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Descendant nova · patch 1.4.0</h2>
          <div className="mt-4">
            <CommunityStatusBadge status={entry.communityStatus} showDescription />
          </div>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{entry.hotReason}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <ConfidenceIndicator confidence={entry.confidence} />
            <span className="text-[12px] text-muted">última verificação: {entry.lastVerifiedAt}</span>
          </div>

          {!goalAchieved && (
            <div className="mt-5 rounded-lg border border-purple/25 bg-purple/[0.06] px-3.5 py-3 text-[13px] leading-relaxed text-ink">
              <strong className="text-purple">Objetivo de build completa ainda não alcançado.</strong> Temos o kit oficial
              confirmado pela própria Nexon (skills, módulos Transcendent, farm), mas nenhuma configuração de módulos + arma +
              reator + componentes pôde ser aberta e conferida item a item por este projeto até agora. Nada foi inventado pra
              fechar essa lacuna — assim que existir uma fonte verificável, ela entra aqui sem precisar mudar esta página.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-purple/20 bg-black/20 p-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-purple">Kit oficial (Nexon)</h3>
          <dl className="mt-2 grid gap-2 text-[13px] leading-snug text-muted">
            <div><dt className="inline font-semibold text-ink">Elemento — </dt><dd className="inline">Non-Attribute Fusion</dd></div>
            <div><dt className="inline font-semibold text-ink">Passiva — </dt><dd className="inline">Queen of Darkness</dd></div>
            <div><dt className="inline font-semibold text-ink">Skill 1 — </dt><dd className="inline">Shadow Shot</dd></div>
            <div><dt className="inline font-semibold text-ink">Skill 2 — </dt><dd className="inline">Raven Feather</dd></div>
            <div><dt className="inline font-semibold text-ink">Skill 3 — </dt><dd className="inline">Shadow Step</dd></div>
            <div><dt className="inline font-semibold text-ink">Skill 4 — </dt><dd className="inline">Vendetta</dd></div>
            <div><dt className="inline font-semibold text-ink">Módulos Transcendent — </dt><dd className="inline">Nightfall (foco em skill/área) e Law of the Back Alley (libera todas as armas de fogo)</dd></div>
            <div><dt className="inline font-semibold text-ink">Farm — </dt><dd className="inline">Legion Laboratory ou Sigma Sector: Isolated Desert (Alto risco)</dd></div>
          </dl>
        </div>
      </div>

      <div className="border-t border-purple/20 bg-black/20 p-6 sm:p-8">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">Fontes conferidas (evidência validada)</h3>
        <div className="mt-3">
          <EvidenceSummary evidence={entry.evidence} />
        </div>

        {entry.complementaryLinks && entry.complementaryLinks.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">Leitura complementar (não conferida)</h3>
            <ul className="mt-2 grid gap-2">
              {entry.complementaryLinks.map((link) => (
                <li key={link.url} className="rounded-lg border border-dashed border-line bg-panel/40 p-3 text-[13px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-ink">{link.source}</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">
                      abrir link ↗
                    </a>
                  </div>
                  <p className="mt-1 text-muted">{link.note}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
