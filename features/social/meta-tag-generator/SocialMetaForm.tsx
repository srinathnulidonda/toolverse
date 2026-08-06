// features/social/meta-tag-generator/SocialMetaForm.tsx
"use client";

import type { MetaTags, PageType, TwitterCardType } from "./ts/types";
import styles from "./style/SocialMetaForm.module.css";

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
    <div className={styles.smfRoot}>
      <div className={styles.smfSection}>
        <div className={styles.smfSectionTitle}>
          <i className="ti ti-brand-facebook" aria-hidden="true" />
          <span>Open Graph (Facebook, LinkedIn)</span>
        </div>

        <div className={styles.smfRow}>
          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-og-type">
              Content Type
            </label>
            <select
              id="smf-og-type"
              className={styles.smfSelect}
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
          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-og-locale">
              Locale
            </label>
            <select
              id="smf-og-locale"
              className={styles.smfSelect}
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

        <div className={styles.smfField}>
          <label className={styles.smfLabel} htmlFor="smf-og-title">
            OG Title
            <span className={styles.smfOptional}>Leave empty to use page title</span>
          </label>
          <input
            id="smf-og-title"
            type="text"
            className={styles.smfInput}
            value={tags.ogTitle}
            onChange={(e) => set({ ogTitle: e.target.value })}
            placeholder={tags.title || "Custom Open Graph title"}
          />
        </div>

        <div className={styles.smfField}>
          <label className={styles.smfLabel} htmlFor="smf-og-desc">
            OG Description
            <span className={styles.smfOptional}>Leave empty to use meta description</span>
          </label>
          <textarea
            id="smf-og-desc"
            className={styles.smfTextarea}
            value={tags.ogDescription}
            onChange={(e) => set({ ogDescription: e.target.value })}
            placeholder={tags.description || "Custom Open Graph description"}
            rows={2}
          />
        </div>

        <div className={styles.smfField}>
          <label className={styles.smfLabel} htmlFor="smf-og-image">
            OG Image URL
          </label>
          <input
            id="smf-og-image"
            type="url"
            className={styles.smfInput}
            value={tags.ogImage}
            onChange={(e) => set({ ogImage: e.target.value })}
            placeholder="https://example.com/og-image.jpg"
          />
          {tags.ogImage && (
            <div className={styles.smfImagePreview}>
              <img
                src={tags.ogImage}
                alt=""
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}
        </div>

        <div className={styles.smfRow}>
          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-og-img-w">
              Image Width
            </label>
            <input
              id="smf-og-img-w"
              type="number"
              className={styles.smfInput}
              value={tags.ogImageWidth}
              onChange={(e) => set({ ogImageWidth: e.target.value })}
              placeholder="1200"
            />
          </div>
          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-og-img-h">
              Image Height
            </label>
            <input
              id="smf-og-img-h"
              type="number"
              className={styles.smfInput}
              value={tags.ogImageHeight}
              onChange={(e) => set({ ogImageHeight: e.target.value })}
              placeholder="630"
            />
          </div>
        </div>

        <div className={styles.smfField}>
          <label className={styles.smfLabel} htmlFor="smf-og-img-alt">
            Image Alt Text
          </label>
          <input
            id="smf-og-img-alt"
            type="text"
            className={styles.smfInput}
            value={tags.ogImageAlt}
            onChange={(e) => set({ ogImageAlt: e.target.value })}
            placeholder="Descriptive alt text for accessibility"
          />
        </div>

        <div className={styles.smfRow}>
          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-og-url">
              Page URL
            </label>
            <input
              id="smf-og-url"
              type="url"
              className={styles.smfInput}
              value={tags.ogUrl}
              onChange={(e) => set({ ogUrl: e.target.value })}
              placeholder="https://example.com/page"
            />
          </div>
          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-og-site">
              Site Name
            </label>
            <input
              id="smf-og-site"
              type="text"
              className={styles.smfInput}
              value={tags.ogSiteName}
              onChange={(e) => set({ ogSiteName: e.target.value })}
              placeholder="My Website"
            />
          </div>
        </div>
      </div>

      {tags.ogType === "article" && (
        <div className={styles.smfSection}>
          <div className={styles.smfSectionTitle}>
            <i className="ti ti-article" aria-hidden="true" />
            <span>Article Details</span>
          </div>

          <div className={styles.smfRow}>
            <div className={styles.smfField}>
              <label className={styles.smfLabel} htmlFor="smf-article-published">
                Published Time
              </label>
              <input
                id="smf-article-published"
                type="datetime-local"
                className={styles.smfInput}
                value={tags.articlePublishedTime}
                onChange={(e) => set({ articlePublishedTime: e.target.value })}
              />
            </div>
            <div className={styles.smfField}>
              <label className={styles.smfLabel} htmlFor="smf-article-modified">
                Modified Time
              </label>
              <input
                id="smf-article-modified"
                type="datetime-local"
                className={styles.smfInput}
                value={tags.articleModifiedTime}
                onChange={(e) => set({ articleModifiedTime: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.smfRow}>
            <div className={styles.smfField}>
              <label className={styles.smfLabel} htmlFor="smf-article-author">
                Author Name
              </label>
              <input
                id="smf-article-author"
                type="text"
                className={styles.smfInput}
                value={tags.articleAuthor}
                onChange={(e) => set({ articleAuthor: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className={styles.smfField}>
              <label className={styles.smfLabel} htmlFor="smf-article-section">
                Section
              </label>
              <input
                id="smf-article-section"
                type="text"
                className={styles.smfInput}
                value={tags.articleSection}
                onChange={(e) => set({ articleSection: e.target.value })}
                placeholder="Technology"
              />
            </div>
          </div>

          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-article-tags">
              Tags
              <span className={styles.smfOptional}>Comma-separated</span>
            </label>
            <input
              id="smf-article-tags"
              type="text"
              className={styles.smfInput}
              value={tags.articleTag}
              onChange={(e) => set({ articleTag: e.target.value })}
              placeholder="web development, javascript, tutorial"
            />
          </div>
        </div>
      )}

      <div className={styles.smfSection}>
        <div className={styles.smfSectionTitle}>
          <i className="ti ti-brand-twitter" aria-hidden="true" />
          <span>Twitter Card</span>
        </div>

        <div className={styles.smfField}>
          <label className={styles.smfLabel}>Card Type</label>
          <div className={styles.smfCardGrid}>
            {TWITTER_CARDS.map((card) => (
              <button
                key={card.value}
                type="button"
                className={`${styles.smfCardBtn} ${tags.twitterCard === card.value ? styles.active : ""}`}
                onClick={() => set({ twitterCard: card.value })}
              >
                <span className={styles.smfCardLabel}>{card.label}</span>
                <span className={styles.smfCardDesc}>{card.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.smfRow}>
          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-tw-site">
              Site @username
            </label>
            <input
              id="smf-tw-site"
              type="text"
              className={styles.smfInput}
              value={tags.twitterSite}
              onChange={(e) => set({ twitterSite: e.target.value })}
              placeholder="@mysite"
            />
          </div>
          <div className={styles.smfField}>
            <label className={styles.smfLabel} htmlFor="smf-tw-creator">
              Creator @username
            </label>
            <input
              id="smf-tw-creator"
              type="text"
              className={styles.smfInput}
              value={tags.twitterCreator}
              onChange={(e) => set({ twitterCreator: e.target.value })}
              placeholder="@author"
            />
          </div>
        </div>

        <div className={styles.smfField}>
          <label className={styles.smfLabel} htmlFor="smf-tw-title">
            Twitter Title
            <span className={styles.smfOptional}>Optional override</span>
          </label>
          <input
            id="smf-tw-title"
            type="text"
            className={styles.smfInput}
            value={tags.twitterTitle}
            onChange={(e) => set({ twitterTitle: e.target.value })}
            placeholder={tags.ogTitle || tags.title || "Twitter-specific title"}
          />
        </div>

        <div className={styles.smfField}>
          <label className={styles.smfLabel} htmlFor="smf-tw-desc">
            Twitter Description
            <span className={styles.smfOptional}>Optional override</span>
          </label>
          <textarea
            id="smf-tw-desc"
            className={styles.smfTextarea}
            value={tags.twitterDescription}
            onChange={(e) => set({ twitterDescription: e.target.value })}
            placeholder={tags.ogDescription || tags.description || "Twitter-specific description"}
            rows={2}
          />
        </div>

        <div className={styles.smfField}>
          <label className={styles.smfLabel} htmlFor="smf-tw-image">
            Twitter Image
            <span className={styles.smfOptional}>Optional override</span>
          </label>
          <input
            id="smf-tw-image"
            type="url"
            className={styles.smfInput}
            value={tags.twitterImage}
            onChange={(e) => set({ twitterImage: e.target.value })}
            placeholder={tags.ogImage || "https://example.com/twitter-image.jpg"}
          />
        </div>
      </div>
    </div>
  );
}
