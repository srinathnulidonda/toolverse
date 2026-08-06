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
} from "./ts/emiEngine";
import { useEMIStore } from "./ts/emiStore";
import { SAMPLE_LOANS, SAMPLE_LOAN_LABELS, type SampleLoanType } from "./ts/sampleData";
import { SettingsPanel } from "./SettingsPanel";
import { LoanInputForm } from "./LoanInputForm";
import { ResultSummary } from "./ResultSummary";
import { ResultDetails } from "./ResultDetails";
import { downloadEMIReportPDF, type EMIReportData } from "./ts/emiPdfGenerator";
import styles from "./style/Workspace.module.css";

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
    return true;
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

    const hasPrepayment = prepaymentType !== 'none' &&
      parseFloat(prepaymentAmount) > 0;

    const baseInput: EMIInput = {
      loanAmount: parsed.loanAmount,
      interestRate: parsed.interestRate,
      tenureValue: parsed.tenureValue,
      tenureUnit: parsed.tenureUnit,
      loanStartDate: parsed.loanStartDate,
      loanType: parsed.loanType,
      prepaymentType: 'none',
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
    loanType,
    parsed,
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
      const outputPanel = document.querySelector(`.${styles.emiPanelOutput}`);
      if (outputPanel) {
        outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return (
    <div className={styles.emiWorkspace} role="main" aria-label="EMI Calculator">
      <div className={styles.emiChrome}>
        <div className={styles.emiChromeLeft}>
          <button
            type="button"
            className={`${styles.emiBtn} ${styles.emiBtnIcon}${showSettings ? ` ${styles.active}` : ""}`}
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Toggle settings"
            aria-expanded={showSettings}
          >
            <i className="ti ti-adjustments" aria-hidden="true" />
            <span>Settings</span>
          </button>

          <div className={styles.emiSampleDropdown}>
            <button
              type="button"
              className={`${styles.emiBtn} ${styles.emiBtnIcon}`}
              onClick={() => setShowSampleMenu((s) => !s)}
              aria-label="Load sample data"
              aria-haspopup="menu"
              aria-expanded={showSampleMenu}
            >
              <i className="ti ti-wand" aria-hidden="true" />
              <span>Examples</span>
            </button>

            {showSampleMenu && (
              <div className={styles.emiSampleMenu} role="menu">
                <div className={styles.emiSampleMenuHeader}>
                  <span>Load Sample Loan</span>
                </div>
                {(Object.keys(SAMPLE_LOANS) as SampleLoanType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="menuitem"
                    className={styles.emiSampleMenuItem}
                    onClick={() => loadSample(type)}
                  >
                    <i className={`ti ${SAMPLE_LOAN_LABELS[type].icon}`} aria-hidden="true" />
                    <div className={styles.emiSampleItemContent}>
                      <strong>{SAMPLE_LOAN_LABELS[type].label}</strong>
                      <span>{SAMPLE_LOAN_LABELS[type].desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.emiChromeRight}>
          <button
            type="button"
            className={`${styles.emiBtn} ${styles.emiBtnGhost}`}
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
              className={`${styles.emiBtn} ${styles.emiBtnPrimary}`}
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              aria-label="Download PDF report"
              aria-busy={isGeneratingPDF}
            >
              <i
                className={`ti ${isGeneratingPDF ? `ti-loader-2 ${styles.emiSpin}` : "ti-file-download"}`}
                aria-hidden="true"
              />
              <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
            </button>
          )}

          {calculation && (
            <button
              type="button"
              className={`${styles.emiBtn} ${styles.emiBtnPrimary}`}
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
          usageTaxable="100"
          usageExempt="0"
          usageNonBusiness="0"
          blockedCategory={undefined}
          onUsageChange={(_, __) => { }}
          onBlockedCategoryChange={() => { }}
        />
      )}

      <div className={styles.emiMobileTabs} role="tablist" aria-label="Panel selector">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "input"}
          className={`${styles.emiMobileTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
          onClick={() => setMobilePanel("input")}
        >
          Input
          {!isValidForm && loanAmount && (
            <span className={`${styles.emiMobileBadge} ${styles.error}`}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
            </span>
          )}
          {isValidForm && (
            <span className={`${styles.emiMobileBadge} ${styles.valid}`}>
              <i className="ti ti-check" aria-hidden="true" />
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "output"}
          className={`${styles.emiMobileTab}${mobilePanel === "output" ? ` ${styles.active}` : ""}`}
          onClick={() => setMobilePanel("output")}
        >
          Result
          {calculation && <span className={styles.emiMobileDot} />}
        </button>
      </div>

      <div className={styles.emiBody}>
        <div
          className={`${styles.emiPanel} ${styles.emiPanelInput}${mobilePanel === "input" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
        >
          <div className={styles.emiPanelHeader}>
            <div className={styles.emiPanelTitle}>
              <i className="ti ti-pencil" aria-hidden="true" />
              Loan Details
            </div>
            {isValidForm && (
              <span className={`${styles.emiStatusPill} ${styles.valid}`}>
                <i className="ti ti-check" aria-hidden="true" />
                Valid
              </span>
            )}
          </div>

          <div className={styles.emiPanelContent}>
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

        <div className={styles.emiDivider} aria-hidden="true" />

        <div
          className={`${styles.emiPanel} ${styles.emiPanelOutput}${mobilePanel === "output" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
        >
          <div className={styles.emiPanelHeader}>
            <div className={styles.emiPanelTitle}>
              <i className="ti ti-report-money" aria-hidden="true" />
              Calculation Result
            </div>

            {calculation && (
              <div className={styles.emiViewTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  className={`${styles.emiViewTab}${viewTab === "summary" ? ` ${styles.active}` : ""}`}
                  onClick={() => setViewTab("summary")}
                  aria-selected={viewTab === "summary"}
                >
                  <i className="ti ti-sum" aria-hidden="true" />
                  Summary
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`${styles.emiViewTab}${viewTab === "details" ? ` ${styles.active}` : ""}`}
                  onClick={() => setViewTab("details")}
                  aria-selected={viewTab === "details"}
                >
                  <i className="ti ti-list-details" aria-hidden="true" />
                  Details
                </button>
              </div>
            )}
          </div>

          <div className={styles.emiPanelContent}>
            {!calculation && (
              <div className={styles.emiEmpty}>
                <div className={styles.emiEmptyIcon}>
                  <i className="ti ti-credit-card" aria-hidden="true" />
                </div>
                <h3 className={styles.emiEmptyTitle}>No Calculation Yet</h3>
                <p className={styles.emiEmptyText}>
                  Fill in the loan details to calculate your EMI
                </p>
                <p className={styles.emiEmptyHint}>
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
  );
}