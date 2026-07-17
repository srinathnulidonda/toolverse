// features/finance/gst-calculator/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  calculateGST,
  searchHSNCode,
  formatCurrency,
  DEFAULT_GST_OPTIONS,
  GST_RATES,
  type GSTOptions,
  type GSTMode,
  type RoundingMode,
} from "./gstEngine";
import GSTAnalysis from "./GSTAnalysis";
import { useGSTStore } from "./gstStore";

export default function GSTCalculatorWorkspace() {
  const [amount, setAmount] = useState<string>("");
  const [options, setOptions] = useState<GSTOptions>(DEFAULT_GST_OPTIONS);
  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showHSNSearch, setShowHSNSearch] = useState(false);
  const [hsnQuery, setHSNQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { saveToHistory } = useGSTStore();

  const calculation = useMemo(() => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt < 0) return null;
    return calculateGST(amt, options);
  }, [amount, options]);

  const hsnResults = useMemo(() => searchHSNCode(hsnQuery), [hsnQuery]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch (error) {
      logger.warn("Failed to copy to clipboard:", error);
    }
  }, []);

  const handleSaveCalculation = useCallback(() => {
    if (!calculation) return;

    saveToHistory({
      title: `${options.mode} — ${formatCurrency(calculation.finalAmount)}`,
      type: "simple",
      calculation,
      options,
      isFavorite: false,
      tags: [`${options.gstRate}%`, options.mode, options.gstType],
    });
  }, [calculation, options, saveToHistory]);

  const handleOptionsChange = useCallback((updates: Partial<GSTOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleAmountChange = useCallback(
    (newAmount: string) => {
      setAmount(newAmount);
      // Clear price per unit when amount is manually changed
      if (newAmount && options.pricePerUnit > 0) {
        handleOptionsChange({ pricePerUnit: 0 });
      }
    },
    [options.pricePerUnit, handleOptionsChange]
  );

  const handleQuickAmount = useCallback(
    (quickAmount: number) => {
      setAmount(quickAmount.toString());
      // Clear price per unit when quick amount is selected
      if (options.pricePerUnit > 0) {
        handleOptionsChange({ pricePerUnit: 0 });
      }
    },
    [options.pricePerUnit, handleOptionsChange]
  );

  const handleQuantityChange = useCallback(
    (value: string) => {
      const parsed = parseFloat(value);
      // Allow 0 as a valid quantity
      handleOptionsChange({ quantity: isNaN(parsed) ? 1 : Math.max(0, parsed) });
    },
    [handleOptionsChange]
  );

  const handleRateChange = useCallback(
    (field: "gstRate" | "cessRate" | "discountPercent", value: string) => {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        handleOptionsChange({ [field]: 0 });
      } else {
        // Clamp to 0-100 range
        handleOptionsChange({ [field]: Math.min(Math.max(parsed, 0), 100) });
      }
    },
    [handleOptionsChange]
  );

  return (
    <>
      <div className="gw-root">
        <div className="gw-chrome">
          <div className="gw-chrome-left">
            <div className="gw-title">
              <div className="gw-title-icon">
                <i className="ti ti-receipt-tax" />
              </div>
              GST Calculator
              <span className="gw-title-badge">{options.gstRate}%</span>
            </div>
          </div>
          <div className="gw-chrome-right">
            <div className="gw-mode-pills">
              {(["exclusive", "inclusive", "reverse"] as GSTMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`gw-mode-pill ${options.mode === m ? "active" : ""}`}
                  data-mode={m}
                  onClick={() => handleOptionsChange({ mode: m })}
                  title={
                    m === "exclusive"
                      ? "Add GST to amount"
                      : m === "inclusive"
                        ? "Extract GST from amount"
                        : "Calculate original from total"
                  }
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`gw-settings-btn ${showSettings ? "active" : ""}`}
              onClick={() => setShowSettings((s) => !s)}
            >
              <i className="ti ti-settings" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="gw-settings">
            <div className="gw-settings-section">
              <div className="gw-settings-header">
                <i className="ti ti-percentage" />
                <span>GST Configuration</span>
              </div>
              <div className="gw-settings-grid">
                <div className="gw-form-group">
                  <label className="gw-label">GST Rate (%)</label>
                  <div className="gw-rate-options">
                    {GST_RATES.filter((r) => r.common).map((rate) => (
                      <button
                        key={rate.rate}
                        type="button"
                        className={`gw-rate-btn ${options.gstRate === rate.rate ? "active" : ""}`}
                        onClick={() => handleOptionsChange({ gstRate: rate.rate })}
                      >
                        {rate.rate}%
                      </button>
                    ))}
                    <input
                      type="number"
                      className="gw-rate-input"
                      value={options.gstRate}
                      onChange={(e) => handleRateChange("gstRate", e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Custom"
                    />
                  </div>
                </div>

                <div className="gw-form-group">
                  <label className="gw-label">GST Type</label>
                  <div className="gw-radio-group">
                    <label className="gw-radio">
                      <input
                        type="radio"
                        name="gstType"
                        checked={options.gstType === "intra"}
                        onChange={() => handleOptionsChange({ gstType: "intra" })}
                      />
                      <span className="gw-radio-mark" />
                      <div className="gw-radio-label">
                        <strong>Intra-State</strong>
                        <small>CGST + SGST</small>
                      </div>
                    </label>
                    <label className="gw-radio">
                      <input
                        type="radio"
                        name="gstType"
                        checked={options.gstType === "inter"}
                        onChange={() => handleOptionsChange({ gstType: "inter" })}
                      />
                      <span className="gw-radio-mark" />
                      <div className="gw-radio-label">
                        <strong>Inter-State</strong>
                        <small>IGST</small>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="gw-form-group">
                  <label className="gw-label">Cess Rate (%)</label>
                  <input
                    type="number"
                    className="gw-input"
                    value={options.cessRate}
                    onChange={(e) => handleRateChange("cessRate", e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                <div className="gw-form-group">
                  <label className="gw-label">Discount (%)</label>
                  <input
                    type="number"
                    className="gw-input"
                    value={options.discountPercent}
                    onChange={(e) => handleRateChange("discountPercent", e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                <div className="gw-form-group">
                  <label className="gw-label">Rounding</label>
                  <select
                    className="gw-select"
                    value={options.roundingMode}
                    onChange={(e) =>
                      handleOptionsChange({ roundingMode: e.target.value as RoundingMode })
                    }
                  >
                    <option value="none">No Rounding</option>
                    <option value="nearest">Nearest Rupee</option>
                    <option value="up">Round Up</option>
                    <option value="down">Round Down</option>
                  </select>
                </div>

                <div className="gw-form-group">
                  <label className="gw-toggle">
                    <input
                      type="checkbox"
                      checked={options.includeRoundOff}
                      onChange={(e) => handleOptionsChange({ includeRoundOff: e.target.checked })}
                    />
                    <div className="gw-toggle-track">
                      <div className="gw-toggle-thumb" />
                    </div>
                    <span>Include Round-off in Total</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="gw-toolbar">
          <div className="gw-toolbar-left">
            <button
              type="button"
              className="gw-hsn-btn"
              onClick={() => setShowHSNSearch((s) => !s)}
            >
              <i className="ti ti-search" />
              HSN/SAC Lookup
            </button>
          </div>
          <div className="gw-toolbar-right">
            {calculation && (
              <button
                type="button"
                className={`gw-analysis-btn ${showAnalysis ? "active" : ""}`}
                onClick={() => setShowAnalysis((s) => !s)}
              >
                <i className="ti ti-chart-line" />
                {showAnalysis ? "Hide" : "Show"} Analysis
              </button>
            )}
          </div>
        </div>

        {showHSNSearch && (
          <div className="gw-hsn-search">
            <div className="gw-hsn-search-header">
              <input
                type="text"
                className="gw-hsn-input"
                placeholder="Search HSN/SAC code or description..."
                value={hsnQuery}
                onChange={(e) => setHSNQuery(e.target.value)}
                autoFocus
              />
              <button type="button" className="gw-icon-btn" onClick={() => setShowHSNSearch(false)}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="gw-hsn-results">
              {hsnResults.map((hsn) => (
                <button
                  key={hsn.code}
                  type="button"
                  className="gw-hsn-item"
                  onClick={() => {
                    handleOptionsChange({
                      gstRate: hsn.gstRate,
                      cessRate: hsn.cessRate,
                    });
                    setShowHSNSearch(false);
                  }}
                >
                  <div className="gw-hsn-code">{hsn.code}</div>
                  <div className="gw-hsn-desc">{hsn.description}</div>
                  <div className="gw-hsn-rate">{hsn.gstRate}% GST</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="gw-mobile-switcher">
          <button
            type="button"
            className={`gw-sw-tab ${mobilePanel === "input" ? "active" : ""}`}
            onClick={() => setMobilePanel("input")}
          >
            <i className="ti ti-edit" />
            Input
          </button>
          <div className="gw-sw-divider" />
          <button
            type="button"
            className={`gw-sw-tab ${mobilePanel === "output" ? "active" : ""}`}
            onClick={() => setMobilePanel("output")}
          >
            <i className="ti ti-report-money" />
            Result
            {calculation && mobilePanel !== "output" && <span className="gw-sw-dot" />}
          </button>
        </div>

        <div className="gw-body">
          <div className={`gw-panel ${mobilePanel === "input" ? "mob-visible" : "mob-hidden"}`}>
            <div className="gw-panel-bar">
              <div className="gw-panel-label">
                <i className="ti ti-edit" />
                Enter Amount
              </div>
              <div className="gw-panel-actions">
                <span className="gw-mode-indicator" data-mode={options.mode}>
                  {options.mode === "exclusive" && "Amount (excl. GST)"}
                  {options.mode === "inclusive" && "Amount (incl. GST)"}
                  {options.mode === "reverse" && "Final Total"}
                </span>
              </div>
            </div>

            <div className="gw-input-section">
              <div className="gw-amount-input-wrap">
                <div className="gw-currency-symbol">₹</div>
                <input
                  type="number"
                  className="gw-amount-input"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              {(options.quantity > 1 || options.pricePerUnit > 0) && (
                <div className="gw-calc-mode-indicator">
                  <i className="ti ti-calculator" />
                  Using {options.quantity} × ₹{options.pricePerUnit.toLocaleString("en-IN")} = ₹
                  {(options.quantity * options.pricePerUnit).toLocaleString("en-IN")}
                </div>
              )}

              <div className="gw-quick-amounts">
                {[1000, 5000, 10000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="gw-quick-btn"
                    onClick={() => handleQuickAmount(amt)}
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <div className="gw-qty-price">
                <div className="gw-form-group">
                  <label className="gw-label">Quantity</label>
                  <input
                    type="number"
                    className="gw-input"
                    value={options.quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
                <div className="gw-form-group">
                  <label className="gw-label">Price per Unit</label>
                  <input
                    type="number"
                    className="gw-input"
                    value={options.pricePerUnit}
                    onChange={(e) =>
                      handleOptionsChange({ pricePerUnit: parseFloat(e.target.value) || 0 })
                    }
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="gw-mode-help">
                <i className="ti ti-info-circle" />
                <div>
                  {options.mode === "exclusive" && (
                    <>
                      <strong>GST Exclusive:</strong> Enter the base amount. GST will be added on
                      top.
                    </>
                  )}
                  {options.mode === "inclusive" && (
                    <>
                      <strong>GST Inclusive:</strong> Enter the total amount. GST will be extracted
                      from it.
                    </>
                  )}
                  {options.mode === "reverse" && (
                    <>
                      <strong>Reverse Calculation:</strong> Enter the final total. Original amount
                      and GST will be calculated.
                    </>
                  )}
                </div>
              </div>
            </div>

            {amount && calculation && (
              <div className="gw-mob-cta">
                <button
                  type="button"
                  className="gw-cta-btn"
                  onClick={() => setMobilePanel("output")}
                >
                  <i className="ti ti-report-money" />
                  View GST Breakdown
                  <i className="ti ti-chevron-right" />
                </button>
              </div>
            )}
          </div>

          <div className="gw-gutter">
            <div className="gw-gutter-line" />
            <div className="gw-gutter-node">
              <i className="ti ti-calculator" />
            </div>
            <div className="gw-gutter-line" />
          </div>

          <div className={`gw-panel ${mobilePanel === "output" ? "mob-visible" : "mob-hidden"}`}>
            <div className="gw-panel-bar">
              <div className="gw-panel-label">
                <i className="ti ti-report-money" />
                GST Breakdown
              </div>
              <div className="gw-panel-actions">
                {calculation && (
                  <>
                    <button
                      type="button"
                      className={`gw-copy-btn ${copiedKey === "calc" ? "copied" : ""}`}
                      onClick={() =>
                        handleCopy(
                          `Amount: ${formatCurrency(calculation.originalAmount)}\nGST (${options.gstRate}%): ${formatCurrency(calculation.gstAmount)}\nTotal: ${formatCurrency(calculation.finalAmount)}`,
                          "calc"
                        )
                      }
                    >
                      <i className={`ti ${copiedKey === "calc" ? "ti-check" : "ti-copy"}`} />
                      {copiedKey === "calc" ? "Copied!" : "Copy"}
                    </button>
                    <button
                      type="button"
                      className="gw-save-btn"
                      onClick={handleSaveCalculation}
                      title="Save to history"
                    >
                      <i className="ti ti-bookmark" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {!calculation && (
              <div className="gw-empty">
                <div className="gw-empty-icon">
                  <i className="ti ti-receipt-tax" />
                </div>
                <h3 className="gw-empty-title">GST Calculator</h3>
                <p className="gw-empty-desc">
                  Enter an amount on the left to calculate GST automatically. Support for exclusive,
                  inclusive, and reverse calculations.
                </p>
              </div>
            )}

            {calculation && (
              <div className="gw-result">
                <div className="gw-result-card gw-result-card--primary">
                  <div className="gw-result-label">Final Amount</div>
                  <div className="gw-result-value gw-result-value--large">
                    {formatCurrency(calculation.finalAmount)}
                  </div>
                  {calculation.roundOffAmount !== 0 && (
                    <div className="gw-result-meta">
                      Round-off: {calculation.roundOffAmount > 0 ? "+" : ""}
                      {formatCurrency(calculation.roundOffAmount)}
                    </div>
                  )}
                </div>

                <div className="gw-breakdown">
                  <div className="gw-breakdown-item">
                    <div className="gw-breakdown-label">
                      <i className="ti ti-receipt" />
                      Original Amount
                    </div>
                    <div className="gw-breakdown-value">
                      {formatCurrency(calculation.originalAmount)}
                    </div>
                  </div>

                  <div className="gw-breakdown-item gw-breakdown-item--highlight">
                    <div className="gw-breakdown-label">
                      <i className="ti ti-percentage" />
                      GST ({options.gstRate}%)
                    </div>
                    <div className="gw-breakdown-value">
                      {formatCurrency(calculation.gstAmount)}
                    </div>
                  </div>

                  {options.gstType === "intra" ? (
                    <>
                      <div className="gw-breakdown-item gw-breakdown-item--sub">
                        <div className="gw-breakdown-label">
                          <i className="ti ti-circle-half" />
                          CGST ({options.gstRate / 2}%)
                        </div>
                        <div className="gw-breakdown-value">{formatCurrency(calculation.cgst)}</div>
                      </div>
                      <div className="gw-breakdown-item gw-breakdown-item--sub">
                        <div className="gw-breakdown-label">
                          <i className="ti ti-circle-half-2" />
                          SGST ({options.gstRate / 2}%)
                        </div>
                        <div className="gw-breakdown-value">{formatCurrency(calculation.sgst)}</div>
                      </div>
                    </>
                  ) : (
                    <div className="gw-breakdown-item gw-breakdown-item--sub">
                      <div className="gw-breakdown-label">
                        <i className="ti ti-circle-filled" />
                        IGST ({options.gstRate}%)
                      </div>
                      <div className="gw-breakdown-value">{formatCurrency(calculation.igst)}</div>
                    </div>
                  )}

                  {calculation.cessAmount > 0 && (
                    <div className="gw-breakdown-item">
                      <div className="gw-breakdown-label">
                        <i className="ti ti-plus" />
                        Cess ({options.cessRate}%)
                      </div>
                      <div className="gw-breakdown-value">
                        {formatCurrency(calculation.cessAmount)}
                      </div>
                    </div>
                  )}

                  {calculation.discountAmount > 0 && (
                    <div className="gw-breakdown-item gw-breakdown-item--discount">
                      <div className="gw-breakdown-label">
                        <i className="ti ti-discount" />
                        Discount ({options.discountPercent}%)
                      </div>
                      <div className="gw-breakdown-value">
                        - {formatCurrency(calculation.discountAmount)}
                      </div>
                    </div>
                  )}

                  <div className="gw-breakdown-item gw-breakdown-item--total">
                    <div className="gw-breakdown-label">
                      <i className="ti ti-sum" />
                      Total Amount
                    </div>
                    <div className="gw-breakdown-value">
                      {formatCurrency(calculation.totalAmount)}
                    </div>
                  </div>
                </div>

                <div className="gw-info-cards">
                  <div className="gw-info-card">
                    <div className="gw-info-icon gw-info-icon--rate">
                      <i className="ti ti-tag" />
                    </div>
                    <div className="gw-info-content">
                      <div className="gw-info-label">Effective Rate</div>
                      <div className="gw-info-value">{options.gstRate}%</div>
                    </div>
                  </div>

                  <div className="gw-info-card">
                    <div className="gw-info-icon gw-info-icon--type">
                      <i className="ti ti-building-bank" />
                    </div>
                    <div className="gw-info-content">
                      <div className="gw-info-label">Tax Type</div>
                      <div className="gw-info-value">
                        {options.gstType === "intra" ? "Intra-State" : "Inter-State"}
                      </div>
                    </div>
                  </div>

                  {options.quantity > 1 && (
                    <div className="gw-info-card">
                      <div className="gw-info-icon gw-info-icon--qty">
                        <i className="ti ti-package" />
                      </div>
                      <div className="gw-info-content">
                        <div className="gw-info-label">Quantity</div>
                        <div className="gw-info-value">{options.quantity} units</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showAnalysis && calculation && amount && (
          <div className="gw-analysis-section">
            <GSTAnalysis calculation={calculation} options={options} amount={parseFloat(amount)} />
          </div>
        )}

        <div className="gw-footer">
          <div className="gw-footer-left">
            <i className="ti ti-shield-lock" />
            <span>All calculations are done in your browser. No data is sent to any server.</span>
          </div>
          {calculation && (
            <div className="gw-footer-right">
              <span>GST: {formatCurrency(calculation.gstAmount)}</span>
              <span>·</span>
              <span>Rate: {options.gstRate}%</span>
              <span>·</span>
              <span>{options.gstType === "intra" ? "CGST + SGST" : "IGST"}</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .gw-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          overflow: hidden;
        }

        .gw-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .gw-chrome-left,
        .gw-chrome-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gw-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .gw-title-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: var(--brand-light);
          color: var(--brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }

        .gw-title-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 99px;
          background: var(--bg-card);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .gw-mode-pills {
          display: flex;
          gap: 3px;
          padding: 3px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 9px;
        }

        .gw-mode-pill {
          height: 26px;
          padding: 0 10px;
          border: 0.5px solid transparent;
          border-radius: 6px;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .gw-mode-pill:hover {
          color: var(--text);
          background: var(--bg-surface);
        }

        .gw-mode-pill.active {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        .gw-mode-pill.active[data-mode="exclusive"] {
          background: var(--success, var(--brand));
        }

        .gw-mode-pill.active[data-mode="inclusive"] {
          background: var(--info, var(--brand));
        }

        .gw-mode-pill.active[data-mode="reverse"] {
          background: var(--warning, var(--brand));
        }

        .gw-settings-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 30px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .gw-settings-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .gw-settings-btn.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .gw-settings-btn i {
          font-size: 13px;
        }

        .gw-settings {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
          max-height: 400px;
          overflow-y: auto;
        }

        .gw-settings-section {
          padding: 16px;
        }

        .gw-settings-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 14px;
        }

        .gw-settings-header i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .gw-settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }

        .gw-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gw-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .gw-input,
        .gw-select {
          height: 36px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
          transition: all 0.12s;
        }

        .gw-input:focus,
        .gw-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .gw-input::placeholder {
          color: var(--text-disabled);
        }

        .gw-select {
          cursor: pointer;
        }

        .gw-rate-options {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .gw-rate-btn {
          height: 32px;
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .gw-rate-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .gw-rate-btn.active {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        .gw-rate-input {
          width: 80px;
          height: 32px;
          padding: 0 8px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text);
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          outline: none;
        }

        .gw-rate-input:focus {
          border-color: var(--brand);
        }

        .gw-radio-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .gw-radio {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.12s;
        }

        .gw-radio:hover {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }

        .gw-radio input {
          display: none;
        }

        .gw-radio-mark {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-radius: 50%;
          flex-shrink: 0;
          position: relative;
          transition: all 0.12s;
        }

        .gw-radio input:checked ~ .gw-radio-mark {
          border-color: var(--brand);
        }

        .gw-radio input:checked ~ .gw-radio-mark::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--brand);
        }

        .gw-radio-label {
          flex: 1;
        }

        .gw-radio-label strong {
          display: block;
          font-size: 13px;
          color: var(--text);
          margin-bottom: 2px;
        }

        .gw-radio-label small {
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .gw-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .gw-toggle input {
          display: none;
        }

        .gw-toggle-track {
          width: 34px;
          height: 18px;
          border-radius: 99px;
          background: var(--border);
          border: 0.5px solid var(--border);
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .gw-toggle input:checked ~ .gw-toggle-track {
          background: var(--brand);
          border-color: var(--brand);
        }

        .gw-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: white;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .gw-toggle input:checked ~ .gw-toggle-track .gw-toggle-thumb {
          transform: translateX(16px);
        }

        .gw-toggle span {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .gw-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .gw-toolbar-left,
        .gw-toolbar-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .gw-hsn-btn,
        .gw-analysis-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 26px;
          padding: 0 9px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .gw-hsn-btn:hover,
        .gw-analysis-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .gw-analysis-btn.active {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        .gw-hsn-search {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .gw-hsn-search-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
        }

        .gw-hsn-input {
          flex: 1;
          height: 36px;
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          outline: none;
        }

        .gw-hsn-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .gw-hsn-results {
          max-height: 200px;
          overflow-y: auto;
          padding: 0 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gw-hsn-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.12s;
          text-align: left;
        }

        .gw-hsn-item:hover {
          border-color: var(--brand-border);
          background: var(--brand-light);
        }

        .gw-hsn-code {
          font-size: 12px;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--text);
          min-width: 60px;
        }

        .gw-hsn-desc {
          flex: 1;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .gw-hsn-rate {
          font-size: 11px;
          font-weight: 600;
          color: var(--brand);
          padding: 2px 7px;
          border-radius: 4px;
          background: var(--brand-light);
        }

        .gw-icon-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 0.5px solid transparent;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .gw-icon-btn:hover {
          background: var(--bg-card);
          border-color: var(--border);
          color: var(--text);
        }

        .gw-mobile-switcher {
          display: none;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .gw-sw-tab {
          flex: 1;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
        }

        .gw-sw-tab.active {
          color: var(--text);
        }

        .gw-sw-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
        }

        .gw-sw-divider {
          width: 0.5px;
          background: var(--border);
          align-self: stretch;
          margin: 10px 0;
        }

        .gw-sw-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        .gw-body {
          display: grid;
          grid-template-columns: 1fr 40px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .gw-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .gw-panel-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 38px;
          padding: 0 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 8px;
          flex-shrink: 0;
        }

        .gw-panel-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .gw-panel-label i {
          font-size: 12px;
        }

        .gw-panel-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .gw-mode-indicator {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .gw-mode-indicator[data-mode="exclusive"] {
          color: var(--success, var(--brand));
        }

        .gw-mode-indicator[data-mode="inclusive"] {
          color: var(--info, var(--brand));
        }

        .gw-mode-indicator[data-mode="reverse"] {
          color: var(--warning, var(--brand));
        }

        .gw-copy-btn,
        .gw-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 26px;
          padding: 0 9px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .gw-copy-btn:hover,
        .gw-save-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .gw-copy-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .gw-copy-btn i,
        .gw-save-btn i {
          font-size: 11px;
        }

        .gw-input-section {
          flex: 1;
          padding: 20px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: var(--bg-card);
        }

        .gw-amount-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .gw-currency-symbol {
          position: absolute;
          left: 16px;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .gw-amount-input {
          width: 100%;
          height: 72px;
          padding: 0 20px 0 52px;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: var(--bg-surface);
          color: var(--text);
          font-size: 32px;
          font-weight: 700;
          font-family: var(--font-mono);
          outline: none;
          transition: all 0.15s;
        }

        .gw-amount-input:focus {
          border-color: var(--brand);
          background: var(--bg-card);
          box-shadow: 0 0 0 4px var(--brand-light);
        }

        .gw-amount-input::placeholder {
          color: var(--text-disabled);
        }

        .gw-calc-mode-indicator {
          margin-top: 8px;
          padding: 8px 12px;
          background: var(--warning-light, #fef3c7);
          border: 0.5px solid var(--warning-border, #fde68a);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--warning-text, #92400e);
        }

        .gw-calc-mode-indicator i {
          font-size: 14px;
        }

        .gw-quick-amounts {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .gw-quick-btn {
          height: 32px;
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .gw-quick-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .gw-qty-price {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .gw-mode-help {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .gw-mode-help i {
          font-size: 16px;
          color: var(--brand);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .gw-mode-help strong {
          color: var(--text);
        }

        .gw-mob-cta {
          display: none;
          padding: 12px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          flex-shrink: 0;
        }

        .gw-cta-btn {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: none;
          border-radius: 10px;
          background: var(--brand);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.12s;
        }

        .gw-cta-btn:hover {
          background: var(--brand-hover);
        }

        .gw-cta-btn i {
          font-size: 15px;
        }

        .gw-cta-btn i:last-child {
          margin-left: auto;
          opacity: 0.7;
        }

        .gw-gutter {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-surface);
          border-left: 0.5px solid var(--border);
          border-right: 0.5px solid var(--border);
        }

        .gw-gutter-line {
          flex: 1;
          width: 0.5px;
          background: var(--border);
        }

        .gw-gutter-node {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-disabled);
          font-size: 13px;
        }

        .gw-result {
          flex: 1;
          padding: 20px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--bg-card);
        }

        .gw-result-card {
          padding: 18px;
          border: 0.5px solid var(--border);
          border-radius: 12px;
          background: var(--bg-surface);
          text-align: center;
        }

        .gw-result-card--primary {
          background: linear-gradient(135deg, var(--brand-light) 0%, var(--bg-surface) 100%);
          border-color: var(--brand-border);
        }

        .gw-result-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .gw-result-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .gw-result-value--large {
          font-size: 32px;
          color: var(--brand);
        }

        .gw-result-meta {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 6px;
        }

        .gw-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border);
          border-radius: 10px;
          overflow: hidden;
        }

        .gw-breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: var(--bg-card);
        }

        .gw-breakdown-item--highlight {
          background: var(--brand-light);
        }

        .gw-breakdown-item--sub {
          padding-left: 32px;
          background: var(--bg-surface);
        }

        .gw-breakdown-item--discount .gw-breakdown-value {
          color: var(--error, #dc2626);
        }

        .gw-breakdown-item--total {
          background: var(--bg-surface);
          font-weight: 600;
        }

        .gw-breakdown-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .gw-breakdown-label i {
          font-size: 14px;
          color: var(--text-tertiary);
        }

        .gw-breakdown-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .gw-info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
        }

        .gw-info-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 0.5px solid var(--border);
          border-radius: 10px;
          background: var(--bg-surface);
        }

        .gw-info-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          background: var(--bg-card);
          color: var(--text-secondary);
        }

        .gw-info-icon--rate {
          background: var(--info-light, var(--bg-card));
          color: var(--info, var(--brand));
        }

        .gw-info-icon--type {
          background: var(--warning-light, var(--bg-card));
          color: var(--warning, var(--brand));
        }

        .gw-info-icon--qty {
          background: var(--success-light, var(--bg-card));
          color: var(--success, var(--brand));
        }

        .gw-info-content {
          flex: 1;
          min-width: 0;
        }

        .gw-info-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .gw-info-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .gw-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 60px 24px;
          text-align: center;
        }

        .gw-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: var(--text-disabled);
        }

        .gw-empty-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }

        .gw-empty-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 380px;
          line-height: 1.6;
        }

        .gw-analysis-section {
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          max-height: 600px;
          overflow: auto;
          flex-shrink: 0;
        }

        .gw-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 16px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          font-size: 11px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .gw-footer-left {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-tertiary);
        }

        .gw-footer-left i {
          font-size: 13px;
          color: var(--brand);
        }

        .gw-footer-right {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .gw-root {
            border-radius: 0;
            border-left: none;
            border-right: none;
            min-height: 100dvh;
          }

          .gw-settings-btn span {
            display: none;
          }

          .gw-settings-grid {
            grid-template-columns: 1fr;
          }

          .gw-mobile-switcher {
            display: flex;
          }

          .gw-body {
            grid-template-columns: 1fr;
            position: relative;
          }

          .gw-gutter {
            display: none;
          }

          .gw-panel {
            grid-column: 1;
            grid-row: 1;
            position: absolute;
            inset: 0;
          }

          .gw-panel.mob-visible {
            z-index: 1;
            visibility: visible;
          }

          .gw-panel.mob-hidden {
            z-index: 0;
            visibility: hidden;
            pointer-events: none;
          }

          .gw-mob-cta {
            display: block;
          }

          .gw-qty-price {
            grid-template-columns: 1fr;
          }

          .gw-info-cards {
            grid-template-columns: 1fr;
          }

          .gw-footer {
            flex-direction: column;
            text-align: center;
            gap: 6px;
          }

          .gw-footer-right {
            justify-content: center;
          }
        }

        @media (max-width: 380px) {
          .gw-amount-input {
            height: 56px;
            font-size: 24px;
            padding: 0 16px 0 42px;
          }

          .gw-currency-symbol {
            left: 12px;
            font-size: 22px;
          }

          .gw-quick-btn {
            height: 28px;
            padding: 0 8px;
            font-size: 11px;
            flex: 1;
            min-width: 0;
          }

          .gw-result-value--large {
            font-size: 24px;
            word-break: break-all;
          }

          .gw-empty {
            padding: 40px 16px;
          }

          .gw-footer {
            font-size: 10px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </>
  );
}
