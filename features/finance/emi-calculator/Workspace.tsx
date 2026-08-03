// features/finance/emi-calculator/Workspace.tsx

"use client";

import { logger } from "@/lib/logger";
import { formatCurrency } from "@/lib/utils";
import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import {
  calculateEMI,
  calculateWithPrepayment,
  type EMIInput,
  type EMICalculationResult,
} from "./emiEngine";
import { useEMIStore } from "./emiStore";
import { SAMPLE_LOANS, SAMPLE_LOAN_LABELS, type SampleLoanType } from "./sampleData";
import { SettingsPanel } from "./SettingsPanel";
import { LoanInputForm } from "./LoanInputForm";
import { ResultSummary } from "./ResultSummary";
import { ResultDetails } from "./ResultDetails";
import { downloadEMIReportPDF, type EMIReportData } from "./emiPdfGenerator";

type ViewTab = "summary" | "details";

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export default function EMICalculatorWorkspace({ tool }: { tool: Tool }) {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureValue, setTenureValue] = useState("");
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [loanStartDate, setLoanStartDate] = useState(getTodayString());
  const [loanType, setLoanType] = useState("");

  const [prepaymentType, setPrepaymentType] = useState<'none' | 'one-time' | 'recurring'>('none');
  const [prepaymentAmount, setPrepaymentAmount] = useState("");
  const [prepaymentMonth, setPrepaymentMonth] = useState("");

  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [viewTab, setViewTab] = useState<ViewTab>("summary");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { saveToHistory } = useEMIStore();

  const parsed = useMemo(() => {
    return {
      loanAmount: loanAmount === "" ? 0 : parseFloat(loanAmount),
      interestRate: interestRate === "" ? 0 : parseFloat(interestRate),
      tenureValue: tenureValue === "" ? 0 : parseInt(tenureValue, 10),
      tenureUnit,
      loanStartDate,
      loanType,
      prepaymentType,
      prepaymentAmount: prepaymentAmount === "" ? 0 : parseFloat(prepaymentAmount),
      prepaymentMonth: prepaymentMonth === "" ? 0 : parseInt(prepaymentMonth, 10),
    };
  }, [
    loanAmount,
    interestRate,
    tenureValue,
    tenureUnit,
    loanStartDate,
    loanType,
    prepaymentType,
    prepaymentAmount,
    prepaymentMonth,
  ]);

  const usageSplitValid = useMemo(() => {
    // For EMI calculator, we're repurposing these fields for validation
    // In reality, we don't need usage split validation for EMI
    return true; // Always valid for EMI calculator
  }, []);

  const isValidForm = useMemo(() => {
    return (
      loanAmount.trim() !== "" &&
      interestRate !== "" &&
      parseFloat(interestRate) >= 0 &&
      parseFloat(interestRate) <= 50 &&
      tenureValue.trim() !== "" &&
      parseInt(tenureValue, 10) > 0 &&
      loanStartDate !== "" &&
      loanType !== "" &&
      ((prepaymentType === 'none') ||
        (prepaymentType === 'one-time' && prepaymentAmount !== "" && parseFloat(prepaymentAmount) > 0) ||
        (prepaymentType === 'recurring' && prepaymentAmount !== "" && parseFloat(prepaymentAmount) > 0)) &&
      ((prepaymentType === 'one-time') ?
        (prepaymentMonth !== "" && parseInt(prepaymentMonth, 10) >= 1) :
        (prepaymentType === 'recurring' ? (prepaymentMonth !== "" && parseInt(prepaymentMonth, 10) >= 1) : true))
    );
  }, [
    loanAmount,
    interestRate,
    tenureValue,
    loanStartDate,
    loanType,
    prepaymentType,
    prepaymentAmount,
    prepaymentMonth,
  ]);

  const calculation = useMemo((): EMICalculationResult | null => {
    if (!isValidForm) return null;

    // Check if prepayment is specified
    const hasPrepayment = prepaymentType !== 'none' &&
                         parseFloat(prepaymentAmount) > 0;

    const baseInput: EMIInput = {
      loanAmount: parsed.loanAmount,
      interestRate: parsed.interestRate,
      tenureValue: parsed.tenureValue,
      tenureUnit: parsed.tenureUnit,
      loanStartDate: parsed.loanStartDate,
      loanType: parsed.loanType,
      prepaymentType: 'none', // Base calculation without prepayment
    };

    if (hasPrepayment) {
      const prepaymentInput: EMIInput = {
        ...baseInput,
        prepaymentType: parsed.prepaymentType,
      };

      const prepayment = {
        type: parsed.prepaymentType as 'one-time' | 'recurring',
        amount: parsed.prepaymentAmount,
        month: parsed.prepaymentMonth,
      };

      try {
        return calculateWithPrepayment(prepaymentInput, prepayment);
      } catch (error) {
        logger.error("Error calculating with prepayment:", error);
        return null;
      }
    } else {
      try {
        return calculateEMI(baseInput);
      } catch (error) {
        logger.error("Error calculating EMI:", error);
        return null;
      }
    }
  }, [
    isValidForm,
    parsed.loanAmount,
    parsed.interestRate,
    parsed.tenureValue,
    parsed.tenureUnit,
    parsed.loanStartDate,
    parsed.loanType,
    parsed.prepaymentType,
    parsed.prepaymentAmount,
    parsed.prepaymentMonth,
  ]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch (error) {
      logger.error("Failed to copy:", error);
    }
  }, []);

  const handleSaveCalculation = useCallback(() => {
    if (!calculation) return;

    try {
      saveToHistory({
        title: `${loanType} Loan - ₹${formatCurrency(parsed.loanAmount)}`,
        input: {
          loanAmount: parsed.loanAmount,
          interestRate: parsed.interestRate,
          tenureValue: parsed.tenureValue,
          tenureUnit: parsed.tenureUnit,
          loanStartDate: parsed.loanStartDate,
          loanType: parsed.loanType,
          prepaymentType: parsed.prepaymentType,
          prepaymentAmount: parsed.prepaymentAmount,
          prepaymentMonth: parsed.prepaymentMonth,
        },
        calculation,
        isFavorite: false,
        tags: [loanType, prepaymentType],
      });
    } catch (error) {
      logger.error("Failed to save:", error);
    }
  }, [
    calculation,
    loanAmount,
    interestRate,
    tenureValue,
    tenureUnit,
    loanStartDate,
    loanType,
    prepaymentType,
    prepaymentAmount,
    prepaymentMonth,
    saveToHistory,
  ]);

  const handleDownloadPDF = useCallback(async () => {
    if (!calculation) return;

    setIsGeneratingPDF(true);
    try {
      const reportData: EMIReportData = {
        loanAmount: parsed.loanAmount,
        interestRate: parsed.interestRate,
        tenureValue: parsed.tenureValue,
        tenureUnit: parsed.tenureUnit,
        loanStartDate: parsed.loanStartDate,
        loanType: parsed.loanType,
        prepaymentType: parsed.prepaymentType,
        prepaymentAmount: parsed.prepaymentAmount > 0 ? parsed.prepaymentAmount : undefined,
        prepaymentMonth: parsed.prepaymentMonth > 0 ? parsed.prepaymentMonth : undefined,
        calculation,
      };

      await downloadEMIReportPDF(reportData);
    } catch (error) {
      logger.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [
    calculation,
    parsed.loanAmount,
    parsed.interestRate,
    parsed.tenureValue,
    parsed.tenureUnit,
    parsed.loanStartDate,
    parsed.loanType,
    parsed.prepaymentType,
    parsed.prepaymentAmount,
    parsed.prepaymentMonth,
  ]);

  const handleReset = useCallback(() => {
    setLoanAmount("");
    setInterestRate("");
    setTenureValue("");
    setTenureUnit('years');
    setLoanStartDate(getTodayString());
    setLoanType("");
    setPrepaymentType('none');
    setPrepaymentAmount("");
    setPrepaymentMonth("");
  }, []);

  const loadSample = useCallback((type: SampleLoanType) => {
    const sample = SAMPLE_LOANS[type];
    setLoanAmount(sample.loanAmount.toString());
    setInterestRate(sample.interestRate.toString());
    setTenureValue(sample.tenureValue.toString());
    setTenureUnit(sample.tenureUnit as 'years' | 'months');
    setLoanStartDate(sample.loanStartDate);
    setLoanType(sample.loanType);
    setPrepaymentType(sample.prepaymentType as 'none' | 'one-time' | 'recurring');
    setPrepaymentAmount(sample.prepaymentAmount?.toString() || "");
    setPrepaymentMonth(sample.prepaymentMonth?.toString() || "");
    setShowSampleMenu(false);
    setMobilePanel("input");
  }, []);

  const handleViewResults = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setMobilePanel("output");
    } else {
      const outputPanel = document.querySelector('.emi-panel-output');
      if (outputPanel) {
        outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return (
    <>
      <div className="emi-workspace" role="main" aria-label="EMI Calculator">
        <div className="emi-chrome">
          <div className="emi-chrome-left">
            <button
              type="button"
              className={`emi-btn emi-btn-icon${showSettings ? " active" : ""}`}
              onClick={() => setShowSettings((s) => !s)}
              aria-label="Toggle settings"
              aria-expanded={showSettings}
            >
              <i className="ti ti-adjustments" aria-hidden="true" />
              <span>Settings</span>
            </button>

            <div className="emi-sample-dropdown">
              <button
                type="button"
                className="emi-btn emi-btn-icon"
                onClick={() => setShowSampleMenu((s) => !s)}
                aria-label="Load sample data"
                aria-haspopup="menu"
                aria-expanded={showSampleMenu}
              >
                <i className="ti ti-wand" aria-hidden="true" />
                <span>Examples</span>
              </button>

              {showSampleMenu && (
                <div className="emi-sample-menu" role="menu">
                  <div className="emi-sample-menu-header">
                    <span>Load Sample Loan</span>
                  </div>
                  {(Object.keys(SAMPLE_LOANS) as SampleLoanType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="menuitem"
                      className="emi-sample-menu-item"
                      onClick={() => loadSample(type)}
                    >
                      <i className={`ti ${SAMPLE_LOAN_LABELS[type].icon}`} aria-hidden="true" />
                      <div className="emi-sample-item-content">
                        <strong>{SAMPLE_LOAN_LABELS[type].label}</strong>
                        <span>{SAMPLE_LOAN_LABELS[type].desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="emi-chrome-right">
            <button
              type="button"
              className="emi-btn emi-btn-ghost"
              onClick={handleReset}
              disabled={!loanAmount && !interestRate && !tenureValue && !loanStartDate}
              aria-label="Reset form"
            >
              <i className="ti ti-refresh" aria-hidden="true" />
              <span>Reset</span>
            </button>

            {calculation && (
              <button
                type="button"
                className="emi-btn emi-btn-primary"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                aria-label="Download PDF report"
                aria-busy={isGeneratingPDF}
              >
                <i
                  className={`ti ${isGeneratingPDF ? "ti-loader-2 emi-spin" : "ti-file-download"}`}
                  aria-hidden="true"
                />
                <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
              </button>
            )}

            {calculation && (
              <button
                type="button"
                className="emi-btn emi-btn-primary"
                onClick={handleSaveCalculation}
                aria-label="Save calculation"
              >
                <i className="ti ti-device-floppy" aria-hidden="true" />
                <span>Save</span>
              </button>
            )}
          </div>
        </div>

        {showSettings && (
          <SettingsPanel
            usageTaxable="100" // Placeholder values - not used in EMI calculator
            usageExempt="0"
            usageNonBusiness="0"
            blockedCategory={undefined}
            onUsageChange={(_, __) => {}} // Placeholder
            onBlockedCategoryChange={() => {}} // Placeholder
          />
        )}

        <div className="emi-mobile-tabs" role="tablist" aria-label="Panel selector">
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === "input"}
            className={`emi-mobile-tab${mobilePanel === "input" ? " active" : ""}`}
            onClick={() => setMobilePanel("input")}
          >
            Input
            {!isValidForm && loanAmount && (
              <span className="emi-mobile-badge error">
                <i className="ti ti-alert-circle" aria-hidden="true" />
              </span>
            )}
            {isValidForm && (
              <span className="emi-mobile-badge valid">
                <i className="ti ti-check" aria-hidden="true" />
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === "output"}
            className={`emi-mobile-tab${mobilePanel === "output" ? " active" : ""}`}
            onClick={() => setMobilePanel("output")}
          >
            Result
            {calculation && <span className="emi-mobile-dot" />}
          </button>
        </div>

        <div className="emi-body">
          <div
            className={`emi-panel emi-panel-input${mobilePanel === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="emi-panel-header">
              <div className="emi-panel-title">
                <i className="ti ti-pencil" aria-hidden="true" />
                Loan Details
              </div>
              {isValidForm && (
                <span className="emi-status-pill valid">
                  <i className="ti ti-check" aria-hidden="true" />
                  Valid
                </span>
              )}
            </div>

            <div className="emi-panel-content">
              <LoanInputForm
                loanAmount={loanAmount}
                interestRate={interestRate}
                tenureValue={tenureValue}
                tenureUnit={tenureUnit}
                loanStartDate={loanStartDate}
                loanType={loanType}
                prepaymentType={prepaymentType}
                prepaymentAmount={prepaymentAmount}
                prepaymentMonth={prepaymentMonth}
                onLoanAmountChange={setLoanAmount}
                onInterestRateChange={setInterestRate}
                onTenureValueChange={setTenureValue}
                onTenureUnitChange={setTenureUnit}
                onLoanStartDateChange={setLoanStartDate}
                onLoanTypeChange={setLoanType}
                onPrepaymentTypeChange={setPrepaymentType}
                onPrepaymentAmountChange={setPrepaymentAmount}
                onPrepaymentMonthChange={setPrepaymentMonth}
                isValidForm={isValidForm}
                hasCalculation={!!calculation}
                onViewResults={handleViewResults}
              />
            </div>
          </div>

          <div className="emi-divider" aria-hidden="true" />

          <div
            className={`emi-panel emi-panel-output${mobilePanel === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="emi-panel-header">
              <div className="emi-panel-title">
                <i className="ti ti-report-money" aria-hidden="true" />
                Calculation Result
              </div>

              {calculation && (
                <div className="emi-view-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    className={`emi-view-tab${viewTab === "summary" ? " active" : ""}`}
                    onClick={() => setViewTab("summary")}
                    aria-selected={viewTab === "summary"}
                  >
                    <i className="ti ti-sum" aria-hidden="true" />
                    Summary
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`emi-view-tab${viewTab === "details" ? " active" : ""}`}
                    onClick={() => setViewTab("details")}
                    aria-selected={viewTab === "details"}
                  >
                    <i className="ti ti-list-details" aria-hidden="true" />
                    Details
                  </button>
                </div>
              )}
            </div>

            <div className="emi-panel-content">
              {!calculation && (
                <div className="emi-empty">
                  <div className="emi-empty-icon">
                    <i className="ti ti-credit-card" aria-hidden="true" />
                  </div>
                  <h3 className="emi-empty-title">No Calculation Yet</h3>
                  <p className="emi-empty-text">
                    Fill in the loan details to calculate your EMI
                  </p>
                  <p className="emi-empty-hint">
                    Try loading an example from the "Examples" button above
                  </p>
                </div>
              )}

              {calculation && viewTab === "summary" && (
                <ResultSummary
                  calculation={calculation}
                  loanAmount={parsed.loanAmount}
                  interestRate={parsed.interestRate}
                  tenureValue={parsed.tenureValue}
                  tenureUnit={parsed.tenureUnit}
                  loanType={parsed.loanType}
                  prepaymentType={parsed.prepaymentType}
                  onCopy={handleCopy}
                  copiedKey={copiedKey}
                  onDownloadPDF={handleDownloadPDF}
                  isGeneratingPDF={isGeneratingPDF}
                />
              )}

              {calculation && viewTab === "details" && (
                <ResultDetails
                  calculation={calculation}
                  loanAmount={parsed.loanAmount}
                  interestRate={parsed.interestRate}
                  tenureValue={parsed.tenureValue}
                  tenureUnit={parsed.tenureUnit}
                  loanStartDate={parsed.loanStartDate}
                  loanType={parsed.loanType}
                  prepaymentType={parsed.prepaymentType}
                  prepaymentAmount={parsed.prepaymentAmount}
                  prepaymentMonth={parsed.prepaymentMonth}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .emi-workspace {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          font-family: var(--font-sans);
        }

        .emi-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .emi-chrome-left,
        .emi-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .emi-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 10px;
          border-radius: var(--radius-md);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
          border: none;
          outline: none;
        }

        .emi-btn i {
          font-size: 13px;
        }

        .emi-btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        .emi-btn-icon,
        .emi-btn-ghost {
          background: transparent;
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
        }

        .emi-btn-icon:hover:not(:disabled),
        .emi-btn-ghost:hover:not(:disabled) {
          background: var(--border-faint);
          color: var(--text);
        }

        .emi-btn-icon.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .emi-btn-primary {
          background: var(--brand);
          color: white;
          border: none;
        }

        .emi-btn-primary:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .emi-sample-dropdown {
          position: relative;
        }

        .emi-sample-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 280px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }

        @media (prefers-color-scheme: dark) {
          .emi-sample-menu {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
        }

        .emi-sample-menu-header {
          padding: 10px 12px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .emi-sample-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          color: var(--text);
          cursor: pointer;
          transition: background 0.12s;
          text-align: left;
        }

        .emi-sample-menu-item:hover {
          background: var(--bg-surface);
        }

        .emi-sample-menu-item i {
          font-size: 16px;
          color: var(--brand);
          flex-shrink: 0;
        }

        .emi-sample-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .emi-sample-item-content strong {
          font-size: 12.5px;
          color: var(--text);
        }

        .emi-sample-item-content span {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .emi-mobile-tabs {
          display: none;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .emi-mobile-tab {
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
        }

        .emi-mobile-tab.active {
          color: var(--text);
        }

        .emi-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .emi-mobile-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 9px;
        }

        .emi-mobile-badge.valid {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .emi-mobile-badge.error {
          background: rgba(220, 38, 38, 0.1);
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .emi-mobile-badge.error {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
          }
        }

        .emi-mobile-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        .emi-body {
          display: grid;
          grid-template-columns: 1fr 0.5px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .emi-divider {
          background: var(--border);
          width: 0.5px;
        }

        .emi-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .emi-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          padding: 0 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          gap: 12px;
          flex-shrink: 0;
        }

        .emi-panel-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .emi-panel-title i {
          font-size: 12px;
        }

        .emi-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 600;
        }

        .emi-status-pill i {
          font-size: 9px;
        }

        .emi-status-pill.valid {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .emi-view-tabs {
          display: flex;
          gap: 0;
          height: 100%;
        }

        .emi-view-tab {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 100%;
          padding: 0 10px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
        }

        .emi-view-tab i {
          font-size: 11px;
        }

        .emi-view-tab:hover {
          color: var(--text);
        }

        .emi-view-tab.active {
          color: var(--text);
        }

        .emi-view-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 6px;
          right: 6px;
          height: 1.5px;
          background: var(--brand);
          border-radius: 1.5px 1.5px 0 0;
        }

        .emi-panel-content {
          flex: 1;
          overflow: auto;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .emi-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          gap: 14px;
        }

        .emi-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .emi-empty-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .emi-empty-text {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 0;
          max-width: 300px;
          line-height: 1.5;
        }

        .emi-empty-hint {
          font-size: 11.5px;
          color: var(--text-tertiary);
          margin: 0;
          font-style: italic;
        }

        .emi-spin {
          animation: emi-spin-rotate 0.8s linear infinite;
        }

        @keyframes emi-spin-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .emi-workspace {
            min-height: auto;
            border-radius: var(--radius-lg);
          }

          .emi-chrome {
            padding: 8px 12px;
          }

          .emi-btn span {
            display: none;
          }

          .emi-btn {
            padding: 0 10px;
          }

          .emi-mobile-tabs {
            display: flex;
          }

          .emi-body {
            display: block;
            position: relative;
          }

          .emi-divider {
            display: none;
          }

          .emi-panel {
            min-height: 420px;
          }

          .emi-panel.mobile-hidden {
            display: none;
          }

          .emi-panel.mobile-visible {
            display: flex;
          }

          .emi-sample-menu {
            position: fixed;
            top: auto;
            left: 50%;
            transform: translateX(-50%);
            width: 90vw;
            max-width: 90vw;
            margin-top: 10px;
            box-sizing: border-box;
          }
        }

        @media (max-width: 480px) {
          .emi-workspace {
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
        }

        .emi-btn:focus-visible,
        .emi-mobile-tab:focus-visible,
        .emi-view-tab:focus-visible,
        .emi-sample-menu-item:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
          .emi-spin {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}