// features/dev/case-converter/CasePreview.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { convertCase, CASE_FORMATS, type CaseType, type ConversionOptions } from "./ts/utils";
import styles from "./style/CasePreview.module.css";

interface CasePreviewProps {
  input: string;
  onInputChange: (value: string) => void;
  selectedCases: CaseType[];
  preserveNumbers: boolean;
  preserveAcronyms: boolean;
  onConvert?: (text: string, caseType: CaseType, result: string) => void;
}

export default function CasePreview({
  input,
  onInputChange,
  selectedCases,
  preserveNumbers,
  preserveAcronyms,
  onConvert,
}: CasePreviewProps) {
  const [copiedKey, setCopiedKey] = useState("");

  const options: ConversionOptions = {
    preserveNumbers,
    preserveAcronyms,
  };

  const results = useMemo(() => {
    if (!input.trim()) return [];

    return CASE_FORMATS.filter((format) => selectedCases.includes(format.id)).map((format) => ({
      ...format,
      converted: convertCase(input, format.id, options),
    }));
  }, [input, selectedCases, preserveNumbers, preserveAcronyms]);

  const handleCopy = useCallback(
    async (text: string, key: string, caseType: CaseType) => {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1800);

      if (onConvert) {
        onConvert(input, caseType, text);
      }
    },
    [input, onConvert]
  );

  return (
    <>
      <div className={styles.cpRoot}>
        {/*  Input Section  */}
        <div className={styles.cpInputSection}>
          <div className={styles.cpInputHeader}>
            <div className={styles.cpInputLabel}>
              <i className="ti ti-pencil" />
              Input Text
            </div>
            {input && (
              <button className={styles.cpClearBtn} onClick={() => onInputChange("")} title="Clear">
                <i className="ti ti-x" />
              </button>
            )}
          </div>
          <textarea
            className={styles.cpTextarea}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter text to convert case..."
            rows={3}
            spellCheck={false}
          />
        </div>

        {/*  Results Section  */}
        {results.length === 0 && !input ? (
          <div className={styles.cpEmpty}>
            <div className={styles.cpEmptyIcon}>
              <i className="ti ti-letter-case" />
            </div>
            <p className={styles.cpEmptyTitle}>Convert Text Case</p>
            <p className={styles.cpEmptyDesc}>
              Convert text between camelCase, snake_case, kebab-case, and more. Enter text above to
              get started.
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className={styles.cpResultsSection}>
            <div className={styles.cpResultsHeader}>
              <div className={styles.cpResultsLabel}>
                <i className="ti ti-sparkles" />
                Converted Cases
                <span className={styles.cpResultsCount}>{results.length}</span>
              </div>
            </div>
            <div className={styles.cpResults}>
              {results.map((result) => (
                <div key={result.id} className={styles.cpResultCard}>
                  <div className={styles.cpResultHeader}>
                    <div className={styles.cpResultInfo}>
                      <i className={`ti ${result.icon}`} />
                      <div className={styles.cpResultText}>
                        <span className={styles.cpResultLabel}>{result.label}</span>
                        <span className={styles.cpResultDesc}>{result.description}</span>
                      </div>
                    </div>
                    <button
                      className={`${styles.cpCopyBtn}${copiedKey === result.id ? " copied" : ""}`}
                      onClick={() => handleCopy(result.converted, result.id, result.id)}
                    >
                      <i className={`ti ${copiedKey === result.id ? "ti-check" : "ti-copy"}`} />
                      {copiedKey === result.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className={styles.cpResultValue}>{result.converted}</div>
                  <div className={styles.cpResultExample}>Example: {result.example}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}