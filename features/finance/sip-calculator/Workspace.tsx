// features/finance/sip-calculator/Workspace.tsx
"use client";

import { logger } from "@/lib/logger";
import { formatCurrency } from "@/lib/utils";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import {
  calculateSIP,
  type SIPCalculationResult,
} from "./ts/sipEngine";
import { useSIPStore } from "./ts/sipStore";
import { SAMPLE_SIPS, SAMPLE_SIP_LABELS, type SampleSIPType } from "./ts/sampleData";
import { SettingsPanel } from "./SettingsPanel";
import { SIPInputForm } from "./SIPInputForm";
import { ResultSummary } from "./ResultSummary";
import { ResultDetails } from "./ResultDetails";
import { downloadSIPReportPDF, type SIPReportData } from "./ts/sipPdfGenerator";
import styles from "./style/Workspace.module.css";

type ViewTab = "summary" | "details";

export default function SIPCalculatorWorkspace(_: { tool: Tool }) {
  const [mode, setMode] = useState<"regular" | "step-up" | "goal-based">("regular");
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [tenureValue, setTenureValue] = useState("");
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [lumpSum, setLumpSum] = useState("");
  const [inflationRate, setInflationRate] = useState("");
  const [stepUpPercentage, setStepUpPercentage] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [viewTab, setViewTab] = useState<ViewTab>("summary");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const sampleMenuRef = useRef<HTMLDivElement>(null);
  const outputPanelRef = useRef<HTMLDivElement>(null);

  const { saveToHistory } = useSIPStore();

  const parsed = useMemo(() => {
    return {
      mode,
      monthlyInvestment: monthlyInvestment === "" ? 0 : parseFloat(monthlyInvestment),
      expectedReturn: expectedReturn === "" ? 0 : parseFloat(expectedReturn),
      tenureValue: tenureValue === "" ? 0 : parseInt(tenureValue, 10),
      tenureUnit,
      lumpSum: lumpSum === "" ? 0 : parseFloat(lumpSum),
      inflationRate: inflationRate === "" ? 0 : parseFloat(inflationRate),
      stepUpPercentage: stepUpPercentage === "" ? 0 : parseFloat(stepUpPercentage),
      goalAmount: goalAmount === "" ? 0 : parseFloat(goalAmount),
    };
  }, [
    mode,
    monthlyInvestment,
    expectedReturn,
    tenureValue,
    tenureUnit,
    lumpSum,
    inflationRate,
    stepUpPercentage,
    goalAmount,
  ]);

  const hasAnyInput = useMemo(() => {
    return Boolean(
      monthlyInvestment ||
      expectedReturn ||
      tenureValue ||
      lumpSum ||
      inflationRate ||
      stepUpPercentage ||
      goalAmount
    );
  }, [monthlyInvestment, expectedReturn, tenureValue, lumpSum, inflationRate, stepUpPercentage, goalAmount]);

  const isValidForm = useMemo(() => {
    const returnValue = parseFloat(expectedReturn);
    const tenureNum = parseInt(tenureValue, 10);

    const monthlyValid =
      mode === "regular" || mode === "step-up"
        ? monthlyInvestment.trim() !== "" && parseFloat(monthlyInvestment) > 0
        : true;

    const goalValid =
      mode === "goal-based" ? goalAmount.trim() !== "" && parseFloat(goalAmount) > 0 : true;

    const stepUpValid =
      mode === "step-up"
        ? stepUpPercentage.trim() !== "" &&
          parseFloat(stepUpPercentage) >= 0 &&
          parseFloat(stepUpPercentage) <= 50
        : true;

    return (
      monthlyValid &&
      goalValid &&
      stepUpValid &&
      expectedReturn !== "" &&
      returnValue >= 0.1 &&
      returnValue <= 30 &&
      tenureValue.trim() !== "" &&
      tenureNum > 0 &&
      (lumpSum === "" || parseFloat(lumpSum) >= 0) &&
      (inflationRate === "" || (parseFloat(inflationRate) >= 0 && parseFloat(inflationRate) <= 20))
    );
  }, [mode, monthlyInvestment, expectedReturn, tenureValue, lumpSum, inflationRate, stepUpPercentage, goalAmount]);

  const calculation = useMemo((): SIPCalculationResult | null => {
    if (!isValidForm) return null;
    try {
      return calculateSIP(parsed);
    } catch (error) {
      logger.error("Error calculating SIP:", error);
      return null;
    }
  }, [isValidForm, parsed]);

  useEffect(() => {
    if (!showSampleMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(event.target as Node)) {
        setShowSampleMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSampleMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showSampleMenu]);

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
      const titleAmount = mode === "goal-based" ? calculation.monthlySIPRequired ?? 0 : parsed.monthlyInvestment;
      const modeLabel = mode === "goal-based" ? "Goal-Based SIP" : mode === "step-up" ? "Step-Up SIP" : "Regular SIP";

      saveToHistory({
        title: `${modeLabel} - ${formatCurrency(titleAmount)}/month`,
        input: {
          mode,
          monthlyInvestment: parsed.monthlyInvestment,
          expectedReturn: parsed.expectedReturn,
          tenureValue: parsed.tenureValue,
          tenureUnit: parsed.tenureUnit,
          lumpSum: parsed.lumpSum,
          inflationRate: parsed.inflationRate,
          stepUpPercentage: parsed.stepUpPercentage,
          goalAmount: parsed.goalAmount,
        },
        calculation,
        isFavorite: false,
        tags: [mode],
      });
    } catch (error) {
      logger.error("Failed to save:", error);
    }
  }, [calculation, mode, parsed, saveToHistory]);

  const handleDownloadPDF = useCallback(async () => {
    if (!calculation) return;
    setIsGeneratingPDF(true);
    try {
      const reportData: SIPReportData = {
        mode: parsed.mode,
        monthlyInvestment: parsed.monthlyInvestment,
        expectedReturn: parsed.expectedReturn,
        tenureValue: parsed.tenureValue,
        tenureUnit: parsed.tenureUnit,
        lumpSum: parsed.lumpSum > 0 ? parsed.lumpSum : undefined,
        inflationRate: parsed.inflationRate > 0 ? parsed.inflationRate : undefined,
        stepUpPercentage: parsed.stepUpPercentage > 0 ? parsed.stepUpPercentage : undefined,
        goalAmount: parsed.goalAmount > 0 ? parsed.goalAmount : undefined,
        calculation,
      };
      await downloadSIPReportPDF(reportData);
    } catch (error) {
      logger.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [calculation, parsed]);

  const handleReset = useCallback(() => {
    setMode("regular");
    setMonthlyInvestment("");
    setExpectedReturn("");
    setTenureValue("");
    setTenureUnit('years');
    setLumpSum("");
    setInflationRate("");
    setStepUpPercentage("");
    setGoalAmount("");
  }, []);

  const loadSample = useCallback((type: SampleSIPType) => {
    const sample = SAMPLE_SIPS[type];
    setMode(sample.mode);
    setMonthlyInvestment(sample.monthlyInvestment.toString());
    setExpectedReturn(sample.expectedReturn.toString());
    setTenureValue(sample.tenureValue.toString());
    setTenureUnit(sample.tenureUnit as 'years' | 'months');
    setLumpSum(sample.lumpSum?.toString() || "");
    setInflationRate(sample.inflationRate?.toString() || "");
    setStepUpPercentage(sample.stepUpPercentage?.toString() || "");
    setGoalAmount(sample.goalAmount?.toString() || "");
    setShowSampleMenu(false);
    setMobilePanel("input");
  }, []);

  const handleViewResults = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth <= 768) {
      setMobilePanel("output");
    } else {
      outputPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className={styles.sipWorkspace} role="main" aria-label="SIP Calculator">
      <div className={styles.sipChrome}>
        <div className={styles.sipChromeLeft}>
          <button
            type="button"
            className={`${styles.sipBtn} ${styles.sipBtnIcon}${showSettings ? ` ${styles.active}` : ""}`}
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Toggle settings"
            aria-expanded={showSettings}
          >
            <i className="ti ti-adjustments" aria-hidden="true" />
            <span>Settings</span>
          </button>

          <div className={styles.sipSampleDropdown} ref={sampleMenuRef}>
            <button
              type="button"
              className={`${styles.sipBtn} ${styles.sipBtnIcon}`}
              onClick={() => setShowSampleMenu((s) => !s)}
              aria-label="Load sample data"
              aria-haspopup="menu"
              aria-expanded={showSampleMenu}
            >
              <i className="ti ti-wand" aria-hidden="true" />
              <span>Examples</span>
            </button>

            {showSampleMenu && (
              <div className={styles.sipSampleMenu} role="menu">
                <div className={styles.sipSampleMenuHeader}>
                  <span>Load Sample SIP</span>
                </div>
                {(Object.keys(SAMPLE_SIPS) as SampleSIPType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="menuitem"
                    className={styles.sipSampleMenuItem}
                    onClick={() => loadSample(type)}
                  >
                    <i className={`ti ${SAMPLE_SIP_LABELS[type].icon}`} aria-hidden="true" />
                    <div className={styles.sipSampleItemContent}>
                      <strong>{SAMPLE_SIP_LABELS[type].label}</strong>
                      <span>{SAMPLE_SIP_LABELS[type].desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.sipChromeRight}>
          <button
            type="button"
            className={`${styles.sipBtn} ${styles.sipBtnGhost}`}
            onClick={handleReset}
            disabled={!hasAnyInput}
            aria-label="Reset form"
          >
            <i className="ti ti-refresh" aria-hidden="true" />
            <span>Reset</span>
          </button>

          {calculation && (
            <button
              type="button"
              className={`${styles.sipBtn} ${styles.sipBtnPrimary}`}
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              aria-label="Download PDF report"
              aria-busy={isGeneratingPDF}
            >
              <i
                className={`ti ${isGeneratingPDF ? `ti-loader-2 ${styles.sipSpin}` : "ti-file-download"}`}
                aria-hidden="true"
              />
              <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
            </button>
          )}

          {calculation && (
            <button
              type="button"
              className={`${styles.sipBtn} ${styles.sipBtnPrimary}`}
              onClick={handleSaveCalculation}
              aria-label="Save calculation"
            >
              <i className="ti ti-device-floppy" aria-hidden="true" />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      {showSettings && <SettingsPanel />}

      <div className={styles.sipMobileTabs} role="tablist" aria-label="Panel selector">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "input"}
          className={`${styles.sipMobileTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
          onClick={() => setMobilePanel("input")}
        >
          Input
          {!isValidForm && hasAnyInput && (
            <span className={`${styles.sipMobileBadge} ${styles.error}`}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
            </span>
          )}
          {isValidForm && (
            <span className={`${styles.sipMobileBadge} ${styles.valid}`}>
              <i className="ti ti-check" aria-hidden="true" />
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "output"}
          className={`${styles.sipMobileTab}${mobilePanel === "output" ? ` ${styles.active}` : ""}`}
          onClick={() => setMobilePanel("output")}
        >
          Result
          {calculation && <span className={styles.sipMobileDot} />}
        </button>
      </div>

      <div className={styles.sipBody}>
        <div
          className={`${styles.sipPanel} ${mobilePanel === "input" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.sipPanelHeader}>
            <div className={styles.sipPanelTitle}>
              <i className="ti ti-pencil" aria-hidden="true" />
              SIP Details
            </div>
            {isValidForm && (
              <span className={`${styles.sipStatusPill} ${styles.valid}`}>
                <i className="ti ti-check" aria-hidden="true" />
                Valid
              </span>
            )}
          </div>

          <div className={styles.sipPanelContent}>
            <SIPInputForm
              mode={mode}
              monthlyInvestment={monthlyInvestment}
              expectedReturn={expectedReturn}
              tenureValue={tenureValue}
              tenureUnit={tenureUnit}
              lumpSum={lumpSum}
              inflationRate={inflationRate}
              stepUpPercentage={stepUpPercentage}
              goalAmount={goalAmount}
              onModeChange={setMode}
              onMonthlyInvestmentChange={setMonthlyInvestment}
              onExpectedReturnChange={setExpectedReturn}
              onTenureValueChange={setTenureValue}
              onTenureUnitChange={setTenureUnit}
              onLumpSumChange={setLumpSum}
              onInflationRateChange={setInflationRate}
              onStepUpPercentageChange={setStepUpPercentage}
              onGoalAmountChange={setGoalAmount}
              hasCalculation={!!calculation}
              onViewResults={handleViewResults}
            />
          </div>
        </div>

        <div className={styles.sipDivider} aria-hidden="true" />

        <div
          ref={outputPanelRef}
          className={`${styles.sipPanel} ${mobilePanel === "output" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.sipPanelHeader}>
            <div className={styles.sipPanelTitle}>
              <i className="ti ti-report-money" aria-hidden="true" />
              Calculation Result
            </div>

            {calculation && (
              <div className={styles.sipViewTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  className={`${styles.sipViewTab}${viewTab === "summary" ? ` ${styles.active}` : ""}`}
                  onClick={() => setViewTab("summary")}
                  aria-selected={viewTab === "summary"}
                >
                  <i className="ti ti-sum" aria-hidden="true" />
                  Summary
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`${styles.sipViewTab}${viewTab === "details" ? ` ${styles.active}` : ""}`}
                  onClick={() => setViewTab("details")}
                  aria-selected={viewTab === "details"}
                >
                  <i className="ti ti-list-details" aria-hidden="true" />
                  Details
                </button>
              </div>
            )}
          </div>

          <div className={styles.sipPanelContent}>
            {!calculation && (
              <div className={styles.sipEmpty}>
                <div className={styles.sipEmptyIcon}>
                  <i className="ti ti-calculator" aria-hidden="true" />
                </div>
                <h3 className={styles.sipEmptyTitle}>No Calculation Yet</h3>
                <p className={styles.sipEmptyText}>
                  Fill in the SIP details to calculate your returns
                </p>
                <p className={styles.sipEmptyHint}>
                  Try loading an example from the "Examples" button above
                </p>
              </div>
            )}

            {calculation && viewTab === "summary" && (
              <ResultSummary
                calculation={calculation}
                monthlyInvestment={parsed.monthlyInvestment}
                expectedReturn={parsed.expectedReturn}
                tenureValue={parsed.tenureValue}
                tenureUnit={parsed.tenureUnit}
                lumpSum={parsed.lumpSum}
                inflationRate={parsed.inflationRate}
                stepUpPercentage={parsed.stepUpPercentage}
                goalAmount={parsed.goalAmount}
                mode={parsed.mode}
                onCopy={handleCopy}
                copiedKey={copiedKey}
                onDownloadPDF={handleDownloadPDF}
                isGeneratingPDF={isGeneratingPDF}
              />
            )}

            {calculation && viewTab === "details" && (
              <ResultDetails
                calculation={calculation}
                monthlyInvestment={parsed.monthlyInvestment}
                expectedReturn={parsed.expectedReturn}
                tenureValue={parsed.tenureValue}
                tenureUnit={parsed.tenureUnit}
                lumpSum={parsed.lumpSum}
                inflationRate={parsed.inflationRate}
                stepUpPercentage={parsed.stepUpPercentage}
                goalAmount={parsed.goalAmount}
                mode={parsed.mode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}