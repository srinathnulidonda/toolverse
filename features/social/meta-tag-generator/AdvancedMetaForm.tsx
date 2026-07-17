// features/social/meta-tag-generator/AdvancedMetaForm.tsx
"use client";

import type { MetaTags, SchemaType } from "./types";

type AdvancedMetaFormProps = {
  tags: MetaTags;
  onChange: (tags: MetaTags) => void;
};

const SCHEMA_TYPES: { value: SchemaType; label: string; icon: string }[] = [
  { value: "Article", label: "Article", icon: "ti-article" },
  { value: "BlogPosting", label: "Blog Post", icon: "ti-notes" },
  { value: "NewsArticle", label: "News Article", icon: "ti-news" },
  { value: "Product", label: "Product", icon: "ti-package" },
  { value: "Organization", label: "Organization", icon: "ti-building" },
  { value: "Person", label: "Person", icon: "ti-user" },
  { value: "WebSite", label: "Website", icon: "ti-world" },
  { value: "VideoObject", label: "Video", icon: "ti-video" },
  { value: "Recipe", label: "Recipe", icon: "ti-chef-hat" },
  { value: "Event", label: "Event", icon: "ti-calendar-event" },
  { value: "LocalBusiness", label: "Local Business", icon: "ti-map-pin" },
];

export default function AdvancedMetaForm({ tags, onChange }: AdvancedMetaFormProps) {
  const set = (patch: Partial<MetaTags>) => onChange({ ...tags, ...patch });

  return (
    <>
      <div className="amf-root">
        {/* Theme & Mobile */}
        <div className="amf-section">
          <div className="amf-section-title">
            <i className="ti ti-device-mobile" aria-hidden="true" />
            <span>Mobile & PWA</span>
          </div>

          <div className="amf-field">
            <label className="amf-label" htmlFor="amf-theme-color">
              Theme Color
            </label>
            <div className="amf-color-row">
              <input
                type="color"
                className="amf-color-picker"
                value={tags.themeColor || "#000000"}
                onChange={(e) => set({ themeColor: e.target.value })}
              />
              <input
                id="amf-theme-color"
                type="text"
                className="amf-input"
                value={tags.themeColor}
                onChange={(e) => set({ themeColor: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="amf-field">
            <label className="amf-label" htmlFor="amf-ms-tile">
              MS Tile Color
            </label>
            <div className="amf-color-row">
              <input
                type="color"
                className="amf-color-picker"
                value={tags.msapplicationTileColor || "#000000"}
                onChange={(e) => set({ msapplicationTileColor: e.target.value })}
              />
              <input
                id="amf-ms-tile"
                type="text"
                className="amf-input"
                value={tags.msapplicationTileColor}
                onChange={(e) => set({ msapplicationTileColor: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="amf-toggle-row">
            <span className="amf-toggle-label">Apple Mobile Web App Capable</span>
            <button
              type="button"
              role="switch"
              aria-checked={tags.appleMobileWebAppCapable === "yes"}
              className={`amf-toggle ${tags.appleMobileWebAppCapable === "yes" ? "on" : ""}`}
              onClick={() =>
                set({
                  appleMobileWebAppCapable: tags.appleMobileWebAppCapable === "yes" ? "" : "yes",
                })
              }
            >
              <span className="amf-toggle-thumb" />
            </button>
          </div>

          {tags.appleMobileWebAppCapable === "yes" && (
            <>
              <div className="amf-field">
                <label className="amf-label" htmlFor="amf-status-bar">
                  Status Bar Style
                </label>
                <select
                  id="amf-status-bar"
                  className="amf-select"
                  value={tags.appleMobileWebAppStatusBarStyle}
                  onChange={(e) => set({ appleMobileWebAppStatusBarStyle: e.target.value })}
                >
                  <option value="default">Default</option>
                  <option value="black">Black</option>
                  <option value="black-translucent">Black Translucent</option>
                </select>
              </div>

              <div className="amf-field">
                <label className="amf-label" htmlFor="amf-app-title">
                  App Title
                </label>
                <input
                  id="amf-app-title"
                  type="text"
                  className="amf-input"
                  value={tags.appleMobileWebAppTitle}
                  onChange={(e) => set({ appleMobileWebAppTitle: e.target.value })}
                  placeholder="My App"
                />
              </div>
            </>
          )}
        </div>

        {/* Favicons */}
        <div className="amf-section">
          <div className="amf-section-title">
            <i className="ti ti-photo" aria-hidden="true" />
            <span>Favicons & Icons</span>
          </div>

          <div className="amf-field">
            <label className="amf-label" htmlFor="amf-favicon">
              Favicon URL
            </label>
            <input
              id="amf-favicon"
              type="url"
              className="amf-input"
              value={tags.favicon}
              onChange={(e) => set({ favicon: e.target.value })}
              placeholder="https://example.com/favicon.ico"
            />
          </div>

          <div className="amf-row">
            <div className="amf-field">
              <label className="amf-label" htmlFor="amf-icon16">
                16x16 Icon
              </label>
              <input
                id="amf-icon16"
                type="url"
                className="amf-input"
                value={tags.icon16}
                onChange={(e) => set({ icon16: e.target.value })}
                placeholder="https://example.com/icon-16.png"
              />
            </div>
            <div className="amf-field">
              <label className="amf-label" htmlFor="amf-icon32">
                32x32 Icon
              </label>
              <input
                id="amf-icon32"
                type="url"
                className="amf-input"
                value={tags.icon32}
                onChange={(e) => set({ icon32: e.target.value })}
                placeholder="https://example.com/icon-32.png"
              />
            </div>
          </div>

          <div className="amf-field">
            <label className="amf-label" htmlFor="amf-apple-touch">
              Apple Touch Icon
            </label>
            <input
              id="amf-apple-touch"
              type="url"
              className="amf-input"
              value={tags.appleTouchIcon}
              onChange={(e) => set({ appleTouchIcon: e.target.value })}
              placeholder="https://example.com/apple-touch-icon.png"
            />
          </div>
        </div>

        {/* Schema.org */}
        <div className="amf-section">
          <div className="amf-section-header">
            <div className="amf-section-title">
              <i className="ti ti-code" aria-hidden="true" />
              <span>Schema.org Structured Data</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={tags.enableSchema}
              className={`amf-toggle ${tags.enableSchema ? "on" : ""}`}
              onClick={() => set({ enableSchema: !tags.enableSchema })}
            >
              <span className="amf-toggle-thumb" />
            </button>
          </div>

          {tags.enableSchema && (
            <>
              <div className="amf-field">
                <label className="amf-label">Schema Type</label>
                <div className="amf-schema-grid">
                  {SCHEMA_TYPES.map((schema) => (
                    <button
                      key={schema.value}
                      type="button"
                      className={`amf-schema-btn ${tags.schemaType === schema.value ? "active" : ""}`}
                      onClick={() => set({ schemaType: schema.value })}
                    >
                      <i className={`ti ${schema.icon}`} aria-hidden="true" />
                      <span>{schema.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="amf-hint">
                <i className="ti ti-info-circle" aria-hidden="true" />
                Schema data will be auto-generated based on your title, description, and other meta
                fields.
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        .amf-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .amf-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 10px;
        }

        .amf-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 4px;
          border-bottom: 0.5px solid var(--border);
        }

        .amf-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .amf-section-title i { font-size: 16px; color: var(--text-secondary); }
        .amf-section:not(:has(.amf-section-header)) .amf-section-title {
          padding-bottom: 4px;
          border-bottom: 0.5px solid var(--border);
        }

        .amf-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .amf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .amf-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .amf-input, .amf-select {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text);
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          padding: 9px 11px;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
        }
        .amf-input:focus, .amf-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .amf-select { cursor: pointer; }

        .amf-color-row {
          display: flex;
          gap: 8px;
        }
        .amf-color-picker {
          width: 42px;
          height: 38px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          cursor: pointer;
        }

        .amf-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 7px;
        }
        .amf-toggle-label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .amf-toggle {
          width: 40px;
          height: 22px;
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
        .amf-toggle.on { background: var(--brand); }
        .amf-toggle-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        .amf-toggle.on .amf-toggle-thumb { transform: translateX(18px); }

        .amf-schema-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .amf-schema-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.12s;
        }
        .amf-schema-btn:hover { background: var(--border-faint); }
        .amf-schema-btn.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }
        .amf-schema-btn i {
          font-size: 20px;
          color: var(--text-secondary);
        }
        .amf-schema-btn.active i { color: var(--brand-text); }
        .amf-schema-btn span {
          font-size: 10.5px;
          font-weight: 500;
          color: var(--text-secondary);
          text-align: center;
        }
        .amf-schema-btn.active span { color: var(--brand-text); }

        .amf-hint {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 11.5px;
          color: var(--text-tertiary);
          line-height: 1.5;
          margin: 0;
        }
        .amf-hint i { font-size: 13px; margin-top: 1px; flex-shrink: 0; }

        @media (max-width: 600px) {
          .amf-row {
            grid-template-columns: 1fr;
          }
          .amf-schema-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
}
