// features/social/meta-tag-generator/BasicSeoForm.tsx
"use client";

import type { MetaTags } from "./types";
import { getCharCountColor } from "./utils";

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
    <>
      <div className="bsf-root">
        <div className="bsf-field">
          <label className="bsf-label" htmlFor="bsf-title">
            Page Title
            <span
              className="bsf-char-count"
              style={{ color: getCharCountColor(tags.title.length, 60, 55) }}
            >
              {tags.title.length}/60
            </span>
          </label>
          <input
            id="bsf-title"
            type="text"
            className="bsf-input"
            value={tags.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Your Page Title | Brand Name"
            maxLength={100}
          />
          <span className="bsf-hint">
            Appears in search results and browser tabs. Keep it descriptive and under 60 characters.
          </span>
        </div>

        <div className="bsf-field">
          <label className="bsf-label" htmlFor="bsf-description">
            Meta Description
            <span
              className="bsf-char-count"
              style={{ color: getCharCountColor(tags.description.length, 160, 155) }}
            >
              {tags.description.length}/160
            </span>
          </label>
          <textarea
            id="bsf-description"
            className="bsf-textarea"
            value={tags.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="A compelling description of your page that will appear in search engine results..."
            rows={3}
            maxLength={300}
          />
          <span className="bsf-hint">
            Summarize your page content. Aim for 150-160 characters for optimal display.
          </span>
        </div>

        <div className="bsf-field">
          <label className="bsf-label" htmlFor="bsf-keywords">
            Keywords
            <span className="bsf-optional">Comma-separated</span>
          </label>
          <input
            id="bsf-keywords"
            type="text"
            className="bsf-input"
            value={tags.keywords}
            onChange={(e) => set({ keywords: e.target.value })}
            placeholder="web design, seo, marketing, digital"
          />
          <span className="bsf-hint">
            Less important for modern SEO but still used by some search engines.
          </span>
        </div>

        <div className="bsf-row">
          <div className="bsf-field">
            <label className="bsf-label" htmlFor="bsf-author">
              Author
            </label>
            <input
              id="bsf-author"
              type="text"
              className="bsf-input"
              value={tags.author}
              onChange={(e) => set({ author: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="bsf-field">
            <label className="bsf-label" htmlFor="bsf-language">
              Language
            </label>
            <select
              id="bsf-language"
              className="bsf-select"
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

        <div className="bsf-field">
          <label className="bsf-label" htmlFor="bsf-canonical">
            Canonical URL
          </label>
          <input
            id="bsf-canonical"
            type="url"
            className="bsf-input"
            value={tags.canonical}
            onChange={(e) => set({ canonical: e.target.value })}
            placeholder="https://example.com/page"
          />
          <span className="bsf-hint">
            Prevents duplicate content issues by specifying the preferred URL.
          </span>
        </div>

        <div className="bsf-field">
          <label className="bsf-label" htmlFor="bsf-robots">
            Robots Directive
          </label>
          <select
            id="bsf-robots"
            className="bsf-select"
            value={tags.robots}
            onChange={(e) => set({ robots: e.target.value as any })}
          >
            {ROBOTS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="bsf-hint">Controls how search engines crawl and index your page.</span>
        </div>

        <div className="bsf-row">
          <div className="bsf-field">
            <label className="bsf-label" htmlFor="bsf-viewport">
              Viewport
            </label>
            <input
              id="bsf-viewport"
              type="text"
              className="bsf-input"
              value={tags.viewport}
              onChange={(e) => set({ viewport: e.target.value })}
              placeholder="width=device-width, initial-scale=1"
            />
          </div>
          <div className="bsf-field">
            <label className="bsf-label" htmlFor="bsf-charset">
              Charset
            </label>
            <select
              id="bsf-charset"
              className="bsf-select"
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

      <style>{`
        .bsf-root {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .bsf-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bsf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .bsf-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .bsf-optional {
          font-size: 11px;
          font-weight: 400;
          color: var(--text-tertiary);
        }

        .bsf-char-count {
          font-size: 11px;
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .bsf-input, .bsf-textarea, .bsf-select {
          font-family: var(--font-sans);
          font-size: 13.5px;
          color: var(--text);
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          width: 100%;
        }

        .bsf-input:focus, .bsf-textarea:focus, .bsf-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .bsf-textarea {
          resize: vertical;
          line-height: 1.6;
          min-height: 76px;
        }

        .bsf-input::placeholder, .bsf-textarea::placeholder {
          color: var(--text-disabled);
        }

        .bsf-select {
          cursor: pointer;
        }

        .bsf-hint {
          font-size: 11.5px;
          color: var(--text-tertiary);
          line-height: 1.5;
          font-family: var(--font-sans);
        }

        @media (max-width: 600px) {
          .bsf-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
