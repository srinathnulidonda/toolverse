// features/dev/random-string-generator/GeneratorPanel.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import type { GeneratorOptions, GeneratedString, StrengthLevel } from "./ts/utils";
import {
  generateString,
  calculateEntropy,
  getStrengthLevel,
  estimateCrackTime,
  analyzeString,
} from "./ts/utils";
import styles from "./style/GeneratorPanel.module.css";

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
      <div className={styles.gpRoot}>
        {/*  Mobile Tab Switcher  */}
        <div className={styles.gpMobileTabs}>
          <button
            type="button"
            className={`${styles.gpMobileTab}${mobileView === "options" ? ` ${styles.active}` : ""}`}
            onClick={() => setMobileView("options")}
          >
            <i className="ti ti-adjustments" />
            Options
          </button>
          <button
            type="button"
            className={`${styles.gpMobileTab}${mobileView === "results" ? ` ${styles.active}` : ""}`}
            onClick={() => setMobileView("results")}
          >
            <i className="ti ti-list-check" />
            Results
            {results.length > 0 && <span className={styles.gpMobileBadge}>{results.length}</span>}
          </button>
        </div>

        <div className={styles.gpPanels}>
          {/*  Options Panel  */}
          <div
            className={`${styles.gpOptions}${mobileView === "options" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
          >
            {/* Length Control */}
            <div className={styles.gpSection}>
              <div className={styles.gpSectionHeader}>
                <label className={styles.gpLabel}>Length</label>
                <div className={styles.gpLengthDisplay}>
                  <input
                    type="number"
                    className={styles.gpLengthInput}
                    value={options.length}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      updateOptions({ length: Math.max(1, Math.min(10000, val)) });
                    }}
                    min="1"
                    max="10000"
                  />
                  <span className={styles.gpLengthUnit}>chars</span>
                </div>
              </div>
              <input
                type="range"
                className={styles.gpSlider}
                min="1"
                max="128"
                value={Math.min(options.length, 128)}
                onChange={(e) => updateOptions({ length: parseInt(e.target.value) })}
              />
              <div className={styles.gpSliderMarks}>
                <span>1</span>
                <span>32</span>
                <span>64</span>
                <span>128</span>
              </div>
            </div>

            {/* Character Sets */}
            <div className={styles.gpSection}>
              <label className={styles.gpLabel}>Character Sets</label>
              <div className={styles.gpCheckboxes}>
                <label className={styles.gpCheckbox}>
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={(e) =>
                      updateOptions({ uppercase: e.target.checked, hex: false, binary: false })
                    }
                  />
                  <div className={styles.gpCheckboxContent}>
                    <span className={styles.gpCheckboxLabel}>Uppercase</span>
                    <span className={styles.gpCheckboxHint}>A-Z (26)</span>
                  </div>
                </label>

                <label className={styles.gpCheckbox}>
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={(e) =>
                      updateOptions({ lowercase: e.target.checked, hex: false, binary: false })
                    }
                  />
                  <div className={styles.gpCheckboxContent}>
                    <span className={styles.gpCheckboxLabel}>Lowercase</span>
                    <span className={styles.gpCheckboxHint}>a-z (26)</span>
                  </div>
                </label>

                <label className={styles.gpCheckbox}>
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={(e) =>
                      updateOptions({ numbers: e.target.checked, hex: false, binary: false })
                    }
                  />
                  <div className={styles.gpCheckboxContent}>
                    <span className={styles.gpCheckboxLabel}>Numbers</span>
                    <span className={styles.gpCheckboxHint}>0-9 (10)</span>
                  </div>
                </label>

                <label className={styles.gpCheckbox}>
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={(e) =>
                      updateOptions({ symbols: e.target.checked, hex: false, binary: false })
                    }
                  />
                  <div className={styles.gpCheckboxContent}>
                    <span className={styles.gpCheckboxLabel}>Symbols</span>
                    <span className={styles.gpCheckboxHint}>!@#$... (28)</span>
                  </div>
                </label>

                <label className={styles.gpCheckbox}>
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
                  <div className={styles.gpCheckboxContent}>
                    <span className={styles.gpCheckboxLabel}>Hexadecimal</span>
                    <span className={styles.gpCheckboxHint}>0-9, A-F (16)</span>
                  </div>
                </label>

                <label className={styles.gpCheckbox}>
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
                  <div className={styles.gpCheckboxContent}>
                    <span className={styles.gpCheckboxLabel}>Binary</span>
                    <span className={styles.gpCheckboxHint}>0, 1 (2)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Advanced Options */}
            <div className={styles.gpSection}>
              <label className={styles.gpLabel}>Advanced</label>
              <div className={styles.gpCheckboxes}>
                <label className={styles.gpCheckbox}>
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => updateOptions({ excludeSimilar: e.target.checked })}
                    disabled={options.hex || options.binary || !!options.customChars}
                  />
                  <div className={styles.gpCheckboxContent}>
                    <span className={styles.gpCheckboxLabel}>Exclude similar</span>
                    <span className={styles.gpCheckboxHint}>i, l, 1, L, o, 0, O</span>
                  </div>
                </label>

                <label className={styles.gpCheckbox}>
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) => updateOptions({ excludeAmbiguous: e.target.checked })}
                    disabled={options.hex || options.binary || !!options.customChars}
                  />
                  <div className={styles.gpCheckboxContent}>
                    <span className={styles.gpCheckboxLabel}>Exclude ambiguous</span>
                    <span className={styles.gpCheckboxHint}>{`{ } [ ] ( ) / \\ ' " \` ~ , ; : . < >`}</span>
                  </div>
                </label>
              </div>

              {/* Custom Characters */}
              <div className={styles.gpInputGroup}>
                <label className={styles.gpInputLabel}>Custom character set</label>
                <input
                  type="text"
                  className={styles.gpInput}
                  value={options.customChars}
                  onChange={(e) => updateOptions({ customChars: e.target.value })}
                  placeholder="e.g., abc123XYZ (overrides above)"
                />
              </div>

              {/* Prefix/Suffix */}
              <div className={styles.gpInputRow}>
                <div className={styles.gpInputGroup}>
                  <label className={styles.gpInputLabel}>Prefix</label>
                  <input
                    type="text"
                    className={styles.gpInput}
                    value={options.prefix}
                    onChange={(e) => updateOptions({ prefix: e.target.value })}
                    placeholder="e.g., user_"
                  />
                </div>
                <div className={styles.gpInputGroup}>
                  <label className={styles.gpInputLabel}>Suffix</label>
                  <input
                    type="text"
                    className={styles.gpInput}
                    value={options.suffix}
                    onChange={(e) => updateOptions({ suffix: e.target.value })}
                    placeholder="e.g., _2024"
                  />
                </div>
              </div>

              {/* Separator */}
              <div className={styles.gpInputRow}>
                <div className={styles.gpInputGroup}>
                  <label className={styles.gpInputLabel}>Separator</label>
                  <input
                    type="text"
                    className={styles.gpInput}
                    value={options.separator}
                    onChange={(e) => updateOptions({ separator: e.target.value.slice(0, 1) })}
                    placeholder="e.g., -"
                    maxLength={1}
                  />
                </div>
                <div className={styles.gpInputGroup}>
                  <label className={styles.gpInputLabel}>Every N chars</label>
                  <input
                    type="number"
                    className={styles.gpInput}
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
            <div className={styles.gpStrength}>
              <div className={styles.gpStrengthHeader}>
                <div className={styles.gpStrengthLabel}>
                  <i className="ti ti-shield-check" />
                  Security Strength
                </div>
                <span className={styles.gpStrengthBadge} style={{ background: strengthColor }}>
                  {strength}
                </span>
              </div>

              <div className={styles.gpStrengthBar}>
                <div
                  className={styles.gpStrengthFill}
                  style={{
                    width: `${Math.min((entropy / 150) * 100, 100)}%`,
                    background: strengthColor,
                  }}
                />
              </div>

              <div className={styles.gpStrengthStats}>
                <div className={styles.gpStat}>
                  <span className={styles.gpStatValue}>{entropy.toFixed(1)}</span>
                  <span className={styles.gpStatLabel}>bits entropy</span>
                </div>
                <div className={styles.gpStat}>
                  <span className={styles.gpStatValue}>{crackTime}</span>
                  <span className={styles.gpStatLabel}>to crack</span>
                </div>
              </div>
            </div>

            {/* Mobile-only Generate Button */}
            <button className={`${styles.gpGenerateBtn} ${styles.gpGenerateBtnMobile}`} onClick={handleGenerate}>
              <i className="ti ti-refresh" />
              Generate {count} String{count !== 1 ? "s" : ""}
            </button>
          </div>

          {/*  Results Panel  */}
          <div
            className={`${styles.gpResultsPanel}${mobileView === "results" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
          >
            {/* Controls */}
            <div className={styles.gpControls}>
              <div className={styles.gpControlsLeft}>
                <label className={styles.gpCountLabel}>
                  Generate
                  <input
                    type="number"
                    className={styles.gpCountInput}
                    value={count}
                    onChange={(e) =>
                      setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
                    }
                    min="1"
                    max="100"
                  />
                  strings
                </label>

                <label className={styles.gpAutoToggle}>
                  <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(e) => setAutoGenerate(e.target.checked)}
                  />
                  <span>Auto-generate</span>
                </label>
              </div>

              <button className={styles.gpGenerateBtn} onClick={handleGenerate}>
                <i className="ti ti-refresh" />
                Generate
              </button>
            </div>

            {/* Results */}
            {results.length === 0 ? (
              <div className={styles.gpEmpty}>
                <div className={styles.gpEmptyIcon}>
                  <i className="ti ti-click" />
                </div>
                <p className={styles.gpEmptyTitle}>Ready to generate</p>
                <p className={styles.gpEmptyDesc}>
                  Configure your options and click "Generate" to create secure random strings
                </p>
                <button className={styles.gpEmptyCta} onClick={() => setMobileView("options")}>
                  <i className="ti ti-adjustments" />
                  Configure Options
                </button>
              </div>
            ) : (
              <div className={styles.gpResults}>
                {results.map((result, idx) => {
                  const analysis = analyzeString(result);
                  return (
                    <div key={idx} className={styles.gpResultCard}>
                      <div className={styles.gpResultHeader}>
                        <span className={styles.gpResultIndex}>#{idx + 1}</span>
                        <div className={styles.gpResultMeta}>
                          <span className={styles.gpResultLength}>{result.length} chars</span>
                          {analysis.hasRepeats && (
                            <span className={styles.gpResultWarn} title="Contains repeated characters">
                              <i className="ti ti-alert-triangle" />
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.gpResultValue}>{result}</div>
                      <div className={styles.gpResultActions}>
                        <button
                          className={`${styles.gpResultBtn}${copiedIndex === idx ? ` ${styles.copied}` : ""}`}
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