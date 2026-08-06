// features/social/qr-generator/TypeInput.tsx
"use client";

import type { QrType, WifiData, EmailData, VCardData, SmsData, LocationData } from "./ts/types";
import styles from "./style/TypeInput.module.css";

type TypeInputProps = {
  type: QrType;
  url: string;
  setUrl: (v: string | ((prev: string) => string)) => void;
  text: string;
  setText: (v: string | ((prev: string) => string)) => void;
  email: EmailData;
  setEmail: (v: EmailData | ((prev: EmailData) => EmailData)) => void;
  phone: string;
  setPhone: (v: string | ((prev: string) => string)) => void;
  wifi: WifiData;
  setWifi: (v: WifiData | ((prev: WifiData) => WifiData)) => void;
  vcard: VCardData;
  setVcard: (v: VCardData | ((prev: VCardData) => VCardData)) => void;
  sms: SmsData;
  setSms: (v: SmsData | ((prev: SmsData) => SmsData)) => void;
  location: LocationData;
  setLocation: (v: LocationData | ((prev: LocationData) => LocationData)) => void;
};

export default function TypeInput(props: TypeInputProps) {
  const {
    type,
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
  } = props;

  return (
    <div className={styles.tiRoot}>
      {type === "url" && (
        <div className={styles.tiField}>
          <label className={styles.tiLabel} htmlFor="ti-url">
            Website URL
          </label>
          <input
            id="ti-url"
            type="url"
            className={styles.tiInput}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
          />
        </div>
      )}

      {type === "text" && (
        <div className={styles.tiField}>
          <label className={styles.tiLabel} htmlFor="ti-text">
            Plain text
          </label>
          <textarea
            id="ti-text"
            className={styles.tiTextarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter any text..."
            rows={5}
          />
          <span className={styles.tiHint}>
            {text.length} chars · QR codes support up to ~3,000 chars
          </span>
        </div>
      )}

      {type === "email" && (
        <>
          <div className={styles.tiField}>
            <label className={styles.tiLabel} htmlFor="ti-email-addr">
              Email address
            </label>
            <input
              id="ti-email-addr"
              type="email"
              className={styles.tiInput}
              value={email.address}
              onChange={(e) =>
                setEmail((prev: EmailData) => ({ ...prev, address: e.target.value }))
              }
              placeholder="name@example.com"
            />
          </div>
          <div className={styles.tiField}>
            <label className={styles.tiLabel} htmlFor="ti-email-sub">
              Subject <span className={styles.tiOptional}>optional</span>
            </label>
            <input
              id="ti-email-sub"
              type="text"
              className={styles.tiInput}
              value={email.subject}
              onChange={(e) =>
                setEmail((prev: EmailData) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Hello!"
            />
          </div>
          <div className={styles.tiField}>
            <label className={styles.tiLabel} htmlFor="ti-email-body">
              Message <span className={styles.tiOptional}>optional</span>
            </label>
            <textarea
              id="ti-email-body"
              className={styles.tiTextarea}
              value={email.body}
              onChange={(e) => setEmail((prev: EmailData) => ({ ...prev, body: e.target.value }))}
              placeholder="Hi there..."
              rows={3}
            />
          </div>
        </>
      )}

      {type === "phone" && (
        <div className={styles.tiField}>
          <label className={styles.tiLabel} htmlFor="ti-phone">
            Phone number
          </label>
          <input
            id="ti-phone"
            type="tel"
            className={styles.tiInput}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 1234"
          />
          <span className={styles.tiHint}>Scanning will open the dialer</span>
        </div>
      )}

      {type === "wifi" && (
        <>
          <div className={styles.tiField}>
            <label className={styles.tiLabel} htmlFor="ti-ssid">
              Network name (SSID)
            </label>
            <input
              id="ti-ssid"
              type="text"
              className={styles.tiInput}
              value={wifi.ssid}
              onChange={(e) => setWifi((prev: WifiData) => ({ ...prev, ssid: e.target.value }))}
              placeholder="My Network"
            />
          </div>
          <div className={styles.tiRow}>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-enc">
                Security type
              </label>
              <select
                id="ti-enc"
                className={styles.tiSelect}
                value={wifi.encryption}
                onChange={(e) =>
                  setWifi((prev: WifiData) => ({ ...prev, encryption: e.target.value as any }))
                }
              >
                <option value="WPA">WPA / WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
            <div className={styles.tiField}>
              <label className={`${styles.tiLabel} ${styles.tiToggleLabel}`}>
                <span>Hidden network</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={wifi.hidden}
                  className={`${styles.tiToggle} ${wifi.hidden ? styles.on : ""}`}
                  onClick={() => setWifi((prev: WifiData) => ({ ...prev, hidden: !prev.hidden }))}
                >
                  <span className={styles.tiToggleThumb} />
                </button>
              </label>
            </div>
          </div>
          {wifi.encryption !== "nopass" && (
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-pass">
                Password
              </label>
              <input
                id="ti-pass"
                type="text"
                className={styles.tiInput}
                value={wifi.password}
                onChange={(e) => setWifi((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Wi-Fi password"
                autoComplete="off"
              />
            </div>
          )}
        </>
      )}

      {type === "vcard" && (
        <>
          <div className={styles.tiRow}>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-fn">
                First name
              </label>
              <input
                id="ti-fn"
                type="text"
                className={styles.tiInput}
                value={vcard.firstName}
                onChange={(e) => setVcard((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="Jane"
              />
            </div>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-ln">
                Last name
              </label>
              <input
                id="ti-ln"
                type="text"
                className={styles.tiInput}
                value={vcard.lastName}
                onChange={(e) => setVcard((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Smith"
              />
            </div>
          </div>
          <div className={styles.tiRow}>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-vc-phone">
                Phone
              </label>
              <input
                id="ti-vc-phone"
                type="tel"
                className={styles.tiInput}
                value={vcard.phone}
                onChange={(e) => setVcard((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 555 000 1234"
              />
            </div>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-vc-email">
                Email
              </label>
              <input
                id="ti-vc-email"
                type="email"
                className={styles.tiInput}
                value={vcard.email}
                onChange={(e) => setVcard((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
          </div>
          <div className={styles.tiRow}>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-company">
                Company <span className={styles.tiOptional}>optional</span>
              </label>
              <input
                id="ti-company"
                type="text"
                className={styles.tiInput}
                value={vcard.company}
                onChange={(e) => setVcard((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-title">
                Job title <span className={styles.tiOptional}>optional</span>
              </label>
              <input
                id="ti-title"
                type="text"
                className={styles.tiInput}
                value={vcard.title}
                onChange={(e) => setVcard((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Designer"
              />
            </div>
          </div>
          <div className={styles.tiField}>
            <label className={styles.tiLabel} htmlFor="ti-vc-web">
              Website <span className={styles.tiOptional}>optional</span>
            </label>
            <input
              id="ti-vc-web"
              type="url"
              className={styles.tiInput}
              value={vcard.website}
              onChange={(e) => setVcard((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://janesmith.com"
            />
          </div>
        </>
      )}

      {type === "sms" && (
        <>
          <div className={styles.tiField}>
            <label className={styles.tiLabel} htmlFor="ti-sms-phone">
              Phone number
            </label>
            <input
              id="ti-sms-phone"
              type="tel"
              className={styles.tiInput}
              value={sms.phone}
              onChange={(e) => setSms((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 555 000 1234"
            />
          </div>
          <div className={styles.tiField}>
            <label className={styles.tiLabel} htmlFor="ti-sms-msg">
              Message <span className={styles.tiOptional}>optional</span>
            </label>
            <textarea
              id="ti-sms-msg"
              className={styles.tiTextarea}
              value={sms.message}
              onChange={(e) => setSms((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Hey, scan this to text me!"
              rows={3}
            />
          </div>
        </>
      )}

      {type === "location" && (
        <>
          <div className={styles.tiRow}>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-lat">
                Latitude
              </label>
              <input
                id="ti-lat"
                type="text"
                className={styles.tiInput}
                value={location.lat}
                onChange={(e) => setLocation((prev) => ({ ...prev, lat: e.target.value }))}
                placeholder="40.7128"
              />
            </div>
            <div className={styles.tiField}>
              <label className={styles.tiLabel} htmlFor="ti-lng">
                Longitude
              </label>
              <input
                id="ti-lng"
                type="text"
                className={styles.tiInput}
                value={location.lng}
                onChange={(e) => setLocation((prev) => ({ ...prev, lng: e.target.value }))}
                placeholder="-74.0060"
              />
            </div>
          </div>
          <div className={styles.tiField}>
            <label className={styles.tiLabel} htmlFor="ti-loc-label">
              Label <span className={styles.tiOptional}>optional</span>
            </label>
            <input
              id="ti-loc-label"
              type="text"
              className={styles.tiInput}
              value={location.label}
              onChange={(e) => setLocation((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Empire State Building"
            />
          </div>
          <span className={styles.tiHint}>Scanning will open the default map app</span>
        </>
      )}
    </div>
  );
}