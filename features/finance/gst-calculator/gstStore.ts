import { logger } from "@/lib/logger";
// features/finance/gst-calculator/gstStore.ts
import { useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import { DEFAULT_GST_OPTIONS } from "./gstEngine";
import type { GSTCalculation, GSTOptions, GSTInvoice } from "./gstEngine";

export interface GSTHistoryEntry {
  id: string;
  timestamp: number;
  title: string;
  type: "simple" | "bulk" | "itc" | "composition";
  calculation?: GSTCalculation;
  invoice?: GSTInvoice;
  options: GSTOptions;
  isFavorite: boolean;
  tags: string[];
  note?: string;
  customerName?: string;
}

export interface GSTSettings {
  defaultOptions: GSTOptions;
  currency: string;
  autoSave: boolean;
  defaultGSTIN?: string;
  companyName?: string;
  companyAddress?: string;
  showBreakdown: boolean;
  enableNotifications: boolean;
  maxHistoryItems: number;
  invoicePrefix: string;
  invoiceNumberStart: number;
}

const STORAGE_KEYS = {
  history: "tv:gst-history",
  settings: "tv:gst-settings",
} as const;

interface HistoryStorage {
  v: number;
  data: GSTHistoryEntry[];
}

interface SettingsStorage {
  v: number;
  data: GSTSettings;
}

function getDefaultSettings(): GSTSettings {
  return {
    defaultOptions: DEFAULT_GST_OPTIONS,
    currency: "INR",
    autoSave: true,
    showBreakdown: true,
    enableNotifications: false,
    maxHistoryItems: 100,
    invoicePrefix: "INV",
    invoiceNumberStart: 1,
  };
}

function validateHistory(raw: HistoryStorage | null, maxItems: number): GSTHistoryEntry[] {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("v" in raw) ||
    !("data" in raw) ||
    !Array.isArray(raw.data)
  ) {
    return [];
  }
  const valid: GSTHistoryEntry[] = [];
  const invalid: any[] = [];

  for (const item of raw.data) {
    if (
      item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.timestamp === "number" &&
      typeof item.title === "string" &&
      typeof item.type === "string" &&
      item.options &&
      typeof item.options === "object" &&
      Array.isArray(item.tags) &&
      typeof item.isFavorite === "boolean"
    ) {
      if (item.calculation) {
        const c = item.calculation;
        if (
          typeof c.originalAmount !== "number" ||
          typeof c.gstRate !== "number" ||
          typeof c.gstAmount !== "number" ||
          typeof c.finalAmount !== "number" ||
          !isFinite(c.originalAmount) ||
          !isFinite(c.gstAmount) ||
          !isFinite(c.finalAmount)
        ) {
          invalid.push(item);
          continue;
        }
      }

      if (item.invoice) {
        const inv = item.invoice;
        if (
          typeof inv.invoiceNumber !== "string" ||
          typeof inv.grandTotal !== "number" ||
          !Array.isArray(inv.items) ||
          !isFinite(inv.grandTotal)
        ) {
          invalid.push(item);
          continue;
        }
      }

      valid.push(item as GSTHistoryEntry);
    } else {
      invalid.push(item);
    }
  }

  if (
    invalid.length > 0 &&
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    logger.warn(
      `Filtered out ${invalid.length} invalid GST history entries. They will be removed from storage.`
    );
  }

  if (valid.length > maxItems) {
    return valid.slice(0, maxItems);
  }
  return valid;
}

function validateSettings(raw: SettingsStorage | null): GSTSettings {
  if (!raw || typeof raw !== "object" || !("v" in raw) || !("data" in raw)) {
    return getDefaultSettings();
  }
  return { ...getDefaultSettings(), ...raw.data };
}

/**
 * Generate a unique ID for history entries
 */
function generateEntryId(): string {
  return `gst_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Helper to escape CSV cell content
 */
function escapeCSVCell(cell: any): string {
  return `"${String(cell).replace(/"/g, '""')}"`;
}

export function useGSTStore() {
  const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(STORAGE_KEYS.history, {
    v: 1,
    data: [],
  });
  const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(STORAGE_KEYS.settings, {
    v: 1,
    data: getDefaultSettings(),
  });

  const settings = useMemo(() => validateSettings(settingsRaw), [settingsRaw]);
  const history = useMemo(
    () => validateHistory(historyRaw, settings.maxHistoryItems),
    [historyRaw, settings.maxHistoryItems]
  );

  const saveToHistory = useCallback(
    (entry: Omit<GSTHistoryEntry, "id" | "timestamp">) => {
      if (!settings.autoSave) return;

      const newEntry: GSTHistoryEntry = {
        ...entry,
        id: generateEntryId(),
        timestamp: Date.now(),
      };

      setHistoryRaw((prev) => {
        const newData = [newEntry, ...(prev?.data ?? [])].slice(0, settings.maxHistoryItems);
        return { v: 1, data: newData };
      });
    },
    [settings.autoSave, settings.maxHistoryItems, setHistoryRaw]
  );

  const removeFromHistory = useCallback(
    (id: string) => {
      setHistoryRaw((prev) => ({
        v: 1,
        data: (prev?.data ?? []).filter((e) => e.id !== id),
      }));
    },
    [setHistoryRaw]
  );

  const clearHistory = useCallback(() => {
    setHistoryRaw({ v: 1, data: [] });
  }, [setHistoryRaw]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setHistoryRaw((prev) => ({
        v: 1,
        data: (prev?.data ?? []).map((e) =>
          e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
        ),
      }));
    },
    [setHistoryRaw]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<GSTHistoryEntry>) => {
      setHistoryRaw((prev) => ({
        v: 1,
        data: (prev?.data ?? []).map((e) => (e.id === id ? { ...e, ...updates } : e)),
      }));
    },
    [setHistoryRaw]
  );

  const searchHistory = useCallback(
    (query: string): GSTHistoryEntry[] => {
      if (!query.trim()) return history;

      const q = query.toLowerCase();
      return history.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.customerName?.toLowerCase().includes(q) ||
          e.note?.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    },
    [history]
  );

  const getFavorites = useCallback(() => history.filter((e) => e.isFavorite), [history]);

  const getStatistics = useCallback(() => {
    const totalEntries = history.length;
    const favoriteCount = history.filter((e) => e.isFavorite).length;
    const totalGSTCalculated = history.reduce(
      (acc, e) => acc + (e.calculation?.gstAmount || 0) + (e.invoice?.totalGST || 0),
      0
    );
    const averageGST = totalEntries > 0 ? totalGSTCalculated / totalEntries : 0;

    const typeUsage = history.reduce(
      (acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const rateUsage = history.reduce(
      (acc, e) => {
        const rate = e.options.gstRate;
        acc[rate] = (acc[rate] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const mostUsedRateEntry = Object.entries(rateUsage).sort(([, a], [, b]) => b - a)[0];
    const mostUsedRate = mostUsedRateEntry ? Number(mostUsedRateEntry[0]) : null;

    return {
      totalEntries,
      favoriteCount,
      totalGSTCalculated,
      averageGST,
      typeUsage,
      rateUsage,
      mostUsedRate,
    };
  }, [history]);

  const updateSettings = useCallback(
    (updates: Partial<GSTSettings>) => {
      setSettingsRaw((prev) => ({
        v: 1,
        data: { ...(prev?.data ?? getDefaultSettings()), ...updates },
      }));
    },
    [setSettingsRaw]
  );

  const resetSettings = useCallback(() => {
    setSettingsRaw({ v: 1, data: getDefaultSettings() });
  }, [setSettingsRaw]);

  const exportHistory = useCallback(
    (format: "json" | "csv") => {
      if (format === "json") return JSON.stringify(history, null, 2);

      const headers = [
        "Date",
        "Title",
        "Type",
        "GST Amount",
        "Total Amount",
        "Customer",
        "Favorite",
      ];
      const rows = history.map((e) => [
        new Date(e.timestamp).toISOString(),
        e.title,
        e.type,
        e.calculation?.gstAmount || e.invoice?.totalGST || 0,
        e.calculation?.finalAmount || e.invoice?.grandTotal || 0,
        e.customerName || "-",
        e.isFavorite ? "Yes" : "No",
      ]);

      return [headers, ...rows].map((row) => row.map(escapeCSVCell).join(",")).join("\n");
    },
    [history]
  );

  const getNextInvoiceNumber = useCallback(() => {
    const lastInvoice = history
      .filter((e) => e.type === "bulk" && e.invoice)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (lastInvoice?.invoice?.invoiceNumber) {
      const match = lastInvoice.invoice.invoiceNumber.match(/\d+$/);
      if (match) {
        const lastNumber = parseInt(match[0]);
        return `${settings.invoicePrefix}-${String(lastNumber + 1).padStart(4, "0")}`;
      }
    }

    return `${settings.invoicePrefix}-${String(settings.invoiceNumberStart).padStart(4, "0")}`;
  }, [history, settings.invoicePrefix, settings.invoiceNumberStart]);

  return {
    history,
    settings,
    saveToHistory,
    removeFromHistory,
    clearHistory,
    toggleFavorite,
    updateEntry,
    searchHistory,
    getFavorites,
    getStatistics,
    updateSettings,
    resetSettings,
    exportHistory,
    getNextInvoiceNumber,
  };
}
