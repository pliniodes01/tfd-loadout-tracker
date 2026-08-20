export function Disclaimer() {
  return (
    <footer className="mt-14 border-t border-white/10 py-7 text-[11px] leading-relaxed text-muted">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><img src="/assets/game/tfd-icon.png" alt="" className="h-8 w-8 opacity-70" /><p className="max-w-3xl">Dados baseados na <span className="text-ink">NEXON Open API</span>. Projeto não-oficial, sem afiliação com a NEXON Korea Corp. Nomes, imagens e marcas pertencem aos respectivos proprietários.</p></div><p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em]">Feito por <span className="text-cyan">pliniodes</span></p></div>
    </footer>
  );
}
