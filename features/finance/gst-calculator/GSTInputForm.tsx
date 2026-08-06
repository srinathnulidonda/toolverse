// features/finance/gst-calculator/GSTInputForm.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import { GST_SLABS } from "./ts/gstRules.config";
import type { CalculationMode, SupplyType } from "./ts/gstEngine";
import styles from "./style/GSTInputForm.module.css";

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
    <div className={styles.gstInputForm}>
      <div className={styles.gstFormSection}>
        <h4 className={styles.gstSectionTitle}>
          <i className="ti ti-calculator" aria-hidden="true" />
          Calculation Mode
        </h4>

        <div className={styles.gstModeToggle}>
          <button
            type="button"
            className={`${styles.gstModeBtn}${mode === "ADD_GST" ? ` ${styles.active}` : ""}`}
            onClick={() => onModeChange("ADD_GST")}
          >
            <i className="ti ti-plus" aria-hidden="true" />
            <div className={styles.gstModeContent}>
              <strong>Add GST</strong>
              <span>Base amount → GST inclusive</span>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.gstModeBtn}${mode === "REMOVE_GST" ? ` ${styles.active}` : ""}`}
            onClick={() => onModeChange("REMOVE_GST")}
          >
            <i className="ti ti-minus" aria-hidden="true" />
            <div className={styles.gstModeContent}>
              <strong>Remove GST</strong>
              <span>GST inclusive → Base amount</span>
            </div>
          </button>
        </div>
      </div>

      <div className={styles.gstFormSection}>
        <h4 className={styles.gstSectionTitle}>
          <i className="ti ti-currency-rupee" aria-hidden="true" />
          Amount & Quantity
        </h4>

        <div className={styles.gstFormGrid}>
          <div className={`${styles.gstField} ${styles.gstFieldFull}`}>
            <label htmlFor="amount" className={styles.gstLabel}>
              {mode === "ADD_GST" ? "Base Amount" : "GST-Inclusive Amount"}
              <span className={styles.gstRequired}>*</span>
            </label>
            <div className={styles.gstAmountField}>
              <span className={styles.gstCurrencySymbol}>₹</span>
              <input
                id="amount"
                type="number"
                className={styles.gstAmountInput}
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <p className={styles.gstFieldHelp}>
              {mode === "ADD_GST"
                ? "Enter the base amount without GST"
                : "Enter the total amount including GST"}
            </p>
          </div>

          <div className={styles.gstField}>
            <label htmlFor="quantity" className={styles.gstLabel}>
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              className={styles.gstInput}
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              min="1"
              step="1"
            />
            {quantityNum > 1 && (
              <p className={styles.gstFieldHint}>
                <i className="ti ti-info-circle" aria-hidden="true" />
                Multiplier for line items
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.gstFormSection}>
        <h4 className={styles.gstSectionTitle}>
          <i className="ti ti-percentage" aria-hidden="true" />
          GST Rate & Supply Type
        </h4>

        <div className={styles.gstFormGrid}>
          <div className={styles.gstField}>
            <label htmlFor="gst-rate" className={styles.gstLabel}>
              GST Rate
              <span className={styles.gstRequired}>*</span>
            </label>
            <select
              id="gst-rate"
              className={styles.gstSelect}
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
            <div className={styles.gstField}>
              <label htmlFor="custom-rate" className={styles.gstLabel}>
                Custom Rate (%)
              </label>
              <input
                id="custom-rate"
                type="number"
                className={styles.gstInput}
                placeholder="0.00"
                min="0"
                max="100"
                step="0.01"
                onChange={(e) => onGstRateChange(e.target.value)}
              />
            </div>
          )}

          <div className={styles.gstField}>
            <label htmlFor="supply-type" className={styles.gstLabel}>
              Supply Type
              <span className={styles.gstRequired}>*</span>
            </label>
            <select
              id="supply-type"
              className={styles.gstSelect}
              value={supplyType}
              onChange={(e) => onSupplyTypeChange(e.target.value as SupplyType)}
              required
            >
              <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
              <option value="INTER_STATE">Inter-State (IGST)</option>
            </select>
            <p className={styles.gstFieldHelp}>
              {supplyType === "INTRA_STATE"
                ? "Both parties in same state"
                : "Parties in different states"}
            </p>
          </div>

          <div className={styles.gstField}>
            <label htmlFor="cess-rate" className={styles.gstLabel}>
              Cess Rate (%)
            </label>
            <input
              id="cess-rate"
              type="number"
              className={styles.gstInput}
              value={cessRate}
              onChange={(e) => onCessRateChange(e.target.value)}
              placeholder="0.00"
              min="0"
              max="100"
              step="0.01"
            />
            {cessRateNum > 0 && (
              <p className={styles.gstFieldHint}>
                <i className="ti ti-info-circle" aria-hidden="true" />
                Additional {cessRateNum}% cess will be applied
              </p>
            )}
          </div>
        </div>
      </div>

      {amountNum > 0 && gstRateNum >= 0 && (
        <div className={styles.gstPreview}>
          <div className={styles.gstPreviewHeader}>
            <i className="ti ti-eye" aria-hidden="true" />
            <span>Quick Preview</span>
          </div>
          <div className={styles.gstPreviewGrid}>
            <div className={styles.gstPreviewItem}>
              <span className={styles.gstPreviewLabel}>Effective Rate</span>
              <strong className={styles.gstPreviewValue}>{(gstRateNum + cessRateNum).toFixed(2)}%</strong>
            </div>
            {mode === "ADD_GST" && (
              <div className={styles.gstPreviewItem}>
                <span className={styles.gstPreviewLabel}>Tax on Amount</span>
                <strong className={styles.gstPreviewValue}>
                  ~{formatCurrency((amountNum * quantityNum * (gstRateNum + cessRateNum)) / 100)}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      {hasCalculation && (
        <div className={styles.gstFormActions}>
          <button
            type="button"
            className={styles.gstViewResultsBtn}
            onClick={onViewResults}
            aria-label="View calculation results"
          >
            <i className="ti ti-arrow-right" aria-hidden="true" />
            <span className={styles.gstBtnContent}>
              <strong>View Results</strong>
              <span className={styles.gstBtnDesc}>See your GST calculation</span>
            </span>
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}