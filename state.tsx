import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Wallet } from 'ethers';
import { CHAINS, TESTNETS, DEFAULT_CHAIN_ID, applyOverrides, type ChainCfg } from './lib/chains';
import { loadHistory, saveHistory, type HistoryItem } from './lib/history';
import type { Speed } from './lib/mint';

export type Page = 'dashboard' | 'mint' | 'wallet' | 'history' | 'settings';

export interface Settings {
  rpc: Record<string, string>;
  showTestnets: boolean;
  explorerKey: string;
  speed: Speed;
}

export interface Toast {
  id: number;
  kind: 'ok' | 'err' | 'info';
  msg: string;
}

const SETTINGS_KEY = 'fastmint.settings.v1';
const envKey = (import.meta.env.VITE_EXPLORER_API_KEY as string | undefined) ?? '';
const DEFAULTS: Settings = { rpc: {}, showTestnets: true, explorerKey: envKey, speed: 'standard' };

function loadSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
}

interface Ctx {
  page: Page;
  setPage: (p: Page) => void;
  chains: ChainCfg[];
  chain: ChainCfg;
  setChainId: (id: number) => void;
  wallet: Wallet | null;
  setWallet: (w: Wallet | null) => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  history: HistoryItem[];
  upsertHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  toasts: Toast[];
  toast: (kind: Toast['kind'], msg: string) => void;
}

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('AppProvider missing');
  return c;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('dashboard');
  const [chainId, setChainId] = useState<number>(DEFAULT_CHAIN_ID);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const chains = useMemo(
    () => applyOverrides([...CHAINS, ...(settings.showTestnets ? TESTNETS : [])], settings.rpc),
    [settings.rpc, settings.showTestnets],
  );
  const chain = chains.find((c) => c.id === chainId) ?? chains[0];

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => {
      const n = { ...s, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(n));
      return n;
    });
  }, []);

  const upsertHistory = useCallback((item: HistoryItem) => {
    setHistory((h) => {
      const i = h.findIndex((x) => x.id === item.id);
      const n = i >= 0 ? h.map((x, k) => (k === i ? { ...x, ...item } : x)) : [item, ...h];
      saveHistory(n);
      return n;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const toast = useCallback((kind: Toast['kind'], msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000);
  }, []);

  const value: Ctx = { page, setPage, chains, chain, setChainId, wallet, setWallet, settings, updateSettings, history, upsertHistory, clearHistory, toasts, toast };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
