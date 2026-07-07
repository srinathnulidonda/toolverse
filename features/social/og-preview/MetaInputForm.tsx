// features/social/og-preview/MetaInputForm.tsx
"use client";

import { useState } from "react";
import type { MetaData, InputMode, TwitterCardType } from "./types";
import { fetchMetaFromUrl } from "./utils";

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
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <div className="mif-root">
        
        {/* Mode toggle */}
        <div className="mif-mode-toggle">
          <button
            className={`mif-mode-btn ${mode === "manual" ? "active" : ""}`}
            onClick={() => setMode("manual")}
          >
            <i className="ti ti-edit" aria-hidden="true" />
            Manual Input
          </button>
          <button
            className={`mif-mode-btn ${mode === "url" ? "active" : ""}`}
            onClick={() => setMode("url")}
          >
            <i className="ti ti-world-download" aria-hidden="true" />
            Fetch from URL
          </button>
        </div>

        {/* URL Fetch mode */}
        {mode === "url" && (
          <div className="mif-fetch-section">
            <div className="mif-fetch-input-row">
              <input
                type="url"
                className="mif-fetch-input"
                placeholder="https://example.com"
                value={fetchUrl}
                onChange={(e) => setFetchUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
              <button
                className="mif-fetch-btn"
                onClick={handleFetch}
                disabled={!fetchUrl.trim() || fetching}
              >
                {fetching ? (
                  <>
                    <i className="ti ti-loader-2 mif-spin" aria-hidden="true" />
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
              <p className="mif-error">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                {fetchError}
              </p>
            )}
            <p className="mif-hint">
              <i className="ti ti-info-circle" aria-hidden="true" />
              Enter any URL to automatically extract its Open Graph and Twitter Card meta tags
            </p>
          </div>
        )}

        {/* Basic Meta Tags */}
        <section className="mif-section">
          <button
            className="mif-section-header"
            onClick={() => toggleSection("basic")}
          >
            <div className="mif-section-header-left">
              <i className="ti ti-file-text" aria-hidden="true" />
              <span className="mif-section-title">Basic Meta Tags</span>
              <span className="mif-section-badge">Required</span>
            </div>
            <i className={`ti ti-chevron-down mif-chevron ${expandedSections.basic ? "expanded" : ""}`} aria-hidden="true" />
          </button>

          {expandedSections.basic && (
            <div className="mif-section-body">
              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-title">
                  Page Title
                  <span className="mif-char-count" style={{ color: meta.title.length > 60 ? "#D97706" : "var(--text-tertiary)" }}>
                    {meta.title.length}/60
                  </span>
                </label>
                <input
                  id="mif-title"
                  type="text"
                  className="mif-input"
                  value={meta.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="Ultimate Guide to Open Graph Tags"
                  maxLength={100}
                />
                <span className="mif-hint">Shown as the main headline when shared</span>
              </div>

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-description">
                  Description
                  <span className="mif-char-count" style={{ color: meta.description.length > 155 ? "#D97706" : "var(--text-tertiary)" }}>
                    {meta.description.length}/155
                  </span>
                </label>
                <textarea
                  id="mif-description"
                  className="mif-textarea"
                  value={meta.description}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="A comprehensive guide to implementing Open Graph meta tags for better social media sharing..."
                  rows={3}
                  maxLength={300}
                />
                <span className="mif-hint">Keep between 125-155 characters for best results</span>
              </div>

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-image">
                  Image URL
                  <span className="mif-optional">Recommended: 1200×630px</span>
                </label>
                <input
                  id="mif-image"
                  type="url"
                  className="mif-input"
                  value={meta.image}
                  onChange={(e) => set({ image: e.target.value })}
                  placeholder="https://example.com/og-image.jpg"
                />
                {meta.image && (
                  <div className="mif-image-preview">
                    <img src={meta.image} alt="Preview" onError={(e) => e.currentTarget.style.display = "none"} />
                  </div>
                )}
              </div>

              <div className="mif-row">
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-url">Canonical URL</label>
                  <input
                    id="mif-url"
                    type="url"
                    className="mif-input"
                    value={meta.url}
                    onChange={(e) => set({ url: e.target.value })}
                    placeholder="https://example.com/article"
                  />
                </div>
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-type">Content Type</label>
                  <select
                    id="mif-type"
                    className="mif-select"
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

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-sitename">Site Name</label>
                <input
                  id="mif-sitename"
                  type="text"
                  className="mif-input"
                  value={meta.siteName}
                  onChange={(e) => set({ siteName: e.target.value })}
                  placeholder="My Awesome Blog"
                />
              </div>
            </div>
          )}
        </section>

        {/* Twitter Card */}
        <section className="mif-section">
          <button
            className="mif-section-header"
            onClick={() => toggleSection("twitter")}
          >
            <div className="mif-section-header-left">
              <i className="ti ti-brand-twitter" aria-hidden="true" />
              <span className="mif-section-title">Twitter Card</span>
              <span className="mif-section-badge optional">Optional</span>
            </div>
            <i className={`ti ti-chevron-down mif-chevron ${expandedSections.twitter ? "expanded" : ""}`} aria-hidden="true" />
          </button>

          {expandedSections.twitter && (
            <div className="mif-section-body">
              <div className="mif-field">
                <label className="mif-label">Card Type</label>
                <div className="mif-card-type-grid">
                  {TWITTER_CARD_TYPES.map((card) => (
                    <button
                      key={card.value}
                      type="button"
                      className={`mif-card-type-btn ${meta.twitterCard === card.value ? "active" : ""}`}
                      onClick={() => set({ twitterCard: card.value })}
                    >
                      <span className="mif-card-type-label">{card.label}</span>
                      <span className="mif-card-type-desc">{card.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mif-row">
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-tw-site">@username (Site)</label>
                  <input
                    id="mif-tw-site"
                    type="text"
                    className="mif-input"
                    value={meta.twitterSite}
                    onChange={(e) => set({ twitterSite: e.target.value })}
                    placeholder="@mysite"
                  />
                </div>
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-tw-creator">@username (Author)</label>
                  <input
                    id="mif-tw-creator"
                    type="text"
                    className="mif-input"
                    value={meta.twitterCreator}
                    onChange={(e) => set({ twitterCreator: e.target.value })}
                    placeholder="@author"
                  />
                </div>
              </div>

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-tw-title">
                  Twitter Title
                  <span className="mif-optional">Leave empty to use main title</span>
                </label>
                <input
                  id="mif-tw-title"
                  type="text"
                  className="mif-input"
                  value={meta.twitterTitle}
                  onChange={(e) => set({ twitterTitle: e.target.value })}
                  placeholder={meta.title || "Custom Twitter title"}
                  maxLength={70}
                />
              </div>

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-tw-desc">
                  Twitter Description
                  <span className="mif-optional">Leave empty to use main description</span>
                </label>
                <textarea
                  id="mif-tw-desc"
                  className="mif-textarea"
                  value={meta.twitterDescription}
                  onChange={(e) => set({ twitterDescription: e.target.value })}
                  placeholder={meta.description || "Custom Twitter description"}
                  rows={2}
                  maxLength={200}
                />
              </div>

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-tw-image">
                  Twitter Image
                  <span className="mif-optional">Leave empty to use main image</span>
                </label>
                <input
                  id="mif-tw-image"
                  type="url"
                  className="mif-input"
                  value={meta.twitterImage}
                  onChange={(e) => set({ twitterImage: e.target.value })}
                  placeholder={meta.image || "https://example.com/twitter-image.jpg"}
                />
              </div>
            </div>
          )}
        </section>

        {/* Advanced Meta */}
        <section className="mif-section">
          <button
            className="mif-section-header"
            onClick={() => toggleSection("advanced")}
          >
            <div className="mif-section-header-left">
              <i className="ti ti-settings" aria-hidden="true" />
              <span className="mif-section-title">Advanced Meta</span>
              <span className="mif-section-badge optional">Optional</span>
            </div>
            <i className={`ti ti-chevron-down mif-chevron ${expandedSections.advanced ? "expanded" : ""}`} aria-hidden="true" />
          </button>

          {expandedSections.advanced && (
            <div className="mif-section-body">
              <div className="mif-row">
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-img-alt">Image Alt Text</label>
                  <input
                    id="mif-img-alt"
                    type="text"
                    className="mif-input"
                    value={meta.imageAlt}
                    onChange={(e) => set({ imageAlt: e.target.value })}
                    placeholder="Descriptive alt text"
                  />
                </div>
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-locale">Locale</label>
                  <input
                    id="mif-locale"
                    type="text"
                    className="mif-input"
                    value={meta.locale}
                    onChange={(e) => set({ locale: e.target.value })}
                    placeholder="en_US"
                  />
                </div>
              </div>

              <div className="mif-row">
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-img-w">Image Width (px)</label>
                  <input
                    id="mif-img-w"
                    type="number"
                    className="mif-input"
                    value={meta.imageWidth}
                    onChange={(e) => set({ imageWidth: e.target.value })}
                    placeholder="1200"
                  />
                </div>
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-img-h">Image Height (px)</label>
                  <input
                    id="mif-img-h"
                    type="number"
                    className="mif-input"
                    value={meta.imageHeight}
                    onChange={(e) => set({ imageHeight: e.target.value })}
                    placeholder="630"
                  />
                </div>
              </div>

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-author">Author</label>
                <input
                  id="mif-author"
                  type="text"
                  className="mif-input"
                  value={meta.author}
                  onChange={(e) => set({ author: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}
        </section>

        {/* SEO Meta */}
        <section className="mif-section">
          <button
            className="mif-section-header"
            onClick={() => toggleSection("seo")}
          >
            <div className="mif-section-header-left">
              <i className="ti ti-seo" aria-hidden="true" />
              <span className="mif-section-title">SEO & Extras</span>
              <span className="mif-section-badge optional">Optional</span>
            </div>
            <i className={`ti ti-chevron-down mif-chevron ${expandedSections.seo ? "expanded" : ""}`} aria-hidden="true" />
          </button>

          {expandedSections.seo && (
            <div className="mif-section-body">
              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-keywords">Keywords</label>
                <input
                  id="mif-keywords"
                  type="text"
                  className="mif-input"
                  value={meta.keywords}
                  onChange={(e) => set({ keywords: e.target.value })}
                  placeholder="open graph, meta tags, social media"
                />
                <span className="mif-hint">Comma-separated keywords</span>
              </div>

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-canonical">Canonical URL</label>
                <input
                  id="mif-canonical"
                  type="url"
                  className="mif-input"
                  value={meta.canonical}
                  onChange={(e) => set({ canonical: e.target.value })}
                  placeholder="https://example.com/canonical"
                />
              </div>

              <div className="mif-row">
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-robots">Robots</label>
                  <select
                    id="mif-robots"
                    className="mif-select"
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
                <div className="mif-field">
                  <label className="mif-label" htmlFor="mif-theme">Theme Color</label>
                  <div className="mif-color-input-row">
                    <input
                      type="color"
                      className="mif-color-picker"
                      value={meta.themeColor || "#000000"}
                      onChange={(e) => set({ themeColor: e.target.value })}
                    />
                    <input
                      id="mif-theme"
                      type="text"
                      className="mif-input"
                      value={meta.themeColor}
                      onChange={(e) => set({ themeColor: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <div className="mif-field">
                <label className="mif-label" htmlFor="mif-favicon">Favicon URL</label>
                <input
                  id="mif-favicon"
                  type="url"
                  className="mif-input"
                  value={meta.favicon}
                  onChange={(e) => set({ favicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .mif-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mif-mode-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 4px;
          background: var(--bg-surface);
          border-radius: 10px;
        }
        .mif-mode-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 14px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .mif-mode-btn i { font-size: 15px; }
        .mif-mode-btn:hover { color: var(--text-secondary); background: var(--border-faint); }
        .mif-mode-btn.active {
          background: var(--bg-card);
          color: var(--brand);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .mif-fetch-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 10px;
        }
        .mif-fetch-input-row {
          display: flex;
          gap: 8px;
        }
        .mif-fetch-input {
          flex: 1;
          font-family: var(--font-sans);
          font-size: 13.5px;
          color: var(--text);
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
          transition: border-color 0.15s;
        }
        .mif-fetch-input:focus { border-color: var(--brand); }
        .mif-fetch-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--brand);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .mif-fetch-btn:hover:not(:disabled) { background: var(--brand-hover); }
        .mif-fetch-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .mif-fetch-btn i { font-size: 14px; }

        .mif-error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          background: var(--error-bg);
          border-radius: 6px;
          font-size: 12px;
          color: #B91C1C;
          margin: 0;
        }
        .mif-error i { font-size: 14px; }

        .mif-hint {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 11.5px;
          color: var(--text-tertiary);
          line-height: 1.5;
          margin: 0;
        }
        .mif-hint i { font-size: 13px; margin-top: 1px; flex-shrink: 0; }

        .mif-section {
          display: flex;
          flex-direction: column;
          border: 0.5px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg-card);
        }
        .mif-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: var(--bg-surface);
          border: none;
          border-bottom: 0.5px solid var(--border);
          cursor: pointer;
          transition: background 0.12s;
          width: 100%;
          text-align: left;
        }
        .mif-section-header:hover { background: var(--border-faint); }
        .mif-section-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .mif-section-header-left i { font-size: 16px; color: var(--text-secondary); }
        .mif-section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
        }
        .mif-section-badge {
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .mif-section-badge:not(.optional) {
          background: var(--brand-light);
          color: var(--brand-text);
        }
        .mif-section-badge.optional {
          background: var(--bg);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
        }

        .mif-chevron {
          font-size: 14px;
          color: var(--text-tertiary);
          transition: transform 0.2s;
        }
        .mif-chevron.expanded { transform: rotate(180deg); }

        .mif-section-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
        }

        .mif-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .mif-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .mif-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }
        .mif-optional {
          font-size: 11px;
          font-weight: 400;
          color: var(--text-tertiary);
        }
        .mif-char-count {
          font-size: 11px;
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .mif-input, .mif-textarea, .mif-select {
          font-family: var(--font-sans);
          font-size: 13.5px;
          color: var(--text);
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 9px 12px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          width: 100%;
        }
        .mif-input:focus, .mif-textarea:focus, .mif-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .mif-textarea {
          resize: vertical;
          line-height: 1.6;
        }
        .mif-input::placeholder, .mif-textarea::placeholder {
          color: var(--text-disabled);
        }

        .mif-image-preview {
          width: 100%;
          max-width: 320px;
          aspect-ratio: 1200/630;
          border-radius: 8px;
          overflow: hidden;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
        }
        .mif-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mif-card-type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .mif-card-type-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          padding: 10px 12px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.12s;
          text-align: left;
        }
        .mif-card-type-btn:hover { background: var(--border-faint); }
        .mif-card-type-btn.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }
        .mif-card-type-label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text);
          font-family: var(--font-sans);
        }
        .mif-card-type-desc {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .mif-color-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mif-color-picker {
          width: 40px;
          height: 38px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          cursor: pointer;
          background: none;
        }

        @keyframes mif-spin { to { transform: rotate(360deg); } }
        .mif-spin { animation: mif-spin 0.75s linear infinite; }

        @media (max-width: 600px) {
          .mif-row { grid-template-columns: 1fr; }
          .mif-card-type-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}