// features/social/meta-tag-generator/AdvancedMetaForm.tsx
"use client";

import type { MetaTags, SchemaType } from "./ts/types";
import styles from "./style/AdvancedMetaForm.module.css";

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
    <div className={styles.amfRoot}>
      <div className={styles.amfSection}>
        <div className={styles.amfSectionTitle}>
          <i className="ti ti-device-mobile" aria-hidden="true" />
          <span>Mobile & PWA</span>
        </div>

        <div className={styles.amfField}>
          <label className={styles.amfLabel} htmlFor="amf-theme-color">
            Theme Color
          </label>
          <div className={styles.amfColorRow}>
            <input
              type="color"
              className={styles.amfColorPicker}
              value={tags.themeColor || "#000000"}
              onChange={(e) => set({ themeColor: e.target.value })}
            />
            <input
              id="amf-theme-color"
              type="text"
              className={styles.amfInput}
              value={tags.themeColor}
              onChange={(e) => set({ themeColor: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className={styles.amfField}>
          <label className={styles.amfLabel} htmlFor="amf-ms-tile">
            MS Tile Color
          </label>
          <div className={styles.amfColorRow}>
            <input
              type="color"
              className={styles.amfColorPicker}
              value={tags.msapplicationTileColor || "#000000"}
              onChange={(e) => set({ msapplicationTileColor: e.target.value })}
            />
            <input
              id="amf-ms-tile"
              type="text"
              className={styles.amfInput}
              value={tags.msapplicationTileColor}
              onChange={(e) => set({ msapplicationTileColor: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className={styles.amfToggleRow}>
          <span className={styles.amfToggleLabel}>Apple Mobile Web App Capable</span>
          <button
            type="button"
            role="switch"
            aria-checked={tags.appleMobileWebAppCapable === "yes"}
            className={`${styles.amfToggle} ${tags.appleMobileWebAppCapable === "yes" ? styles.on : ""}`}
            onClick={() =>
              set({
                appleMobileWebAppCapable: tags.appleMobileWebAppCapable === "yes" ? "" : "yes",
              })
            }
          >
            <span className={styles.amfToggleThumb} />
          </button>
        </div>

        {tags.appleMobileWebAppCapable === "yes" && (
          <>
            <div className={styles.amfField}>
              <label className={styles.amfLabel} htmlFor="amf-status-bar">
                Status Bar Style
              </label>
              <select
                id="amf-status-bar"
                className={styles.amfSelect}
                value={tags.appleMobileWebAppStatusBarStyle}
                onChange={(e) => set({ appleMobileWebAppStatusBarStyle: e.target.value })}
              >
                <option value="default">Default</option>
                <option value="black">Black</option>
                <option value="black-translucent">Black Translucent</option>
              </select>
            </div>

            <div className={styles.amfField}>
              <label className={styles.amfLabel} htmlFor="amf-app-title">
                App Title
              </label>
              <input
                id="amf-app-title"
                type="text"
                className={styles.amfInput}
                value={tags.appleMobileWebAppTitle}
                onChange={(e) => set({ appleMobileWebAppTitle: e.target.value })}
                placeholder="My App"
              />
            </div>
          </>
        )}
      </div>

      <div className={styles.amfSection}>
        <div className={styles.amfSectionTitle}>
          <i className="ti ti-photo" aria-hidden="true" />
          <span>Favicons & Icons</span>
        </div>

        <div className={styles.amfField}>
          <label className={styles.amfLabel} htmlFor="amf-favicon">
            Favicon URL
          </label>
          <input
            id="amf-favicon"
            type="url"
            className={styles.amfInput}
            value={tags.favicon}
            onChange={(e) => set({ favicon: e.target.value })}
            placeholder="https://example.com/favicon.ico"
          />
        </div>

        <div className={styles.amfRow}>
          <div className={styles.amfField}>
            <label className={styles.amfLabel} htmlFor="amf-icon16">
              16x16 Icon
            </label>
            <input
              id="amf-icon16"
              type="url"
              className={styles.amfInput}
              value={tags.icon16}
              onChange={(e) => set({ icon16: e.target.value })}
              placeholder="https://example.com/icon-16.png"
            />
          </div>
          <div className={styles.amfField}>
            <label className={styles.amfLabel} htmlFor="amf-icon32">
              32x32 Icon
            </label>
            <input
              id="amf-icon32"
              type="url"
              className={styles.amfInput}
              value={tags.icon32}
              onChange={(e) => set({ icon32: e.target.value })}
              placeholder="https://example.com/icon-32.png"
            />
          </div>
        </div>

        <div className={styles.amfField}>
          <label className={styles.amfLabel} htmlFor="amf-apple-touch">
            Apple Touch Icon
          </label>
          <input
            id="amf-apple-touch"
            type="url"
            className={styles.amfInput}
            value={tags.appleTouchIcon}
            onChange={(e) => set({ appleTouchIcon: e.target.value })}
            placeholder="https://example.com/apple-touch-icon.png"
          />
        </div>
      </div>

      <div className={styles.amfSection}>
        <div className={styles.amfSectionHeader}>
          <div className={styles.amfSectionTitle}>
            <i className="ti ti-code" aria-hidden="true" />
            <span>Schema.org Structured Data</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={tags.enableSchema}
            className={`${styles.amfToggle} ${tags.enableSchema ? styles.on : ""}`}
            onClick={() => set({ enableSchema: !tags.enableSchema })}
          >
            <span className={styles.amfToggleThumb} />
          </button>
        </div>

        {tags.enableSchema && (
          <>
            <div className={styles.amfField}>
              <label className={styles.amfLabel}>Schema Type</label>
              <div className={styles.amfSchemaGrid}>
                {SCHEMA_TYPES.map((schema) => (
                  <button
                    key={schema.value}
                    type="button"
                    className={`${styles.amfSchemaBtn} ${tags.schemaType === schema.value ? styles.active : ""}`}
                    onClick={() => set({ schemaType: schema.value })}
                  >
                    <i className={`ti ${schema.icon}`} aria-hidden="true" />
                    <span>{schema.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className={styles.amfHint}>
              <i className="ti ti-info-circle" aria-hidden="true" />
              Schema data will be auto-generated based on your title, description, and other meta
              fields.
            </p>
          </>
        )}
      </div>
    </div>
  );
}