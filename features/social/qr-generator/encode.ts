//features/social/qr-generator/encode.ts
import type {
    QrType,
    WifiData,
    EmailData,
    VCardData,
    SmsData,
    LocationData,
} from "./types";

export function escapeWifi(v: string) {
    return v.replace(/([\\;,:"])/g, "\\$1");
}

export function buildWifiString(d: WifiData): string {
    if (!d.ssid.trim()) return "";
    const pass =
        d.encryption === "nopass" ? "" : `P:${escapeWifi(d.password)};`;
    return `WIFI:T:${d.encryption};S:${escapeWifi(d.ssid)};${pass}H:${d.hidden};`;
}

export function buildEmailString(d: EmailData): string {
    if (!d.address.trim()) return "";
    const params = new URLSearchParams();
    if (d.subject.trim()) params.set("subject", d.subject.trim());
    if (d.body.trim()) params.set("body", d.body.trim());
    const q = params.toString();
    return `mailto:${d.address.trim()}${q ? `?${q}` : ""}`;
}

export function buildVCardString(d: VCardData): string {
    const name = `${d.firstName.trim()} ${d.lastName.trim()}`.trim();
    if (!name) return "";
    const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${d.lastName.trim()};${d.firstName.trim()};;;`,
        `FN:${name}`,
    ];
    if (d.phone.trim()) lines.push(`TEL;TYPE=CELL:${d.phone.trim()}`);
    if (d.email.trim()) lines.push(`EMAIL:${d.email.trim()}`);
    if (d.company.trim()) lines.push(`ORG:${d.company.trim()}`);
    if (d.title.trim()) lines.push(`TITLE:${d.title.trim()}`);
    if (d.website.trim()) lines.push(`URL:${d.website.trim()}`);
    lines.push("END:VCARD");
    return lines.join("\n");
}

export function buildSmsString(d: SmsData): string {
    if (!d.phone.trim()) return "";
    return `SMSTO:${d.phone.trim()}:${d.message.trim()}`;
}

export function buildLocationString(d: LocationData): string {
    if (!d.lat.trim() || !d.lng.trim()) return "";
    const label = d.label.trim();
    return label
        ? `geo:${d.lat},${d.lng}?q=${encodeURIComponent(label)}`
        : `geo:${d.lat},${d.lng}`;
}

export function getTypeLabel(type: QrType): string {
    const map: Record<QrType, string> = {
        url: "URL",
        text: "Text",
        email: "Email",
        phone: "Phone",
        wifi: "Wi-Fi",
        vcard: "Contact",
        sms: "SMS",
        location: "Location",
    };
    return map[type];
}

export function getTypeIcon(type: QrType): string {
    const map: Record<QrType, string> = {
        url: "ti-link",
        text: "ti-txt",
        email: "ti-mail",
        phone: "ti-phone",
        wifi: "ti-wifi",
        vcard: "ti-user",
        sms: "ti-message",
        location: "ti-map-pin",
    };
    return map[type];
}