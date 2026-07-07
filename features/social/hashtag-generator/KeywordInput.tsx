// features/social/hashtag-generator/KeywordInput.tsx
"use client";

import { useState } from "react";
import type { InputMode, Hashtag } from "./types";
import { generateFromKeyword, generateFromCaption } from "./utils";

type KeywordInputProps = {
  onGenerate: (hashtags: Hashtag[]) => void;
};

export default function KeywordInput({ onGenerate }: KeywordInputProps) {
  const [mode, setMode] = useState<InputMode>("keyword");
  const [keyword, setKeyword] = useState("");
  const [caption, setCaption] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (generating) return;
    
    const input = mode === "keyword" ? keyword.trim() : caption.trim();
    if (!input) return;

    setGenerating(true);
    
    // Simulate async processing for better UX
    setTimeout(() => {
      try {
        const hashtags = mode === "keyword" 
          ? generateFromKeyword(input)
          : generateFromCaption(input);
        onGenerate(hashtags);
      } finally {
        setGenerating(false);
      }
    }, 500);
  };

  const canGenerate = mode === "keyword" ? keyword.trim().length > 0 : caption.trim().length > 10;

  return (
    <>
      <div className="ki-root">
        <div className="ki-header">
          <i className="ti ti-sparkles" aria-hidden="true" />
          <span>Generate Hashtags</span>
        </div>

        <div className="ki-mode-toggle">
          <button
            className={`ki-mode-btn ${mode === "keyword" ? "active" : ""}`}
            onClick={() => setMode("keyword")}
          >
            <i className="ti ti-tag" aria-hidden="true" />
            Keyword
          </button>
          <button
            className={`ki-mode-btn ${mode === "caption" ? "active" : ""}`}
            onClick={() => setMode("caption")}
          >
            <i className="ti ti-file-text" aria-hidden="true" />
            Caption
          </button>
        </div>

        {mode === "keyword" ? (
          <div className="ki-input-section">
            <label className="ki-label" htmlFor="ki-keyword">
              Enter keyword or topic
            </label>
            <input
              id="ki-keyword"
              type="text"
              className="ki-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="fitness, travel, food..."
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              maxLength={50}
            />
            <span className="ki-hint">
              Enter a single keyword or topic to generate related hashtags
            </span>
          </div>
        ) : (
          <div className="ki-input-section">
            <label className="ki-label" htmlFor="ki-caption">
              Paste your caption
              <span className="ki-char-count">{caption.length} chars</span>
            </label>
            <textarea
              id="ki-caption"
              className="ki-textarea"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Just finished my morning workout! Feeling energized and ready to take on the day. Nothing beats that post-gym endorphin rush..."
              rows={4}
              maxLength={2000}
            />
            <span className="ki-hint">
              Our AI will extract relevant keywords and generate hashtags automatically
            </span>
          </div>
        )}

        <button
          className="ki-generate-btn"
          onClick={handleGenerate}
          disabled={!canGenerate || generating}
        >
          {generating ? (
            <>
              <i className="ti ti-loader-2 ki-spin" aria-hidden="true" />
              Generating...
            </>
          ) : (
            <>
              <i className="ti ti-wand" aria-hidden="true" />
              Generate Hashtags
            </>
          )}
        </button>

        <div className="ki-examples">
          <span className="ki-examples-label">Examples:</span>
          <div className="ki-examples-list">
            {["fitness", "coffee", "sunset", "entrepreneurship"].map((example) => (
              <button
                key={example}
                className="ki-example-btn"
                onClick={() => {
                  setMode("keyword");
                  setKeyword(example);
                }}
              >
                #{example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ki-root {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ki-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .ki-header i { font-size: 16px; color: var(--text-secondary); }

        .ki-mode-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          padding: 4px;
          background: var(--bg-surface);
          border-radius: 8px;
        }
        .ki-mode-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ki-mode-btn i { font-size: 14px; }
        .ki-mode-btn:hover { color: var(--text-secondary); background: var(--border-faint); }
        .ki-mode-btn.active {
          background: var(--bg-card);
          color: var(--brand);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .ki-input-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ki-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .ki-char-count {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
        }

        .ki-input, .ki-textarea {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text);
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ki-input:focus, .ki-textarea:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }
        .ki-textarea {
          resize: vertical;
          line-height: 1.6;
        }
        .ki-input::placeholder, .ki-textarea::placeholder {
          color: var(--text-disabled);
        }

        .ki-hint {
          font-size: 11px;
          color: var(--text-tertiary);
          line-height: 1.4;
        }

        .ki-generate-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--brand);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ki-generate-btn i { font-size: 16px; }
        .ki-generate-btn:hover:not(:disabled) { background: var(--brand-hover); }
        .ki-generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ki-examples {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 8px;
          border-top: 0.5px solid var(--border);
        }
        .ki-examples-label {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }
        .ki-examples-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .ki-example-btn {
          padding: 4px 10px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          color: var(--text-tertiary);
          font-size: 11px;
          font-family: var(--font-mono);
          cursor: pointer;
          transition: all 0.12s;
        }
        .ki-example-btn:hover {
          background: var(--brand-light);
          border-color: var(--brand-border);
          color: var(--brand-text);
        }

        @keyframes ki-spin { to { transform: rotate(360deg); } }
        .ki-spin { animation: ki-spin 0.75s linear infinite; }
      `}</style>
    </>
  );
}