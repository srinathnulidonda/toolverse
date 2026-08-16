// features/finance/gst-calculator/Workspace.tsx
"use client";

import { logger } from "@/lib/logger";
import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import { calculateGST, type GSTInput, type CalculationMode, type SupplyType } from "./ts/gstEngine";
import { useGSTStore } from "./ts/gstStore";
import { SAMPLE_CALCULATIONS, SAMPLE_CALCULATION_LABELS, type SampleCalculationType } from "./ts/sampleData";
import { SettingsPanel } from "./SettingsPanel";
import { GSTInputForm } from "./GSTInputForm";
import { ResultSummary } from "./ResultSummary";
import { ResultDetails } from "./ResultDetails";
import { downloadGSTReportPDF, type GSTReportData } from "./ts/gstPdfGenerator";
import styles from "./style/Workspace.module.css";

type ViewTab = "summary" | "details";

export default function GSTCalculatorWorkspace({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState<CalculationMode>("ADD_GST");
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [supplyType, setSupplyType] = useState<SupplyType>("INTRA_STATE");
  const [cessRate, setCessRate] = useState("0");
  const [quantity, setQuantity] = useState("1");

  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [viewTab, setViewTab] = useState<ViewTab>("summary");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { saveToHistory } = useGSTStore();

  const parsed = useMemo(() => {
    return {
      amount: parseFloat(amount) || 0,
      gstRate: gstRate === "custom" ? 0 : parseFloat(gstRate) || 0,
      cessRate: parseFloat(cessRate) || 0,
      quantity: parseInt(quantity, 10) || 1,
    };
  }, [amount, gstRate, cessRate, quantity]);

  const isValidForm = useMemo(() => {
    return (
      parsed.amount > 0 &&
      parsed.gstRate >= 0 &&
      parsed.gstRate <= 100 &&
      parsed.cessRate >= 0 &&
      parsed.cessRate <= 100 &&
      parsed.quantity > 0 &&
      gstRate !== "custom"
    );
  }, [parsed, gstRate]);

  const calculation = useMemo(() => {
    if (!isValidForm) return null;

    const input: GSTInput = {
      mode,
      amount: parsed.amount,
      gstRate: parsed.gstRate,
      supplyType,
      cessRate: parsed.cessRate,
      quantity: parsed.quantity,
    };

    return calculateGST(input);
  }, [isValidForm, mode, parsed, supplyType]);

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
      const title = `GST ${mode === "ADD_GST" ? "Added" : "Removed"} - ₹${parsed.amount.toFixed(0)} @ ${parsed.gstRate}%`;

      saveToHistory({
        title,
        input: {
          mode,
          amount: parsed.amount,
          gstRate: parsed.gstRate,
          supplyType,
          cessRate: parsed.cessRate,
          quantity: parsed.quantity,
        },
        calculation,
        isFavorite: false,
        tags: [mode, supplyType],
      });
    } catch (error) {
      logger.error("Failed to save:", error);
    }
  }, [calculation, mode, parsed, supplyType, saveToHistory]);

  const handleDownloadPDF = useCallback(async () => {
    if (!calculation) return;

    setIsGeneratingPDF(true);
    try {
      const reportData: GSTReportData = {
        reference: `${mode === "ADD_GST" ? "Forward" : "Reverse"}-${Date.now().toString(36).toUpperCase()}`,
        mode: mode === "ADD_GST" ? "Add GST (Forward)" : "Remove GST (Reverse)",
        supplyType: supplyType === "INTRA_STATE" ? "Intra-State" : "Inter-State",
        inputAmount: parsed.amount,
        gstRate: parsed.gstRate,
        cessRate: parsed.cessRate,
        quantity: parsed.quantity,
        calculation,
      };

      await downloadGSTReportPDF(reportData);
    } catch (error) {
      logger.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [calculation, mode, supplyType, parsed]);

  const handleReset = useCallback(() => {
    setMode("ADD_GST");
    setAmount("");
    setGstRate("18");
    setSupplyType("INTRA_STATE");
    setCessRate("0");
    setQuantity("1");
  }, []);

  const loadSample = useCallback((type: SampleCalculationType) => {
    const sample = SAMPLE_CALCULATIONS[type];
    setMode(sample.mode);
    setAmount(sample.amount.toString());
    setGstRate(sample.gstRate.toString());
    setSupplyType(sample.supplyType);
    setCessRate(sample.cessRate.toString());
    setQuantity(sample.quantity.toString());
    setShowSampleMenu(false);
    setMobilePanel("input");
  }, []);

  const handleViewResults = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setMobilePanel("output");
    } else {
      const outputPanel = document.querySelector(`.${styles.gstPanelOutput}`);
      if (outputPanel) {
        outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return (
    <div className={styles.gstWorkspace} role="main" aria-label="GST Calculator">
      <div className={styles.gstChrome}>
        <div className={styles.gstChromeLeft}>
          <button
            type="button"
            className={`${styles.gstBtn} ${styles.gstBtnIcon}${showSettings ? ` ${styles.active}` : ""}`}
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Toggle settings"
            aria-expanded={showSettings}
          >
            <i className="ti ti-adjustments" aria-hidden="true" />
            <span>Settings</span>
          </button>

          <div className={styles.gstSampleDropdown}>
            <button
              type="button"
              className={`${styles.gstBtn} ${styles.gstBtnIcon}`}
              onClick={() => setShowSampleMenu((s) => !s)}
              aria-label="Load sample data"
              aria-haspopup="menu"
              aria-expanded={showSampleMenu}
            >
              <i className="ti ti-wand" aria-hidden="true" />
              <span>Examples</span>
            </button>

            {showSampleMenu && (
              <div className={styles.gstSampleMenu} role="menu">
                <div className={styles.gstSampleMenuHeader}>
                  <span>Load Sample Calculation</span>
                </div>
                {(Object.keys(SAMPLE_CALCULATIONS) as SampleCalculationType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="menuitem"
                    className={styles.gstSampleMenuItem}
                    onClick={() => loadSample(type)}
                  >
                    <i className={`ti ${SAMPLE_CALCULATION_LABELS[type].icon}`} aria-hidden="true" />
                    <div className={styles.gstSampleItemContent}>
                      <strong>{SAMPLE_CALCULATION_LABELS[type].label}</strong>
                      <span>{SAMPLE_CALCULATION_LABELS[type].desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.gstChromeRight}>
          <button
            type="button"
            className={`${styles.gstBtn} ${styles.gstBtnGhost}`}
            onClick={handleReset}
            disabled={!amount && !gstRate}
            aria-label="Reset form"
          >
            <i className="ti ti-refresh" aria-hidden="true" />
            <span>Reset</span>
          </button>

          {calculation && (
            <button
              type="button"
              className={`${styles.gstBtn} ${styles.gstBtnPrimary}`}
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              aria-label="Download PDF report"
              aria-busy={isGeneratingPDF}
            >
              <i
                className={`ti ${isGeneratingPDF ? `ti-loader-2 ${styles.gstSpin}` : "ti-file-download"}`}
                aria-hidden="true"
              />
              <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
            </button>
          )}

          {calculation && (
            <button
              type="button"
              className={`${styles.gstBtn} ${styles.gstBtnPrimary}`}
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

      <div className={styles.gstMobileTabs} role="tablist" aria-label="Panel selector">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "input"}
          className={`${styles.gstMobileTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
          onClick={() => setMobilePanel("input")}
        >
          Input
          {!isValidForm && amount && (
            <span className={`${styles.gstMobileBadge} ${styles.error}`}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
            </span>
          )}
          {isValidForm && (
            <span className={`${styles.gstMobileBadge} ${styles.valid}`}>
              <i className="ti ti-check" aria-hidden="true" />
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "output"}
          className={`${styles.gstMobileTab}${mobilePanel === "output" ? ` ${styles.active}` : ""}`}
          onClick={() => setMobilePanel("output")}
        >
          Result
          {calculation && <span className={styles.gstMobileDot} />}
        </button>
      </div>

      <div className={styles.gstBody}>
        <div
          className={`${styles.gstPanel} ${styles.gstPanelInput}${mobilePanel === "input" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
        >
          <div className={styles.gstPanelHeader}>
            <div className={styles.gstPanelTitle}>
              <i className="ti ti-pencil" aria-hidden="true" />
              Calculation Input
            </div>
            {isValidForm && (
              <span className={`${styles.gstStatusPill} ${styles.valid}`}>
                <i className="ti ti-check" aria-hidden="true" />
                Valid
              </span>
            )}
          </div>

          <div className={styles.gstPanelContent}>
            <GSTInputForm
              mode={mode}
              amount={amount}
              gstRate={gstRate}
              supplyType={supplyType}
              cessRate={cessRate}
              quantity={quantity}
              onModeChange={setMode}
              onAmountChange={setAmount}
              onGstRateChange={setGstRate}
              onSupplyTypeChange={setSupplyType}
              onCessRateChange={setCessRate}
              onQuantityChange={setQuantity}
              isValidForm={isValidForm}
              hasCalculation={!!calculation}
              onViewResults={handleViewResults}
            />
          </div>
        </div>

        <div className={styles.gstDivider} aria-hidden="true" />

        <div
          className={`${styles.gstPanel} ${styles.gstPanelOutput}${mobilePanel === "output" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
        >
          <div className={styles.gstPanelHeader}>
            <div className={styles.gstPanelTitle}>
              <i className="ti ti-report-money" aria-hidden="true" />
              Calculation Result
            </div>

            {calculation && (
              <div className={styles.gstViewTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  className={`${styles.gstViewTab}${viewTab === "summary" ? ` ${styles.active}` : ""}`}
                  onClick={() => setViewTab("summary")}
                  aria-selected={viewTab === "summary"}
                >
                  <i className="ti ti-sum" aria-hidden="true" />
                  Summary
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`${styles.gstViewTab}${viewTab === "details" ? ` ${styles.active}` : ""}`}
                  onClick={() => setViewTab("details")}
                  aria-selected={viewTab === "details"}
                >
                  <i className="ti ti-list-details" aria-hidden="true" />
                  Details
                </button>
              </div>
            )}
          </div>

          <div className={styles.gstPanelContent}>
            {!calculation && (
              <div className={styles.gstEmpty}>
                <div className={styles.gstEmptyIcon}>
                  <i className="ti ti-calculator" aria-hidden="true" />
                </div>
                <h3 className={styles.gstEmptyTitle}>No Calculation Yet</h3>
                <p className={styles.gstEmptyText}>
                  Enter amount and GST rate to calculate tax breakdown
                </p>
                <p className={styles.gstEmptyHint}>
                  Try loading an example from the "Examples" button above
                </p>
              </div>
            )}

            {calculation && viewTab === "summary" && (
              <ResultSummary
                calculation={calculation}
                reference={`${mode === "ADD_GST" ? "Forward" : "Reverse"}-${parsed.amount.toFixed(0)}`}
                onCopy={handleCopy}
                copiedKey={copiedKey}
                onDownloadPDF={handleDownloadPDF}
                isGeneratingPDF={isGeneratingPDF}
              />
            )}

            {calculation && viewTab === "details" && (
              <ResultDetails
                calculation={calculation}
                inputAmount={parsed.amount}
                gstRate={parsed.gstRate}
                cessRate={parsed.cessRate}
                quantity={parsed.quantity}
                mode={mode}
                supplyType={supplyType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}