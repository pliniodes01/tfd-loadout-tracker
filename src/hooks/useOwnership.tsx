import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type OwnershipState,
  type ItemOwnership,
  loadState,
  saveState,
  getItemOwnership,
  isOwned,
  withItemOwnership,
  withActivator,
  withLevel,
} from "../lib/ownership";

interface OwnershipContextValue {
  state: OwnershipState;
  setState: (next: OwnershipState) => void;
  getItem: (itemId: string) => ItemOwnership;
  isOwned: (itemId: string) => boolean;
  setOwned: (itemId: string, owned: boolean) => void;
  setMaxed: (itemId: string, maxed: boolean) => void;
  setSocketTypeMatches: (itemId: string, matches: boolean) => void;
  setActivator: (target: string, used: boolean) => void;
  setLevel: (target: string, level: number) => void;
}

const OwnershipContext = createContext<OwnershipContextValue | null>(null);

export function OwnershipProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<OwnershipState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  // reflete mudanças feitas em outra aba (mesma origem) quase em tempo real.
  useEffect(() => {
    function onStorage() {
      setStateRaw(loadState());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function setState(next: OwnershipState) {
    setStateRaw(next);
  }

  const value: OwnershipContextValue = {
    state,
    setState,
    getItem: (itemId) => getItemOwnership(state, itemId),
    isOwned: (itemId) => isOwned(state, itemId),
    setOwned: (itemId, owned) => setStateRaw((s) => withItemOwnership(s, itemId, { owned, source: "manual" })),
    setMaxed: (itemId, maxed) => setStateRaw((s) => withItemOwnership(s, itemId, { maxed })),
    setSocketTypeMatches: (itemId, matches) =>
      setStateRaw((s) => withItemOwnership(s, itemId, { socketTypeMatches: matches })),
    setActivator: (target, used) => setStateRaw((s) => withActivator(s, target, used)),
    setLevel: (target, level) => setStateRaw((s) => withLevel(s, target, level)),
  };

  return <OwnershipContext.Provider value={value}>{children}</OwnershipContext.Provider>;
}

export function useOwnership(): OwnershipContextValue {
  const ctx = useContext(OwnershipContext);
  if (!ctx) throw new Error("useOwnership precisa estar dentro de <OwnershipProvider>");
  return ctx;
}
