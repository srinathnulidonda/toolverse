// features/social/og-preview/MetaInputForm.tsx
"use client";
import { useState } from "react";
import type { MetaData, InputMode, TwitterCardType } from "./ts/types";
import { fetchMetaFromUrl } from "./ts/utils";
import styles from "./style/MetaInputForm.module.css";

type MetaInputFormProps = {
  meta: MetaData;
  onChange: (meta: MetaData) => void;
};

const TWITTER_CARD_TYPES: { value: TwitterCardType; label: string; desc: string }[] = [
  { value: "summary", label: "Summary", desc: "Square image, minimal" },
  { value: "summary_large_image", label: "Large Image", desc: "Wide image, recommended" },
  { value: "player", label: "Player", desc: "Video/audio player" },
  { value: "app", label: "App", desc: "Mobile app card" },
];

const OG_TYPES = [
  { value: "website", label: "Website" },
  { value: "article", label: "Article" },
  { value: "product", label: "Product" },
  { value: "video.movie", label: "Video" },
  { value: "music.song", label: "Music" },
  { value: "profile", label: "Profile" },
  { value: "book", label: "Book" },
];

export default function MetaInputForm({ meta, onChange }: MetaInputFormProps) {
  const [mode, setMode] = useState<InputMode>("manual");
  const [fetchUrl, setFetchUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    twitter: false,
    advanced: false,
    seo: false,
  });

  const handleFetch = async () => {
    if (!fetchUrl.trim()) return;

    setFetching(true);
    setFetchError("");

    try {
      const fetchedMeta = await fetchMetaFromUrl(fetchUrl);
      onChange({ ...meta, ...fetchedMeta });
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Failed to fetch metadata");
    } finally {
      setFetching(false);
    }
  };

  const set = (patch: Partial<MetaData>) => onChange({ ...meta, ...patch });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <div className={styles.mifRoot}>
        {/* Mode toggle */}
        <div className={styles.mifModeToggle}>
          <button
            className={`${styles.mifModeBtn} ${mode === "manual" ? styles.active : ""}`}
            onClick={() => setMode("manual")}
          >
            <i className="ti ti-edit" aria-hidden="true" />
            Manual Input
          </button>
          <button
            className={`${styles.mifModeBtn} ${mode === "url" ? styles.active : ""}`}
            onClick={() => setMode("url")}
          >
            <i className="ti ti-world-download" aria-hidden="true" />
            Fetch from URL
          </button>
        </div>

        {/* URL Fetch mode */}
        {mode === "url" && (
          <div className={styles.mifFetchSection}>
            <div className={styles.mifFetchInputRow}>
              <input
                type="url"
                className={styles.mifFetchInput}
                placeholder="https://example.com"
                value={fetchUrl}
                onChange={(e) => setFetchUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
              <button
                className={styles.mifFetchBtn}
                onClick={handleFetch}
                disabled={!fetchUrl.trim() || fetching}
              >
                {fetching ? (
                  <>
                    <i className="ti ti-loader-2 mifSpin" aria-hidden="true" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <i className="ti ti-download" aria-hidden="true" />
                    Fetch Meta
                  </>
                )}
              </button>
            </div>
            {fetchError && (
              <p className={styles.mifError}>
                <i className="ti ti-alert-circle" aria-hidden="true" />
                {fetchError}
              </p>
            )}
            <p className={styles.mifHint}>
              <i className="ti ti-info-circle" aria-hidden="true" />
              Enter any URL to automatically extract its Open Graph and Twitter Card meta tags
            </p>
          </div>
        )}

        {/* Basic Meta Tags */}
        <section className={styles.mifSection}>
          <button className={styles.mifSectionHeader} onClick={() => toggleSection("basic")}>
            <div className={styles.mifSectionHeaderLeft}>
              <i className="ti ti-file-text" aria-hidden="true" />
              <span className={styles.mifSectionTitle}>Basic Meta Tags</span>
              <span className={`${styles.mifSectionBadge}`}>Required</span>
            </div>
            <i
              className={`ti ti-chevron-down mifChevron ${expandedSections.basic ? styles.expanded : ""}`}
              aria-hidden="true"
            />
          </button>

          {expandedSections.basic && (
            <div className={styles.mifSectionBody}>
              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-title">
                  Page Title
                  <span
                    className={styles.mifCharCount}
                    style={{ color: meta.title.length > 60 ? "#D97706" : "var(--text-tertiary)" }}
                  >
                    {meta.title.length}/60
                  </span>
                </label>
                <input
                  id="mif-title"
                  type="text"
                  className={styles.mifInput}
                  value={meta.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="Ultimate Guide to Open Graph Tags"
                  maxLength={100}
                />
                <span className={styles.mifHint}>Shown as the main headline when shared</span>
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-description">
                  Description
                  <span
                    className={styles.mifCharCount}
                    style={{
                      color: meta.description.length > 155 ? "#D97706" : "var(--text-tertiary)",
                    }}
                  >
                    {meta.description.length}/155
                  </span>
                </label>
                <textarea
                  id="mif-description"
                  className={styles.mifTextarea}
                  value={meta.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="A comprehensive guide to implementing Open Graph meta tags for better social media sharing..."
                  rows={3}
                  maxLength={300}
                />
                <span className={styles.mifHint}>Keep between 125-155 characters for best results</span>
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-image">
                  Image URL
                  <span className={styles.mifOptional}>Recommended: 1200×630px</span>
                </label>
                <input
                  id="mif-image"
                  type="url"
                  className={styles.mifInput}
                  value={meta.image}
                  onChange={(e) => set({ image: e.target.value })}
                  placeholder="https://example.com/og-image.jpg"
                />
                {meta.image && (
                  <div className={styles.mifImagePreview}>
                    <img
                      src={meta.image}
                      alt="Preview"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>

              <div className={styles.mifRow}>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-url">
                    Canonical URL
                  </label>
                  <input
                    id="mif-url"
                    type="url"
                    className={styles.mifInput}
                    value={meta.url}
                    onChange={(e) => set({ url: e.target.value })}
                    placeholder="https://example.com/article"
                  />
                </div>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-type">
                    Content Type
                  </label>
                  <select
                    id="mif-type"
                    className={styles.mifSelect}
                    value={meta.type}
                    onChange={(e) => set({ type: e.target.value })}
                  >
                    {OG_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-sitename">
                  Site Name
                </label>
                <input
                  id="mif-sitename"
                  type="text"
                  className={styles.mifInput}
                  value={meta.siteName}
                  onChange={(e) => set({ siteName: e.target.value })}
                  placeholder="My Awesome Blog"
                />
              </div>
            </div>
          )}
        </section>

        {/* Twitter Card */}
        <section className={styles.mifSection}>
          <button className={styles.mifSectionHeader} onClick={() => toggleSection("twitter")}>
            <div className={styles.mifSectionHeaderLeft}>
              <i className="ti ti-brand-twitter" aria-hidden="true" />
              <span className={styles.mifSectionTitle}>Twitter Card</span>
              <span className={`${styles.mifSectionBadge} ${styles.optional}`}>Optional</span>
            </div>
            <i
              className={`ti ti-chevron-down mifChevron ${expandedSections.twitter ? styles.expanded : ""}`}
              aria-hidden="true"
            />
          </button>

          {expandedSections.twitter && (
            <div className={styles.mifSectionBody}>
              <div className={styles.mifField}>
                <label className={styles.mifLabel}>Card Type</label>
                <div className={styles.mifCardTypeGrid}>
                  {TWITTER_CARD_TYPES.map((card) => (
                    <button
                      key={card.value}
                      type="button"
                      className={`${styles.mifCardTypeBtn} ${meta.twitterCard === card.value ? styles.active : ""}`}
                      onClick={() => set({ twitterCard: card.value })}
                    >
                      <span className={styles.mifCardTypeLabel}>{card.label}</span>
                      <span className={styles.mifCardTypeDesc}>{card.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.mifRow}>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-tw-site">
                    @username (Site)
                  </label>
                  <input
                    id="mif-tw-site"
                    type="text"
                    className={styles.mifInput}
                    value={meta.twitterSite}
                    onChange={(e) => set({ twitterSite: e.target.value })}
                    placeholder="@mysite"
                  />
                </div>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-tw-creator">
                    @username (Author)
                  </label>
                  <input
                    id="mif-tw-creator"
                    type="text"
                    className={styles.mifInput}
                    value={meta.twitterCreator}
                    onChange={(e) => set({ twitterCreator: e.target.value })}
                    placeholder="@author"
                  />
                </div>
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-tw-title">
                  Twitter Title
                  <span className={styles.mifOptional}>Leave empty to use main title</span>
                </label>
                <input
                  id="mif-tw-title"
                  type="text"
                  className={styles.mifInput}
                  value={meta.twitterTitle}
                  onChange={(e) => set({ twitterTitle: e.target.value })}
                  placeholder={meta.title || "Custom Twitter title"}
                  maxLength={70}
                />
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-tw-desc">
                  Twitter Description
                  <span className={styles.mifOptional}>Leave empty to use main description</span>
                </label>
                <textarea
                  id="mif-tw-desc"
                  className={styles.mifTextarea}
                  value={meta.twitterDescription}
                  onChange={(e) => set({ twitterDescription: e.target.value })}
                  placeholder={meta.description || "Custom Twitter description"}
                  rows={2}
                  maxLength={200}
                />
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-tw-image">
                  Twitter Image
                  <span className={styles.mifOptional}>Leave empty to use main image</span>
                </label>
                <input
                  id="mif-tw-image"
                  type="url"
                  className={styles.mifInput}
                  value={meta.twitterImage}
                  onChange={(e) => set({ twitterImage: e.target.value })}
                  placeholder={meta.image || "https://example.com/twitter-image.jpg"}
                />
              </div>
            </div>
          )}
        </section>

        {/* Advanced Meta */}
        <section className={styles.mifSection}>
          <button className={styles.mifSectionHeader} onClick={() => toggleSection("advanced")}>
            <div className={styles.mifSectionHeaderLeft}>
              <i className="ti ti-settings" aria-hidden="true" />
              <span className={styles.mifSectionTitle}>Advanced Meta</span>
              <span className={`${styles.mifSectionBadge} ${styles.optional}`}>Optional</span>
            </div>
            <i
              className={`ti ti-chevron-down mifChevron ${expandedSections.advanced ? styles.expanded : ""}`}
              aria-hidden="true"
            />
          </button>

          {expandedSections.advanced && (
            <div className={styles.mifSectionBody}>
              <div className={styles.mifRow}>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-img-alt">
                    Image Alt Text
                  </label>
                  <input
                    id="mif-img-alt"
                    type="text"
                    className={styles.mifInput}
                    value={meta.imageAlt}
                    onChange={(e) => set({ imageAlt: e.target.value })}
                    placeholder="Descriptive alt text"
                  />
                </div>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-locale">
                    Locale
                  </label>
                  <input
                    id="mif-locale"
                    type="text"
                    className={styles.mifInput}
                    value={meta.locale}
                    onChange={(e) => set({ locale: e.target.value })}
                    placeholder="en_US"
                  />
                </div>
              </div>

              <div className={styles.mifRow}>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-img-w">
                    Image Width (px)
                  </label>
                  <input
                    id="mif-img-w"
                    type="number"
                    className={styles.mifInput}
                    value={meta.imageWidth}
                    onChange={(e) => set({ imageWidth: e.target.value })}
                    placeholder="1200"
                  />
                </div>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-img-h">
                    Image Height (px)
                  </label>
                  <input
                    id="mif-img-h"
                    type="number"
                    className={styles.mifInput}
                    value={meta.imageHeight}
                    onChange={(e) => set({ imageHeight: e.target.value })}
                    placeholder="630"
                  />
                </div>
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-author">
                  Author
                </label>
                <input
                  id="mif-author"
                  type="text"
                  className={styles.mifInput}
                  value={meta.author}
                  onChange={(e) => set({ author: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}
        </section>

        {/* SEO Meta */}
        <section className={styles.mifSection}>
          <button className={styles.mifSectionHeader} onClick={() => toggleSection("seo")}>
            <div className={styles.mifSectionHeaderLeft}>
              <i className="ti ti-seo" aria-hidden="true" />
              <span className={styles.mifSectionTitle}>SEO & Extras</span>
              <span className={`${styles.mifSectionBadge} ${styles.optional}`}>Optional</span>
            </div>
            <i
              className={`ti ti-chevron-down mifChevron ${expandedSections.seo ? styles.expanded : ""}`}
              aria-hidden="true"
            />
          </button>

          {expandedSections.seo && (
            <div className={styles.mifSectionBody}>
              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-keywords">
                  Keywords
                </label>
                <input
                  id="mif-keywords"
                  type="text"
                  className={styles.mifInput}
                  value={meta.keywords}
                  onChange={(e) => set({ keywords: e.target.value })}
                  placeholder="open graph, meta tags, social media"
                />
                <span className={styles.mifHint}>Comma-separated keywords</span>
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-canonical">
                  Canonical URL
                </label>
                <input
                  id="mif-canonical"
                  type="url"
                  className={styles.mifInput}
                  value={meta.canonical}
                  onChange={(e) => set({ canonical: e.target.value })}
                  placeholder="https://example.com/canonical"
                />
              </div>

              <div className={styles.mifRow}>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-robots">
                    Robots
                  </label>
                  <select
                    id="mif-robots"
                    className={styles.mifSelect}
                    value={meta.robots}
                    onChange={(e) => set({ robots: e.target.value })}
                  >
                    <option value="">Default</option>
                    <option value="index, follow">Index, Follow</option>
                    <option value="noindex, follow">No Index, Follow</option>
                    <option value="index, nofollow">Index, No Follow</option>
                    <option value="noindex, nofollow">No Index, No Follow</option>
                  </select>
                </div>
                <div className={styles.mifField}>
                  <label className={styles.mifLabel} htmlFor="mif-theme">
                    Theme Color
                  </label>
                  <div className={styles.mifColorInputRow}>
                    <input
                      type="color"
                      className={styles.mifColorPicker}
                      value={meta.themeColor || "#000000"}
                      onChange={(e) => set({ themeColor: e.target.value })}
                    />
                    <input
                      id="mif-theme"
                      type="text"
                      className={styles.mifInput}
                      value={meta.themeColor}
                      onChange={(e) => set({ themeColor: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.mifField}>
                <label className={styles.mifLabel} htmlFor="mif-favicon">
                  Favicon URL
                </label>
                <input
                  id="mif-favicon"
                  type="url"
                  className={styles.mifInput}
                  value={meta.favicon}
                  onChange={(e) => set({ favicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}