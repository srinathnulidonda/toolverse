// features/social/hashtag-generator/KeywordInput.tsx
"use client";

import { useState } from "react";
import type { InputMode, Hashtag } from "./ts/types";
import { generateFromKeyword, generateFromCaption } from "./ts/utils";
import styles from "./style/KeywordInput.module.css";

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

    setTimeout(() => {
      try {
        const hashtags =
          mode === "keyword" ? generateFromKeyword(input) : generateFromCaption(input);
        onGenerate(hashtags);
      } finally {
        setGenerating(false);
      }
    }, 500);
  };

  const canGenerate = mode === "keyword" ? keyword.trim().length > 0 : caption.trim().length > 10;

  return (
    <div className={styles.kiRoot}>
      <div className={styles.kiHeader}>
        <i className="ti ti-sparkles" aria-hidden="true" />
        <span>Generate Hashtags</span>
      </div>

      <div className={styles.kiModeToggle}>
        <button
          className={`${styles.kiModeBtn}${mode === "keyword" ? ` ${styles.active}` : ""}`}
          onClick={() => setMode("keyword")}
        >
          <i className="ti ti-tag" aria-hidden="true" />
          Keyword
        </button>
        <button
          className={`${styles.kiModeBtn}${mode === "caption" ? ` ${styles.active}` : ""}`}
          onClick={() => setMode("caption")}
        >
          <i className="ti ti-file-text" aria-hidden="true" />
          Caption
        </button>
      </div>

      {mode === "keyword" ? (
        <div className={styles.kiInputSection}>
          <label className={styles.kiLabel} htmlFor="ki-keyword">
            Enter keyword or topic
          </label>
          <input
            id="ki-keyword"
            type="text"
            className={styles.kiInput}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="fitness, travel, food..."
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            maxLength={50}
          />
          <span className={styles.kiHint}>
            Enter a single keyword or topic to generate related hashtags
          </span>
        </div>
      ) : (
        <div className={styles.kiInputSection}>
          <label className={styles.kiLabel} htmlFor="ki-caption">
            Paste your caption
            <span className={styles.kiCharCount}>{caption.length} chars</span>
          </label>
          <textarea
            id="ki-caption"
            className={styles.kiTextarea}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Just finished my morning workout! Feeling energized and ready to take on the day. Nothing beats that post-gym endorphin rush..."
            rows={4}
            maxLength={2000}
          />
          <span className={styles.kiHint}>
            Our AI will extract relevant keywords and generate hashtags automatically
          </span>
        </div>
      )}

      <button
        className={styles.kiGenerateBtn}
        onClick={handleGenerate}
        disabled={!canGenerate || generating}
      >
        {generating ? (
          <>
            <i className={`ti ti-loader-2 ${styles.kiSpin}`} aria-hidden="true" />
            Generating...
          </>
        ) : (
          <>
            <i className="ti ti-wand" aria-hidden="true" />
            Generate Hashtags
          </>
        )}
      </button>

      <div className={styles.kiExamples}>
        <span className={styles.kiExamplesLabel}>Examples:</span>
        <div className={styles.kiExamplesList}>
          {["fitness", "coffee", "sunset", "entrepreneurship"].map((example) => (
            <button
              key={example}
              className={styles.kiExampleBtn}
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
  );
}