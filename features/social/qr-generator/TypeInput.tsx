// features/social/qr-generator/TypeInput.tsx
"use client";

import type { QrType, WifiData, EmailData, VCardData, SmsData, LocationData } from "./types";

type TypeInputProps = {
    type: QrType;
    url: string; setUrl: (v: string) => void;
    text: string; setText: (v: string) => void;
    email: EmailData; setEmail: (v: EmailData) => void;
    phone: string; setPhone: (v: string) => void;
    wifi: WifiData; setWifi: (v: WifiData) => void;
    vcard: VCardData; setVcard: (v: VCardData) => void;
    sms: SmsData; setSms: (v: SmsData) => void;
    location: LocationData; setLocation: (v: LocationData) => void;
};

export default function TypeInput(props: TypeInputProps) {
    const {
        type,
        url, setUrl,
        text, setText,
        email, setEmail,
        phone, setPhone,
        wifi, setWifi,
        vcard, setVcard,
        sms, setSms,
        location, setLocation,
    } = props;

    return (
        <>
            <div className="ti-root">
                {type === "url" && (
                    <div className="ti-field">
                        <label className="ti-label" htmlFor="ti-url">Website URL</label>
                        <input
                            id="ti-url" type="url" className="ti-input"
                            value={url} onChange={e => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            autoFocus
                        />
                    </div>
                )}

                {type === "text" && (
                    <div className="ti-field">
                        <label className="ti-label" htmlFor="ti-text">Plain text</label>
                        <textarea
                            id="ti-text" className="ti-textarea"
                            value={text} onChange={e => setText(e.target.value)}
                            placeholder="Enter any text..."
                            rows={5}
                        />
                        <span className="ti-hint">{text.length} chars · QR codes support up to ~3,000 chars</span>
                    </div>
                )}

                {type === "email" && (
                    <>
                        <div className="ti-field">
                            <label className="ti-label" htmlFor="ti-email-addr">Email address</label>
                            <input id="ti-email-addr" type="email" className="ti-input"
                                value={email.address} onChange={e => setEmail({ ...email, address: e.target.value })}
                                placeholder="name@example.com" />
                        </div>
                        <div className="ti-field">
                            <label className="ti-label" htmlFor="ti-email-sub">Subject <span className="ti-optional">optional</span></label>
                            <input id="ti-email-sub" type="text" className="ti-input"
                                value={email.subject} onChange={e => setEmail({ ...email, subject: e.target.value })}
                                placeholder="Hello!" />
                        </div>
                        <div className="ti-field">
                            <label className="ti-label" htmlFor="ti-email-body">Message <span className="ti-optional">optional</span></label>
                            <textarea id="ti-email-body" className="ti-textarea"
                                value={email.body} onChange={e => setEmail({ ...email, body: e.target.value })}
                                placeholder="Hi there..." rows={3} />
                        </div>
                    </>
                )}

                {type === "phone" && (
                    <div className="ti-field">
                        <label className="ti-label" htmlFor="ti-phone">Phone number</label>
                        <input id="ti-phone" type="tel" className="ti-input"
                            value={phone} onChange={e => setPhone(e.target.value)}
                            placeholder="+1 555 000 1234" />
                        <span className="ti-hint">Scanning will open the dialer</span>
                    </div>
                )}

                {type === "wifi" && (
                    <>
                        <div className="ti-field">
                            <label className="ti-label" htmlFor="ti-ssid">Network name (SSID)</label>
                            <input id="ti-ssid" type="text" className="ti-input"
                                value={wifi.ssid} onChange={e => setWifi({ ...wifi, ssid: e.target.value })}
                                placeholder="My Network" />
                        </div>
                        <div className="ti-row">
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-enc">Security type</label>
                                <select id="ti-enc" className="ti-select"
                                    value={wifi.encryption}
                                    onChange={e => setWifi({ ...wifi, encryption: e.target.value as any })}>
                                    <option value="WPA">WPA / WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">None</option>
                                </select>
                            </div>
                            <div className="ti-field">
                                <label className="ti-label ti-toggle-label">
                                    <span>Hidden network</span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={wifi.hidden}
                                        className={`ti-toggle ${wifi.hidden ? "on" : ""}`}
                                        onClick={() => setWifi({ ...wifi, hidden: !wifi.hidden })}
                                    >
                                        <span className="ti-toggle-thumb" />
                                    </button>
                                </label>
                            </div>
                        </div>
                        {wifi.encryption !== "nopass" && (
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-pass">Password</label>
                                <input id="ti-pass" type="text" className="ti-input"
                                    value={wifi.password} onChange={e => setWifi({ ...wifi, password: e.target.value })}
                                    placeholder="Wi-Fi password" autoComplete="off" />
                            </div>
                        )}
                    </>
                )}

                {type === "vcard" && (
                    <>
                        <div className="ti-row">
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-fn">First name</label>
                                <input id="ti-fn" type="text" className="ti-input"
                                    value={vcard.firstName} onChange={e => setVcard({ ...vcard, firstName: e.target.value })}
                                    placeholder="Jane" />
                            </div>
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-ln">Last name</label>
                                <input id="ti-ln" type="text" className="ti-input"
                                    value={vcard.lastName} onChange={e => setVcard({ ...vcard, lastName: e.target.value })}
                                    placeholder="Smith" />
                            </div>
                        </div>
                        <div className="ti-row">
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-vc-phone">Phone</label>
                                <input id="ti-vc-phone" type="tel" className="ti-input"
                                    value={vcard.phone} onChange={e => setVcard({ ...vcard, phone: e.target.value })}
                                    placeholder="+1 555 000 1234" />
                            </div>
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-vc-email">Email</label>
                                <input id="ti-vc-email" type="email" className="ti-input"
                                    value={vcard.email} onChange={e => setVcard({ ...vcard, email: e.target.value })}
                                    placeholder="jane@example.com" />
                            </div>
                        </div>
                        <div className="ti-row">
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-company">Company <span className="ti-optional">optional</span></label>
                                <input id="ti-company" type="text" className="ti-input"
                                    value={vcard.company} onChange={e => setVcard({ ...vcard, company: e.target.value })}
                                    placeholder="Acme Corp" />
                            </div>
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-title">Job title <span className="ti-optional">optional</span></label>
                                <input id="ti-title" type="text" className="ti-input"
                                    value={vcard.title} onChange={e => setVcard({ ...vcard, title: e.target.value })}
                                    placeholder="Designer" />
                            </div>
                        </div>
                        <div className="ti-field">
                            <label className="ti-label" htmlFor="ti-vc-web">Website <span className="ti-optional">optional</span></label>
                            <input id="ti-vc-web" type="url" className="ti-input"
                                value={vcard.website} onChange={e => setVcard({ ...vcard, website: e.target.value })}
                                placeholder="https://janesmith.com" />
                        </div>
                    </>
                )}

                {type === "sms" && (
                    <>
                        <div className="ti-field">
                            <label className="ti-label" htmlFor="ti-sms-phone">Phone number</label>
                            <input id="ti-sms-phone" type="tel" className="ti-input"
                                value={sms.phone} onChange={e => setSms({ ...sms, phone: e.target.value })}
                                placeholder="+1 555 000 1234" />
                        </div>
                        <div className="ti-field">
                            <label className="ti-label" htmlFor="ti-sms-msg">Message <span className="ti-optional">optional</span></label>
                            <textarea id="ti-sms-msg" className="ti-textarea"
                                value={sms.message} onChange={e => setSms({ ...sms, message: e.target.value })}
                                placeholder="Hey, scan this to text me!" rows={3} />
                        </div>
                    </>
                )}

                {type === "location" && (
                    <>
                        <div className="ti-row">
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-lat">Latitude</label>
                                <input id="ti-lat" type="text" className="ti-input"
                                    value={location.lat} onChange={e => setLocation({ ...location, lat: e.target.value })}
                                    placeholder="40.7128" />
                            </div>
                            <div className="ti-field">
                                <label className="ti-label" htmlFor="ti-lng">Longitude</label>
                                <input id="ti-lng" type="text" className="ti-input"
                                    value={location.lng} onChange={e => setLocation({ ...location, lng: e.target.value })}
                                    placeholder="-74.0060" />
                            </div>
                        </div>
                        <div className="ti-field">
                            <label className="ti-label" htmlFor="ti-loc-label">Label <span className="ti-optional">optional</span></label>
                            <input id="ti-loc-label" type="text" className="ti-input"
                                value={location.label} onChange={e => setLocation({ ...location, label: e.target.value })}
                                placeholder="Empire State Building" />
                        </div>
                        <span className="ti-hint">Scanning will open the default map app</span>
                    </>
                )}
            </div>

            <style>{`
        .ti-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ti-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ti-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ti-label {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ti-optional {
          font-size: 11px;
          font-weight: 400;
          color: var(--text-tertiary);
        }
        .ti-input, .ti-textarea, .ti-select {
          font-family: var(--font-sans);
          font-size: 13.5px;
          color: var(--text);
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          padding: 9px 12px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          width: 100%;
        }
        .ti-input:focus, .ti-textarea:focus, .ti-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .ti-textarea {
          resize: vertical;
          min-height: 72px;
          line-height: 1.6;
        }
        .ti-input::placeholder, .ti-textarea::placeholder {
          color: var(--text-disabled);
        }
        .ti-select { cursor: pointer; }
        .ti-hint {
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .ti-toggle-label {
          justify-content: space-between;
          cursor: pointer;
          height: 38px;
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          padding: 0 12px;
        }
        .ti-toggle {
          width: 36px;
          height: 20px;
          border-radius: 999px;
          background: var(--border);
          border: none;
          padding: 2px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .ti-toggle.on { background: var(--brand); }
        .ti-toggle-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          transition: transform 0.2s;
          display: block;
        }
        .ti-toggle.on .ti-toggle-thumb { transform: translateX(16px); }

        @media (max-width: 600px) {
          .ti-row { grid-template-columns: 1fr; }
        }
      `}</style>
        </>
    );
}