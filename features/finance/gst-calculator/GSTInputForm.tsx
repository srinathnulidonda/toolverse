// features/finance/gst-calculator/GSTInputForm.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import { GST_SLABS } from "./gstRules.config";
import type { CalculationMode, SupplyType } from "./gstEngine";

type GSTInputFormProps = {
    mode: CalculationMode;
    amount: string;
    gstRate: string;
    supplyType: SupplyType;
    cessRate: string;
    quantity: string;
    onModeChange: (value: CalculationMode) => void;
    onAmountChange: (value: string) => void;
    onGstRateChange: (value: string) => void;
    onSupplyTypeChange: (value: SupplyType) => void;
    onCessRateChange: (value: string) => void;
    onQuantityChange: (value: string) => void;
    isValidForm: boolean;
    hasCalculation: boolean;
    onViewResults: () => void;
};

export function GSTInputForm({
    mode,
    amount,
    gstRate,
    supplyType,
    cessRate,
    quantity,
    onModeChange,
    onAmountChange,
    onGstRateChange,
    onSupplyTypeChange,
    onCessRateChange,
    onQuantityChange,
    isValidForm,
    hasCalculation,
    onViewResults,
}: GSTInputFormProps) {
    const quantityNum = parseInt(quantity, 10) || 1;
    const amountNum = parseFloat(amount) || 0;
    const gstRateNum = parseFloat(gstRate) || 0;
    const cessRateNum = parseFloat(cessRate) || 0;

    return (
        <div className="gst-input-form">
            <div className="gst-form-section">
                <h4 className="gst-section-title">
                    <i className="ti ti-calculator" aria-hidden="true" />
                    Calculation Mode
                </h4>

                <div className="gst-mode-toggle">
                    <button
                        type="button"
                        className={`gst-mode-btn${mode === "ADD_GST" ? " active" : ""}`}
                        onClick={() => onModeChange("ADD_GST")}
                    >
                        <i className="ti ti-plus" aria-hidden="true" />
                        <div className="gst-mode-content">
                            <strong>Add GST</strong>
                            <span>Base amount → GST inclusive</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={`gst-mode-btn${mode === "REMOVE_GST" ? " active" : ""}`}
                        onClick={() => onModeChange("REMOVE_GST")}
                    >
                        <i className="ti ti-minus" aria-hidden="true" />
                        <div className="gst-mode-content">
                            <strong>Remove GST</strong>
                            <span>GST inclusive → Base amount</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="gst-form-section">
                <h4 className="gst-section-title">
                    <i className="ti ti-currency-rupee" aria-hidden="true" />
                    Amount & Quantity
                </h4>

                <div className="gst-form-grid">
                    <div className="gst-field gst-field-full">
                        <label htmlFor="amount" className="gst-label">
                            {mode === "ADD_GST" ? "Base Amount" : "GST-Inclusive Amount"}
                            <span className="gst-required">*</span>
                        </label>
                        <div className="gst-amount-field">
                            <span className="gst-currency-symbol">₹</span>
                            <input
                                id="amount"
                                type="number"
                                className="gst-amount-input"
                                value={amount}
                                onChange={(e) => onAmountChange(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <p className="gst-field-help">
                            {mode === "ADD_GST"
                                ? "Enter the base amount without GST"
                                : "Enter the total amount including GST"}
                        </p>
                    </div>

                    <div className="gst-field">
                        <label htmlFor="quantity" className="gst-label">
                            Quantity
                        </label>
                        <input
                            id="quantity"
                            type="number"
                            className="gst-input"
                            value={quantity}
                            onChange={(e) => onQuantityChange(e.target.value)}
                            min="1"
                            step="1"
                        />
                        {quantityNum > 1 && (
                            <p className="gst-field-hint">
                                <i className="ti ti-info-circle" aria-hidden="true" />
                                Multiplier for line items
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="gst-form-section">
                <h4 className="gst-section-title">
                    <i className="ti ti-percentage" aria-hidden="true" />
                    GST Rate & Supply Type
                </h4>

                <div className="gst-form-grid">
                    <div className="gst-field">
                        <label htmlFor="gst-rate" className="gst-label">
                            GST Rate
                            <span className="gst-required">*</span>
                        </label>
                        <select
                            id="gst-rate"
                            className="gst-select"
                            value={gstRate}
                            onChange={(e) => onGstRateChange(e.target.value)}
                            required
                        >
                            {GST_SLABS.map((slab) => (
                                <option key={slab.rate} value={slab.rate}>
                                    {slab.label}
                                </option>
                            ))}
                            <option value="custom">Custom Rate</option>
                        </select>
                    </div>

                    {gstRate === "custom" && (
                        <div className="gst-field">
                            <label htmlFor="custom-rate" className="gst-label">
                                Custom Rate (%)
                            </label>
                            <input
                                id="custom-rate"
                                type="number"
                                className="gst-input"
                                placeholder="0.00"
                                min="0"
                                max="100"
                                step="0.01"
                                onChange={(e) => onGstRateChange(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="gst-field">
                        <label htmlFor="supply-type" className="gst-label">
                            Supply Type
                            <span className="gst-required">*</span>
                        </label>
                        <select
                            id="supply-type"
                            className="gst-select"
                            value={supplyType}
                            onChange={(e) => onSupplyTypeChange(e.target.value as SupplyType)}
                            required
                        >
                            <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
                            <option value="INTER_STATE">Inter-State (IGST)</option>
                        </select>
                        <p className="gst-field-help">
                            {supplyType === "INTRA_STATE"
                                ? "Both parties in same state"
                                : "Parties in different states"}
                        </p>
                    </div>

                    <div className="gst-field">
                        <label htmlFor="cess-rate" className="gst-label">
                            Cess Rate (%)
                        </label>
                        <input
                            id="cess-rate"
                            type="number"
                            className="gst-input"
                            value={cessRate}
                            onChange={(e) => onCessRateChange(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            max="100"
                            step="0.01"
                        />
                        {cessRateNum > 0 && (
                            <p className="gst-field-hint">
                                <i className="ti ti-info-circle" aria-hidden="true" />
                                Additional {cessRateNum}% cess will be applied
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {amountNum > 0 && gstRateNum >= 0 && (
                <div className="gst-preview">
                    <div className="gst-preview-header">
                        <i className="ti ti-eye" aria-hidden="true" />
                        <span>Quick Preview</span>
                    </div>
                    <div className="gst-preview-grid">
                        <div className="gst-preview-item">
                            <span className="gst-preview-label">Effective Rate</span>
                            <strong className="gst-preview-value">{(gstRateNum + cessRateNum).toFixed(2)}%</strong>
                        </div>
                        {mode === "ADD_GST" && (
                            <div className="gst-preview-item">
                                <span className="gst-preview-label">Tax on Amount</span>
                                <strong className="gst-preview-value">
                                    ~{formatCurrency((amountNum * quantityNum * (gstRateNum + cessRateNum)) / 100)}
                                </strong>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {hasCalculation && (
                <div className="gst-form-actions">
                    <button
                        type="button"
                        className="gst-view-results-btn"
                        onClick={onViewResults}
                        aria-label="View calculation results"
                    >
                        <i className="ti ti-arrow-right" aria-hidden="true" />
                        <span className="gst-btn-content">
                            <strong>View Results</strong>
                            <span className="gst-btn-desc">See your GST calculation</span>
                        </span>
                        <i className="ti ti-chevron-right" aria-hidden="true" />
                    </button>
                </div>
            )}

            <style jsx>{`
        .gst-input-form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .gst-form-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .gst-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .gst-section-title i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .gst-mode-toggle {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .gst-mode-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.12s;
          text-align: left;
        }

        .gst-mode-btn:hover {
          background: var(--bg-surface);
          border-color: var(--brand-border);
        }

        .gst-mode-btn.active {
          background: var(--brand-light);
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .gst-mode-btn i {
          font-size: 20px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .gst-mode-btn.active i {
          color: var(--brand);
        }

        .gst-mode-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
        }

        .gst-mode-content strong {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .gst-mode-content span {
          font-size: 11.5px;
          color: var(--text-secondary);
        }

        .gst-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .gst-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gst-field-full {
          grid-column: 1 / -1;
        }

        .gst-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-sans);
        }

        .gst-required {
          color: #B91C1C;
          font-size: 13px;
        }

        @media (prefers-color-scheme: dark) {
          .gst-required {
            color: #F87171;
          }
        }

        .gst-input,
        .gst-select {
          height: 40px;
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
          transition: all 0.12s;
        }

        .gst-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        .gst-input:focus,
        .gst-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .gst-amount-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .gst-currency-symbol {
          position: absolute;
          left: 12px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-tertiary);
          pointer-events: none;
          font-family: var(--font-sans);
        }

        .gst-amount-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 32px;
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

        .gst-amount-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .gst-field-help {
          font-size: 11px;
          color: var(--text-tertiary);
          margin: 0;
          line-height: 1.4;
          font-family: var(--font-sans);
        }

        .gst-field-hint {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
          font-family: var(--font-sans);
        }

        .gst-field-hint i {
          font-size: 12px;
        }

        .gst-preview {
          padding: 14px;
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-lg);
          background: var(--brand-light);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .gst-preview-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--brand-text);
          font-family: var(--font-sans);
        }

        .gst-preview-header i {
          font-size: 14px;
        }

        .gst-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .gst-preview-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gst-preview-label {
          font-size: 10.5px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .gst-preview-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--brand-text);
          font-family: var(--font-mono);
        }

        .gst-form-actions {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 0.5px solid var(--border-faint);
          display: none;
        }

        .gst-view-results-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-lg);
          background: var(--brand-light);
          color: var(--brand-text);
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .gst-view-results-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .gst-view-results-btn:hover::before {
          left: 100%;
        }

        .gst-view-results-btn:hover {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(20, 92, 60, 0.2);
        }

        @media (prefers-color-scheme: dark) {
          .gst-view-results-btn:hover {
            box-shadow: 0 4px 16px rgba(76, 175, 130, 0.2);
          }
        }

        .gst-view-results-btn > i:first-child {
          font-size: 18px;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .gst-btn-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .gst-btn-content strong {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
        }

        .gst-btn-desc {
          font-size: 12px;
          opacity: 0.8;
          line-height: 1.3;
        }

        .gst-view-results-btn > i:last-child {
          font-size: 16px;
          flex-shrink: 0;
          opacity: 0.6;
          transition: transform 0.15s;
        }

        .gst-view-results-btn:hover > i:last-child {
          transform: translateX(3px);
          opacity: 1;
        }

        @media (max-width: 768px) {
          .gst-input-form {
            padding: 16px;
          }

          .gst-mode-toggle,
          .gst-form-grid,
          .gst-preview-grid {
            grid-template-columns: 1fr;
          }

          .gst-form-actions {
            display: block;
          }

          /* Typography */
          .gst-label {
            font-size: 11px;
          }

          .gst-required {
            font-size: 12px;
          }

          .gst-field-help,
          .gst-field-hint {
            font-size: 10.5px;
          }

          /* Buttons */
          .gst-view-results-btn {
            padding: 14px 16px;
          }

          .gst-view-results-btn > i:first-child {
            font-size: 18px;
          }

          .gst-btn-content strong {
            font-size: 13px;
          }

          .gst-btn-desc {
            font-size: 11px;
          }

          .gst-view-results-btn > i:last-child {
            font-size: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gst-input,
          .gst-select,
          .gst-amount-input,
          .gst-mode-btn,
          .gst-view-results-btn,
          .gst-view-results-btn::before,
          .gst-view-results-btn > i:last-child {
            transition: none;
          }
        }
      `}</style>
        </div>
    );
}