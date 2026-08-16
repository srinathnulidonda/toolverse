//features/social/qr-generator/ts/store.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import type {
  QrType,
  QrStyle,
  WifiData,
  EmailData,
  VCardData,
  SmsData,
  LocationData,
  HistoryItem,
  WifiEncryption,
} from "./types";
import {
  buildEmailString,
  buildLocationString,
  buildSmsString,
  buildVCardString,
  buildWifiString,
  getTypeIcon,
  getTypeLabel,
} from "./encode";

export interface QrGeneratorStore {
  // QR type
  type: QrType;
  setType: (type: QrType) => void;

  // Per-type content
  url: string;
  setUrl: (url: string) => void;
  text: string;
  setText: (text: string) => void;
  email: EmailData;
  setEmail: (email: EmailData) => void;
  phone: string;
  setPhone: (phone: string) => void;
  wifi: WifiData;
  setWifi: (wifi: WifiData) => void;
  vcard: VCardData;
  setVcard: (vcard: VCardData) => void;
  sms: SmsData;
  setSms: (sms: SmsData) => void;
  location: LocationData;
  setLocation: (location: LocationData) => void;

  // Style + UI
  qrStyle: QrStyle;
  setQrStyle: (style: QrStyle) => void;
  activeTab: "content" | "style" | "history";
  setActiveTab: (tab: "content" | "style" | "history") => void;
  mobilePreviewOpen: boolean;
  setMicrophonePreviewOpen: (open: boolean) => void;

  // History
  history: HistoryItem[];
  setHistory: (history: HistoryItem[]) => void;

  // Computed properties
  data: string;
  saveToHistory: (thumbnail: string) => void;
  handleRestore: (item: HistoryItem) => void;
}

export function useQrGeneratorStore() {
  // QR type
  const [type, setType] = useState<QrType>("url");

  // Per-type content
  const [url, setUrl] = useState<string>("https://");
  const [text, setText] = useState<string>("");
  const [email, setEmail] = useState<EmailData>({ address: "", subject: "", body: "" });
  const [phone, setPhone] = useState<string>("");
  const [wifi, setWifi] = useState<WifiData>({
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  });
  const [vcard, setVcard] = useState<VCardData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    title: "",
    website: "",
  });
  const [sms, setSms] = useState<SmsData>({ phone: "", message: "" });
  const [location, setLocation] = useState<LocationData>({ lat: "", lng: "", label: "" });

  // Style + UI
  const DEFAULT_STYLE: QrStyle = {
    size: 512,
    errorLevel: "M",
    fgColor: "#1C1C18",
    bgColor: "#FFFFFF",
    margin: 2,
    transparent: false,
  };
  const [qrStyle, setQrStyle] = useState<QrStyle>(DEFAULT_STYLE);
  const [activeTab, setActiveTab] = useState<"content" | "style" | "history">("content");
  const [mobilePreviewOpen, setMicrophonePreviewOpen] = useState<boolean>(false);

  // Computed QR data string
  const data = useMemo(() => {
    switch (type) {
      case "url":
        return url.trim();
      case "text":
        return text.trim();
      case "email":
        return buildEmailString(email);
      case "phone":
        return phone.trim() ? `tel:${phone.trim()}` : "";
      case "wifi":
        return buildWifiString(wifi);
      case "vcard":
        return buildVCardString(vcard);
      case "sms":
        return buildSmsString(sms);
      case "location":
        return buildLocationString(location);
      default:
        return "";
    }
  }, [type, url, text, email, phone, wifi, vcard, sms, location]);

  // Storage wrapper for history
  interface HistoryStorage {
    v: number;
    data: HistoryItem[];
  }

  // Validation function for history
  function validateHistory(raw: HistoryStorage | null): HistoryItem[] {
    if (
      !raw ||
      typeof raw !== "object" ||
      !("v" in raw) ||
      !("data" in raw) ||
      !Array.isArray(raw.data)
    ) {
      return [];
    }
    const valid: HistoryItem[] = [];
    for (const item of raw.data) {
      if (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.type === "string" &&
        typeof item.label === "string" &&
        typeof item.data === "string" &&
        typeof item.timestamp === "number" &&
        typeof item.thumbnail === "string"
      ) {
        valid.push(item as HistoryItem);
      }
    }
    return valid;
  }

  const [historyRaw, setHistoryRaw] = useLocalStorage<HistoryStorage>("qr-generator-history", {
    v: 1,
    data: [],
  });

  const history = useMemo(() => validateHistory(historyRaw), [historyRaw]);

  // Sync back to storage if validation changes the data
  useEffect(() => {
    if (!JSON_equal(history, historyRaw?.data)) {
      setHistoryRaw({ v: 1, data: history });
    }
  }, [history, historyRaw]);

  // Save to history (explicit — triggered by user clicking "Save" in QrPreview)
  const saveToHistory = useCallback(
    (thumbnail: string) => {
      if (!data) return;
      const label = (() => {
        switch (type) {
          case "url":
            return url;
          case "text":
            return text.slice(0, 40);
          case "email":
            return email.address;
          case "phone":
            return phone;
          case "wifi":
            return wifi.ssid;
          case "vcard":
            return `${vcard.firstName} ${vcard.lastName}`.trim();
          case "sms":
            return sms.phone;
          case "location":
            return location.label || `${location.lat}, ${location.lng}`;
          default:
            return data.slice(0, 40);
        }
      })();

      setHistoryRaw((prev) => {
        const validated = validateHistory(prev);
        // Prevent duplicates
        const exists = validated.some((h) => h.data === data);
        if (exists) return prev;

        return {
          v: 1,
          data: [
            {
              id: `${Date.now()}-${Math.random()}`,
              type,
              label,
              data,
              timestamp: Date.now(),
              thumbnail,
            },
            ...validated,
          ].slice(0, 20),
        };
      });
    },
    [data, type, url, text, email, phone, wifi, vcard, sms, location]
  );

  const handleRestore = useCallback((item: HistoryItem) => {
    setType(item.type);
    setActiveTab("content");

    // Also restore the content fields based on type
    switch (item.type) {
      case "url":
        setUrl(item.data);
        break;
      case "text":
        setText(item.data);
        break;
      case "email": {
        // Simple parsing - in a real app we'd want better parsing
        const emailParts = item.data.split("?");
        const address = emailParts[0] || "";
        const subject =
          emailParts.length > 1
            ? emailParts[1]
              .split("&")
              .find((p) => p.startsWith("subject="))
              ?.split("=")[1] || ""
            : "";
        const body =
          emailParts.length > 1
            ? emailParts[1]
              .split("&")
              .find((p) => p.startsWith("body="))
              ?.split("=")[1] || ""
            : "";
        setEmail({ address, subject: decodeURIComponent(subject), body: decodeURIComponent(body) });
        break;
      }
      case "phone":
        setPhone(item.data.replace("tel:", ""));
        break;
      case "wifi": {
        // Simple parsing - in a real app we'd want better parsing
        const wifiParts = item.data.split(";");
        const ssid = wifiParts.find((p) => p.startsWith("SSID:"))?.split(":")[1] || "";
        const password = wifiParts.find((p) => p.startsWith("P:"))?.split(":")[1] || "";
        const encryptionRaw = wifiParts.find((p) => p.startsWith("T:"))?.split(":")[1] || "WPA";
        // Convert "none" to "nopass" to match the WifiEncryption type
        let encryptionValue: WifiEncryption = "WPA";
        if (encryptionRaw === "WPA" || encryptionRaw === "WEP" || encryptionRaw === "nopass") {
          encryptionValue = encryptionRaw;
        } else if (encryptionRaw === "none") {
          encryptionValue = "nopass";
        }
        // default to WPA for any other value (including empty string)
        const hidden = wifiParts.find((p) => p.startsWith("H:"))?.split(":")[1] === "true" || false;
        setWifi({ ssid, password, encryption: encryptionValue, hidden });
        break;
      }
      case "vcard": {
        // Simple parsing - in a real app we'd want better parsing
        const vcardParts = item.data.split(";");
        const firstName = vcardParts.find((p) => p.startsWith("FN:"))?.split(":")[1] || "";
        const lastName = vcardParts.find((p) => p.startsWith("LN:"))?.split(":")[1] || "";
        const phone = vcardParts.find((p) => p.startsWith("TEL:"))?.split(":")[1] || "";
        const email = vcardParts.find((p) => p.startsWith("EMAIL:"))?.split(":")[1] || "";
        const company = vcardParts.find((p) => p.startsWith("ORG:"))?.split(":")[1] || "";
        const title = vcardParts.find((p) => p.startsWith("TITLE:"))?.split(":")[1] || "";
        const website = vcardParts.find((p) => p.startsWith("URL:"))?.split(":")[1] || "";
        setVcard({ firstName, lastName, phone, email, company, title, website });
        break;
      }
      case "sms": {
        // Simple parsing - in a real app we'd want better parsing
        const smsParts = item.data.split(";");
        const phone = smsParts.find((p) => p.startsWith("NUM:"))?.split(":")[1] || "";
        const message = smsParts.find((p) => p.startsWith("MSG:"))?.split(":")[1] || "";
        setSms({ phone, message });
        break;
      }
      case "location": {
        // Simple parsing - in a real app we'd want better parsing
        const locationParts = item.data.split(";");
        const lat = locationParts.find((p) => p.startsWith("LAT:"))?.split(":")[1] || "";
        const lng = locationParts.find((p) => p.startsWith("LNG:"))?.split(":")[1] || "";
        const label = locationParts.find((p) => p.startsWith("LABEL:"))?.split(":")[1] || "";
        setLocation({ lat, lng, label });
        break;
      }
      default:
        break;
    }
  }, []);

  // Helper for deep equality (since we don't have lodash)
  function JSON_equal(a: any, b: any): boolean {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return a === b;
    }
  }

  return {
    // QR type
    type,
    setType,

    // Per-type content
    url,
    setUrl,
    text,
    setText,
    email,
    setEmail,
    phone,
    setPhone,
    wifi,
    setWifi,
    vcard,
    setVcard,
    sms,
    setSms,
    location,
    setLocation,

    // Style + UI
    qrStyle,
    setQrStyle,
    activeTab,
    setActiveTab,
    mobilePreviewOpen,
    setMicrophonePreviewOpen,

    // History
    history,
    setHistory: setHistoryRaw,

    // Computed properties
    data,
    saveToHistory,
    handleRestore,
  };
}
