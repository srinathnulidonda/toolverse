// features/dev/js-minifier/ts/jsStore.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MinifyOptions, MinifyResult } from "./jsEngine";

export interface HistoryEntry {
  id: string;
  title: string;
  input: string;
  result: MinifyResult;
  options: MinifyOptions;
  timestamp: number;
  isFavorite: boolean;
  tags: string[];
}

export interface JSSettings {
  autoSave: boolean;
  maxHistory: number;
  defaultMode: string;
}

interface AddHistoryPayload {
  title: string;
  input: string;
  result: MinifyResult;
  options: MinifyOptions;
  isFavorite: boolean;
  tags: string[];
}

interface JSStoreState {
  history: HistoryEntry[];
  settings: JSSettings;
  addToHistory: (entry: AddHistoryPayload) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (id: string) => void;
  updateSettings: (settings: Partial<JSSettings>) => void;
}

const STORAGE_KEY = "js-minifier-store";

const DEFAULT_SETTINGS: JSSettings = {
  autoSave: true,
  maxHistory: 50,
  defaultMode: "minify",
};

const DEFAULT_STATE = {
  history: [] as HistoryEntry[],
  settings: DEFAULT_SETTINGS,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): typeof DEFAULT_STATE {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      history: Array.isArray(parsed.history) ? parsed.history : [],
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveToStorage(state: typeof DEFAULT_STATE): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable */
  }
}

type Listener = () => void;

let storeHistory: HistoryEntry[] = DEFAULT_STATE.history;
let storeSettings: JSSettings = DEFAULT_STATE.settings;
let initialized = false;
const listeners = new Set<Listener>();

function initStore(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const saved = loadFromStorage();
  storeHistory = saved.history;
  storeSettings = saved.settings;
}

function notify(): void {
  listeners.forEach((l) => l());
}

function persist(): void {
  saveToStorage({ history: storeHistory, settings: storeSettings });
}

const storeActions = {
  addToHistory(payload: AddHistoryPayload): void {
    const entry: HistoryEntry = {
      id: generateId(),
      title: payload.title,
      input: payload.input,
      result: payload.result,
      options: payload.options,
      timestamp: Date.now(),
      isFavorite: payload.isFavorite,
      tags: payload.tags,
    };

    const deduped = storeHistory.filter(
      (h) =>
        h.input !== payload.input ||
        h.options.mode !== payload.options.mode
    );

    storeHistory = [entry, ...deduped].slice(0, storeSettings.maxHistory);
    persist();
    notify();
  },

  removeFromHistory(id: string): void {
    storeHistory = storeHistory.filter((h) => h.id !== id);
    persist();
    notify();
  },

  clearHistory(): void {
    storeHistory = [];
    persist();
    notify();
  },

  toggleFavorite(id: string): void {
    storeHistory = storeHistory.map((h) =>
      h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
    );
    persist();
    notify();
  },

  updateSettings(newSettings: Partial<JSSettings>): void {
    storeSettings = { ...storeSettings, ...newSettings };
    persist();
    notify();
  },
};

export function useJSStore(): JSStoreState {
  initStore();

  const [, rerender] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const listener: Listener = () => {
      if (mountedRef.current) {
        rerender((n) => n + 1);
      }
    };

    listeners.add(listener);

    return () => {
      mountedRef.current = false;
      listeners.delete(listener);
    };
  }, []);

  const addToHistory = useCallback(
    (payload: AddHistoryPayload) => storeActions.addToHistory(payload),
    []
  );

  const removeFromHistory = useCallback(
    (id: string) => storeActions.removeFromHistory(id),
    []
  );

  const clearHistory = useCallback(() => storeActions.clearHistory(), []);

  const toggleFavorite = useCallback(
    (id: string) => storeActions.toggleFavorite(id),
    []
  );

  const updateSettings = useCallback(
    (s: Partial<JSSettings>) => storeActions.updateSettings(s),
    []
  );

  return {
    history: storeHistory,
    settings: storeSettings,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    updateSettings,
  };
}