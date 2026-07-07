// features/dev/timestamp-converter/utils.ts

import { formatBytes, downloadText } from '@/utils';

export type TimeUnit = "seconds" | "milliseconds" | "microseconds" | "nanoseconds";
export type TimeZone = string; // IANA timezone identifier
export type DateFormat = "iso" | "utc" | "local" | "custom";

export interface TimestampOptions {
    unit: TimeUnit;
    timezone: TimeZone;
    includeMilliseconds: boolean;
    use24Hour: boolean;
    showWeekday: boolean;
    customFormat?: string;
}

export interface ConversionResult {
    unix: number;
    unixMs: number;
    unixMicro: number;
    unixNano: number;
    iso: string;
    utc: string;
    local: string;
    relative: string;
    date: Date;
    formatted: {
        short: string;
        medium: string;
        long: string;
        full: string;
    };
    components: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second: number;
        millisecond: number;
        weekday: string;
        monthName: string;
    };
}

export interface TimezoneInfo {
    name: string;
    offset: string;
    offsetMinutes: number;
    abbreviation: string;
}

export const DEFAULT_OPTIONS: TimestampOptions = {
    unit: "seconds",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    includeMilliseconds: false,
    use24Hour: true,
    showWeekday: false,
};

export const SAMPLE_TIMESTAMPS = [
    { id: "now", label: "Now", getValue: () => Math.floor(Date.now() / 1000) },
    { id: "today", label: "Today Midnight", getValue: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return Math.floor(d.getTime() / 1000);
    }},
    { id: "yesterday", label: "Yesterday", getValue: () => Math.floor((Date.now() - 86400000) / 1000) },
    { id: "week", label: "Week Ago", getValue: () => Math.floor((Date.now() - 604800000) / 1000) },
    { id: "month", label: "Month Ago", getValue: () => Math.floor((Date.now() - 2592000000) / 1000) },
    { id: "year", label: "Year Ago", getValue: () => Math.floor((Date.now() - 31536000000) / 1000) },
];

// Popular timezones
export const POPULAR_TIMEZONES: Array<{ label: string; value: string; region: string }> = [
    { label: "UTC", value: "UTC", region: "Universal" },
    { label: "New York (EST/EDT)", value: "America/New_York", region: "Americas" },
    { label: "Los Angeles (PST/PDT)", value: "America/Los_Angeles", region: "Americas" },
    { label: "Chicago (CST/CDT)", value: "America/Chicago", region: "Americas" },
    { label: "London (GMT/BST)", value: "Europe/London", region: "Europe" },
    { label: "Paris (CET/CEST)", value: "Europe/Paris", region: "Europe" },
    { label: "Tokyo (JST)", value: "Asia/Tokyo", region: "Asia" },
    { label: "Sydney (AEST/AEDT)", value: "Australia/Sydney", region: "Pacific" },
    { label: "Mumbai (IST)", value: "Asia/Kolkata", region: "Asia" },
    { label: "Dubai (GST)", value: "Asia/Dubai", region: "Asia" },
    { label: "Singapore (SGT)", value: "Asia/Singapore", region: "Asia" },
    { label: "Hong Kong (HKT)", value: "Asia/Hong_Kong", region: "Asia" },
];

/*  Core Functions  */

export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp * 1000;
    const absDiff = Math.abs(diff);
    const isFuture = diff < 0;

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (absDiff < 5000) return "just now";
    if (years > 0) return `${years} year${years !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (months > 0) return `${months} month${months !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (weeks > 0) return `${weeks} week${weeks !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
    return `${seconds} second${seconds !== 1 ? "s" : ""} ${isFuture ? "from now" : "ago"}`;
}

export function parseTimestamp(input: string, unit: TimeUnit): number | null {
    if (!input.trim()) return null;

    // Try parsing as number first
    const num = parseFloat(input.trim());
    if (!isNaN(num)) {
        // Convert to seconds based on unit
        switch (unit) {
            case "milliseconds":
                return Math.floor(num / 1000);
            case "microseconds":
                return Math.floor(num / 1000000);
            case "nanoseconds":
                return Math.floor(num / 1000000000);
            default:
                return Math.floor(num);
        }
    }

    // Try parsing as date string
    try {
        const date = new Date(input);
        if (isNaN(date.getTime())) return null;
        return Math.floor(date.getTime() / 1000);
    } catch {
        return null;
    }
}

export function convertTimestamp(input: string, options: TimestampOptions): ConversionResult | null {
    const unix = parseTimestamp(input, options.unit);
    if (unix === null) return null;

    const date = new Date(unix * 1000);
    if (isNaN(date.getTime())) return null;

    const unixMs = unix * 1000;
    const unixMicro = unix * 1000000;
    const unixNano = unix * 1000000000;

    // ISO format
    const iso = date.toISOString();

    // UTC format
    const utc = date.toUTCString();

    // Local format
    const local = date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: !options.use24Hour,
        timeZoneName: "short",
        timeZone: options.timezone,
    });

    // Relative time
    const relative = formatRelativeTime(unix);

    // Formatted versions
    const formatted = {
        short: date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            timeZone: options.timezone,
        }),
        medium: date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: options.timezone,
        }),
        long: date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: options.timezone,
        }),
        full: date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: options.timezone,
        }),
    };

    // Components
    const components = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds(),
        weekday: date.toLocaleDateString("en-US", { weekday: "long", timeZone: options.timezone }),
        monthName: date.toLocaleDateString("en-US", { month: "long", timeZone: options.timezone }),
    };

    return {
        unix,
        unixMs,
        unixMicro,
        unixNano,
        iso,
        utc,
        local,
        relative,
        date,
        formatted,
        components,
    };
}

export function getTimezoneInfo(timezone: string, date: Date = new Date()): TimezoneInfo {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
    });

    const parts = formatter.formatToParts(date);
    const abbreviation = parts.find(p => p.type === "timeZoneName")?.value || "";

    // Calculate offset
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000;
    
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    const offsetSign = offsetMinutes >= 0 ? "+" : "-";
    const offset = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMins).padStart(2, "0")}`;

    return {
        name: timezone,
        offset,
        offsetMinutes,
        abbreviation,
    };
}

export function formatTimezone(timezone: string): string {
    const info = getTimezoneInfo(timezone);
    return `${timezone} (${info.offset})`;
}

export function calculateDuration(start: number, end: number): {
    total: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
} {
    const total = Math.abs(end - start);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return {
        total,
        days,
        hours,
        minutes,
        seconds,
        formatted: parts.join(" "),
    };
}

export function addTime(timestamp: number, amount: number, unit: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"): number {
    const date = new Date(timestamp * 1000);

    switch (unit) {
        case "seconds":
            return timestamp + amount;
        case "minutes":
            return timestamp + (amount * 60);
        case "hours":
            return timestamp + (amount * 3600);
        case "days":
            return timestamp + (amount * 86400);
        case "weeks":
            return timestamp + (amount * 604800);
        case "months":
            date.setMonth(date.getMonth() + amount);
            return Math.floor(date.getTime() / 1000);
        case "years":
            date.setFullYear(date.getFullYear() + amount);
            return Math.floor(date.getTime() / 1000);
        default:
            return timestamp;
    }
}

export function validateTimestamp(input: string, unit: TimeUnit): { valid: boolean; error?: string } {
    if (!input.trim()) {
        return { valid: false, error: "Input cannot be empty" };
    }

    const unix = parseTimestamp(input, unit);
    if (unix === null) {
        return { valid: false, error: "Invalid timestamp or date format" };
    }

    // Check if date is reasonable (between 1970 and 2100)
    const year = new Date(unix * 1000).getFullYear();
    if (year < 1970 || year > 2100) {
        return { valid: false, error: "Date is out of reasonable range (1970-2100)" };
    }

    return { valid: true };
}

export function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

// Format for different programming languages
export function getCodeSnippets(timestamp: number): Record<string, string> {
    const date = new Date(timestamp * 1000);
    return {
        javascript: `new Date(${timestamp * 1000}) // ${date.toISOString()}`,
        python: `from datetime import datetime\ndatetime.fromtimestamp(${timestamp})`,
        php: `<?php\ndate('Y-m-d H:i:s', ${timestamp});`,
        ruby: `Time.at(${timestamp})`,
        go: `time.Unix(${timestamp}, 0)`,
        java: `new Date(${timestamp * 1000}L)`,
        csharp: `DateTimeOffset.FromUnixTimeSeconds(${timestamp})`,
        mysql: `FROM_UNIXTIME(${timestamp})`,
    };
}