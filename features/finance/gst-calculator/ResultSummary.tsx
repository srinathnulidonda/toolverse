// features/finance/gst-calculator/ResultSummary.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import type { GSTCalculationResult, CalculationMode } from "./gstEngine";

type ResultSummaryProps = {
  calculation: GSTCalculationResult;
  reference: string;
  onCopy: (text: string, key: string) => void;
  copiedKey: string;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
};

export function ResultSummary({
  calculation,
  reference,
  onCopy,
  copiedKey,
  onDownloadPDF,
  isGeneratingPDF,
}: ResultSummaryProps) {
  const resultText = `
GST Calculation Result - ${reference}

═══════════════════════════════════
Mode: ${calculation.mode === "ADD_GST" ? "Add GST (Forward)" : "Remove GST (Reverse)"}
Supply Type: ${calculation.supplyType === "INTRA_STATE" ? "Intra-State" : "Inter-State"}
═══════════════════════════════════

BASE AMOUNT: ${formatCurrency(calculation.baseAmount)}
TOTAL TAX: ${formatCurrency(calculation.totalTax)}
FINAL AMOUNT: ${formatCurrency(calculation.finalAmount)}

Tax Breakdown:
• Taxable Value: ${formatCurrency(calculation.taxableValue)}
${calculation.supplyType === "INTRA_STATE"
      ? `• CGST @ ${(calculation.gstRate / 2).toFixed(2)}%: ${formatCurrency(calculation.cgst)}
• SGST @ ${(calculation.gstRate / 2).toFixed(2)}%: ${formatCurrency(calculation.sgst)}`
      : `• IGST @ ${calculation.gstRate.toFixed(2)}%: ${formatCurrency(calculation.igst)}`}
${calculation.cess > 0 ? `• Cess @ ${calculation.cessRate.toFixed(2)}%: ${formatCurrency(calculation.cess)}` : ''}

${calculation.quantity > 1 ? `\nPer Unit:
• Base: ${formatCurrency(calculation.perUnitBase)}
• Tax: ${formatCurrency(calculation.perUnitTax)}
• Final: ${formatCurrency(calculation.perUnitFinal)}` : ''}
  `.trim();

  return (
    <div className="gst-result-summary">
      <div className="gst-status-banner">
        <div className="gst-status-icon">
          <i className={`ti ${calculation.mode === "ADD_GST" ? "ti-plus" : "ti-minus"}`} aria-hidden="true" />
        </div>
        <div className="gst-status-content">
          <span className="gst-status-label">Calculation Status</span>
          <strong className="gst-status-value">
            {calculation.mode === "ADD_GST" ? "GST Added Successfully" : "GST Extracted Successfully"}
          </strong>
        </div>
      </div>

      <div className="gst-result-cards">
        <div className="gst-result-card gst-card-primary">
          <div className="gst-card-icon">
            <i className="ti ti-currency-rupee" aria-hidden="true" />
          </div>
          <div className="gst-card-content">
            <span className="gst-card-label">Base Amount</span>
            <strong className="gst-card-value">{formatCurrency(calculation.baseAmount)}</strong>
          </div>
        </div>

        <div className="gst-result-card gst-card-accent">
          <div className="gst-card-icon">
            <i className="ti ti-receipt-tax" aria-hidden="true" />
          </div>
          <div className="gst-card-content">
            <span className="gst-card-label">Total Tax</span>
            <strong className="gst-card-value">{formatCurrency(calculation.totalTax)}</strong>
          </div>
        </div>

        <div className="gst-result-card gst-card-success">
          <div className="gst-card-icon">
            <i className="ti ti-circle-check" aria-hidden="true" />
          </div>
          <div className="gst-card-content">
            <span className="gst-card-label">Final Amount</span>
            <strong className="gst-card-value">{formatCurrency(calculation.finalAmount)}</strong>
          </div>
        </div>
      </div>

      <div className="gst-breakdown-section">
        <h4 className="gst-breakdown-heading">
          <i className="ti ti-list-details" aria-hidden="true" />
          Tax Breakdown
        </h4>

        <div className="gst-breakdown-list">
          <div className="gst-breakdown-item">
            <div className="gst-breakdown-label">
              <i className="ti ti-currency-rupee" aria-hidden="true" />
              Base Amount
            </div>
            <div className="gst-breakdown-value">{formatCurrency(calculation.baseAmount)}</div>
          </div>

          {calculation.quantity > 1 && (
            <div className="gst-breakdown-item">
              <div className="gst-breakdown-label">
                <i className="ti ti-x" aria-hidden="true" />
                Quantity
              </div>
              <div className="gst-breakdown-value">{calculation.quantity} units</div>
            </div>
          )}

          <div className="gst-breakdown-divider" />

          <div className="gst-breakdown-item gst-item-highlight">
            <div className="gst-breakdown-label">
              <i className="ti ti-receipt" aria-hidden="true" />
              Taxable Value
            </div>
            <div className="gst-breakdown-value">{formatCurrency(calculation.taxableValue)}</div>
          </div>

          <div className="gst-breakdown-divider" />
          <div className="gst-breakdown-subtitle">
            <i className="ti ti-plus" aria-hidden="true" />
            Tax Components
          </div>

          {calculation.supplyType === "INTRA_STATE" ? (
            <>
              <div className="gst-breakdown-item">
                <div className="gst-breakdown-label">
                  <i className="ti ti-building" aria-hidden="true" />
                  CGST @ {(calculation.gstRate / 2).toFixed(2)}%
                </div>
                <div className="gst-breakdown-value">{formatCurrency(calculation.cgst)}</div>
              </div>

              <div className="gst-breakdown-item">
                <div className="gst-breakdown-label">
                  <i className="ti ti-map-pin" aria-hidden="true" />
                  SGST @ {(calculation.gstRate / 2).toFixed(2)}%
                </div>
                <div className="gst-breakdown-value">{formatCurrency(calculation.sgst)}</div>
              </div>
            </>
          ) : (
            <div className="gst-breakdown-item">
              <div className="gst-breakdown-label">
                <i className="ti ti-route" aria-hidden="true" />
                IGST @ {calculation.gstRate.toFixed(2)}%
              </div>
              <div className="gst-breakdown-value">{formatCurrency(calculation.igst)}</div>
            </div>
          )}

          {calculation.cess > 0 && (
            <div className="gst-breakdown-item">
              <div className="gst-breakdown-label">
                <i className="ti ti-plus-minus" aria-hidden="true" />
                Cess @ {calculation.cessRate.toFixed(2)}%
              </div>
              <div className="gst-breakdown-value">{formatCurrency(calculation.cess)}</div>
            </div>
          )}

          <div className="gst-breakdown-divider" />

          <div className="gst-breakdown-item gst-item-total">
            <div className="gst-breakdown-label">
              <i className="ti ti-sum" aria-hidden="true" />
              Total Tax
            </div>
            <div className="gst-breakdown-value">{formatCurrency(calculation.totalTax)}</div>
          </div>

          <div className="gst-breakdown-item gst-item-total">
            <div className="gst-breakdown-label">
              <i className="ti ti-circle-check" aria-hidden="true" />
              Final Amount (Inc. Tax)
            </div>
            <div className="gst-breakdown-value">{formatCurrency(calculation.finalAmount)}</div>
          </div>
        </div>
      </div>

      {calculation.quantity > 1 && (
        <div className="gst-per-unit">
          <h4 className="gst-per-unit-heading">
            <i className="ti ti-package" aria-hidden="true" />
            Per Unit Breakdown
          </h4>
          <div className="gst-per-unit-grid">
            <div className="gst-per-unit-item">
              <span className="gst-per-unit-label">Base</span>
              <strong className="gst-per-unit-value">{formatCurrency(calculation.perUnitBase)}</strong>
            </div>
            <div className="gst-per-unit-item">
              <span className="gst-per-unit-label">Tax</span>
              <strong className="gst-per-unit-value">{formatCurrency(calculation.perUnitTax)}</strong>
            </div>
            <div className="gst-per-unit-item">
              <span className="gst-per-unit-label">Final</span>
              <strong className="gst-per-unit-value">{formatCurrency(calculation.perUnitFinal)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="gst-result-actions">
        <button
          type="button"
          className={`gst-action-btn${copiedKey === "summary" ? " success" : ""}`}
          onClick={() => onCopy(resultText, "summary")}
        >
          <i className={`ti ${copiedKey === "summary" ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
          {copiedKey === "summary" ? "Copied!" : (
            <>
              Copy<span className="gst-btn-text-full"> Result</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="gst-action-btn primary"
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          aria-busy={isGeneratingPDF}
        >
          <i
            className={`ti ${isGeneratingPDF ? "ti-loader-2 gst-spin" : "ti-file-download"}`}
            aria-hidden="true"
          />
          {isGeneratingPDF ? "Generating PDF…" : "Download PDF Report"}
        </button>
      </div>

      <style jsx>{`
        .gst-result-summary {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          font-family: var(--font-sans);
        }

        .gst-status-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid var(--brand-border);
          border-radius: var(--radius-lg);
          background: var(--brand-light);
          transition: all 0.12s;
        }

        .gst-status-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          color: var(--brand);
        }

        @media (prefers-color-scheme: dark) {
          .gst-status-icon {
            background: rgba(0, 0, 0, 0.2);
          }
        }

        .gst-status-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .gst-status-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .gst-status-value {
          font-size: 15px;
          font-weight: 700;
          color: var(--brand-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gst-result-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

        .gst-result-card {
          padding: 16px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.12s;
        }

        .gst-result-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .gst-card-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .gst-card-primary {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .gst-card-primary .gst-card-icon {
          background: rgba(20, 92, 60, 0.15);
          color: var(--brand);
        }

        @media (prefers-color-scheme: dark) {
          .gst-card-primary .gst-card-icon {
            background: rgba(76, 175, 130, 0.15);
          }
        }

        .gst-card-primary .gst-card-value {
          color: var(--brand-text);
        }

        .gst-card-accent {
          background: rgba(37, 99, 235, 0.05);
          border-color: rgba(37, 99, 235, 0.2);
        }

        .gst-card-accent .gst-card-icon {
          background: rgba(37, 99, 235, 0.1);
          color: #2563EB;
        }

        .gst-card-accent .gst-card-value {
          color: #2563EB;
        }

        @media (prefers-color-scheme: dark) {
          .gst-card-accent {
            background: rgba(59, 130, 246, 0.08);
            border-color: rgba(59, 130, 246, 0.2);
          }

          .gst-card-accent .gst-card-icon {
            color: #60A5FA;
          }

          .gst-card-accent .gst-card-value {
            color: #60A5FA;
          }
        }

        .gst-card-success {
          background: rgba(5, 150, 105, 0.05);
          border-color: rgba(5, 150, 105, 0.2);
        }

        .gst-card-success .gst-card-icon {
          background: rgba(5, 150, 105, 0.1);
          color: #059669;
        }

        .gst-card-success .gst-card-value {
          color: #059669;
        }

        @media (prefers-color-scheme: dark) {
          .gst-card-success {
            background: rgba(16, 185, 129, 0.08);
            border-color: rgba(16, 185, 129, 0.2);
          }

          .gst-card-success .gst-card-icon {
            color: #10B981;
          }

          .gst-card-success .gst-card-value {
            color: #10B981;
          }
        }

        .gst-card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .gst-card-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .gst-card-value {
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-mono);
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gst-breakdown-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gst-breakdown-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .gst-breakdown-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .gst-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border-faint);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .gst-breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          background: var(--bg-card);
          gap: 12px;
        }

        .gst-breakdown-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          flex: 1;
        }

        .gst-breakdown-label i {
          font-size: 15px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .gst-breakdown-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gst-breakdown-divider {
          height: 0.5px;
          background: var(--border);
        }

        .gst-breakdown-subtitle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-surface);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .gst-breakdown-subtitle i {
          font-size: 12px;
        }

        .gst-item-highlight {
          background: var(--brand-light);
        }

        .gst-item-highlight .gst-breakdown-value {
          color: var(--brand-text);
        }

        .gst-item-total {
          background: var(--bg-surface);
        }

        .gst-item-total .gst-breakdown-label {
          color: var(--text);
          font-weight: 600;
        }

        .gst-item-total .gst-breakdown-value {
          color: var(--brand-text);
          font-size: 15px;
          font-weight: 700;
        }

        .gst-per-unit {
          padding: 14px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .gst-per-unit-heading {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .gst-per-unit-heading i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .gst-per-unit-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .gst-per-unit-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: center;
        }

        .gst-per-unit-label {
          font-size: 10.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .gst-per-unit-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .gst-result-actions {
          display: flex;
          gap: 8px;
          padding-top: 4px;
        }

        .gst-action-btn {
          flex: 1;
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          padding: 0 16px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          text-align: center;
          white-space: nowrap;
        }

        .gst-action-btn i {
          font-size: 15px;
        }

        .gst-action-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
          border-color: var(--brand-border);
        }

        .gst-action-btn.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .gst-action-btn.primary {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
          font-weight: 600;
        }

        .gst-action-btn.primary:hover:not(:disabled) {
          background: var(--brand-hover);
          border-color: var(--brand-hover);
          color: white;
        }

        .gst-action-btn.primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gst-spin {
          animation: gst-spin-rotate 0.8s linear infinite;
        }

        @keyframes gst-spin-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .gst-result-summary {
            padding: 16px;
            gap: 16px;
          }

          .gst-result-cards,
          .gst-prepayment-grid {
            grid-template-columns: 1fr;
          }

          .gst-status-label {
            font-size: 11px;
          }

          .gst-status-value {
            font-size: 15px;
          }

          .gst-card-label {
            font-size: 10.5px;
          }

          .gst-card-value {
            font-size: 15px;
          }

          .gst-prepayment-heading {
            font-size: 12px;
          }

          .gst-benefit-label {
            font-size: 10px;
          }

          .gst-benefit-value {
            font-size: 12px;
          }

          .gst-breakdown-label {
            font-size: 12px;
          }

          .gst-breakdown-value {
            font-size: 12.5px;
          }

          .gst-item-total .gst-breakdown-label {
            font-size: 12px;
          }

          .gst-item-total .gst-breakdown-value {
            font-size: 13px;
          }

          .gst-result-actions {
            gap: 6px;
          }

          .gst-action-btn {
            flex: 0 0 auto;
            width: auto;
            height: 32px;
            padding: 0 12px;
            font-size: 12px;
            white-space: nowrap;
          }

          .gst-action-btn i {
            font-size: 13px;
          }

          .gst-btn-text-full {
            display: none;
          }

          .gst-action-btn.primary {
            flex: 1;
            padding: 0 10px;
            white-space: nowrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gst-status-banner,
          .gst-result-card,
          .gst-action-btn,
          .gst-spin {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}