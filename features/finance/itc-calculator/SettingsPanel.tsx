// features/finance/itc-calculator/SettingsPanel.tsx

"use client";

import { BLOCKED_CREDIT_CATEGORIES, TIME_LIMIT_RULE, REVERSAL_RULES } from "./itcRules.config";

type SettingsPanelProps = {
  usageTaxable: string;
  usageExempt: string;
  usageNonBusiness: string;
  blockedCategory: string | undefined;
  onUsageChange: (field: "taxable" | "exempt" | "nonBusiness", value: number) => void;
  onBlockedCategoryChange: (value: string | undefined) => void;
};

export function SettingsPanel({
  usageTaxable,
  usageExempt,
  usageNonBusiness,
  blockedCategory,
  onUsageChange,
  onBlockedCategoryChange,
}: SettingsPanelProps) {
  const parsed = {
    taxable: parseFloat(usageTaxable) || 0,
    exempt: parseFloat(usageExempt) || 0,
    nonBusiness: parseFloat(usageNonBusiness) || 0,
  };

  const total = parsed.taxable + parsed.exempt + parsed.nonBusiness;
  const isValid = Math.abs(total - 100) < 0.01;

  return (
    <div className="itc-settings" role="region" aria-label="Settings">
      <div className="itc-settings-inner">
        <div className="itc-settings-section">
          <h3 className="itc-settings-heading">
            <i className="ti ti-chart-pie" aria-hidden="true" />
            Usage Split Distribution
          </h3>
          <p className="itc-settings-desc">
            Allocate input usage across taxable, exempt, and non-business supplies. This affects Rule 42/43 calculations.
          </p>

          <div className="itc-usage-grid">
            <div className="itc-usage-field">
              <label htmlFor="usage-taxable" className="itc-usage-label">
                <i className="ti ti-circle-check" aria-hidden="true" />
                <span>Taxable Supply</span>
              </label>
              <div className="itc-usage-input-wrap">
                <input
                  id="usage-taxable"
                  type="number"
                  className="itc-usage-input"
                  value={usageTaxable}
                  onChange={(e) => onUsageChange("taxable", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="itc-usage-suffix">%</span>
              </div>
            </div>

            <div className="itc-usage-field">
              <label htmlFor="usage-exempt" className="itc-usage-label">
                <i className="ti ti-circle-x" aria-hidden="true" />
                <span>Exempt Supply</span>
              </label>
              <div className="itc-usage-input-wrap">
                <input
                  id="usage-exempt"
                  type="number"
                  className="itc-usage-input"
                  value={usageExempt}
                  onChange={(e) => onUsageChange("exempt", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="itc-usage-suffix">%</span>
              </div>
            </div>

            <div className="itc-usage-field">
              <label htmlFor="usage-nonbusiness" className="itc-usage-label">
                <i className="ti ti-circle-dashed" aria-hidden="true" />
                <span>Non-Business</span>
              </label>
              <div className="itc-usage-input-wrap">
                <input
                  id="usage-nonbusiness"
                  type="number"
                  className="itc-usage-input"
                  value={usageNonBusiness}
                  onChange={(e) => onUsageChange("nonBusiness", parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="itc-usage-suffix">%</span>
              </div>
            </div>
          </div>

          <div className={`itc-usage-total ${isValid ? "valid" : "error"}`}>
            <i className={`ti ${isValid ? "ti-check" : "ti-alert-circle"}`} aria-hidden="true" />
            <span>
              Total: {total.toFixed(1)}%{isValid ? " ✓" : " (Must equal 100%)"}
            </span>
          </div>

          {parsed.exempt > 0 || parsed.nonBusiness > 0 ? (
            <div className="itc-usage-impact">
              <i className="ti ti-info-circle" aria-hidden="true" />
              <span>
                {parsed.exempt > 0 && `${parsed.exempt}% ITC will be reversed under Rule 42/43 for exempt supply. `}
                {parsed.nonBusiness > 0 && `${parsed.nonBusiness}% ITC cannot be claimed for non-business use.`}
              </span>
            </div>
          ) : (
            <div className="itc-usage-impact success">
              <i className="ti ti-check" aria-hidden="true" />
              <span>100% taxable supply - Full ITC eligible (subject to other conditions).</span>
            </div>
          )}
        </div>

        <div className="itc-settings-section">
          <h3 className="itc-settings-heading">
            <i className="ti ti-ban" aria-hidden="true" />
            Blocked Credit Category
          </h3>
          <p className="itc-settings-desc">Select if this invoice falls under Section 17(5) restrictions</p>

          <select
            className="itc-select-full"
            value={blockedCategory || ""}
            onChange={(e) => onBlockedCategoryChange(e.target.value || undefined)}
            aria-label="Select blocked credit category"
          >
            <option value="">None - Fully eligible for ITC</option>
            {BLOCKED_CREDIT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
                {cat.note && ` — ${cat.note}`}
              </option>
            ))}
          </select>

          {blockedCategory && (
            <div className="itc-blocked-warning">
              <i className="ti ti-alert-triangle" aria-hidden="true" />
              <span>
                This category is blocked under Section 17(5). No ITC can be claimed regardless of other factors.
              </span>
            </div>
          )}
        </div>

        <div className="itc-settings-section">
          <h3 className="itc-settings-heading">
            <i className="ti ti-book" aria-hidden="true" />
            Applicable Rules Reference
          </h3>

          <div className="itc-rules-grid">
            <div className="itc-rule-card">
              <div className="itc-rule-header">
                <i className="ti ti-clock" aria-hidden="true" />
                <strong>Section 16(4)</strong>
              </div>
              <p className="itc-rule-text">{TIME_LIMIT_RULE.description}</p>
              <span className="itc-rule-tag">Time Limit</span>
            </div>

            <div className="itc-rule-card">
              <div className="itc-rule-header">
                <i className="ti ti-refresh" aria-hidden="true" />
                <strong>Rule 42 & 43</strong>
              </div>
              <p className="itc-rule-text">{REVERSAL_RULES.rule42_43.description}</p>
              <span className="itc-rule-tag">Common Credit</span>
            </div>

            <div className="itc-rule-card">
              <div className="itc-rule-header">
                <i className="ti ti-clock-pause" aria-hidden="true" />
                <strong>Rule 37</strong>
              </div>
              <p className="itc-rule-text">{REVERSAL_RULES.rule37.description}</p>
              <span className="itc-rule-tag">{REVERSAL_RULES.rule37.daysLimit} Days</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .itc-settings {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          max-height: 70vh;
          overflow-y: auto;
        }

        .itc-settings-inner {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .itc-settings-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .itc-settings-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .itc-settings-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .itc-settings-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin: -4px 0 0 0;
          line-height: 1.5;
          font-family: var(--font-sans);
        }

        .itc-usage-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .itc-usage-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .itc-usage-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .itc-usage-label i {
          font-size: 13px;
        }

        .itc-usage-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .itc-usage-input {
          width: 100%;
          height: 40px;
          padding: 0 40px 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          font-family: var(--font-mono);
          outline: none;
          transition: all 0.12s;
        }

        .itc-usage-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .itc-usage-suffix {
          position: absolute;
          right: 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-tertiary);
          pointer-events: none;
          font-family: var(--font-sans);
        }

        .itc-usage-total {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
        }

        .itc-usage-total i {
          font-size: 14px;
        }

        .itc-usage-total.valid {
          background: rgba(20, 92, 60, 0.1);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .itc-usage-total.error {
          background: rgba(220, 38, 38, 0.08);
          color: #991b1b;
          border: 0.5px solid rgba(220, 38, 38, 0.2);
        }

        @media (prefers-color-scheme: dark) {
          .itc-usage-total.valid {
            background: rgba(76, 175, 130, 0.12);
            color: var(--brand-text);
          }
          .itc-usage-total.error {
            background: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
          }
        }

        .itc-usage-impact {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 12px;
          line-height: 1.5;
          font-family: var(--font-sans);
          background: rgba(217, 119, 6, 0.08);
          color: #92400e;
          border: 0.5px solid rgba(217, 119, 6, 0.2);
        }

        .itc-usage-impact.success {
          background: rgba(20, 92, 60, 0.1);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .itc-usage-impact i {
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        @media (prefers-color-scheme: dark) {
          .itc-usage-impact {
            background: rgba(251, 191, 36, 0.1);
            color: #fbbf24;
          }
        }

        .itc-select-full {
          width: 100%;
          height: 40px;
          padding: 0 36px 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-sans);
          cursor: pointer;
          outline: none;
          transition: all 0.12s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }

        .itc-select-full:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .itc-blocked-warning {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 12px;
          line-height: 1.5;
          font-family: var(--font-sans);
          background: rgba(220, 38, 38, 0.08);
          color: #991b1b;
          border: 0.5px solid rgba(220, 38, 38, 0.2);
        }

        .itc-blocked-warning i {
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .itc-blocked-warning {
            background: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
          }
          .itc-blocked-warning i {
            color: #f87171;
          }
        }

        .itc-rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }

        .itc-rule-card {
          padding: 14px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.12s;
        }

        .itc-rule-card:hover {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }

        .itc-rule-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .itc-rule-header i {
          font-size: 15px;
          color: var(--brand);
        }

        .itc-rule-text {
          margin: 0;
          font-size: 11.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          font-family: var(--font-sans);
        }

        .itc-rule-tag {
          display: inline-flex;
          align-items: center;
          align-self: flex-start;
          padding: 3px 8px;
          border-radius: 99px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .itc-settings-inner {
            padding: 16px;
          }

          .itc-usage-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .itc-usage-input,
          .itc-select-full,
          .itc-rule-card {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}