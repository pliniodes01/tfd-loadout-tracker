import { useEffect, useState } from "react";
import { OwnershipProvider } from "./hooks/useOwnership";
import { BuildSelectScreen } from "./screens/BuildSelectScreen";
import { BuildDetailScreen } from "./screens/BuildDetailScreen";
import { ExportImportBar } from "./components/ExportImportBar";
import { Disclaimer } from "./components/Disclaimer";

// Roteamento por hash (#/build/<id>) — funciona em qualquer host estático sem
// precisar de regra de rewrite no servidor.
function parseHash(): string | null {
  const match = window.location.hash.match(/^#\/build\/(.+)$/);
  const id = match?.[1];
  return id ? decodeURIComponent(id) : null;
}

function AppShell() {
  const [buildId, setBuildId] = useState<string | null>(() => parseHash());
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function onHashChange() {
      setBuildId(parseHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function goToBuild(id: string) {
    setTransitioning(true);
    window.setTimeout(() => {
      window.location.hash = `#/build/${encodeURIComponent(id)}`;
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTransitioning(false);
    }, 150);
  }

  function goHome() {
    setTransitioning(true);
    window.setTimeout(() => {
      window.location.hash = "";
      setBuildId(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTransitioning(false);
    }, 150);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/15 bg-[#0a1720db] shadow-[0_8px_30px_#0006] backdrop-blur-xl">
        <div className="mx-auto flex h-[88px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:h-[96px] sm:px-6">
        <button onClick={goHome} className="group flex items-center gap-3.5 text-left" aria-label="Voltar para todas as builds">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-cyan/20 bg-cyan/[0.06] sm:h-14 sm:w-14"><img src="/assets/game/tfd-icon.png" alt="" className="h-9 w-9 object-contain transition-transform group-hover:scale-110 sm:h-11 sm:w-11" /></span>
          <span><img src="/assets/game/tfd-logo.png" alt="The First Descendant" className="h-7 w-auto opacity-95 sm:h-9" /><span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan">Loadout tracker</span></span>
        </button>
        <div className="flex items-center gap-2"><button onClick={goHome} className={`hidden rounded-md px-3 py-2 text-xs transition-colors sm:block ${!buildId ? "bg-white/10 text-ink" : "text-muted hover:bg-white/5 hover:text-ink"}`}>Builds</button><ExportImportBar /></div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6">
      <main className={`transition-all duration-200 ${transitioning ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"}`}>
        {buildId ? (
          <BuildDetailScreen buildId={buildId} onBack={goHome} />
        ) : (
          <BuildSelectScreen onSelect={goToBuild} />
        )}
      </main>

      <Disclaimer />
      </div>
    </div>
  );
}

function LoadingScreen() {
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-bg"><img src="/assets/game/loading-background.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,#05080cf2_72%)]" /><div className="relative text-center"><img src="/assets/game/tfd-logo.png" alt="The First Descendant" className="mx-auto h-9 w-auto" /><p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-cyan">Sincronizando loadouts</p><div className="mx-auto mt-5 h-px w-52 overflow-hidden bg-white/10"><span className="block h-full w-1/2 animate-[loading_0.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan to-transparent" /></div></div></div>;
}

export default function App() {
  return (
    <OwnershipProvider>
      <AppShell />
    </OwnershipProvider>
  );
}
