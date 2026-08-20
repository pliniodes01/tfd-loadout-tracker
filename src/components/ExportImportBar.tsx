import { forwardRef, useEffect, useRef, useState } from "react";
import { useOwnership } from "../hooks/useOwnership";
import { exportState, importState } from "../lib/exportImport";

const FOCUSABLE_SELECTOR = 'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])';

export function ExportImportBar() {
  const { state, setState } = useOwnership();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"export" | "import">("export");
  const [code, setCode] = useState("");
  const [importInput, setImportInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function closeMenu() {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }

  function closeModal() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  async function openExport() {
    setMode("export");
    setError(null);
    setCode(await exportState(state));
    setMenuOpen(false);
    setOpen(true);
  }

  function openImport() {
    setMode("import");
    setError(null);
    setImportInput("");
    setMenuOpen(false);
    setOpen(true);
  }

  async function doImport() {
    try {
      const next = await importState(importInput);
      setState(next);
      closeModal();
      notify("Progresso importado com sucesso.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao importar.");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      notify("Código copiado para a área de transferência.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard indisponível — o textarea já está selecionável.
    }
  }

  // menu: leva o foco pro primeiro item ao abrir; Escape fecha e devolve o foco.
  useEffect(() => {
    if (!menuOpen) return;
    firstMenuItemRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeMenu();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  // modal: leva o foco pro botão de fechar ao abrir; Escape fecha e devolve o foco;
  // Tab/Shift+Tab ficam presos dentro do modal enquanto ele estiver aberto.
  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeModal();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        (el) => !el.hasAttribute("disabled")
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-ink transition-colors hover:border-cyan/40 hover:bg-white/[0.07]"
        >
          <CloudIcon /><span className="hidden sm:inline">Meu progresso</span><span className={`text-[9px] text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}>▼</span>
        </button>
        {menuOpen && (
          <>
            <button aria-label="Fechar menu" tabIndex={-1} onClick={closeMenu} className="fixed inset-0 z-40 cursor-default" />
            <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right animate-[menu-in_160ms_ease-out] rounded-lg border border-white/10 bg-[#0b151ee8] p-2 shadow-2xl backdrop-blur-xl">
              <p className="px-2 pb-2 pt-1 text-[10px] uppercase tracking-[0.16em] text-muted">Gerenciar dados locais</p>
              <MenuButton ref={firstMenuItemRef} icon="↗" title="Exportar progresso" detail="Copiar código de backup" onClick={openExport} />
              <MenuButton icon="↙" title="Importar progresso" detail="Restaurar ou transferir dados" onClick={openImport} />
            </div>
          </>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5 backdrop-blur-sm animate-[fade-in_150ms_ease-out]"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="progress-modal-title"
            className="w-full max-w-lg animate-[modal-in_180ms_ease-out] rounded-xl border border-white/10 bg-[#0b151e] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 id="progress-modal-title" className="text-[13px] font-semibold">
                {mode === "export" ? "Seu progresso, codificado" : "Colar código de progresso"}
              </h3>
              <button
                ref={closeButtonRef}
                onClick={closeModal}
                aria-label="Fechar"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                ✕
              </button>
            </div>

            {mode === "export" ? (
              <>
                <textarea
                  readOnly
                  value={code}
                className="h-32 w-full resize-none rounded-md border border-line bg-bg p-3 font-mono text-[10.5px] text-ink outline-none focus:border-cyan"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={copy}
                  className="mt-3 min-h-11 rounded-md bg-cyan px-4 py-2 text-xs font-semibold text-[#031016] transition-colors hover:bg-white"
                >
                  {copied ? "Copiado." : "Copiar"}
                </button>
              </>
            ) : (
              <>
                <textarea
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="Cole aqui o código que seu amigo mandou"
                  className="h-32 w-full resize-none rounded-md border border-line bg-bg p-3 font-mono text-[10.5px] text-ink outline-none focus:border-cyan"
                />
                {error && <p className="mt-1 text-[11px] text-fire2">{error}</p>}
                <p className="mt-1.5 text-[10.5px] text-muted">
                  Isso substitui o seu progresso atual pelo do código importado.
                </p>
                <button
                  onClick={doImport}
                  className="mt-3 min-h-11 rounded-md bg-fire px-4 py-2 text-xs font-semibold text-[#1b0b02] transition-colors hover:bg-white"
                >
                  Importar e substituir
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[60] flex animate-[toast-in_220ms_ease-out] items-center gap-2 rounded-lg border border-green/30 bg-[#0b1b18ed] px-4 py-3 text-xs text-green shadow-2xl backdrop-blur-xl"><span className="grid h-5 w-5 place-items-center rounded-full bg-green text-[#03140e]">✓</span>{toast}</div>}
    </>
  );
}

const MenuButton = forwardRef<
  HTMLButtonElement,
  { icon: string; title: string; detail: string; onClick: () => void }
>(({ icon, title, detail, onClick }, ref) => (
  <button ref={ref} role="menuitem" onClick={onClick} className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-white/[0.07]">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-bg font-mono text-cyan">{icon}</span>
    <span><strong className="block text-xs">{title}</strong><span className="text-[10px] text-muted">{detail}</span></span>
  </button>
));
MenuButton.displayName = "MenuButton";

function CloudIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 18h10a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.28 8.4 4.8 4.8 0 0 0 7 18Z"/><path d="m9 13 3-3 3 3M12 10v7"/></svg>;
}
