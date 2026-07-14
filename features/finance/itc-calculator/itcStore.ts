// features/finance/itc-calculator/itcStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { ITCCalculation, ITCOptions } from "./itcEngine";

export interface ITCHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    calculation: ITCCalculation;
    options: ITCOptions;
    purchaseAmount: number;
    tags: string[];
    note?: string;
    period?: string;
}

export interface ITCSettings {
    defaultOptions: ITCOptions;
    autoSave: boolean;
    defaultBusinessType: "manufacturing" | "trading" | "services" | "other";
    showAdvanced: boolean;
    reminderDays: number; // Remind to utilize ITC before expiry
    maxHistoryItems: number;
}

const STORAGE_KEYS = {
    history: "tv:itc-history",
    settings: "tv:itc-settings",
} as const;

const MAX_HISTORY_ITEMS = 50;

interface HistoryStorage {
    v: number;
    data: ITCHistoryEntry[];
}

interface SettingsStorage {
    v: number;
    data: ITCSettings;
}

function validateHistory(raw: HistoryStorage | null): ITCHistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    
    const valid: ITCHistoryEntry[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.timestamp === "number" &&
            typeof item.title === "string" &&
            item.calculation &&
            typeof item.calculation === "object" &&
            item.options &&
            typeof item.options === "object" &&
            typeof item.purchaseAmount === "number" &&
            Array.isArray(item.tags)
        ) {
            valid.push(item as ITCHistoryEntry);
        }
    }
    
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

function validateSettings(raw: SettingsStorage | null): ITCSettings {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw)) {
        return getDefaultSettings();
    }
    return { ...getDefaultSettings(), ...raw.data };
}

function getDefaultSettings(): ITCSettings {
    return {
        defaultOptions: {
            gstRate: 18,
            blockedAmount: 0,
            reversedAmount: 0,
            utilizedAmount: 0,
            period: "monthly",
        },
        autoSave: true,
        defaultBusinessType: "trading",
        showAdvanced: false,
        reminderDays: 30,
        maxHistoryItems: 50,
    };
}

export function useITCStore() {
    const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>(
        STORAGE_KEYS.history,
        { v: 1, data: [] }
    );
    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(
        STORAGE_KEYS.settings,
        { v: 1, data: getDefaultSettings() }
    );

    const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);
    const settings = useMemo(() => validateSettings(settingsRaw), [settingsRaw]);

    useEffect(() => {
        if (!deepEqual(history, historyRaw?.data)) {
            setHistoryRaw({ v: 1, data: history });
        }
    }, [history, historyRaw]);

    useEffect(() => {
        if (!deepEqual(settings, settingsRaw?.data)) {
            setSettingsRaw({ v: 1, data: settings });
        }
    }, [settings, settingsRaw]);

    const addToHistory = (entry: Omit<ITCHistoryEntry, "id">) => {
        if (!settings.autoSave) return;

        const newEntry: ITCHistoryEntry = {
            ...entry,
            id: `itc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        setHistoryRaw((prev) => {
            const newData = [newEntry, ...(prev?.data ?? [])].slice(0, settings.maxHistoryItems);
            return { v: 1, data: newData };
        });
    };

    const removeFromHistory = (id: string) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).filter(e => e.id !== id)
        }));
    };

    const clearHistory = () => {
        setHistoryRaw({ v: 1, data: [] });
    };

    const updateEntry = (id: string, updates: Partial<ITCHistoryEntry>) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(e =>
                e.id === id ? { ...e, ...updates } : e
            )
        }));
    };

    const searchHistory = (query: string): ITCHistoryEntry[] => {
        if (!query.trim()) return history;

        const q = query.toLowerCase();
        return history.filter(e =>
            e.title.toLowerCase().includes(q) ||
            e.note?.toLowerCase().includes(q) ||
            e.tags.some(t => t.toLowerCase().includes(q)) ||
            e.period?.toLowerCase().includes(q)
        );
    };

    const getHistoryByPeriod = (period: ITCOptions["period"]): ITCHistoryEntry[] => {
        return history.filter(e => e.options.period === period);
    };

    const getStatistics = () => {
        const totalEntries = history.length;
        const totalITCClaimed = history.reduce((acc, e) => acc + e.calculation.eligibleITC, 0);
        const totalITCUtilized = history.reduce((acc, e) => acc + e.calculation.itcUtilized, 0);
        const totalITCBalance = history.reduce((acc, e) => acc + e.calculation.itcBalance, 0);
        const averageITCRate = totalEntries > 0 ? 
            history.reduce((acc, e) => acc + ((e.calculation.totalITC / e.purchaseAmount) * 100), 0) / totalEntries : 0;

        const periodUsage = history.reduce((acc, e) => {
            acc[e.options.period] = (acc[e.options.period] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const gstRateUsage = history.reduce((acc, e) => {
            const rate = e.options.gstRate;
            acc[rate] = (acc[rate] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        // Calculate blocked ITC percentage
        const totalGSTPaid = history.reduce((acc, e) => acc + e.calculation.totalITC, 0);
        const totalBlocked = history.reduce((acc, e) => acc + e.calculation.blockedITC, 0);
        const blockedPercentage = totalGSTPaid > 0 ? (totalBlocked / totalGSTPaid) * 100 : 0;

        // Calculate utilization efficiency
        const utilizationRate = totalITCClaimed > 0 ? (totalITCUtilized / totalITCClaimed) * 100 : 0;

        return {
            totalEntries,
            totalITCClaimed,
            totalITCUtilized,
            totalITCBalance,
            averageITCRate: parseFloat(averageITCRate.toFixed(2)),
            blockedPercentage: parseFloat(blockedPercentage.toFixed(2)),
            utilizationRate: parseFloat(utilizationRate.toFixed(2)),
            periodUsage,
            gstRateUsage,
            mostUsedPeriod: Object.entries(periodUsage).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
            mostUsedGSTRate: Object.entries(gstRateUsage).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
        };
    };

    const updateSettings = (updates: Partial<ITCSettings>) => {
        setSettingsRaw((prev) => ({
            v: 1,
            data: { ...(prev?.data ?? getDefaultSettings()), ...updates }
        }));
    };

    const resetSettings = () => {
        setSettingsRaw({ v: 1, data: getDefaultSettings() });
    };

    const exportHistory = (format: "json" | "csv") => {
        if (format === "json") return JSON.stringify(history, null, 2);

        const headers = [
            "Date",
            "Title", 
            "Period",
            "Purchase Amount",
            "GST Rate (%)",
            "Total ITC",
            "Blocked ITC",
            "Eligible ITC",
            "ITC Utilized",
            "ITC Balance"
        ];
        
        const rows = history.map(e => [
            new Date(e.timestamp).toISOString().split('T')[0],
            e.title,
            e.options.period,
            e.purchaseAmount,
            e.options.gstRate,
            e.calculation.totalITC,
            e.calculation.blockedITC,
            e.calculation.eligibleITC,
            e.calculation.itcUtilized,
            e.calculation.itcBalance,
        ]);

        return [headers, ...rows]
            .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    // Get ITC reminders (entries with high unused balance)
    const getITCReminders = (): Array<{
        entry: ITCHistoryEntry;
        daysOld: number;
        reminder: string;
    }> => {
        const now = Date.now();
        return history
            .filter(e => e.calculation.itcBalance > 1000) // Only significant balances
            .map(e => {
                const daysOld = Math.floor((now - e.timestamp) / (1000 * 60 * 60 * 24));
                let reminder = "";
                
                if (daysOld > settings.reminderDays) {
                    reminder = `Unused ITC balance of ₹${e.calculation.itcBalance.toLocaleString()} from ${daysOld} days ago`;
                }
                
                return { entry: e, daysOld, reminder };
            })
            .filter(r => r.reminder)
            .sort((a, b) => b.daysOld - a.daysOld);
    };

    // Get monthly summary for current period
    const getMonthlySummary = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyEntries = history.filter(e => {
            const entryDate = new Date(e.timestamp);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });

        const totalPurchases = monthlyEntries.reduce((acc, e) => acc + e.purchaseAmount, 0);
        const totalITC = monthlyEntries.reduce((acc, e) => acc + e.calculation.eligibleITC, 0);
        const totalUtilized = monthlyEntries.reduce((acc, e) => acc + e.calculation.itcUtilized, 0);
        const totalBalance = monthlyEntries.reduce((acc, e) => acc + e.calculation.itcBalance, 0);

        return {
            entries: monthlyEntries.length,
            totalPurchases,
            totalITC,
            totalUtilized,
            totalBalance,
            utilizationRate: totalITC > 0 ? (totalUtilized / totalITC) * 100 : 0,
        };
    };

    return {
        history,
        settings,
        addToHistory,
        removeFromHistory,
        clearHistory,
        updateEntry,
        searchHistory,
        getHistoryByPeriod,
        getStatistics,
        updateSettings,
        resetSettings,
        exportHistory,
        getITCReminders,
        getMonthlySummary,
    };
}

function deepEqual(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}