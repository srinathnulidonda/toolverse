// features/dev/slug-generator/SlugPreview.tsx
"use client";

import { useMemo } from "react";
import { analyzeSlug, validateSlug, type SlugOptions } from "./utils";

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
      <div className="sp-root">
        {/*  Mobile Tabs  */}
        <div className="sp-mobile-tabs">
          <button
            type="button"
            className={`sp-mobile-tab${mobileView === "input" ? " active" : ""}`}
            onClick={() => onMobileViewChange("input")}
            role="tab"
            aria-selected={mobileView === "input"}
          >
            <i className="ti ti-pencil" />
            <span className="sp-tab-text">Input</span>
            {input && <span className="sp-tab-count">{input.length}</span>}
          </button>
          <button
            type="button"
            className={`sp-mobile-tab${mobileView === "output" ? " active" : ""}`}
            onClick={() => onMobileViewChange("output")}
            role="tab"
            aria-selected={mobileView === "output"}
          >
            <i className="ti ti-sparkles" />
            <span className="sp-tab-text">Output</span>
            {output && <span className="sp-mobile-dot" />}
            {analysis && (
              <span className={`sp-tab-score ${analysis.readability}`}>{analysis.score}</span>
            )}
          </button>
        </div>

        {/*  Panels  */}
        <div className="sp-panels">
          {/* Input Panel */}
          <div
            className={`sp-panel sp-panel-input${mobileView === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="sp-panel-header">
              <div className="sp-panel-label">
                <i className="ti ti-pencil" />
                <span className="sp-label-text">Input Text</span>
              </div>
              <div className="sp-panel-meta">
                {input && (
                  <>
                    <span className="sp-meta-text">{input.length} chars</span>
                    <span className="sp-meta-text sp-meta-mobile-hide">
                      {input.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="sp-panel-body">
              <textarea
                className="sp-textarea"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Enter text to convert to a URL-friendly slug...&#10;&#10;Examples:&#10;• Blog Post Title&#10;• Product Name&#10;• Category Description"
                spellCheck={false}
                aria-label="Input text for slug generation"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="sp-divider" aria-hidden="true">
            <div className="sp-divider-icon">
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`sp-panel sp-panel-output${mobileView === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="sp-panel-header">
              <div className="sp-panel-label">
                <i className="ti ti-sparkles" />
                <span className="sp-label-text">Generated Slug</span>
              </div>
              <div className="sp-panel-meta">
                {output && (
                  <>
                    <span className="sp-meta-text">{output.length} chars</span>
                    {reductionPercent > 0 && (
                      <span className="sp-reduction-pill sp-meta-mobile-hide">
                        -{reductionPercent}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="sp-panel-body">
              {!output ? (
                <div className="sp-empty">
                  <div className="sp-empty-icon">
                    <i className="ti ti-link" />
                  </div>
                  <p className="sp-empty-title">Generated slug appears here</p>
                  <p className="sp-empty-desc">
                    Start typing on the left to see your URL-friendly slug
                  </p>
                </div>
              ) : (
                <div className="sp-output-content">
                  {/* URL Preview */}
                  <div className="sp-url-preview">
                    <div className="sp-url-bar">
                      <i className="ti ti-lock" />
                      <span className="sp-url-domain">example.com/</span>
                      <span className="sp-url-slug">{output}</span>
                    </div>
                  </div>

                  {/* Slug Display */}
                  <div className="sp-slug-display">
                    <div className="sp-slug-value">{output}</div>
                    {validation && !validation.valid && (
                      <div className="sp-validation-errors">
                        {validation.errors.map((err, i) => (
                          <div key={i} className="sp-error-item">
                            <i className="ti ti-alert-circle" />
                            {err}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Analysis Score */}
                  {analysis && (
                    <div className="sp-analysis-card">
                      <div className="sp-analysis-header">
                        <div className="sp-score-container">
                          <div
                            className={`sp-score-circle score-${analysis.readability}`}
                            style={{
                              background: `conic-gradient(var(--brand) ${analysis.score * 3.6}deg, var(--border) 0deg)`,
                            }}
                          >
                            <div className="sp-score-inner">
                              <div className="sp-score-value">{analysis.score}</div>
                              <div className="sp-score-label">score</div>
                            </div>
                          </div>
                          <div className="sp-score-info">
                            <div className="sp-score-title">SEO Quality</div>
                            <div className={`sp-score-badge ${analysis.readability}`}>
                              {analysis.readability.charAt(0).toUpperCase() +
                                analysis.readability.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sp-analysis-stats">
                        <div className="sp-stat-item">
                          <i className="ti ti-ruler-2" />
                          <span className="sp-stat-value">{analysis.length}</span>
                          <span className="sp-stat-label">characters</span>
                        </div>
                        <div className="sp-stat-item">
                          <i className="ti ti-text-size" />
                          <span className="sp-stat-value">{analysis.wordCount}</span>
                          <span className="sp-stat-label">words</span>
                        </div>
                        {analysis.hasNumbers && (
                          <div className="sp-stat-item">
                            <i className="ti ti-123" />
                            <span className="sp-stat-label">has numbers</span>
                          </div>
                        )}
                      </div>

                      {/* Keywords */}
                      {analysis.keywords.length > 0 && (
                        <div className="sp-keywords">
                          <div className="sp-keywords-label">Keywords</div>
                          <div className="sp-keywords-list">
                            {analysis.keywords.map((kw, i) => (
                              <div key={i} className="sp-keyword-tag">
                                {kw.word}
                                {kw.count > 1 && (
                                  <span className="sp-keyword-count">×{kw.count}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Issues & Suggestions */}
                      {(analysis.seoIssues.length > 0 || analysis.suggestions.length > 0) && (
                        <div className="sp-feedback">
                          {analysis.seoIssues.length > 0 && (
                            <div className="sp-issues">
                              <div className="sp-issues-title">
                                <i className="ti ti-alert-triangle" />
                                Issues
                              </div>
                              {analysis.seoIssues.map((issue, i) => (
                                <div key={i} className="sp-issue-item">
                                  • {issue}
                                </div>
                              ))}
                            </div>
                          )}
                          {analysis.suggestions.length > 0 && (
                            <div className="sp-suggestions">
                              <div className="sp-suggestions-title">
                                <i className="ti ti-bulb" />
                                Suggestions
                              </div>
                              {analysis.suggestions.map((suggestion, i) => (
                                <div key={i} className="sp-suggestion-item">
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

      <style jsx>{`
        .sp-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Mobile Tabs  */
        .sp-mobile-tabs {
          display: none;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .sp-mobile-tab {
          flex: 1;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
          padding: 0 8px;
        }

        .sp-mobile-tab i {
          font-size: 16px;
          flex-shrink: 0;
        }

        .sp-tab-text {
          font-size: 13px;
        }

        .sp-tab-count {
          font-size: 10px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
        }

        .sp-tab-score {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 20px;
          padding: 0 6px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 700;
        }

        .sp-tab-score.excellent {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .sp-tab-score.good {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .sp-tab-score.fair {
          background: #fef3c7;
          color: #b45309;
        }

        .sp-tab-score.poor {
          background: var(--error-bg);
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .sp-tab-score.good {
            background: #1e3a8a;
            color: #93c5fd;
          }
          .sp-tab-score.fair {
            background: #451a03;
            color: #fcd34d;
          }
          .sp-tab-score.poor {
            color: #f87171;
          }
        }

        .sp-mobile-tab.active {
          color: var(--text);
        }

        .sp-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 15%;
          right: 15%;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .sp-mobile-dot {
          position: absolute;
          top: 8px;
          right: calc(50% - 40px);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        /*  Panels  */
        .sp-panels {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          min-height: 0;
          overflow: hidden;
        }

        .sp-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .sp-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 38px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-shrink: 0;
          gap: 8px;
        }

        .sp-panel-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .sp-panel-label i {
          font-size: 11px;
        }

        .sp-label-text {
          white-space: nowrap;
        }

        .sp-panel-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sp-meta-text {
          font-size: 10px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          white-space: nowrap;
        }

        .sp-reduction-pill {
          font-size: 10px;
          font-weight: 600;
          background: var(--brand-light);
          color: var(--brand-text);
          padding: 2px 7px;
          border-radius: 99px;
        }

        .sp-panel-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: auto;
        }

        /*  Divider  */
        .sp-divider {
          width: 1px;
          background: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .sp-divider-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        /*  Textarea  */
        .sp-textarea {
          flex: 1;
          margin: 0;
          padding: 14px 16px;
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.7;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          resize: none;
          overflow: auto;
        }

        .sp-textarea::placeholder {
          color: var(--text-disabled);
        }

        /*  Empty State  */
        .sp-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 40px 24px;
          text-align: center;
        }

        .sp-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--text-disabled);
          margin-bottom: 4px;
        }

        .sp-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .sp-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 300px;
          line-height: 1.5;
        }

        /*  Output Content  */
        .sp-output-content {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 14px;
        }

        .sp-url-preview {
          padding: 10px;
          background: var(--bg-surface);
          border-radius: var(--sg-radius-md);
          border: 0.5px solid var(--border);
        }

        .sp-url-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          background: var(--bg-card);
          border-radius: 5px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          overflow-x: auto;
        }

        .sp-url-bar i {
          font-size: 12px;
          color: var(--text-disabled);
          flex-shrink: 0;
        }

        .sp-url-domain {
          color: var(--text-disabled);
          flex-shrink: 0;
        }

        .sp-url-slug {
          color: var(--brand);
          font-weight: 600;
          word-break: break-all;
        }

        .sp-slug-display {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sp-slug-value {
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          word-break: break-all;
          line-height: 1.5;
        }

        .sp-validation-errors {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sp-error-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: var(--error-bg);
          border-radius: 5px;
          color: #b91c1c;
          font-size: 11px;
        }

        @media (prefers-color-scheme: dark) {
          .sp-error-item {
            color: #f87171;
          }
        }

        .sp-error-item i {
          font-size: 12px;
          flex-shrink: 0;
        }

        /*  Analysis Card  */
        .sp-analysis-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--sg-radius-md);
        }

        .sp-analysis-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sp-score-container {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .sp-score-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }

        .sp-score-inner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .sp-score-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--brand);
          line-height: 1;
        }

        .sp-score-label {
          font-size: 9px;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sp-score-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .sp-score-title {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .sp-score-badge {
          display: inline-flex;
          align-items: center;
          height: 22px;
          padding: 0 8px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          width: fit-content;
        }

        .sp-score-badge.excellent {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .sp-score-badge.good {
          background: #dbeafe;
          color: #1d4ed8;
        }

        @media (prefers-color-scheme: dark) {
          .sp-score-badge.good {
            background: #1e3a8a;
            color: #93c5fd;
          }
        }

        .sp-score-badge.fair {
          background: #fef3c7;
          color: #b45309;
        }

        @media (prefers-color-scheme: dark) {
          .sp-score-badge.fair {
            background: #451a03;
            color: #fcd34d;
          }
        }

        .sp-score-badge.poor {
          background: var(--error-bg);
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .sp-score-badge.poor {
            color: #f87171;
          }
        }

        .sp-analysis-stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sp-stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 9px;
          background: var(--bg-card);
          border-radius: 6px;
          border: 0.5px solid var(--border);
          font-size: 11px;
        }

        .sp-stat-item i {
          font-size: 12px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .sp-stat-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }

        .sp-stat-label {
          font-size: 10px;
          color: var(--text-tertiary);
        }

        .sp-keywords {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .sp-keywords-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .sp-keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .sp-keyword-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          height: 23px;
          padding: 0 7px;
          background: var(--brand-light);
          color: var(--brand-text);
          border-radius: 99px;
          font-size: 10.5px;
          font-weight: 500;
        }

        .sp-keyword-count {
          opacity: 0.7;
          font-size: 9px;
        }

        .sp-feedback {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sp-issues,
        .sp-suggestions {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 9px 11px;
          border-radius: 6px;
        }

        .sp-issues {
          background: var(--error-bg);
        }

        .sp-suggestions {
          background: #fef3c7;
        }

        @media (prefers-color-scheme: dark) {
          .sp-suggestions {
            background: #451a03;
          }
        }

        .sp-issues-title,
        .sp-suggestions-title {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .sp-issues-title {
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .sp-issues-title {
            color: #f87171;
          }
        }

        .sp-suggestions-title {
          color: #b45309;
        }

        @media (prefers-color-scheme: dark) {
          .sp-suggestions-title {
            color: #fcd34d;
          }
        }

        .sp-issues-title i,
        .sp-suggestions-title i {
          font-size: 11px;
        }

        .sp-issue-item,
        .sp-suggestion-item {
          font-size: 11px;
          line-height: 1.6;
        }

        .sp-issue-item {
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .sp-issue-item {
            color: #f87171;
          }
        }

        .sp-suggestion-item {
          color: #b45309;
        }

        @media (prefers-color-scheme: dark) {
          .sp-suggestion-item {
            color: #fcd34d;
          }
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .sp-mobile-tabs {
            display: flex;
          }

          .sp-panels {
            display: block;
          }

          .sp-divider {
            display: none;
          }

          .sp-panel {
            min-height: 400px;
          }

          .sp-panel.mobile-hidden {
            display: none;
          }

          .sp-panel.mobile-visible {
            display: flex;
          }

          .sp-panel-header {
            padding: 0 12px;
            height: 36px;
          }

          .sp-meta-mobile-hide {
            display: none;
          }

          .sp-output-content {
            padding: 12px;
            gap: 12px;
          }

          .sp-url-bar {
            font-size: 10.5px;
            padding: 6px 9px;
          }

          .sp-slug-value {
            font-size: 14px;
          }

          .sp-analysis-card {
            padding: 12px;
          }

          .sp-score-circle {
            width: 52px;
            height: 52px;
          }

          .sp-score-inner {
            width: 44px;
            height: 44px;
          }

          .sp-score-value {
            font-size: 16px;
          }

          .sp-textarea {
            padding: 12px 14px;
            font-size: 13px;
          }

          .sp-empty {
            padding: 30px 20px;
          }

          .sp-empty-icon {
            width: 44px;
            height: 44px;
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .sp-label-text {
            display: none;
          }

          .sp-tab-text {
            display: none;
          }

          .sp-mobile-tab {
            gap: 4px;
          }

          .sp-analysis-stats {
            gap: 6px;
          }

          .sp-stat-item {
            font-size: 10px;
            padding: 4px 7px;
          }

          .sp-score-container {
            gap: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sp-mobile-tab {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
