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

export default function QrGeneratorWorkspace({ tool }: { tool: Tool }) {
    // Type selection
    const [type, setType] = useState<QrType>("url");

    // Content state per type
    const [url, setUrl] = useState("https://");
    const [text, setText] = useState("");
    const [email, setEmail] = useState<EmailData>({ address: "", subject: "", body: "" });
    const [phone, setPhone] = useState("");
    const [wifi, setWifi] = useState<WifiData>({ ssid: "", password: "", encryption: "WPA", hidden: false });
    const [vcard, setVcard] = useState<VCardData>({ firstName: "", lastName: "", phone: "", email: "", company: "", title: "", website: "" });
    const [sms, setSms] = useState<SmsData>({ phone: "", message: "" });
    const [location, setLocation] = useState<LocationData>({ lat: "", lng: "", label: "" });

    // Style
    const [qrStyle, setQrStyle] = useState<QrStyle>(DEFAULT_STYLE);

    // UI state
    const [activeTab, setActiveTab] = useState<PanelTab>("content");
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Computed QR data string
    const data = useMemo(() => {
        switch (type) {
            case "url": return url.trim();
            case "text": return text.trim();
            case "email": return buildEmailString(email);
            case "phone": return phone.trim() ? `tel:${phone.trim()}` : "";
            case "wifi": return buildWifiString(wifi);
            case "vcard": return buildVCardString(vcard);
            case "sms": return buildSmsString(sms);
            case "location": return buildLocationString(location);
            default: return "";
        }
    }, [type, url, text, email, phone, wifi, vcard, sms, location]);

    // Only called when user explicitly clicks "Save to history"
    const saveToHistory = useCallback((thumbnail: string) => {
        if (!data) return;
        const label = (() => {
            switch (type) {
                case "url": return url;
                case "text": return text.slice(0, 40);
                case "email": return email.address;
                case "phone": return phone;
                case "wifi": return wifi.ssid;
                case "vcard": return `${vcard.firstName} ${vcard.lastName}`.trim();
                case "sms": return sms.phone;
                case "location": return location.label || `${location.lat}, ${location.lng}`;
                default: return data.slice(0, 40);
            }
        })();

        setHistory(prev => {
            // Skip duplicate entries with same data
            if (prev.some(h => h.data === data)) return prev;
            const newItem: HistoryItem = {
                id: `${Date.now()}-${Math.random()}`,
                type,
                label,
                data,
                timestamp: Date.now(),
                thumbnail,
            };
            return [newItem, ...prev].slice(0, 20);
        });
    }, [data, type, url, text, email, phone, wifi, vcard, sms, location]);

    // Restore type from history (content must be re-entered manually)
    const handleRestore = useCallback((item: HistoryItem) => {
        setType(item.type);
        setActiveTab("content");
    }, []);

    const handleDeleteHistory = useCallback((id: string) => {
        setHistory(prev => prev.filter(h => h.id !== id));
    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return (
        <>
            <div className="qgw-root">
                {/* Type selector strip */}
                <div className="qgw-type-strip" role="tablist" aria-label="QR code type">
                    {TYPES.map(t => (
                        <button
                            key={t}
                            role="tab"
                            aria-selected={type === t}
                            className={`qgw-type-btn${type === t ? " active" : ""}`}
                            onClick={() => setType(t)}
                        >
                            <i className={`ti ${getTypeIcon(t)}`} aria-hidden="true" />
                            <span>{getTypeLabel(t)}</span>
                        </button>
                    ))}
                </div>

                {/* Main workspace */}
                <div className="qgw-workspace">
                    {/* Left: config panel */}
                    <div className="qgw-config">
                        {/* Panel tabs */}
                        <div className="qgw-panel-tabs">
                            {(["content", "style", "history"] as PanelTab[]).map(tab => (
                                <button
                                    key={tab}
                                    className={`qgw-panel-tab${activeTab === tab ? " active" : ""}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    <i className={`ti ${tab === "content" ? "ti-edit" : tab === "style" ? "ti-palette" : "ti-history"}`} aria-hidden="true" />
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    {tab === "history" && history.length > 0 && (
                                        <span className="qgw-panel-badge">{history.length}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Panel content */}
                        <div className="qgw-panel-body">
                            {activeTab === "content" && (
                                <TypeInput
                                    type={type}
                                    url={url} setUrl={setUrl}
                                    text={text} setText={setText}
                                    email={email} setEmail={setEmail}
                                    phone={phone} setPhone={setPhone}
                                    wifi={wifi} setWifi={setWifi}
                                    vcard={vcard} setVcard={setVcard}
                                    sms={sms} setSms={setSms}
                                    location={location} setLocation={setLocation}
                                />
                            )}
                            {activeTab === "style" && (
                                <StylePanel style={qrStyle} onChange={setQrStyle} />
                            )}
                            {activeTab === "history" && (
                                <HistoryPanel
                                    items={history}
                                    onRestore={handleRestore}
                                    onDelete={handleDeleteHistory}
                                    onClear={handleClearHistory}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right: preview */}
                    <div className="qgw-preview-pane">
                        <div className="qgw-preview-header">
                            <span className="qgw-preview-title">Preview</span>
                            {data && (
                                <span className="qgw-preview-live">
                                    <span className="qgw-live-dot" />
                                    Live
                                </span>
                            )}
                        </div>
                        <QrPreview
                            data={data}
                            style={qrStyle}
                            slug={tool.slug}
                            onSave={saveToHistory}
                        />
                    </div>
                </div>

                {/* Footer info strip */}
                <div className="qgw-footer">
                    <div className="qgw-footer-item">
                        <i className="ti ti-lock" aria-hidden="true" />
                        <span>Generated entirely in your browser — nothing is uploaded</span>
                    </div>
                    <div className="qgw-footer-item">
                        <i className="ti ti-device-mobile" aria-hidden="true" />
                        <span>Works with all major QR scanners</span>
                    </div>
                    <div className="qgw-footer-item">
                        <i className="ti ti-infinity" aria-hidden="true" />
                        <span>Free forever, no sign-up required</span>
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
        }

        .qgw-type-strip {
          display: flex;
          padding: 12px 16px 0;
          border-bottom: 0.5px solid var(--border);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .qgw-type-strip::-webkit-scrollbar { display: none; }

        .qgw-type-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
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
          transition: color 0.12s, border-color 0.12s;
          border-radius: 0;
        }
        .qgw-type-btn i { font-size: 15px; }
        .qgw-type-btn:hover { color: var(--text-secondary); }
        .qgw-type-btn.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
        }

        .qgw-workspace {
          display: grid;
          grid-template-columns: 1fr 320px;
          min-height: 520px;
        }

        .qgw-config {
          border-right: 0.5px solid var(--border);
          display: flex;
          flex-direction: column;
        }

        .qgw-panel-tabs {
          display: flex;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-shrink: 0;
        }
        .qgw-panel-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          background: none;
          color: var(--text-tertiary);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: color 0.12s, background 0.12s;
        }
        .qgw-panel-tab i { font-size: 14px; }
        .qgw-panel-tab:hover { color: var(--text-secondary); background: var(--border-faint); }
        .qgw-panel-tab.active {
          color: var(--text);
          background: var(--bg-card);
          box-shadow: inset 0 -1.5px 0 var(--brand);
        }
        .qgw-panel-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 600;
        }

        .qgw-panel-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .qgw-preview-pane {
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
        }
        .qgw-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px 0;
          flex-shrink: 0;
        }
        .qgw-preview-title {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }
        .qgw-preview-live {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--brand);
          font-family: var(--font-sans);
          font-weight: 500;
        }
        .qgw-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--brand);
          animation: qgw-pulse 2s infinite;
        }
        @keyframes qgw-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .qgw-footer {
          display: flex;
          border-top: 0.5px solid var(--border);
          padding: 10px 20px;
          flex-wrap: wrap;
          gap: 12px 24px;
        }
        .qgw-footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }
        .qgw-footer-item i { font-size: 13px; }

        @media (max-width: 900px) {
          .qgw-workspace {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .qgw-config {
            border-right: none;
            border-bottom: 0.5px solid var(--border);
          }
          .qgw-preview-pane { min-height: 360px; }
        }

        @media (max-width: 560px) {
          .qgw-type-btn span { display: none; }
          .qgw-type-btn { padding: 8px 12px; }
          .qgw-panel-body { padding: 16px; }
          .qgw-footer { padding: 10px 16px; }
          .qgw-footer-item:not(:first-child) { display: none; }
        }
      `}</style>
        </>
    );
}