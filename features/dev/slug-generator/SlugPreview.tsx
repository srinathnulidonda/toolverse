// features/dev/slug-generator/SlugPreview.tsx
"use client";

import { useMemo } from "react";
import { analyzeSlug, validateSlug, type SlugOptions } from "./ts/utils";
import styles from "./style/SlugPreview.module.css";

interface SlugPreviewProps {
  input: string;
  output: string;
  options: SlugOptions;
  mobileView: "input" | "output";
  onInputChange: (value: string) => void;
  onMobileViewChange: (view: "input" | "output") => void;
}

export default function SlugPreview({
  input,
  output,
  options,
  mobileView,
  onInputChange,
  onMobileViewChange,
}: SlugPreviewProps) {
  const analysis = useMemo(() => {
    if (!output) return null;
    return analyzeSlug(output, input);
  }, [output, input]);

  const validation = useMemo(() => {
    if (!output) return null;
    return validateSlug(output);
  }, [output]);

  const inputBytes = useMemo(() => new Blob([input]).size, [input]);
  const outputBytes = useMemo(() => new Blob([output]).size, [output]);

  const reductionPercent = useMemo(() => {
    if (inputBytes === 0) return 0;
    return Math.round(((inputBytes - outputBytes) / inputBytes) * 100);
  }, [inputBytes, outputBytes]);

  return (
    <>
      <div className={styles.spRoot}>
        {/*  Mobile Tabs  */}
        <div className={styles.spMobileTabs}>
          <button
            type="button"
            className={`${styles.spMobileTab}${mobileView === "input" ? ` ${styles.active}` : ""}`}
            onClick={() => onMobileViewChange("input")}
            role="tab"
            aria-selected={mobileView === "input"}
          >
            <i className="ti ti-pencil" />
            <span className={styles.spTabText}>Input</span>
            {input && <span className={styles.spTabCount}>{input.length}</span>}
          </button>
          <button
            type="button"
            className={`${styles.spMobileTab}${mobileView === "output" ? ` ${styles.active}` : ""}`}
            onClick={() => onMobileViewChange("output")}
            role="tab"
            aria-selected={mobileView === "output"}
          >
            <i className="ti ti-sparkles" />
            <span className={styles.spTabText}>Output</span>
            {output && <span className={styles.spMobileDot} />}
            {analysis && (
              <span className={`${styles.spTabScore} ${styles[analysis.readability]}`}>{analysis.score}</span>
            )}
          </button>
        </div>

        {/*  Panels  */}
        <div className={styles.spPanels}>
          {/* Input Panel */}
          <div
            className={`${styles.spPanel} ${styles.spPanelInput}${mobileView === "input" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
          >
            <div className={styles.spPanelHeader}>
              <div className={styles.spPanelLabel}>
                <i className="ti ti-pencil" />
                <span className={styles.spLabelText}>Input Text</span>
              </div>
              <div className={styles.spPanelMeta}>
                {input && (
                  <>
                    <span className={styles.spMetaText}>{input.length} chars</span>
                    <span className={`${styles.spMetaText} ${styles.spMetaMobileHide}`}>
                      {input.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className={styles.spPanelBody}>
              <textarea
                className={styles.spTextarea}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Enter text to convert to a URL-friendly slug...&#10;&#10;Examples:&#10;• Blog Post Title&#10;• Product Name&#10;• Category Description"
                spellCheck={false}
                aria-label="Input text for slug generation"
              />
            </div>
          </div>

          {/* Divider */}
          <div className={styles.spDivider} aria-hidden="true">
            <div className={styles.spDividerIcon}>
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`${styles.spPanel} ${styles.spPanelOutput}${mobileView === "output" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
          >
            <div className={styles.spPanelHeader}>
              <div className={styles.spPanelLabel}>
                <i className="ti ti-sparkles" />
                <span className={styles.spLabelText}>Generated Slug</span>
              </div>
              <div className={styles.spPanelMeta}>
                {output && (
                  <>
                    <span className={styles.spMetaText}>{output.length} chars</span>
                    {reductionPercent > 0 && (
                      <span className={`${styles.spReductionPill} ${styles.spMetaMobileHide}`}>
                        -{reductionPercent}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className={styles.spPanelBody}>
              {!output ? (
                <div className={styles.spEmpty}>
                  <div className={styles.spEmptyIcon}>
                    <i className="ti ti-link" />
                  </div>
                  <p className={styles.spEmptyTitle}>Generated slug appears here</p>
                  <p className={styles.spEmptyDesc}>
                    Start typing on the left to see your URL-friendly slug
                  </p>
                </div>
              ) : (
                <div className={styles.spOutputContent}>
                  {/* URL Preview */}
                  <div className={styles.spUrlPreview}>
                    <div className={styles.spUrlBar}>
                      <i className="ti ti-lock" />
                      <span className={styles.spUrlDomain}>example.com/</span>
                      <span className={styles.spUrlSlug}>{output}</span>
                    </div>
                  </div>

                  {/* Slug Display */}
                  <div className={styles.spSlugDisplay}>
                    <div className={styles.spSlugValue}>{output}</div>
                    {validation && !validation.valid && (
                      <div className={styles.spValidationErrors}>
                        {validation.errors.map((err, i) => (
                          <div key={i} className={styles.spErrorItem}>
                            <i className="ti ti-alert-circle" />
                            {err}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Analysis Score */}
                  {analysis && (
                    <div className={styles.spAnalysisCard}>
                      <div className={styles.spAnalysisHeader}>
                        <div className={styles.spScoreContainer}>
                          <div
                            className={`${styles.spScoreCircle} ${styles[`score${analysis.readability.charAt(0).toUpperCase()}${analysis.readability.slice(1)}`]}`}
                            style={{
                              background: `conic-gradient(var(--brand) ${analysis.score * 3.6}deg, var(--border) 0deg)`,
                            }}
                          >
                            <div className={styles.spScoreInner}>
                              <div className={styles.spScoreValue}>{analysis.score}</div>
                              <div className={styles.spScoreLabel}>score</div>
                            </div>
                          </div>
                          <div className={styles.spScoreInfo}>
                            <div className={styles.spScoreTitle}>SEO Quality</div>
                            <div className={`${styles.spScoreBadge} ${styles[analysis.readability]}`}>
                              {analysis.readability.charAt(0).toUpperCase() +
                                analysis.readability.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.spAnalysisStats}>
                        <div className={styles.spStatItem}>
                          <i className="ti ti-ruler-2" />
                          <span className={styles.spStatValue}>{analysis.length}</span>
                          <span className={styles.spStatLabel}>characters</span>
                        </div>
                        <div className={styles.spStatItem}>
                          <i className="ti ti-text-size" />
                          <span className={styles.spStatValue}>{analysis.wordCount}</span>
                          <span className={styles.spStatLabel}>words</span>
                        </div>
                        {analysis.hasNumbers && (
                          <div className={styles.spStatItem}>
                            <i className="ti ti-123" />
                            <span className={styles.spStatLabel}>has numbers</span>
                          </div>
                        )}
                      </div>

                      {/* Keywords */}
                      {analysis.keywords.length > 0 && (
                        <div className={styles.spKeywords}>
                          <div className={styles.spKeywordsLabel}>Keywords</div>
                          <div className={styles.spKeywordsList}>
                            {analysis.keywords.map((kw, i) => (
                              <div key={i} className={styles.spKeywordTag}>
                                {kw.word}
                                {kw.count > 1 && (
                                  <span className={styles.spKeywordCount}>×{kw.count}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Issues & Suggestions */}
                      {(analysis.seoIssues.length > 0 || analysis.suggestions.length > 0) && (
                        <div className={styles.spFeedback}>
                          {analysis.seoIssues.length > 0 && (
                            <div className={styles.spIssues}>
                              <div className={styles.spIssuesTitle}>
                                <i className="ti ti-alert-triangle" />
                                Issues
                              </div>
                              {analysis.seoIssues.map((issue, i) => (
                                <div key={i} className={styles.spIssueItem}>
                                  • {issue}
                                </div>
                              ))}
                            </div>
                          )}
                          {analysis.suggestions.length > 0 && (
                            <div className={styles.spSuggestions}>
                              <div className={styles.spSuggestionsTitle}>
                                <i className="ti ti-bulb" />
                                Suggestions
                              </div>
                              {analysis.suggestions.map((suggestion, i) => (
                                <div key={i} className={styles.spSuggestionItem}>
                                  • {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}