// features/social/meta-tag-generator/BasicSeoForm.tsx

"use client";
import type { MetaTags } from "./ts/types";
import { getCharCountColor } from "./ts/utils";
import styles from "./style/BasicSeoForm.module.css";

type BasicSeoFormProps = {
  tags: MetaTags;
  onChange: (tags: MetaTags) => void;
};

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
];

const ROBOTS_OPTIONS = [
  { value: "", label: "Default (not set)" },
  { value: "index, follow", label: "Index, Follow" },
  { value: "noindex, follow", label: "No Index, Follow" },
  { value: "index, nofollow", label: "Index, No Follow" },
  { value: "noindex, nofollow", label: "No Index, No Follow" },
];

export default function BasicSeoForm({ tags, onChange }: BasicSeoFormProps) {
  const set = (patch: Partial<MetaTags>) => onChange({ ...tags, ...patch });

  return (
    <div className={styles.bsfRoot}>
      <div className={styles.bsfField}>
        <label className={styles.bsfLabel} htmlFor="bsf-title">
          Page Title
          <span
            className={styles.bsfCharCount}
            style={{ color: getCharCountColor(tags.title.length, 60, 55) }}
          >
            {tags.title.length}/60
          </span>
        </label>
        <input
          id="bsf-title"
          type="text"
          className={styles.bsfInput}
          value={tags.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Your Page Title | Brand Name"
          maxLength={100}
        />
        <span className={styles.bsfHint}>
          Appears in search results and browser tabs. Keep it descriptive and under 60 characters.
        </span>
      </div>

      <div className={styles.bsfField}>
        <label className={styles.bsfLabel} htmlFor="bsf-description">
          Meta Description
          <span
            className={styles.bsfCharCount}
            style={{ color: getCharCountColor(tags.description.length, 160, 155) }}
          >
            {tags.description.length}/160
          </span>
        </label>
        <textarea
          id="bsf-description"
          className={styles.bsfTextarea}
          value={tags.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="A compelling description of your page that will appear in search engine results..."
          rows={3}
          maxLength={300}
        />
        <span className={styles.bsfHint}>
          Summarize your page content. Aim for 150-160 characters for optimal display.
        </span>
      </div>

      <div className={styles.bsfField}>
        <label className={styles.bsfLabel} htmlFor="bsf-keywords">
          Keywords
          <span className={styles.bsfOptional}>Comma-separated</span>
        </label>
        <input
          id="bsf-keywords"
          type="text"
          className={styles.bsfInput}
          value={tags.keywords}
          onChange={(e) => set({ keywords: e.target.value })}
          placeholder="web design, seo, marketing, digital"
        />
        <span className={styles.bsfHint}>
          Less important for modern SEO but still used by some search engines.
        </span>
      </div>

      <div className={styles.bsfRow}>
        <div className={styles.bsfField}>
          <label className={styles.bsfLabel} htmlFor="bsf-author">
            Author
          </label>
          <input
            id="bsf-author"
            type="text"
            className={styles.bsfInput}
            value={tags.author}
            onChange={(e) => set({ author: e.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div className={styles.bsfField}>
          <label className={styles.bsfLabel} htmlFor="bsf-language">
            Language
          </label>
          <select
            id="bsf-language"
            className={styles.bsfSelect}
            value={tags.language}
            onChange={(e) => set({ language: e.target.value })}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.bsfField}>
        <label className={styles.bsfLabel} htmlFor="bsf-canonical">
          Canonical URL
        </label>
        <input
          id="bsf-canonical"
          type="url"
          className={styles.bsfInput}
          value={tags.canonical}
          onChange={(e) => set({ canonical: e.target.value })}
          placeholder="https://example.com/page"
        />
        <span className={styles.bsfHint}>
          Prevents duplicate content issues by specifying the preferred URL.
        </span>
      </div>

      <div className={styles.bsfField}>
        <label className={styles.bsfLabel} htmlFor="bsf-robots">
          Robots Directive
        </label>
        <select
          id="bsf-robots"
          className={styles.bsfSelect}
          value={tags.robots}
          onChange={(e) => set({ robots: e.target.value as any })}
        >
          {ROBOTS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.bsfHint}>Controls how search engines crawl and index your page.</span>
      </div>

      <div className={styles.bsfRow}>
        <div className={styles.bsfField}>
          <label className={styles.bsfLabel} htmlFor="bsf-viewport">
            Viewport
          </label>
          <input
            id="bsf-viewport"
            type="text"
            className={styles.bsfInput}
            value={tags.viewport}
            onChange={(e) => set({ viewport: e.target.value })}
            placeholder="width=device-width, initial-scale=1"
          />
        </div>
        <div className={styles.bsfField}>
          <label className={styles.bsfLabel} htmlFor="bsf-charset">
            Charset
          </label>
          <select
            id="bsf-charset"
            className={styles.bsfSelect}
            value={tags.charset}
            onChange={(e) => set({ charset: e.target.value })}
          >
            <option value="UTF-8">UTF-8</option>
            <option value="ISO-8859-1">ISO-8859-1</option>
            <option value="Windows-1252">Windows-1252</option>
          </select>
        </div>
      </div>
    </div>
  );
}
