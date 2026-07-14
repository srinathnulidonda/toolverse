// features/finance/gst-reconciliation/reconcileStore.ts
import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { ReconciliationResult } from "./reconcileEngine";

export interface ReconciliationHistoryEntry {
    id: string;
    timestamp: number;
    title: string;
    result: ReconciliationResult;
    period: string;
    tags: string[];
    note?: string;
    resolved?: boolean;
}

export interface ReconciliationSettings {
    autoSave: boolean;
    reminderEnabled: boolean;
    reminderThreshold: number; // Compliance score below which to remind
    defaultPeriodType: "monthly" | "quarterly" | "annual";
    maxHistoryItems: number;
    alertOnExcessITC: boolean;
}

const STORAGE_KEYS = {
    history: "tv:reconcile-history",
    settings: "tv:reconcile-settings",
} as const;

const MAX_HISTORY_ITEMS = 60; // 5 years of monthly data

interface HistoryStorage {
    v: number;
    data: ReconciliationHistoryEntry[];
}

interface SettingsStorage {
    v: number;
    data: ReconciliationSettings;
}

function validateHistory(raw: HistoryStorage | null): ReconciliationHistoryEntry[] {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw) || !Array.isArray(raw.data)) {
        return [];
    }
    
    const valid: ReconciliationHistoryEntry[] = [];
    for (const item of raw.data) {
        if (
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.timestamp === "number" &&
            typeof item.title === "string" &&
            item.result &&
            typeof item.result === "object" &&
            typeof item.period === "string" &&
            Array.isArray(item.tags)
        ) {
            valid.push(item as ReconciliationHistoryEntry);
        }
    }
    
    if (valid.length > MAX_HISTORY_ITEMS) {
        return valid.slice(0, MAX_HISTORY_ITEMS);
    }
    return valid;
}

function validateSettings(raw: SettingsStorage | null): ReconciliationSettings {
    if (!raw || typeof raw !== 'object' || !('v' in raw) || !('data' in raw)) {
        return getDefaultSettings();
    }
    return { ...getDefaultSettings(), ...raw.data };
}

function getDefaultSettings(): ReconciliationSettings {
    return {
        autoSave: true,
        reminderEnabled: true,
        reminderThreshold: 85,
        defaultPeriodType: "monthly",
        maxHistoryItems: 60,
        alertOnExcessITC: true,
    };
}

export function useReconcileStore() {
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

    const addToHistory = (entry: Omit<ReconciliationHistoryEntry, "id">) => {
        if (!settings.autoSave) return;

        const newEntry: ReconciliationHistoryEntry = {
            ...entry,
            id: `recon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            resolved: false,
        };

        setHistoryRaw((prev) => {
            // Check if entry for this period already exists, update it
            const existingIndex = (prev?.data ?? []).findIndex(e => e.period === entry.period);
            
            if (existingIndex !== -1) {
                const newData = [...(prev?.data ?? [])];
                newData[existingIndex] = newEntry;
                return { v: 1, data: newData };
            }
            
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

    const updateEntry = (id: string, updates: Partial<ReconciliationHistoryEntry>) => {
        setHistoryRaw((prev) => ({
            v: 1,
            data: (prev?.data ?? []).map(e =>
                e.id === id ? { ...e, ...updates } : e
            )
        }));
    };

    const markAsResolved = (id: string) => {
        updateEntry(id, { resolved: true });
    };

    const searchHistory = (query: string): ReconciliationHistoryEntry[] => {
        if (!query.trim()) return history;

        const q = query.toLowerCase();
        return history.filter(e =>
            e.title.toLowerCase().includes(q) ||
            e.period.toLowerCase().includes(q) ||
            e.note?.toLowerCase().includes(q) ||
            e.tags.some(t => t.toLowerCase().includes(q))
        );
    };

    const getHistoryByPeriod = (period: string): ReconciliationHistoryEntry | undefined => {
        return history.find(e => e.period === period);
    };

    const getUnresolvedIssues = (): ReconciliationHistoryEntry[] => {
        return history.filter(e => 
            !e.resolved && 
            (Math.abs(e.result.salesVariance) > 0 || 
             Math.abs(e.result.purchaseVariance) > 0 || 
             Math.abs(e.result.itcVariance) > 0)
        );
    };

    const getStatistics = () => {
        const totalEntries = history.length;
        const averageComplianceScore = totalEntries > 0
            ? history.reduce((acc, e) => acc + e.result.complianceScore, 0) / totalEntries
            : 0;
        
        const totalSalesVariance = history.reduce((acc, e) => acc + Math.abs(e.result.salesVariance), 0);
        const totalPurchaseVariance = history.reduce((acc, e) => acc + Math.abs(e.result.purchaseVariance), 0);
        const totalITCVariance = history.reduce((acc, e) => acc + Math.abs(e.result.itcVariance), 0);
        
        const perfectMatches = history.filter(e => 
            e.result.salesVariance === 0 && 
            e.result.purchaseVariance === 0 && 
            e.result.itcVariance === 0
        ).length;

        const excessITCCases = history.filter(e => e.result.itcVariance > 0).length;
        const unresolvedCount = getUnresolvedIssues().length;

        const riskDistribution = history.reduce((acc, e) => {
            acc[e.result.riskLevel] = (acc[e.result.riskLevel] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalEntries,
            averageComplianceScore: parseFloat(averageComplianceScore.toFixed(2)),
            totalSalesVariance: parseFloat(totalSalesVariance.toFixed(2)),
            totalPurchaseVariance: parseFloat(totalPurchaseVariance.toFixed(2)),
            totalITCVariance: parseFloat(totalITCVariance.toFixed(2)),
            perfectMatches,
            perfectMatchRate: totalEntries > 0 ? parseFloat(((perfectMatches / totalEntries) * 100).toFixed(1)) : 0,
            excessITCCases,
            unresolvedCount,
            riskDistribution,
        };
    };

    const getComplianceTrend = (months: number = 6): Array<{ period: string; score: number }> => {
        return history
            .slice(0, months)
            .reverse()
            .map(e => ({
                period: e.period,
                score: e.result.complianceScore,
            }));
    };

    const getReminders = (): Array<{
        entry: ReconciliationHistoryEntry;
        message: string;
        severity: "info" | "warning" | "error";
    }> => {
        if (!settings.reminderEnabled) return [];

        const reminders: Array<{
            entry: ReconciliationHistoryEntry;
            message: string;
            severity: "info" | "warning" | "error";
        }> = [];

        history.forEach(entry => {
            if (entry.resolved) return;

            if (entry.result.itcVariance > 0 && settings.alertOnExcessITC) {
                reminders.push({
                    entry,
                    message: `Excess ITC of ₹${entry.result.itcVariance.toLocaleString()} needs correction for ${entry.period}`,
                    severity: "error",
                });
            } else if (entry.result.complianceScore < settings.reminderThreshold) {
                reminders.push({
                    entry,
                    message: `Low compliance score (${entry.result.complianceScore}%) for ${entry.period} needs review`,
                    severity: "warning",
                });
            }
        });

        return reminders.sort((a, b) => b.entry.timestamp - a.entry.timestamp);
    };

    const updateSettings = (updates: Partial<ReconciliationSettings>) => {
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
            "Period",
            "Sales Books",
            "Sales GSTR-1",
            "Sales Variance",
            "Purchase Books",
            "Purchase GSTR-2A",
            "Purchase Variance",
            "ITC Claimed",
            "ITC Available",
            "ITC Variance",
            "Compliance Score",
            "Risk Level",
            "Resolved"
        ];
        
        const rows = history.map(e => [
            e.period,
            e.result.details.sales.books,
            e.result.details.sales.gstr1,
            e.result.salesVariance,
            e.result.details.purchases.books,
            e.result.details.purchases.gstr2a,
            e.result.purchaseVariance,
            e.result.details.itc.claimed,
            e.result.details.itc.available,
            e.result.itcVariance,
            e.result.complianceScore,
            e.result.riskLevel,
            e.resolved ? "Yes" : "No",
        ]);

        return [headers, ...rows]
            .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    // Get year-over-year comparison
    const getYearlyComparison = (year: string): {
        months: Array<{ month: string; score: number; variance: number }>;
        totalVariance: number;
        averageScore: number;
    } => {
        const yearEntries = history.filter(e => e.period.startsWith(year));
        
        const months = yearEntries.map(e => ({
            month: e.period.split('-')[1],
            score: e.result.complianceScore,
            variance: Math.abs(e.result.salesVariance) + Math.abs(e.result.purchaseVariance) + Math.abs(e.result.itcVariance),
        }));

        const totalVariance = months.reduce((sum, m) => sum + m.variance, 0);
        const averageScore = months.length > 0 
            ? months.reduce((sum, m) => sum + m.score, 0) / months.length 
            : 0;

        return {
            months,
            totalVariance: parseFloat(totalVariance.toFixed(2)),
            averageScore: parseFloat(averageScore.toFixed(2)),
        };
    };

    return {
        history,
        settings,
        addToHistory,
        removeFromHistory,
        clearHistory,
        updateEntry,
        markAsResolved,
        searchHistory,
        getHistoryByPeriod,
        getUnresolvedIssues,
        getStatistics,
        getComplianceTrend,
        getReminders,
        updateSettings,
        resetSettings,
        exportHistory,
        getYearlyComparison,
    };
}

function deepEqual(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}