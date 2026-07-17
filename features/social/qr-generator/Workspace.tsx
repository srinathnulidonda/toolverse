// features/social/qr-generator/Workspace.tsx
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
import TypeInput from "./TypeInput";
import StylePanel from "./StylePanel";
import QrPreview from "./QrPreview";
import HistoryPanel from "./HistoryPanel";
import PreviewFab from "./PreviewFab";

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
  // QR type
  const [type, setType] = useState<QrType>("url");

  // Per-type content
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

  // Style + UI
  const [qrStyle, setQrStyle] = useState<QrStyle>(DEFAULT_STYLE);
  const [activeTab, setActiveTab] = useState<PanelTab>("content");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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
    <>
      <div className="qgw-root">
        {/* ── QR type selector strip ── */}
        <div className="qgw-type-bar" role="tablist" aria-label="QR type">
          <div className="qgw-type-scroll">
            {TYPES.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={type === t}
                className={`qgw-type-btn${type === t ? " active" : ""}`}
                onClick={() => setType(t)}
              >
                <i className={`ti ${getTypeIcon(t)}`} aria-hidden="true" />
                <span className="qgw-type-label">{getTypeLabel(t)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main two-column workspace (desktop) ── */}
        <div className="qgw-workspace">
          {/* Left: config panel */}
          <div className="qgw-config">
            <div className="qgw-panel-tabs" role="tablist">
              {PANEL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`qgw-panel-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} aria-hidden="true" />
                  <span>{tab.label}</span>
                  {tab.id === "history" && history.length > 0 && (
                    <span className="qgw-badge">{history.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="qgw-panel-body">
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

            {/* Mobile FAB lives inside config so sticky positioning works */}
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

          {/* Right: preview (desktop only) */}
          <div className="qgw-preview-col">
            <div className="qgw-preview-header">
              <span className="qgw-preview-eyebrow">Preview</span>
              {data && (
                <span className="qgw-live-pill">
                  <span className="qgw-live-dot" aria-hidden="true" />
                  Live
                </span>
              )}
            </div>
            <QrPreview data={data} style={qrStyle} slug={tool.slug} onSave={saveToHistory} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="qgw-footer">
          <div className="qgw-footer-item">
            <i className="ti ti-lock" aria-hidden="true" />
            <span>100% browser-side — nothing uploaded</span>
          </div>
          <div className="qgw-footer-item">
            <i className="ti ti-device-mobile" aria-hidden="true" />
            <span>Works with all major scanners</span>
          </div>
          <div className="qgw-footer-item">
            <i className="ti ti-infinity" aria-hidden="true" />
            <span>Free forever</span>
          </div>
        </div>
      </div>

      <style>{`
        .qgw-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* ── Type bar ── */
        .qgw-type-bar {
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-card);
        }
        .qgw-type-scroll {
          display: flex;
          padding: 0 4px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .qgw-type-scroll::-webkit-scrollbar { display: none; }

        .qgw-type-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 11px 14px;
          border: none;
          border-bottom: 2px solid transparent;
          background: none;
          color: var(--text-tertiary);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          white-space: nowrap;
          margin-bottom: -0.5px;
          transition: color 0.15s, border-color 0.15s;
          border-radius: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .qgw-type-btn i { font-size: 15px; flex-shrink: 0; }
        .qgw-type-btn:hover { color: var(--text-secondary); }
        .qgw-type-btn.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
        }

        /* ── Workspace grid ── */
        .qgw-workspace {
          display: grid;
          grid-template-columns: 1fr 300px;
          min-height: 540px;
          flex: 1;
        }

        /* ── Config panel ── */
        .qgw-config {
          border-right: 0.5px solid var(--border);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .qgw-panel-tabs {
          display: flex;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-shrink: 0;
        }
        .qgw-panel-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          border: none;
          background: none;
          color: var(--text-tertiary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .qgw-panel-tab i { font-size: 14px; }
        .qgw-panel-tab:hover { color: var(--text-secondary); background: var(--border-faint); }
        .qgw-panel-tab.active {
          color: var(--text);
          background: var(--bg-card);
          box-shadow: inset 0 -2px 0 var(--brand);
        }
        .qgw-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 999px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
        }

        .qgw-panel-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
          overscroll-behavior: contain;
        }

        /* ── Preview column (desktop only) ── */
        .qgw-preview-col {
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
        }
        .qgw-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px 0;
          flex-shrink: 0;
        }
        .qgw-preview-eyebrow {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: var(--font-sans);
        }
        .qgw-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          font-size: 11px;
          font-weight: 500;
          color: var(--brand-text);
          font-family: var(--font-sans);
        }
        .qgw-live-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--brand);
          animation: qgw-pulse 2s ease-in-out infinite;
        }
        @keyframes qgw-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }

        /* ── Footer ── */
        .qgw-footer {
          display: flex;
          align-items: center;
          border-top: 0.5px solid var(--border);
          padding: 10px 20px;
          flex-wrap: wrap;
          gap: 10px 24px;
          background: var(--bg-card);
        }
        .qgw-footer-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }
        .qgw-footer-item i { font-size: 12px; }

        /* ── Tablet ≤ 960px ── */
        @media (max-width: 960px) {
          .qgw-workspace { grid-template-columns: 1fr 260px; }
        }

        /* ── Mobile ≤ 768px ── */
        @media (max-width: 768px) {
          .qgw-root { border-radius: 12px; }

          .qgw-type-btn {
            padding: 10px 12px;
            font-size: 12.5px;
            gap: 5px;
            min-height: 44px;
          }
          .qgw-type-btn i { font-size: 16px; }

          .qgw-workspace {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          /* Preview col hidden on mobile — PreviewFab handles it */
          .qgw-preview-col { display: none; }

          .qgw-config { border-right: none; }

          .qgw-panel-tab {
            padding: 12px 8px;
            font-size: 12px;
            min-height: 44px;
          }
          .qgw-panel-body {
            padding: 16px;
            padding-bottom: 80px; /* space for sticky FAB */
          }

          .qgw-footer { padding: 10px 16px; }
          .qgw-footer-item:not(:first-child) { display: none; }
        }

        /* ── Small mobile ≤ 400px ── */
        @media (max-width: 400px) {
          .qgw-type-label { display: none; }
          .qgw-type-btn { padding: 10px; flex: 1; justify-content: center; }
          .qgw-type-btn i { font-size: 18px; }
          .qgw-panel-tab span { display: none; }
          .qgw-panel-tab { padding: 12px; }
          .qgw-panel-tab i { font-size: 16px; }
        }
      `}</style>
    </>
  );
}
