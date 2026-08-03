// features/dev/case-converter/CasePreview.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { convertCase, CASE_FORMATS, type CaseType, type ConversionOptions } from "./utils";

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
      <div className="cp-root">
        {/*  Input Section  */}
        <div className="cp-input-section">
          <div className="cp-input-header">
            <div className="cp-input-label">
              <i className="ti ti-pencil" />
              Input Text
            </div>
            {input && (
              <button className="cp-clear-btn" onClick={() => onInputChange("")} title="Clear">
                <i className="ti ti-x" />
              </button>
            )}
          </div>
          <textarea
            className="cp-textarea"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter text to convert case..."
            rows={3}
            spellCheck={false}
          />
        </div>

        {/*  Results Section  */}
        {results.length === 0 && !input ? (
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <i className="ti ti-letter-case" />
            </div>
            <p className="cp-empty-title">Convert Text Case</p>
            <p className="cp-empty-desc">
              Convert text between camelCase, snake_case, kebab-case, and more. Enter text above to
              get started.
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="cp-results-section">
            <div className="cp-results-header">
              <div className="cp-results-label">
                <i className="ti ti-sparkles" />
                Converted Cases
                <span className="cp-results-count">{results.length}</span>
              </div>
            </div>
            <div className="cp-results">
              {results.map((result) => (
                <div key={result.id} className="cp-result-card">
                  <div className="cp-result-header">
                    <div className="cp-result-info">
                      <i className={`ti ${result.icon}`} />
                      <div className="cp-result-text">
                        <span className="cp-result-label">{result.label}</span>
                        <span className="cp-result-desc">{result.description}</span>
                      </div>
                    </div>
                    <button
                      className={`cp-copy-btn${copiedKey === result.id ? " copied" : ""}`}
                      onClick={() => handleCopy(result.converted, result.id, result.id)}
                    >
                      <i className={`ti ${copiedKey === result.id ? "ti-check" : "ti-copy"}`} />
                      {copiedKey === result.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="cp-result-value">{result.converted}</div>
                  <div className="cp-result-example">Example: {result.example}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
