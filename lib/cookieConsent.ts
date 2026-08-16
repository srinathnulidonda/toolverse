// lib/cookieConsent.ts

const PREFS_KEY = "tv_privacy_prefs";
const PREFS_VERSION = 1;
const PREFS_MAX_AGE_DAYS = 180;

export const CONSENT_OPEN_EVENT = "tv:open-preferences";
export const CONSENT_UPDATED_EVENT = "tv:preferences-updated";

export type ConsentCategoryKey = "necessary" | "functional" | "analytics" | "marketing";

export interface ConsentCategory {
  key: ConsentCategoryKey;
  label: string;
  description: string;
  locked: boolean;
}

export interface ConsentRecord {
  version: number;
  timestamp: number;
  categories: Record<ConsentCategoryKey, boolean>;
}

export const CONSENT_CATEGORIES: Record<ConsentCategoryKey, ConsentCategory> = {
  necessary: {
    key: "necessary",
    label: "Strictly Necessary",
    description:
      "Required for the site to function — session handling, security, and core tool operations. These cannot be switched off.",
    locked: true,
  },
  functional: {
    key: "functional",
    label: "Functional",
    description:
      "Remembers your preferences like pinned tools, recent tools, and theme settings so your experience stays consistent between visits.",
    locked: false,
  },
  analytics: {
    key: "analytics",
    label: "Analytics & Performance",
    description:
      "Helps us understand which tools are used most so we can improve performance, fix bugs, and prioritise new features.",
    locked: false,
  },
  marketing: {
    key: "marketing",
    label: "Marketing & Personalisation",
    description:
      "Used to personalise tool recommendations and surface relevant content based on your interests.",
    locked: false,
  },
};

const DEFAULT_CATEGORIES: Record<ConsentCategoryKey, boolean> = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

function writeCookie(name: string, value: string, days: number): void {
  try {
    const maxAge = days * 24 * 60 * 60;
    const isHttps =
      typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; path=/; max-age=${maxAge}; SameSite=Lax${isHttps ? "; Secure" : ""}`;
  } catch {
  }
}

function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${name}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function deleteCookie(name: string): void {
  try {
    document.cookie = `${name}=; path=/; max-age=0`;
  } catch {
  }
}

export function getConsent(): ConsentRecord | null {
  let raw = readCookie(PREFS_KEY);
  if (!raw) {
    try {
      raw = localStorage.getItem(PREFS_KEY);
    } catch {
    }
  }
  if (!raw) return null;

  let parsed: ConsentRecord;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || parsed.version !== PREFS_VERSION) return null;

  const ageDays =
    (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
  if (ageDays > PREFS_MAX_AGE_DAYS) return null;

  return parsed;
}

export function hasRespondedToConsent(): boolean {
  return getConsent() !== null;
}

export function hasConsent(category: ConsentCategoryKey): boolean {
  if (category === "necessary") return true;
  const consent = getConsent();
  return !!consent?.categories?.[category];
}

export function saveConsent(
  categories: Partial<Record<ConsentCategoryKey, boolean>>
): ConsentRecord {
  const record: ConsentRecord = {
    version: PREFS_VERSION,
    timestamp: Date.now(),
    categories: {
      ...DEFAULT_CATEGORIES,
      ...categories,
      necessary: true,
    },
  };

  const serialized = JSON.stringify(record);
  writeCookie(PREFS_KEY, serialized, PREFS_MAX_AGE_DAYS);
  try {
    localStorage.setItem(PREFS_KEY, serialized);
  } catch {
  }

  if (typeof window !== "undefined") {
    (window as Window & { __tvPreferences?: ConsentRecord | null })
      .__tvPreferences = record;
    window.dispatchEvent(
      new CustomEvent(CONSENT_UPDATED_EVENT, { detail: record })
    );
  }

  return record;
}

export function acceptAll(): ConsentRecord {
  return saveConsent({
    functional: true,
    analytics: true,
    marketing: true,
  });
}

export function rejectAll(): ConsentRecord {
  return saveConsent({
    functional: false,
    analytics: false,
    marketing: false,
  });
}

export function clearConsent(): void {
  deleteCookie(PREFS_KEY);
  try {
    localStorage.removeItem(PREFS_KEY);
  } catch {
  }
  if (typeof window !== "undefined") {
    (window as Window & { __tvPreferences?: ConsentRecord | null })
      .__tvPreferences = null;
    window.dispatchEvent(
      new CustomEvent(CONSENT_UPDATED_EVENT, { detail: null })
    );
  }
}

export function requestPreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
  }
}