//features/social/qr-generator/ts/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import type {
  QrType,
  QrStyle,
  WifiData,
  EmailData,
  VCardData,
  SmsData,
  LocationData,
  HistoryItem,
} from "./ts/types";
import {
  buildEmailString,
  buildLocationString,
  buildSmsString,
  buildVCardString,
  buildWifiString,
  getTypeIcon,
  getTypeLabel,
} from "./ts/encode";
import TypeInput from "./TypeInput";
import StylePanel from "./StylePanel";
import QrPreview from "./QrPreview";
import HistoryPanel from "./HistoryPanel";
import PreviewFab from "./PreviewFab";
import styles from "./style/Workspace.module.css";

const TYPES: QrType[] = ["url", "text", "email", "phone", "wifi", "vcard", "sms", "location"];

type PanelTab = "content" | "style" | "history";

const DEFAULT_STYLE: QrStyle = {
  size: 512,
  errorLevel: "M",
  fgColor: "#1C1C18",
  bgColor: "#FFFFFF",
  margin: 2,
  transparent: false,
};

const PANEL_TABS: { id: PanelTab; icon: string; label: string }[] = [
  { id: "content", icon: "ti-edit", label: "Content" },
  { id: "style", icon: "ti-palette", label: "Style" },
  { id: "history", icon: "ti-history", label: "History" },
];

export default function QrGeneratorWorkspace({ tool }: { tool: Tool }) {
  const [type, setType] = useState<QrType>("url");

  const [url, setUrl] = useState("https://");
  const [text, setText] = useState("");
  const [email, setEmail] = useState<EmailData>({ address: "", subject: "", body: "" });
  const [phone, setPhone] = useState("");
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

  const [qrStyle, setQrStyle] = useState<QrStyle>(DEFAULT_STYLE);
  const [activeTab, setActiveTab] = useState<PanelTab>("content");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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
      setHistory((prev) => {
        if (prev.some((h) => h.data === data)) return prev;
        return [
          {
            id: `${Date.now()}-${Math.random()}`,
            type,
            label,
            data,
            timestamp: Date.now(),
            thumbnail,
          },
          ...prev,
        ].slice(0, 20);
      });
    },
    [data, type, url, text, email, phone, wifi, vcard, sms, location]
  );

  const handleRestore = useCallback((item: HistoryItem) => {
    setType(item.type);
    setActiveTab("content");
  }, []);

  return (
    <div className={styles.qgwRoot}>
      <div className={styles.qgwTypeBar} role="tablist" aria-label="QR type">
        <div className={styles.qgwTypeScroll}>
          {TYPES.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={type === t}
              className={`${styles.qgwTypeBtn} ${type === t ? styles.active : ""}`}
              onClick={() => setType(t)}
            >
              <i className={`ti ${getTypeIcon(t)}`} aria-hidden="true" />
              <span className={styles.qgwTypeLabel}>{getTypeLabel(t)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.qgwWorkspace}>
        <div className={styles.qgwConfig}>
          <div className={styles.qgwPanelTabs} role="tablist">
            {PANEL_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`${styles.qgwPanelTab} ${activeTab === tab.id ? styles.active : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`ti ${tab.icon}`} aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.id === "history" && history.length > 0 && (
                  <span className={styles.qgwBadge}>{history.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.qgwPanelBody}>
            {activeTab === "content" && (
              <TypeInput
                type={type}
                url={url}
                setUrl={setUrl}
                text={text}
                setText={setText}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                wifi={wifi}
                setWifi={setWifi}
                vcard={vcard}
                setVcard={setVcard}
                sms={sms}
                setSms={setSms}
                location={location}
                setLocation={setLocation}
              />
            )}
            {activeTab === "style" && <StylePanel style={qrStyle} onChange={setQrStyle} />}
            {activeTab === "history" && (
              <HistoryPanel
                items={history}
                onRestore={handleRestore}
                onDelete={(id) => setHistory((p) => p.filter((h) => h.id !== id))}
                onClear={() => setHistory([])}
              />
            )}
          </div>

          <PreviewFab
            data={data}
            style={qrStyle}
            slug={tool.slug}
            isOpen={mobilePreviewOpen}
            onOpen={() => setMobilePreviewOpen(true)}
            onClose={() => setMobilePreviewOpen(false)}
            onSave={saveToHistory}
          />
        </div>

        <div className={styles.qgwPreviewCol}>
          <div className={styles.qgwPreviewHeader}>
            <span className={styles.qgwPreviewEyebrow}>Preview</span>
            {data && (
              <span className={styles.qgwLivePill}>
                <span className={styles.qgwLiveDot} aria-hidden="true" />
                Live
              </span>
            )}
          </div>
          <QrPreview data={data} style={qrStyle} slug={tool.slug} onSave={saveToHistory} />
        </div>
      </div>

      <div className={styles.qgwFooter}>
        <div className={styles.qgwFooterItem}>
          <i className="ti ti-lock" aria-hidden="true" />
          <span>100% browser-side — nothing uploaded</span>
        </div>
        <div className={styles.qgwFooterItem}>
          <i className="ti ti-device-mobile" aria-hidden="true" />
          <span>Works with all major scanners</span>
        </div>
        <div className={styles.qgwFooterItem}>
          <i className="ti ti-infinity" aria-hidden="true" />
          <span>Free forever</span>
        </div>
      </div>
    </div>
  );
}