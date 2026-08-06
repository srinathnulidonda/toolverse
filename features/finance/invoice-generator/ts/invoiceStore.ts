// features/finance/invoice-generator/ts/invoiceStore.ts

import { logger } from "@/lib/logger";
import { useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type { InvoiceData } from "./invoiceEngine";

export interface SavedInvoice {
    id: string;
    timestamp: number;
    invoice: InvoiceData;
    isFavorite: boolean;
    tags: string[];
}

export interface CompanyProfile {
    id: string;
    name: string;
    businessName: string;
    address: string;
    gstin: string;
    email: string;
    phone: string;
    logo?: string;
    isDefault: boolean;
}

export interface SavedClient {
    id: string;
    name: string;
    address: string;
    gstin: string;
    email: string;
    phone: string;
    lastUsed: number;
}

export interface InvoiceSettings {
    autoSave: boolean;
    maxSavedInvoices: number;
    defaultCurrency: "INR" | "USD" | "EUR" | "GBP";
    lastInvoiceNumber: string;
}

const STORAGE_KEYS = {
    invoices: "tv:invoices",
    companyProfiles: "tv:company-profiles",
    clients: "tv:saved-clients",
    settings: "tv:invoice-settings",
} as const;

interface InvoicesStorage {
    v: number;
    data: SavedInvoice[];
}

interface CompanyProfilesStorage {
    v: number;
    data: CompanyProfile[];
}

interface ClientsStorage {
    v: number;
    data: SavedClient[];
}

interface SettingsStorage {
    v: number;
    data: InvoiceSettings;
}

function getDefaultSettings(): InvoiceSettings {
    return {
        autoSave: true,
        maxSavedInvoices: 100,
        defaultCurrency: "INR",
        lastInvoiceNumber: "INV-0000",
    };
}

function isValidSavedInvoice(item: any): item is SavedInvoice {
    if (!item || typeof item !== "object") return false;

    if (
        typeof item.id !== "string" ||
        typeof item.timestamp !== "number" ||
        typeof item.isFavorite !== "boolean" ||
        !Array.isArray(item.tags)
    ) {
        return false;
    }

    if (!item.invoice || typeof item.invoice !== "object") return false;
    const inv = item.invoice;

    if (
        typeof inv.invoiceNumber !== "string" ||
        typeof inv.invoiceDate !== "string" ||
        typeof inv.currency !== "string" ||
        !Array.isArray(inv.lineItems)
    ) {
        return false;
    }

    return true;
}

function isValidCompanyProfile(item: any): item is CompanyProfile {
    if (!item || typeof item !== "object") return false;

    return (
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.businessName === "string" &&
        typeof item.address === "string" &&
        typeof item.email === "string" &&
        typeof item.isDefault === "boolean"
    );
}

function isValidSavedClient(item: any): item is SavedClient {
    if (!item || typeof item !== "object") return false;

    return (
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.address === "string" &&
        typeof item.lastUsed === "number"
    );
}

function validateInvoices(raw: InvoicesStorage | null, maxItems: number): SavedInvoice[] {
    if (
        !raw ||
        typeof raw !== "object" ||
        !("v" in raw) ||
        !("data" in raw) ||
        !Array.isArray(raw.data)
    ) {
        return [];
    }

    const valid: SavedInvoice[] = [];
    const invalid: any[] = [];

    for (const item of raw.data) {
        if (isValidSavedInvoice(item)) {
            valid.push(item);
        } else {
            invalid.push(item);
        }
    }

    if (invalid.length > 0 && process.env.NODE_ENV === "development") {
        logger.warn(`Filtered out ${invalid.length} invalid saved invoices`);
    }

    valid.sort((a, b) => b.timestamp - a.timestamp);

    if (valid.length > maxItems) {
        return valid.slice(0, maxItems);
    }

    return valid;
}

function validateCompanyProfiles(raw: CompanyProfilesStorage | null): CompanyProfile[] {
    if (
        !raw ||
        typeof raw !== "object" ||
        !("v" in raw) ||
        !("data" in raw) ||
        !Array.isArray(raw.data)
    ) {
        return [];
    }

    const valid: CompanyProfile[] = [];
    const invalid: any[] = [];

    for (const item of raw.data) {
        if (isValidCompanyProfile(item)) {
            valid.push(item);
        } else {
            invalid.push(item);
        }
    }

    if (invalid.length > 0 && process.env.NODE_ENV === "development") {
        logger.warn(`Filtered out ${invalid.length} invalid company profiles`);
    }

    return valid;
}

function validateClients(raw: ClientsStorage | null): SavedClient[] {
    if (
        !raw ||
        typeof raw !== "object" ||
        !("v" in raw) ||
        !("data" in raw) ||
        !Array.isArray(raw.data)
    ) {
        return [];
    }

    const valid: SavedClient[] = [];
    const invalid: any[] = [];

    for (const item of raw.data) {
        if (isValidSavedClient(item)) {
            valid.push(item);
        } else {
            invalid.push(item);
        }
    }

    if (invalid.length > 0 && process.env.NODE_ENV === "development") {
        logger.warn(`Filtered out ${invalid.length} invalid saved clients`);
    }

    valid.sort((a, b) => b.lastUsed - a.lastUsed);

    return valid;
}

function validateSettings(raw: SettingsStorage | null): InvoiceSettings {
    const defaults = getDefaultSettings();

    if (!raw || typeof raw !== "object" || !("v" in raw) || !("data" in raw)) {
        return defaults;
    }

    return {
        autoSave: typeof raw.data.autoSave === "boolean" ? raw.data.autoSave : defaults.autoSave,
        maxSavedInvoices:
            typeof raw.data.maxSavedInvoices === "number" && raw.data.maxSavedInvoices > 0
                ? Math.min(raw.data.maxSavedInvoices, 500)
                : defaults.maxSavedInvoices,
        defaultCurrency: raw.data.defaultCurrency || defaults.defaultCurrency,
        lastInvoiceNumber: raw.data.lastInvoiceNumber || defaults.lastInvoiceNumber,
    };
}

function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function useInvoiceStore() {
    const [invoicesRaw, setInvoicesRaw] = useLocalStorage<InvoicesStorage>(STORAGE_KEYS.invoices, {
        v: 1,
        data: [],
    });

    const [companyProfilesRaw, setCompanyProfilesRaw] = useLocalStorage<CompanyProfilesStorage>(
        STORAGE_KEYS.companyProfiles,
        { v: 1, data: [] }
    );

    const [clientsRaw, setClientsRaw] = useLocalStorage<ClientsStorage>(STORAGE_KEYS.clients, {
        v: 1,
        data: [],
    });

    const [settingsRaw, setSettingsRaw] = useLocalStorage<SettingsStorage>(STORAGE_KEYS.settings, {
        v: 1,
        data: getDefaultSettings(),
    });

    const settings = useMemo(() => validateSettings(settingsRaw), [settingsRaw]);

    const invoices = useMemo(
        () => validateInvoices(invoicesRaw, settings.maxSavedInvoices),
        [invoicesRaw, settings.maxSavedInvoices]
    );

    const companyProfiles = useMemo(
        () => validateCompanyProfiles(companyProfilesRaw),
        [companyProfilesRaw]
    );

    const clients = useMemo(() => validateClients(clientsRaw), [clientsRaw]);

    const saveInvoice = useCallback(
        (invoice: InvoiceData) => {
            if (!settings.autoSave) return;

            const newInvoice: SavedInvoice = {
                id: generateId(),
                timestamp: Date.now(),
                invoice,
                isFavorite: false,
                tags: [invoice.paymentStatus],
            };

            try {
                setInvoicesRaw((prev) => {
                    const newData = [newInvoice, ...(prev?.data ?? [])].slice(0, settings.maxSavedInvoices);
                    return { v: 1, data: newData };
                });
            } catch (error) {
                logger.error("Failed to save invoice:", error);
            }
        },
        [settings.autoSave, settings.maxSavedInvoices, setInvoicesRaw]
    );

    const removeInvoice = useCallback(
        (id: string) => {
            try {
                setInvoicesRaw((prev) => ({
                    v: 1,
                    data: (prev?.data ?? []).filter((e) => e.id !== id),
                }));
            } catch (error) {
                logger.error("Failed to remove invoice:", error);
            }
        },
        [setInvoicesRaw]
    );

    const saveCompanyProfile = useCallback(
        (profile: Omit<CompanyProfile, "id">) => {
            try {
                const newProfile: CompanyProfile = {
                    ...profile,
                    id: generateId(),
                };

                setCompanyProfilesRaw((prev) => {
                    let profiles = prev?.data ?? [];

                    if (newProfile.isDefault) {
                        profiles = profiles.map((p) => ({ ...p, isDefault: false }));
                    }

                    return { v: 1, data: [...profiles, newProfile] };
                });
            } catch (error) {
                logger.error("Failed to save company profile:", error);
            }
        },
        [setCompanyProfilesRaw]
    );

    const removeCompanyProfile = useCallback(
        (id: string) => {
            try {
                setCompanyProfilesRaw((prev) => ({
                    v: 1,
                    data: (prev?.data ?? []).filter((p) => p.id !== id),
                }));
            } catch (error) {
                logger.error("Failed to remove company profile:", error);
            }
        },
        [setCompanyProfilesRaw]
    );

    const saveClient = useCallback(
        (client: Omit<SavedClient, "id" | "lastUsed">) => {
            try {
                const newClient: SavedClient = {
                    ...client,
                    id: generateId(),
                    lastUsed: Date.now(),
                };

                setClientsRaw((prev) => {
                    const existing = (prev?.data ?? []).filter((c) => c.id !== newClient.id);
                    return { v: 1, data: [newClient, ...existing] };
                });
            } catch (error) {
                logger.error("Failed to save client:", error);
            }
        },
        [setClientsRaw]
    );

    const removeClient = useCallback(
        (id: string) => {
            try {
                setClientsRaw((prev) => ({
                    v: 1,
                    data: (prev?.data ?? []).filter((c) => c.id !== id),
                }));
            } catch (error) {
                logger.error("Failed to remove client:", error);
            }
        },
        [setClientsRaw]
    );

    const updateLastInvoiceNumber = useCallback(
        (invoiceNumber: string) => {
            try {
                setSettingsRaw((prev) => ({
                    v: 1,
                    data: { ...(prev?.data ?? getDefaultSettings()), lastInvoiceNumber: invoiceNumber },
                }));
            } catch (error) {
                logger.error("Failed to update invoice number:", error);
            }
        },
        [setSettingsRaw]
    );

    return {
        invoices,
        companyProfiles,
        clients,
        settings,
        saveInvoice,
        removeInvoice,
        saveCompanyProfile,
        removeCompanyProfile,
        saveClient,
        removeClient,
        updateLastInvoiceNumber,
    };
}