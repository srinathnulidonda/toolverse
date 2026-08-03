// features/finance/emi-calculator/SettingsPanel.tsx

"use client";

type SettingsPanelProps = {
  usageTaxable: string; // Reusing from ITC for consistency but will repurpose
  usageExempt: string;  // Reusing from ITC for consistency but will repurpose
  usageNonBusiness: string; // Reusing from ITC for consistency but will repurpose
  blockedCategory: string | undefined; // Reusing from ITC for consistency but will repurpose
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
  // Repurposing the ITC settings panel for EMI calculator
  // For EMI, we'll use these fields for loan type reference info and prepayment settings

  const handleUsageChange = (
    field: "taxable" | "exempt" | "nonBusiness",
    value: number
  ) => {
    onUsageChange(field, value);
  };

  return (
    <div className="emi-settings-panel">
      <div className="emi-settings-section">
        <h4 className="emi-settings-title">
          <i className="ti ti-info" aria-hidden="true" />
          Loan Type Reference
        </h4>
        <div className="emi-settings-grid">
          <div className="emi-setting-item">
            <span className="emi-setting-label">Home Loan</span>
            <span className="emi-setting-value">7.5% - 9.5% p.a.</span>
          </div>
          <div className="emi-setting-item">
            <span className="emi-setting-label">Car Loan</span>
            <span className="emi-setting-value">7.0% - 12.0% p.a.</span>
          </div>
          <div className="emi-setting-item">
            <span className="emi-setting-label">Personal Loan</span>
            <span className="emi-setting-value">10.5% - 24.0% p.a.</span>
          </div>
          <div className="emi-setting-item">
            <span className="emi-setting-label">Education Loan</span>
            <span className="emi-setting-value">8.0% - 15.0% p.a.</span>
          </div>
        </div>
      </div>

      <div className="emi-settings-section">
        <h4 className="emi-settings-title">
          <i className="ti ti-help" aria-hidden="true" />
          About Amortization
        </h4>
        <p className="emi-settings-desc">
          EMI (Equated Monthly Installment) is calculated using the reducing balance method.
          Each EMI comprises both principal and interest components. Initially, the interest
          component is higher, but as the loan progresses, the principal component increases.
        </p>
        <p className="emi-settings-desc">
          Making prepayments reduces the outstanding principal, which in turn reduces the
          interest burden and can shorten the loan tenure.
        </p>
      </div>

      <div className="emi-settings-section">
        <h4 className="emi-settings-title">
          <i className="ti ti-settings" aria-hidden="true" />
          Advanced Settings
        </h4>
        <div className="emi-settings-group">
          <label className="emi-settings-label">
            <input
              type="checkbox"
              className="emi-settings-input"
              checked={false} // Placeholder - would connect to actual state
              onChange={() => {
                // Placeholder for actual implementation
              }}
            />
            <span className="emi-settings-checkbox-box">
              <i className="ti ti-check" aria-hidden="true" />
            </span>
            <span className="emi-settings-label-text">
              Show amortization formula details
            </span>
          </label>
        </div>
      </div>

      <style jsx>{`
        .emi-settings-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .emi-settings-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .emi-settings-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .emi-settings-title i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .emi-settings-desc {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .emi-settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .emi-setting-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border-faint);
        }

        .emi-setting-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .emi-setting-value {
          font-size: 12px;
          color: var(--text);
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .emi-settings-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .emi-settings-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text);
          cursor: pointer;
        }

        .emi-settings-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .emi-settings-checkbox-box {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-radius: 4px;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.12s;
        }

        .emi-settings-checkbox-box i {
          font-size: 11px;
          color: white;
          opacity: 0;
          transform: scale(0.7);
          transition: all 0.12s;
        }

        .emi-settings-input:checked + .emi-settings-checkbox-box {
          background: var(--brand);
          border-color: var(--brand);
        }

        .emi-settings-input:checked + .emi-settings-checkbox-box i {
          opacity: 1;
          transform: scale(1);
        }

        .emi-settings-label-text {
          font-size: 12.5px;
          color: var(--text);
          font-family: var(--font-sans);
        }

        @media (max-width: 768px) {
          .emi-settings-panel {
            padding: 16px;
          }

          .emi-settings-title {
            font-size: 12px;
          }

          .emi-settings-desc {
            font-size: 11px;
          }

          .emi-setting-label,
          .emi-setting-value {
            font-size: 11px;
          }

          .emi-settings-label {
            font-size: 11.5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .emi-settings-checkbox-box,
          .emi-settings-checkbox-box i,
          .emi-settings-input:checked + .emi-settings-checkbox-box i {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}