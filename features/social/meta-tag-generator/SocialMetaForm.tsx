// features/social/meta-tag-generator/SocialMetaForm.tsx
"use client";

import type { MetaTags, PageType, TwitterCardType } from "./types";

type SocialMetaFormProps = {
  tags: MetaTags;
  onChange: (tags: MetaTags) => void;
};

const PAGE_TYPES: { value: PageType; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "article", label: "Article" },
  { value: "product", label: "Product" },
  { value: "profile", label: "Profile" },
  { value: "video", label: "Video" },
  { value: "music", label: "Music" },
  { value: "book", label: "Book" },
];

const TWITTER_CARDS: { value: TwitterCardType; label: string; desc: string }[] = [
  { value: "summary", label: "Summary", desc: "Compact card" },
  { value: "summary_large_image", label: "Large Image", desc: "Recommended" },
  { value: "app", label: "App", desc: "Mobile app" },
  { value: "player", label: "Player", desc: "Video/audio" },
];

const LOCALES = [
  { value: "en_US", label: "English (US)" },
  { value: "en_GB", label: "English (UK)" },
  { value: "es_ES", label: "Spanish" },
  { value: "fr_FR", label: "French" },
  { value: "de_DE", label: "German" },
  { value: "ja_JP", label: "Japanese" },
  { value: "zh_CN", label: "Chinese" },
];

export default function SocialMetaForm({ tags, onChange }: SocialMetaFormProps) {
  const set = (patch: Partial<MetaTags>) => onChange({ ...tags, ...patch });

  return (
    <>
      <div className="smf-root">
        {/* Open Graph Section */}
        <div className="smf-section">
          <div className="smf-section-title">
            <i className="ti ti-brand-facebook" aria-hidden="true" />
            <span>Open Graph (Facebook, LinkedIn)</span>
          </div>

          <div className="smf-row">
            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-og-type">Content Type</label>
              <select
                id="smf-og-type"
                className="smf-select"
                value={tags.ogType}
                onChange={(e) => set({ ogType: e.target.value as PageType })}
              >
                {PAGE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-og-locale">Locale</label>
              <select
                id="smf-og-locale"
                className="smf-select"
                value={tags.ogLocale}
                onChange={(e) => set({ ogLocale: e.target.value })}
              >
                {LOCALES.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="smf-field">
            <label className="smf-label" htmlFor="smf-og-title">
              OG Title
              <span className="smf-optional">Leave empty to use page title</span>
            </label>
            <input
              id="smf-og-title"
              type="text"
              className="smf-input"
              value={tags.ogTitle}
              onChange={(e) => set({ ogTitle: e.target.value })}
              placeholder={tags.title || "Custom Open Graph title"}
            />
          </div>

          <div className="smf-field">
            <label className="smf-label" htmlFor="smf-og-desc">
              OG Description
              <span className="smf-optional">Leave empty to use meta description</span>
            </label>
            <textarea
              id="smf-og-desc"
              className="smf-textarea"
              value={tags.ogDescription}
              onChange={(e) => set({ ogDescription: e.target.value })}
              placeholder={tags.description || "Custom Open Graph description"}
              rows={2}
            />
          </div>

          <div className="smf-field">
            <label className="smf-label" htmlFor="smf-og-image">OG Image URL</label>
            <input
              id="smf-og-image"
              type="url"
              className="smf-input"
              value={tags.ogImage}
              onChange={(e) => set({ ogImage: e.target.value })}
              placeholder="https://example.com/og-image.jpg"
            />
            {tags.ogImage && (
              <div className="smf-image-preview">
                <img src={tags.ogImage} alt="" onError={(e) => e.currentTarget.style.display = "none"} />
              </div>
            )}
          </div>

          <div className="smf-row">
            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-og-img-w">Image Width</label>
              <input
                id="smf-og-img-w"
                type="number"
                className="smf-input"
                value={tags.ogImageWidth}
                onChange={(e) => set({ ogImageWidth: e.target.value })}
                placeholder="1200"
              />
            </div>
            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-og-img-h">Image Height</label>
              <input
                id="smf-og-img-h"
                type="number"
                className="smf-input"
                value={tags.ogImageHeight}
                onChange={(e) => set({ ogImageHeight: e.target.value })}
                placeholder="630"
              />
            </div>
          </div>

          <div className="smf-field">
            <label className="smf-label" htmlFor="smf-og-img-alt">Image Alt Text</label>
            <input
              id="smf-og-img-alt"
              type="text"
              className="smf-input"
              value={tags.ogImageAlt}
              onChange={(e) => set({ ogImageAlt: e.target.value })}
              placeholder="Descriptive alt text for accessibility"
            />
          </div>

          <div className="smf-row">
            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-og-url">Page URL</label>
              <input
                id="smf-og-url"
                type="url"
                className="smf-input"
                value={tags.ogUrl}
                onChange={(e) => set({ ogUrl: e.target.value })}
                placeholder="https://example.com/page"
              />
            </div>
            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-og-site">Site Name</label>
              <input
                id="smf-og-site"
                type="text"
                className="smf-input"
                value={tags.ogSiteName}
                onChange={(e) => set({ ogSiteName: e.target.value })}
                placeholder="My Website"
              />
            </div>
          </div>
        </div>

        {/* Article specific fields */}
        {tags.ogType === "article" && (
          <div className="smf-section">
            <div className="smf-section-title">
              <i className="ti ti-article" aria-hidden="true" />
              <span>Article Details</span>
            </div>

            <div className="smf-row">
              <div className="smf-field">
                <label className="smf-label" htmlFor="smf-article-published">Published Time</label>
                <input
                  id="smf-article-published"
                  type="datetime-local"
                  className="smf-input"
                  value={tags.articlePublishedTime}
                  onChange={(e) => set({ articlePublishedTime: e.target.value })}
                />
              </div>
              <div className="smf-field">
                <label className="smf-label" htmlFor="smf-article-modified">Modified Time</label>
                <input
                  id="smf-article-modified"
                  type="datetime-local"
                  className="smf-input"
                  value={tags.articleModifiedTime}
                  onChange={(e) => set({ articleModifiedTime: e.target.value })}
                />
              </div>
            </div>

            <div className="smf-row">
              <div className="smf-field">
                <label className="smf-label" htmlFor="smf-article-author">Author Name</label>
                <input
                  id="smf-article-author"
                  type="text"
                  className="smf-input"
                  value={tags.articleAuthor}
                  onChange={(e) => set({ articleAuthor: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="smf-field">
                <label className="smf-label" htmlFor="smf-article-section">Section</label>
                <input
                  id="smf-article-section"
                  type="text"
                  className="smf-input"
                  value={tags.articleSection}
                  onChange={(e) => set({ articleSection: e.target.value })}
                  placeholder="Technology"
                />
              </div>
            </div>

            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-article-tags">
                Tags
                <span className="smf-optional">Comma-separated</span>
              </label>
              <input
                id="smf-article-tags"
                type="text"
                className="smf-input"
                value={tags.articleTag}
                onChange={(e) => set({ articleTag: e.target.value })}
                placeholder="web development, javascript, tutorial"
              />
            </div>
          </div>
        )}

        {/* Twitter Card Section */}
        <div className="smf-section">
          <div className="smf-section-title">
            <i className="ti ti-brand-twitter" aria-hidden="true" />
            <span>Twitter Card</span>
          </div>

          <div className="smf-field">
            <label className="smf-label">Card Type</label>
            <div className="smf-card-grid">
              {TWITTER_CARDS.map((card) => (
                <button
                  key={card.value}
                  type="button"
                  className={`smf-card-btn ${tags.twitterCard === card.value ? "active" : ""}`}
                  onClick={() => set({ twitterCard: card.value })}
                >
                  <span className="smf-card-label">{card.label}</span>
                  <span className="smf-card-desc">{card.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="smf-row">
            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-tw-site">Site @username</label>
              <input
                id="smf-tw-site"
                type="text"
                className="smf-input"
                value={tags.twitterSite}
                onChange={(e) => set({ twitterSite: e.target.value })}
                placeholder="@mysite"
              />
            </div>
            <div className="smf-field">
              <label className="smf-label" htmlFor="smf-tw-creator">Creator @username</label>
              <input
                id="smf-tw-creator"
                type="text"
                className="smf-input"
                value={tags.twitterCreator}
                onChange={(e) => set({ twitterCreator: e.target.value })}
                placeholder="@author"
              />
            </div>
          </div>

          <div className="smf-field">
            <label className="smf-label" htmlFor="smf-tw-title">
              Twitter Title
              <span className="smf-optional">Optional override</span>
            </label>
            <input
              id="smf-tw-title"
              type="text"
              className="smf-input"
              value={tags.twitterTitle}
              onChange={(e) => set({ twitterTitle: e.target.value })}
              placeholder={tags.ogTitle || tags.title || "Twitter-specific title"}
            />
          </div>

          <div className="smf-field">
            <label className="smf-label" htmlFor="smf-tw-desc">
              Twitter Description
              <span className="smf-optional">Optional override</span>
            </label>
            <textarea
              id="smf-tw-desc"
              className="smf-textarea"
              value={tags.twitterDescription}
              onChange={(e) => set({ twitterDescription: e.target.value })}
              placeholder={tags.ogDescription || tags.description || "Twitter-specific description"}
              rows={2}
            />
          </div>

          <div className="smf-field">
            <label className="smf-label" htmlFor="smf-tw-image">
              Twitter Image
              <span className="smf-optional">Optional override</span>
            </label>
            <input
              id="smf-tw-image"
              type="url"
              className="smf-input"
              value={tags.twitterImage}
              onChange={(e) => set({ twitterImage: e.target.value })}
              placeholder={tags.ogImage || "https://example.com/twitter-image.jpg"}
            />
          </div>
        </div>
      </div>

      <style>{`
        .smf-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .smf-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 10px;
        }

        .smf-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          padding-bottom: 4px;
          border-bottom: 0.5px solid var(--border);
        }
        .smf-section-title i { font-size: 16px; color: var(--text-secondary); }

        .smf-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .smf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .smf-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .smf-optional {
          font-size: 10.5px;
          font-weight: 400;
          color: var(--text-tertiary);
        }

        .smf-input, .smf-textarea, .smf-select {
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

        .smf-input:focus, .smf-textarea:focus, .smf-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .smf-textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .smf-select { cursor: pointer; }

        .smf-image-preview {
          width: 100%;
          max-width: 240px;
          aspect-ratio: 1200/630;
          border-radius: 7px;
          overflow: hidden;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
        }
        .smf-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .smf-card-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .smf-card-btn {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 10px 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 7px;
          cursor: pointer;
          text-align: left;
          transition: all 0.12s;
        }
        .smf-card-btn:hover { background: var(--border-faint); }
        .smf-card-btn.active {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }
        .smf-card-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
        }
        .smf-card-desc {
          font-size: 10.5px;
          color: var(--text-tertiary);
        }

        @media (max-width: 600px) {
          .smf-row {
            grid-template-columns: 1fr;
          }
          .smf-card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}