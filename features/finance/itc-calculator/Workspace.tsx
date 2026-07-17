// features/finance/itc-calculator/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/data/tools";
import {
  calculateITC,
  formatCurrency,
  GST_RATES,
  BLOCKED_ITC_CATEGORIES,
  type ITCCalculation,
  type ITCOptions,
} from "./itcEngine";
import ITCAnalysis from "./ITCAnalysis";
import { useITCStore } from "./itcStore";

export default function ITCCalculatorWorkspace({ tool }: { tool: Tool }) {
  const [purchases, setPurchases] = useState<string>("");
  const [options, setOptions] = useState<ITCOptions>({
    gstRate: 18,
    blockedAmount: 0,
    reversedAmount: 0,
    utilizedAmount: 0,
    period: "monthly",
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showBlockedHelper, setShowBlockedHelper] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const { addToHistory } = useITCStore();

  const calculation = useMemo(() => {
    const amt = parseFloat(purchases);
    if (!purchases || isNaN(amt) || amt <= 0) return null;
    return calculateITC(
      amt,
      options.gstRate,
      options.blockedAmount,
      options.reversedAmount,
      options.utilizedAmount
    );
  }, [purchases, options]);

  const handleOptionsChange = useCallback((updates: Partial<ITCOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const handleSave = useCallback(() => {
    if (!calculation) return;

    addToHistory({
      title: `ITC ${options.period} — ${formatCurrency(calculation.eligibleITC)}`,
      calculation,
      options,
      purchaseAmount: parseFloat(purchases),
      timestamp: Date.now(),
      tags: [`${options.gstRate}%`, options.period],
    });
  }, [calculation, options, purchases, addToHistory]);

  return (
    <>
      <div className="itc-root">
        {/* Chrome */}
        <div className="itc-chrome">
          <div className="itc-chrome-left">
            <div className="itc-title">
              <div className="itc-title-icon">
                <i className="ti ti-receipt-refund" />
              </div>
              ITC Calculator
              <span className="itc-title-badge">{options.gstRate}%</span>
            </div>
          </div>
          <div className="itc-chrome-right">
            {/* Period selector */}
            <div className="itc-period-pills">
              {(["monthly", "quarterly", "annual"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`itc-period-pill ${options.period === p ? "active" : ""}`}
                  onClick={() => handleOptionsChange({ period: p })}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Helper Panel */}
        <div className="itc-helper">
          <div className="itc-helper-content">
            <i className="ti ti-info-circle" />
            <span>
              Input Tax Credit (ITC) allows you to reduce your GST liability by claiming the tax
              paid on business purchases.
            </span>
          </div>
          <button
            type="button"
            className={`itc-helper-btn ${showBlockedHelper ? "active" : ""}`}
            onClick={() => setShowBlockedHelper((s) => !s)}
          >
            <i className="ti ti-help-circle" />
            Blocked ITC Guide
          </button>
        </div>

        {/* Blocked ITC Helper */}
        {showBlockedHelper && (
          <div className="itc-blocked-helper">
            <div className="itc-blocked-header">
              <h4>Common Blocked ITC Categories</h4>
              <button
                type="button"
                className="itc-icon-btn"
                onClick={() => setShowBlockedHelper(false)}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="itc-blocked-grid">
              {BLOCKED_ITC_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="itc-blocked-item">
                  <div className="itc-blocked-icon">
                    <i className={`ti ${cat.icon}`} />
                  </div>
                  <div className="itc-blocked-content">
                    <div className="itc-blocked-title">{cat.title}</div>
                    <div className="itc-blocked-desc">{cat.description}</div>
                    {cat.examples && (
                      <div className="itc-blocked-examples">
                        Examples: {cat.examples.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="itc-content">
          {/* Input Section */}
          <div className="itc-input-section">
            <div className="itc-section-header">
              <i className="ti ti-edit" />
              <span>Enter Purchase Details</span>
            </div>

            <div className="itc-form">
              {/* Purchase Amount */}
              <div className="itc-form-group itc-form-group--primary">
                <label className="itc-label">Total Purchases (₹)</label>
                <div className="itc-amount-input-wrap">
                  <div className="itc-currency-symbol">₹</div>
                  <input
                    type="number"
                    className="itc-amount-input"
                    value={purchases}
                    onChange={(e) => setPurchases(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="itc-helper-text">Enter total purchase amount including GST</div>
              </div>

              {/* Quick amounts */}
              <div className="itc-quick-amounts">
                {[50000, 100000, 500000, 1000000, 5000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="itc-quick-btn"
                    onClick={() => setPurchases(amt.toString())}
                  >
                    ₹{(amt / 100000).toFixed(amt >= 100000 ? 1 : 0)}L
                  </button>
                ))}
              </div>

              <div className="itc-form-row">
                {/* GST Rate */}
                <div className="itc-form-group">
                  <label className="itc-label">GST Rate (%)</label>
                  <select
                    className="itc-select"
                    value={options.gstRate}
                    onChange={(e) => handleOptionsChange({ gstRate: parseFloat(e.target.value) })}
                  >
                    {GST_RATES.map((rate) => (
                      <option key={rate.rate} value={rate.rate}>
                        {rate.rate}% - {rate.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Blocked ITC */}
                <div className="itc-form-group">
                  <label className="itc-label">
                    Blocked ITC (₹)
                    <button
                      type="button"
                      className="itc-label-help"
                      onClick={() => setShowBlockedHelper(true)}
                      title="What is blocked ITC?"
                    >
                      <i className="ti ti-help-circle" />
                    </button>
                  </label>
                  <input
                    type="number"
                    className="itc-input"
                    value={options.blockedAmount}
                    onChange={(e) =>
                      handleOptionsChange({ blockedAmount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Motor vehicles, food, etc."
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="itc-form-row">
                {/* Reversed ITC */}
                <div className="itc-form-group">
                  <label className="itc-label">Reversed ITC (₹)</label>
                  <input
                    type="number"
                    className="itc-input"
                    value={options.reversedAmount}
                    onChange={(e) =>
                      handleOptionsChange({ reversedAmount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Rule 42/43 reversals"
                    min="0"
                    step="0.01"
                  />
                  <div className="itc-helper-text">ITC to be reversed as per GST rules</div>
                </div>

                {/* Utilized ITC */}
                <div className="itc-form-group">
                  <label className="itc-label">ITC Utilized (₹)</label>
                  <input
                    type="number"
                    className="itc-input"
                    value={options.utilizedAmount}
                    onChange={(e) =>
                      handleOptionsChange({ utilizedAmount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Already used ITC"
                    min="0"
                    step="0.01"
                  />
                  <div className="itc-helper-text">ITC already used to pay GST liability</div>
                </div>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="itc-result-section">
            <div className="itc-section-header">
              <i className="ti ti-report-money" />
              <span>ITC Summary</span>
              {calculation && (
                <div className="itc-section-actions">
                  <button
                    type="button"
                    className={`itc-copy-btn ${copiedKey === "itc" ? "copied" : ""}`}
                    onClick={() =>
                      calculation &&
                      handleCopy(
                        `Total ITC: ${formatCurrency(calculation.totalITC)}\nEligible ITC: ${formatCurrency(calculation.eligibleITC)}\nITC Balance: ${formatCurrency(calculation.itcBalance)}`,
                        "itc"
                      )
                    }
                  >
                    <i className={`ti ${copiedKey === "itc" ? "ti-check" : "ti-copy"}`} />
                    {copiedKey === "itc" ? "Copied!" : "Copy"}
                  </button>
                  <button
                    type="button"
                    className="itc-save-btn"
                    onClick={handleSave}
                    title="Save to history"
                  >
                    <i className="ti ti-bookmark" />
                  </button>
                  <button
                    type="button"
                    className={`itc-analysis-btn ${showAnalysis ? "active" : ""}`}
                    onClick={() => setShowAnalysis((s) => !s)}
                  >
                    <i className="ti ti-chart-line" />
                    {showAnalysis ? "Hide" : "Show"} Analysis
                  </button>
                </div>
              )}
            </div>

            {!calculation && (
              <div className="itc-empty">
                <div className="itc-empty-icon">
                  <i className="ti ti-receipt-refund" />
                </div>
                <h3 className="itc-empty-title">Input Tax Credit Calculator</h3>
                <p className="itc-empty-desc">
                  Enter your purchase details above to calculate eligible ITC and track your tax
                  credits
                </p>
              </div>
            )}

            {calculation && (
              <div className="itc-result">
                {/* Summary Cards */}
                <div className="itc-cards">
                  <div className="itc-card itc-card--primary">
                    <div className="itc-card-icon">
                      <i className="ti ti-circle-check" />
                    </div>
                    <div className="itc-card-content">
                      <div className="itc-card-label">Eligible ITC</div>
                      <div className="itc-card-value">
                        {formatCurrency(calculation.eligibleITC)}
                      </div>
                      <div className="itc-card-meta">You can claim this amount</div>
                    </div>
                  </div>

                  <div className="itc-card itc-card--balance">
                    <div className="itc-card-icon">
                      <i className="ti ti-wallet" />
                    </div>
                    <div className="itc-card-content">
                      <div className="itc-card-label">ITC Balance</div>
                      <div className="itc-card-value">{formatCurrency(calculation.itcBalance)}</div>
                      <div className="itc-card-meta">Available to use</div>
                    </div>
                  </div>

                  <div className="itc-card">
                    <div className="itc-card-icon">
                      <i className="ti ti-sum" />
                    </div>
                    <div className="itc-card-content">
                      <div className="itc-card-label">Total ITC</div>
                      <div className="itc-card-value">{formatCurrency(calculation.totalITC)}</div>
                      <div className="itc-card-meta">Before restrictions</div>
                    </div>
                  </div>

                  <div className="itc-card">
                    <div className="itc-card-icon">
                      <i className="ti ti-circle-x" />
                    </div>
                    <div className="itc-card-content">
                      <div className="itc-card-label">Blocked ITC</div>
                      <div className="itc-card-value">{formatCurrency(calculation.blockedITC)}</div>
                      <div className="itc-card-meta">Cannot be claimed</div>
                    </div>
                  </div>

                  <div className="itc-card">
                    <div className="itc-card-icon">
                      <i className="ti ti-arrow-back-up" />
                    </div>
                    <div className="itc-card-content">
                      <div className="itc-card-label">Reversed ITC</div>
                      <div className="itc-card-value">
                        {formatCurrency(calculation.reversedITC)}
                      </div>
                      <div className="itc-card-meta">Must be reversed</div>
                    </div>
                  </div>

                  <div className="itc-card">
                    <div className="itc-card-icon">
                      <i className="ti ti-checkup-list" />
                    </div>
                    <div className="itc-card-content">
                      <div className="itc-card-label">ITC Utilized</div>
                      <div className="itc-card-value">
                        {formatCurrency(calculation.itcUtilized)}
                      </div>
                      <div className="itc-card-meta">Already used</div>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="itc-breakdown">
                  <div className="itc-breakdown-header">
                    <i className="ti ti-chart-pie" />
                    <span>ITC Breakdown</span>
                  </div>
                  <div className="itc-breakdown-items">
                    <div className="itc-breakdown-item">
                      <div className="itc-breakdown-label">
                        <i className="ti ti-shopping-cart" />
                        Purchase Amount (incl. GST)
                      </div>
                      <div className="itc-breakdown-value">
                        {formatCurrency(parseFloat(purchases))}
                      </div>
                    </div>

                    <div className="itc-breakdown-item itc-breakdown-item--highlight">
                      <div className="itc-breakdown-label">
                        <i className="ti ti-percentage" />
                        GST Component ({options.gstRate}%)
                      </div>
                      <div className="itc-breakdown-value">
                        {formatCurrency(calculation.totalITC)}
                      </div>
                    </div>

                    {calculation.blockedITC > 0 && (
                      <div className="itc-breakdown-item itc-breakdown-item--negative">
                        <div className="itc-breakdown-label">
                          <i className="ti ti-ban" />
                          Less: Blocked ITC
                        </div>
                        <div className="itc-breakdown-value">
                          - {formatCurrency(calculation.blockedITC)}
                        </div>
                      </div>
                    )}

                    {calculation.reversedITC > 0 && (
                      <div className="itc-breakdown-item itc-breakdown-item--negative">
                        <div className="itc-breakdown-label">
                          <i className="ti ti-rotate-clockwise" />
                          Less: Reversed ITC
                        </div>
                        <div className="itc-breakdown-value">
                          - {formatCurrency(calculation.reversedITC)}
                        </div>
                      </div>
                    )}

                    <div className="itc-breakdown-item itc-breakdown-item--total">
                      <div className="itc-breakdown-label">
                        <i className="ti ti-check" />
                        Eligible ITC
                      </div>
                      <div className="itc-breakdown-value">
                        {formatCurrency(calculation.eligibleITC)}
                      </div>
                    </div>

                    {calculation.itcUtilized > 0 && (
                      <div className="itc-breakdown-item">
                        <div className="itc-breakdown-label">
                          <i className="ti ti-minus" />
                          Less: ITC Utilized
                        </div>
                        <div className="itc-breakdown-value">
                          - {formatCurrency(calculation.itcUtilized)}
                        </div>
                      </div>
                    )}

                    <div className="itc-breakdown-item itc-breakdown-item--balance">
                      <div className="itc-breakdown-label">
                        <i className="ti ti-wallet" />
                        ITC Balance
                      </div>
                      <div className="itc-breakdown-value">
                        {formatCurrency(calculation.itcBalance)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="itc-insights">
                  <div className="itc-insight itc-insight--info">
                    <div className="itc-insight-icon">
                      <i className="ti ti-info-circle" />
                    </div>
                    <div className="itc-insight-content">
                      <div className="itc-insight-title">ITC Utilization Rate</div>
                      <div className="itc-insight-text">
                        {calculation.eligibleITC > 0
                          ? `You've utilized ${((calculation.itcUtilized / calculation.eligibleITC) * 100).toFixed(1)}% of your eligible ITC.`
                          : "Enter utilized amount to track your ITC usage."}
                      </div>
                    </div>
                  </div>

                  {calculation.blockedITC > 0 && (
                    <div className="itc-insight itc-insight--warning">
                      <div className="itc-insight-icon">
                        <i className="ti ti-alert-triangle" />
                      </div>
                      <div className="itc-insight-content">
                        <div className="itc-insight-title">Blocked ITC Impact</div>
                        <div className="itc-insight-text">
                          ₹{formatCurrency(calculation.blockedITC)} cannot be claimed. This
                          represents{" "}
                          {((calculation.blockedITC / calculation.totalITC) * 100).toFixed(1)}% of
                          total GST paid.
                        </div>
                      </div>
                    </div>
                  )}

                  {calculation.itcBalance > 0 && (
                    <div className="itc-insight itc-insight--success">
                      <div className="itc-insight-icon">
                        <i className="ti ti-coin" />
                      </div>
                      <div className="itc-insight-content">
                        <div className="itc-insight-title">Available Credit</div>
                        <div className="itc-insight-text">
                          You have ₹{formatCurrency(calculation.itcBalance)} available to offset
                          your next GST payment. Use it within the prescribed time limit.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Section */}
        {showAnalysis && calculation && purchases && (
          <div className="itc-analysis-section">
            <ITCAnalysis
              calculation={calculation}
              options={options}
              purchaseAmount={parseFloat(purchases)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="itc-footer">
          <div className="itc-footer-left">
            <i className="ti ti-shield-lock" />
            <span>All calculations are done locally. Your data is never sent to any server.</span>
          </div>
          {calculation && (
            <div className="itc-footer-right">
              <span>Period: {options.period}</span>
              <span>·</span>
              <span>GST Rate: {options.gstRate}%</span>
              <span>·</span>
              <span>Balance: {formatCurrency(calculation.itcBalance)}</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .itc-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          overflow: hidden;
        }

        /* Chrome */
        .itc-chrome {
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

        .itc-chrome-left,
        .itc-chrome-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .itc-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .itc-title-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: #3b82f620;
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }

        .itc-title-badge {
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

        /* Period Pills */
        .itc-period-pills {
          display: flex;
          gap: 3px;
          padding: 3px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 9px;
        }

        .itc-period-pill {
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

        .itc-period-pill:hover {
          color: var(--text);
          background: var(--bg-surface);
        }

        .itc-period-pill.active {
          background: #3b82f620;
          color: #3b82f6;
          border-color: #3b82f640;
        }

        /* Helper */
        .itc-helper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 16px;
          background: #eff6ff;
          border-bottom: 0.5px solid #bfdbfe;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        @media (prefers-color-scheme: dark) {
          .itc-helper {
            background: #0a1628;
            border-color: #1e3a5f;
          }
        }

        .itc-helper-content {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
          flex: 1;
        }

        .itc-helper-content i {
          font-size: 16px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .itc-helper-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: 7px;
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .itc-helper-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .itc-helper-btn.active {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        /* Blocked Helper */
        .itc-blocked-helper {
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          padding: 16px;
          flex-shrink: 0;
          max-height: 400px;
          overflow-y: auto;
        }

        .itc-blocked-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .itc-blocked-header h4 {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }

        .itc-icon-btn {
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

        .itc-icon-btn:hover {
          background: var(--bg-card);
          border-color: var(--border);
          color: var(--text);
        }

        .itc-blocked-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 10px;
        }

        .itc-blocked-item {
          display: flex;
          gap: 10px;
          padding: 12px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 8px;
        }

        .itc-blocked-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #fef2f2;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        @media (prefers-color-scheme: dark) {
          .itc-blocked-icon {
            background: #1f1517;
            color: #f87171;
          }
        }

        .itc-blocked-content {
          flex: 1;
        }

        .itc-blocked-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .itc-blocked-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 6px;
        }

        .itc-blocked-examples {
          font-size: 11px;
          color: var(--text-tertiary);
          font-style: italic;
        }

        /* Content */
        .itc-content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 0;
          overflow: hidden;
        }

        /* Section */
        .itc-input-section,
        .itc-result-section {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .itc-input-section {
          border-right: 0.5px solid var(--border);
        }

        .itc-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          height: 38px;
          padding: 0 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          flex-shrink: 0;
        }

        .itc-section-header i {
          font-size: 12px;
        }

        .itc-section-header span {
          flex: 1;
        }

        .itc-section-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .itc-copy-btn,
        .itc-save-btn,
        .itc-analysis-btn {
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
          white-space: nowrap;
        }

        .itc-copy-btn:hover,
        .itc-save-btn:hover,
        .itc-analysis-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .itc-copy-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .itc-analysis-btn.active {
          background: var(--brand);
          color: white;
          border-color: var(--brand);
        }

        /* Form */
        .itc-form {
          flex: 1;
          padding: 20px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: var(--bg-card);
        }

        .itc-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .itc-form-group--primary {
          margin-bottom: 4px;
        }

        .itc-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .itc-label-help {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--text-disabled);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .itc-label-help:hover {
          color: var(--brand);
        }

        .itc-input,
        .itc-select {
          height: 36px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          background: var(--bg-surface);
          color: var(--text);
          font-size: 13px;
          outline: none;
          transition: all 0.12s;
        }

        .itc-input:focus,
        .itc-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .itc-select {
          cursor: pointer;
        }

        .itc-amount-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .itc-currency-symbol {
          position: absolute;
          left: 16px;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .itc-amount-input {
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

        .itc-amount-input:focus {
          border-color: var(--brand);
          background: var(--bg-card);
          box-shadow: 0 0 0 4px var(--brand-light);
        }

        .itc-helper-text {
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .itc-quick-amounts {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .itc-quick-btn {
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

        .itc-quick-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .itc-form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        /* Result */
        .itc-result {
          flex: 1;
          padding: 20px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--bg-card);
        }

        .itc-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .itc-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 12px;
        }

        .itc-card--primary {
          background: linear-gradient(135deg, #3b82f620 0%, var(--bg-surface) 100%);
          border-color: #3b82f640;
        }

        .itc-card--balance {
          background: linear-gradient(135deg, #fef3c7 0%, var(--bg-surface) 100%);
          border-color: #fde68a;
        }

        .itc-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .itc-card--primary .itc-card-icon {
          background: white;
        }

        .itc-card-content {
          flex: 1;
          min-width: 0;
        }

        .itc-card-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .itc-card-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          font-family: var(--font-mono);
          margin-bottom: 2px;
        }

        .itc-card-meta {
          font-size: 10px;
          color: var(--text-tertiary);
        }

        /* Breakdown */
        .itc-breakdown {
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .itc-breakdown-header {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .itc-breakdown-header i {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .itc-breakdown-items {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border);
        }

        .itc-breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--bg-card);
        }

        .itc-breakdown-item--highlight {
          background: #3b82f615;
        }

        .itc-breakdown-item--negative {
          background: #fef2f2;
        }

        @media (prefers-color-scheme: dark) {
          .itc-breakdown-item--negative {
            background: #1f1517;
          }
        }

        .itc-breakdown-item--total {
          background: var(--brand-light);
          font-weight: 600;
        }

        .itc-breakdown-item--balance {
          background: #fef3c7;
          font-weight: 700;
        }

        @media (prefers-color-scheme: dark) {
          .itc-breakdown-item--balance {
            background: #451a03;
          }
        }

        .itc-breakdown-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .itc-breakdown-label i {
          font-size: 14px;
          color: var(--text-tertiary);
        }

        .itc-breakdown-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        /* Insights */
        .itc-insights {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .itc-insight {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border-radius: 8px;
          border: 0.5px solid;
        }

        .itc-insight--info {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .itc-insight--warning {
          background: #fef3c7;
          border-color: #fde68a;
        }

        .itc-insight--success {
          background: #dcfce7;
          border-color: #bbf7d0;
        }

        @media (prefers-color-scheme: dark) {
          .itc-insight--info {
            background: #0a1628;
            border-color: #1e3a5f;
          }
          .itc-insight--warning {
            background: #451a03;
            border-color: #78350f;
          }
          .itc-insight--success {
            background: #022c22;
            border-color: #064e3b;
          }
        }

        .itc-insight-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .itc-insight--info .itc-insight-icon {
          background: #dbeafe;
          color: #1e40af;
        }

        .itc-insight--warning .itc-insight-icon {
          background: #fde68a;
          color: #92400e;
        }

        .itc-insight--success .itc-insight-icon {
          background: #bbf7d0;
          color: #166534;
        }

        @media (prefers-color-scheme: dark) {
          .itc-insight--info .itc-insight-icon {
            background: #1e3a5f;
            color: #93c5fd;
          }
          .itc-insight--warning .itc-insight-icon {
            background: #78350f;
            color: #fbbf24;
          }
          .itc-insight--success .itc-insight-icon {
            background: #064e3b;
            color: #4ade80;
          }
        }

        .itc-insight-content {
          flex: 1;
        }

        .itc-insight-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .itc-insight-text {
          font-size: 12px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        /* Empty State */
        .itc-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 60px 24px;
          text-align: center;
        }

        .itc-empty-icon {
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

        .itc-empty-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }

        .itc-empty-desc {
          font-size: 13px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 380px;
          line-height: 1.6;
        }

        /* Analysis Section */
        .itc-analysis-section {
          border-top: 0.5px solid var(--border);
          background: var(--bg-surface);
          max-height: 600px;
          overflow: auto;
          flex-shrink: 0;
        }

        /* Footer */
        .itc-footer {
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

        .itc-footer-left {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-tertiary);
        }

        .itc-footer-left i {
          font-size: 13px;
          color: #3b82f6;
        }

        .itc-footer-right {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          flex-wrap: wrap;
        }

        /* Mobile Responsive */
        @media (max-width: 968px) {
          .itc-root {
            border-radius: 0;
            border-left: none;
            border-right: none;
            min-height: 100dvh;
          }

          .itc-content {
            grid-template-columns: 1fr;
          }

          .itc-input-section {
            border-right: none;
            border-bottom: 0.5px solid var(--border);
          }

          .itc-cards {
            grid-template-columns: 1fr;
          }

          .itc-blocked-grid {
            grid-template-columns: 1fr;
          }

          .itc-footer {
            flex-direction: column;
            text-align: center;
            gap: 6px;
          }

          .itc-footer-right {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
