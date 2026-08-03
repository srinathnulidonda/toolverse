// features/finance/gst-calculator/SettingsPanel.tsx

"use client";

import { GST_SLABS, GST_CALCULATION_RULES, CESS_CATEGORIES } from "./gstRules.config";

type SettingsPanelProps = {
    onClose?: () => void;
};

export function SettingsPanel({ onClose }: SettingsPanelProps) {
    return (
        <div className="gst-settings" role="region" aria-label="Settings">
            <div className="gst-settings-inner">
                <div className="gst-settings-section">
                    <h3 className="gst-settings-heading">
                        <i className="ti ti-percentage" aria-hidden="true" />
                        Standard GST Rates
                    </h3>
                    <p className="gst-settings-desc">
                        Current GST slabs applicable in India as per latest tax structure
                    </p>

                    <div className="gst-rate-grid">
                        {GST_SLABS.map((slab) => (
                            <div key={slab.rate} className="gst-rate-card">
                                <div className="gst-rate-badge">{slab.rate}%</div>
                                <p className="gst-rate-desc">{slab.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="gst-settings-section">
                    <h3 className="gst-settings-heading">
                        <i className="ti ti-alert-circle" aria-hidden="true" />
                        Cess Categories
                    </h3>
                    <p className="gst-settings-desc">
                        Additional cess applicable on specific goods beyond standard GST
                    </p>

                    <div className="gst-cess-list">
                        {CESS_CATEGORIES.map((category) => (
                            <div key={category.id} className="gst-cess-item">
                                <div className="gst-cess-header">
                                    <strong>{category.label}</strong>
                                    {category.commonRate > 0 && (
                                        <span className="gst-cess-rate">{category.commonRate}% cess</span>
                                    )}
                                </div>
                                <p className="gst-cess-note">{category.note}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="gst-settings-section">
                    <h3 className="gst-settings-heading">
                        <i className="ti ti-book" aria-hidden="true" />
                        Calculation Rules Reference
                    </h3>

                    <div className="gst-rules-grid">
                        <div className="gst-rule-card">
                            <div className="gst-rule-header">
                                <i className="ti ti-plus" aria-hidden="true" />
                                <strong>Forward Calculation</strong>
                            </div>
                            <p className="gst-rule-text">{GST_CALCULATION_RULES.forward.description}</p>
                            <div className="gst-rule-formula">
                                <code>{GST_CALCULATION_RULES.forward.formula}</code>
                            </div>
                            <span className="gst-rule-example">{GST_CALCULATION_RULES.forward.example}</span>
                        </div>

                        <div className="gst-rule-card">
                            <div className="gst-rule-header">
                                <i className="ti ti-minus" aria-hidden="true" />
                                <strong>Reverse Calculation</strong>
                            </div>
                            <p className="gst-rule-text">{GST_CALCULATION_RULES.reverse.description}</p>
                            <div className="gst-rule-formula">
                                <code>{GST_CALCULATION_RULES.reverse.formula}</code>
                            </div>
                            <span className="gst-rule-example">{GST_CALCULATION_RULES.reverse.example}</span>
                        </div>

                        <div className="gst-rule-card">
                            <div className="gst-rule-header">
                                <i className="ti ti-divide" aria-hidden="true" />
                                <strong>Intra-State Split</strong>
                            </div>
                            <p className="gst-rule-text">{GST_CALCULATION_RULES.intraSplit.description}</p>
                            <div className="gst-rule-formula">
                                <code>{GST_CALCULATION_RULES.intraSplit.formula}</code>
                            </div>
                            <span className="gst-rule-example">{GST_CALCULATION_RULES.intraSplit.example}</span>
                        </div>

                        <div className="gst-rule-card">
                            <div className="gst-rule-header">
                                <i className="ti ti-plus-minus" aria-hidden="true" />
                                <strong>Cess Calculation</strong>
                            </div>
                            <p className="gst-rule-text">{GST_CALCULATION_RULES.cess.description}</p>
                            <div className="gst-rule-formula">
                                <code>{GST_CALCULATION_RULES.cess.formula}</code>
                            </div>
                            <span className="gst-rule-example">{GST_CALCULATION_RULES.cess.example}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .gst-settings {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          max-height: 70vh;
          overflow-y: auto;
        }

        .gst-settings-inner {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .gst-settings-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gst-settings-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .gst-settings-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .gst-settings-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin: -4px 0 0 0;
          line-height: 1.5;
          font-family: var(--font-sans);
        }

        .gst-rate-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
        }

        .gst-rate-card {
          padding: 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.12s;
        }

        .gst-rate-card:hover {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }

        .gst-rate-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          padding: 4px 10px;
          border-radius: 99px;
          background: var(--brand);
          color: white;
          font-size: 13px;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .gst-rate-desc {
          margin: 0;
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          font-family: var(--font-sans);
        }

        .gst-cess-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .gst-cess-item {
          padding: 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gst-cess-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .gst-cess-header strong {
          font-size: 12.5px;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .gst-cess-rate {
          font-size: 11px;
          font-weight: 600;
          color: var(--brand-text);
          font-family: var(--font-mono);
          padding: 2px 8px;
          border-radius: 99px;
          background: var(--brand-light);
        }

        .gst-cess-note {
          margin: 0;
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.5;
          font-family: var(--font-sans);
        }

        .gst-rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }

        .gst-rule-card {
          padding: 14px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.12s;
        }

        .gst-rule-card:hover {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }

        .gst-rule-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .gst-rule-header i {
          font-size: 15px;
          color: var(--brand);
        }

        .gst-rule-text {
          margin: 0;
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          font-family: var(--font-sans);
        }

        .gst-rule-formula {
          padding: 8px;
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
        }

        .gst-rule-formula code {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text);
          word-break: break-word;
        }

        .gst-rule-example {
          font-size: 10.5px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .gst-settings-inner {
            padding: 16px;
          }

          .gst-rate-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gst-rate-card,
          .gst-rule-card {
            transition: none;
          }
        }
      `}</style>
        </div>
    );
}