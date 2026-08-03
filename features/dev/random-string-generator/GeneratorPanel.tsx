// features/dev/random-string-generator/GeneratorPanel.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { GeneratorOptions, GeneratedString, StrengthLevel } from "./utils";
import {
  generateString,
  calculateEntropy,
  getStrengthLevel,
  estimateCrackTime,
  analyzeString,
} from "./utils";

interface GeneratorPanelProps {
  options: GeneratorOptions;
  onOptionsChange: (options: GeneratorOptions) => void;
  onGenerate?: (result: GeneratedString) => void;
}

type MobileView = "options" | "results";

export default function GeneratorPanel({
  options,
  onOptionsChange,
  onGenerate,
}: GeneratorPanelProps) {
  const [results, setResults] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("options");

  const entropy = useMemo(() => calculateEntropy(options), [options]);
  const strength = useMemo(() => getStrengthLevel(entropy), [entropy]);
  const crackTime = useMemo(() => estimateCrackTime(entropy), [entropy]);

  const handleGenerate = useCallback(() => {
    const newResults = Array.from({ length: count }, () => generateString(options));
    setResults(newResults);

    // Auto-switch to results view on mobile after generating
    setMobileView("results");

    // Add to history
    if (onGenerate && newResults.length > 0 && newResults[0]) {
      const entry: GeneratedString = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        value: newResults[0],
        timestamp: Date.now(),
        options: { ...options },
        entropy,
        strength,
      };
      onGenerate(entry);
    }
  }, [options, count, entropy, strength, onGenerate]);

  const handleCopy = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Silent fail
    }
  }, []);

  // Auto-generate when options change
  useMemo(() => {
    if (autoGenerate && results.length > 0) {
      const timeoutId = setTimeout(handleGenerate, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [options, autoGenerate, results.length, handleGenerate]);

  const strengthColor = {
    weak: "#dc2626",
    fair: "#f59e0b",
    good: "#10b981",
    strong: "#059669",
    excellent: "#047857",
  }[strength];

  const updateOptions = useCallback(
    (updates: Partial<GeneratorOptions>) => {
      onOptionsChange({ ...options, ...updates });
    },
    [options, onOptionsChange]
  );

  return (
    <>
      <div className="gp-root">
        {/*  Mobile Tab Switcher  */}
        <div className="gp-mobile-tabs">
          <button
            type="button"
            className={`gp-mobile-tab${mobileView === "options" ? " active" : ""}`}
            onClick={() => setMobileView("options")}
          >
            <i className="ti ti-adjustments" />
            Options
          </button>
          <button
            type="button"
            className={`gp-mobile-tab${mobileView === "results" ? " active" : ""}`}
            onClick={() => setMobileView("results")}
          >
            <i className="ti ti-list-check" />
            Results
            {results.length > 0 && <span className="gp-mobile-badge">{results.length}</span>}
          </button>
        </div>

        <div className="gp-panels">
          {/*  Options Panel  */}
          <div
            className={`gp-options${mobileView === "options" ? " mobile-visible" : " mobile-hidden"}`}
          >
            {/* Length Control */}
            <div className="gp-section">
              <div className="gp-section-header">
                <label className="gp-label">Length</label>
                <div className="gp-length-display">
                  <input
                    type="number"
                    className="gp-length-input"
                    value={options.length}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      updateOptions({ length: Math.max(1, Math.min(10000, val)) });
                    }}
                    min="1"
                    max="10000"
                  />
                  <span className="gp-length-unit">chars</span>
                </div>
              </div>
              <input
                type="range"
                className="gp-slider"
                min="1"
                max="128"
                value={Math.min(options.length, 128)}
                onChange={(e) => updateOptions({ length: parseInt(e.target.value) })}
              />
              <div className="gp-slider-marks">
                <span>1</span>
                <span>32</span>
                <span>64</span>
                <span>128</span>
              </div>
            </div>

            {/* Character Sets */}
            <div className="gp-section">
              <label className="gp-label">Character Sets</label>
              <div className="gp-checkboxes">
                <label className="gp-checkbox">
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={(e) =>
                      updateOptions({ uppercase: e.target.checked, hex: false, binary: false })
                    }
                  />
                  <div className="gp-checkbox-content">
                    <span className="gp-checkbox-label">Uppercase</span>
                    <span className="gp-checkbox-hint">A-Z (26)</span>
                  </div>
                </label>

                <label className="gp-checkbox">
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={(e) =>
                      updateOptions({ lowercase: e.target.checked, hex: false, binary: false })
                    }
                  />
                  <div className="gp-checkbox-content">
                    <span className="gp-checkbox-label">Lowercase</span>
                    <span className="gp-checkbox-hint">a-z (26)</span>
                  </div>
                </label>

                <label className="gp-checkbox">
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={(e) =>
                      updateOptions({ numbers: e.target.checked, hex: false, binary: false })
                    }
                  />
                  <div className="gp-checkbox-content">
                    <span className="gp-checkbox-label">Numbers</span>
                    <span className="gp-checkbox-hint">0-9 (10)</span>
                  </div>
                </label>

                <label className="gp-checkbox">
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={(e) =>
                      updateOptions({ symbols: e.target.checked, hex: false, binary: false })
                    }
                  />
                  <div className="gp-checkbox-content">
                    <span className="gp-checkbox-label">Symbols</span>
                    <span className="gp-checkbox-hint">!@#$... (28)</span>
                  </div>
                </label>

                <label className="gp-checkbox">
                  <input
                    type="checkbox"
                    checked={options.hex}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateOptions({
                          hex: true,
                          binary: false,
                          uppercase: false,
                          lowercase: false,
                          numbers: false,
                          symbols: false,
                        });
                      } else {
                        updateOptions({ hex: false });
                      }
                    }}
                  />
                  <div className="gp-checkbox-content">
                    <span className="gp-checkbox-label">Hexadecimal</span>
                    <span className="gp-checkbox-hint">0-9, A-F (16)</span>
                  </div>
                </label>

                <label className="gp-checkbox">
                  <input
                    type="checkbox"
                    checked={options.binary}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateOptions({
                          binary: true,
                          hex: false,
                          uppercase: false,
                          lowercase: false,
                          numbers: false,
                          symbols: false,
                        });
                      } else {
                        updateOptions({ binary: false });
                      }
                    }}
                  />
                  <div className="gp-checkbox-content">
                    <span className="gp-checkbox-label">Binary</span>
                    <span className="gp-checkbox-hint">0, 1 (2)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="gp-section">
              <label className="gp-label">Advanced</label>
              <div className="gp-checkboxes">
                <label className="gp-checkbox">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => updateOptions({ excludeSimilar: e.target.checked })}
                    disabled={options.hex || options.binary || !!options.customChars}
                  />
                  <div className="gp-checkbox-content">
                    <span className="gp-checkbox-label">Exclude similar</span>
                    <span className="gp-checkbox-hint">i, l, 1, L, o, 0, O</span>
                  </div>
                </label>

                <label className="gp-checkbox">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) => updateOptions({ excludeAmbiguous: e.target.checked })}
                    disabled={options.hex || options.binary || !!options.customChars}
                  />
                  <div className="gp-checkbox-content">
                    <span className="gp-checkbox-label">Exclude ambiguous</span>
                    <span className="gp-checkbox-hint">{`{ } [ ] ( ) / \\ ' " \` ~ , ; : . < >`}</span>
                  </div>
                </label>
              </div>

              {/* Custom Characters */}
              <div className="gp-input-group">
                <label className="gp-input-label">Custom character set</label>
                <input
                  type="text"
                  className="gp-input"
                  value={options.customChars}
                  onChange={(e) => updateOptions({ customChars: e.target.value })}
                  placeholder="e.g., abc123XYZ (overrides above)"
                />
              </div>

              {/* Prefix/Suffix */}
              <div className="gp-input-row">
                <div className="gp-input-group">
                  <label className="gp-input-label">Prefix</label>
                  <input
                    type="text"
                    className="gp-input"
                    value={options.prefix}
                    onChange={(e) => updateOptions({ prefix: e.target.value })}
                    placeholder="e.g., user_"
                  />
                </div>
                <div className="gp-input-group">
                  <label className="gp-input-label">Suffix</label>
                  <input
                    type="text"
                    className="gp-input"
                    value={options.suffix}
                    onChange={(e) => updateOptions({ suffix: e.target.value })}
                    placeholder="e.g., _2024"
                  />
                </div>
              </div>

              {/* Separator */}
              <div className="gp-input-row">
                <div className="gp-input-group">
                  <label className="gp-input-label">Separator</label>
                  <input
                    type="text"
                    className="gp-input"
                    value={options.separator}
                    onChange={(e) => updateOptions({ separator: e.target.value.slice(0, 1) })}
                    placeholder="e.g., -"
                    maxLength={1}
                  />
                </div>
                <div className="gp-input-group">
                  <label className="gp-input-label">Every N chars</label>
                  <input
                    type="number"
                    className="gp-input"
                    value={options.separatorInterval || ""}
                    onChange={(e) =>
                      updateOptions({ separatorInterval: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Strength Meter */}
            <div className="gp-strength">
              <div className="gp-strength-header">
                <div className="gp-strength-label">
                  <i className="ti ti-shield-check" />
                  Security Strength
                </div>
                <span className="gp-strength-badge" style={{ background: strengthColor }}>
                  {strength}
                </span>
              </div>

              <div className="gp-strength-bar">
                <div
                  className="gp-strength-fill"
                  style={{
                    width: `${Math.min((entropy / 150) * 100, 100)}%`,
                    background: strengthColor,
                  }}
                />
              </div>

              <div className="gp-strength-stats">
                <div className="gp-stat">
                  <span className="gp-stat-value">{entropy.toFixed(1)}</span>
                  <span className="gp-stat-label">bits entropy</span>
                </div>
                <div className="gp-stat">
                  <span className="gp-stat-value">{crackTime}</span>
                  <span className="gp-stat-label">to crack</span>
                </div>
              </div>
            </div>

            {/* Mobile-only Generate Button */}
            <button className="gp-generate-btn gp-generate-btn-mobile" onClick={handleGenerate}>
              <i className="ti ti-refresh" />
              Generate {count} String{count !== 1 ? "s" : ""}
            </button>
          </div>

          {/*  Results Panel  */}
          <div
            className={`gp-results-panel${mobileView === "results" ? " mobile-visible" : " mobile-hidden"}`}
          >
            {/* Controls */}
            <div className="gp-controls">
              <div className="gp-controls-left">
                <label className="gp-count-label">
                  Generate
                  <input
                    type="number"
                    className="gp-count-input"
                    value={count}
                    onChange={(e) =>
                      setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
                    }
                    min="1"
                    max="100"
                  />
                  strings
                </label>

                <label className="gp-auto-toggle">
                  <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(e) => setAutoGenerate(e.target.checked)}
                  />
                  <span>Auto-generate</span>
                </label>
              </div>

              <button className="gp-generate-btn" onClick={handleGenerate}>
                <i className="ti ti-refresh" />
                Generate
              </button>
            </div>

            {/* Results */}
            {results.length === 0 ? (
              <div className="gp-empty">
                <div className="gp-empty-icon">
                  <i className="ti ti-click" />
                </div>
                <p className="gp-empty-title">Ready to generate</p>
                <p className="gp-empty-desc">
                  Configure your options and click "Generate" to create secure random strings
                </p>
                <button className="gp-empty-cta" onClick={() => setMobileView("options")}>
                  <i className="ti ti-adjustments" />
                  Configure Options
                </button>
              </div>
            ) : (
              <div className="gp-results">
                {results.map((result, idx) => {
                  const analysis = analyzeString(result);
                  return (
                    <div key={idx} className="gp-result-card">
                      <div className="gp-result-header">
                        <span className="gp-result-index">#{idx + 1}</span>
                        <div className="gp-result-meta">
                          <span className="gp-result-length">{result.length} chars</span>
                          {analysis.hasRepeats && (
                            <span className="gp-result-warn" title="Contains repeated characters">
                              <i className="ti ti-alert-triangle" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="gp-result-value">{result}</div>
                      <div className="gp-result-actions">
                        <button
                          className={`gp-result-btn${copiedIndex === idx ? " copied" : ""}`}
                          onClick={() => handleCopy(result, idx)}
                        >
                          <i className={`ti ${copiedIndex === idx ? "ti-check" : "ti-copy"}`} />
                          {copiedIndex === idx ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
