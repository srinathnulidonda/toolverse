// features/finance/gst-calculator/Workspace.tsx

"use client";

import { logger } from "@/lib/logger";
import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import { calculateGST, type GSTInput, type CalculationMode, type SupplyType } from "./gstEngine";
import { useGSTStore } from "./gstStore";
import { SAMPLE_CALCULATIONS, SAMPLE_CALCULATION_LABELS, type SampleCalculationType } from "./sampleData";
import { SettingsPanel } from "./SettingsPanel";
import { GSTInputForm } from "./GSTInputForm";
import { ResultSummary } from "./ResultSummary";
import { ResultDetails } from "./ResultDetails";
import { downloadGSTReportPDF, type GSTReportData } from "./gstPdfGenerator";

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
            const outputPanel = document.querySelector('.gst-panel-output');
            if (outputPanel) {
                outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, []);

    return (
        <>
            <div className="gst-workspace" role="main" aria-label="GST Calculator">
                <div className="gst-chrome">
                    <div className="gst-chrome-left">
                        <button
                            type="button"
                            className={`gst-btn gst-btn-icon${showSettings ? " active" : ""}`}
                            onClick={() => setShowSettings((s) => !s)}
                            aria-label="Toggle settings"
                            aria-expanded={showSettings}
                        >
                            <i className="ti ti-adjustments" aria-hidden="true" />
                            <span>Settings</span>
                        </button>

                        <div className="gst-sample-dropdown">
                            <button
                                type="button"
                                className="gst-btn gst-btn-icon"
                                onClick={() => setShowSampleMenu((s) => !s)}
                                aria-label="Load sample data"
                                aria-haspopup="menu"
                                aria-expanded={showSampleMenu}
                            >
                                <i className="ti ti-wand" aria-hidden="true" />
                                <span>Examples</span>
                            </button>

                            {showSampleMenu && (
                                <div className="gst-sample-menu" role="menu">
                                    <div className="gst-sample-menu-header">
                                        <span>Load Sample Calculation</span>
                                    </div>
                                    {(Object.keys(SAMPLE_CALCULATIONS) as SampleCalculationType[]).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            role="menuitem"
                                            className="gst-sample-menu-item"
                                            onClick={() => loadSample(type)}
                                        >
                                            <i className={`ti ${SAMPLE_CALCULATION_LABELS[type].icon}`} aria-hidden="true" />
                                            <div className="gst-sample-item-content">
                                                <strong>{SAMPLE_CALCULATION_LABELS[type].label}</strong>
                                                <span>{SAMPLE_CALCULATION_LABELS[type].desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="gst-chrome-right">
                        <button
                            type="button"
                            className="gst-btn gst-btn-ghost"
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
                                className="gst-btn gst-btn-primary"
                                onClick={handleDownloadPDF}
                                disabled={isGeneratingPDF}
                                aria-label="Download PDF report"
                                aria-busy={isGeneratingPDF}
                            >
                                <i
                                    className={`ti ${isGeneratingPDF ? "ti-loader-2 gst-spin" : "ti-file-download"}`}
                                    aria-hidden="true"
                                />
                                <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
                            </button>
                        )}

                        {calculation && (
                            <button
                                type="button"
                                className="gst-btn gst-btn-primary"
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

                <div className="gst-mobile-tabs" role="tablist" aria-label="Panel selector">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mobilePanel === "input"}
                        className={`gst-mobile-tab${mobilePanel === "input" ? " active" : ""}`}
                        onClick={() => setMobilePanel("input")}
                    >
                        Input
                        {!isValidForm && amount && (
                            <span className="gst-mobile-badge error">
                                <i className="ti ti-alert-circle" aria-hidden="true" />
                            </span>
                        )}
                        {isValidForm && (
                            <span className="gst-mobile-badge valid">
                                <i className="ti ti-check" aria-hidden="true" />
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mobilePanel === "output"}
                        className={`gst-mobile-tab${mobilePanel === "output" ? " active" : ""}`}
                        onClick={() => setMobilePanel("output")}
                    >
                        Result
                        {calculation && <span className="gst-mobile-dot" />}
                    </button>
                </div>

                <div className="gst-body">
                    <div
                        className={`gst-panel gst-panel-input${mobilePanel === "input" ? " mobile-visible" : " mobile-hidden"}`}
                    >
                        <div className="gst-panel-header">
                            <div className="gst-panel-title">
                                <i className="ti ti-pencil" aria-hidden="true" />
                                Calculation Input
                            </div>
                            {isValidForm && (
                                <span className="gst-status-pill valid">
                                    <i className="ti ti-check" aria-hidden="true" />
                                    Valid
                                </span>
                            )}
                        </div>

                        <div className="gst-panel-content">
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

                    <div className="gst-divider" aria-hidden="true" />

                    <div
                        className={`gst-panel gst-panel-output${mobilePanel === "output" ? " mobile-visible" : " mobile-hidden"}`}
                    >
                        <div className="gst-panel-header">
                            <div className="gst-panel-title">
                                <i className="ti ti-report-money" aria-hidden="true" />
                                Calculation Result
                            </div>

                            {calculation && (
                                <div className="gst-view-tabs" role="tablist">
                                    <button
                                        type="button"
                                        role="tab"
                                        className={`gst-view-tab${viewTab === "summary" ? " active" : ""}`}
                                        onClick={() => setViewTab("summary")}
                                        aria-selected={viewTab === "summary"}
                                    >
                                        <i className="ti ti-sum" aria-hidden="true" />
                                        Summary
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        className={`gst-view-tab${viewTab === "details" ? " active" : ""}`}
                                        onClick={() => setViewTab("details")}
                                        aria-selected={viewTab === "details"}
                                    >
                                        <i className="ti ti-list-details" aria-hidden="true" />
                                        Details
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="gst-panel-content">
                            {!calculation && (
                                <div className="gst-empty">
                                    <div className="gst-empty-icon">
                                        <i className="ti ti-calculator" aria-hidden="true" />
                                    </div>
                                    <h3 className="gst-empty-title">No Calculation Yet</h3>
                                    <p className="gst-empty-text">
                                        Enter amount and GST rate to calculate tax breakdown
                                    </p>
                                    <p className="gst-empty-hint">
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

            <style jsx>{`
        .gst-workspace {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          font-family: var(--font-sans);
        }

        .gst-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .gst-chrome-left,
        .gst-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .gst-btn {
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

        .gst-btn i {
          font-size: 13px;
        }

        .gst-btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        .gst-btn-icon,
        .gst-btn-ghost {
          background: transparent;
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
        }

        .gst-btn-icon:hover:not(:disabled),
        .gst-btn-ghost:hover:not(:disabled) {
          background: var(--border-faint);
          color: var(--text);
        }

        .gst-btn-icon.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .gst-btn-primary {
          background: var(--brand);
          color: white;
          border: none;
        }

        .gst-btn-primary:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .gst-sample-dropdown {
          position: relative;
        }

        .gst-sample-menu {
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
          .gst-sample-menu {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
        }

        .gst-sample-menu-header {
          padding: 10px 12px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .gst-sample-menu-item {
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

        .gst-sample-menu-item:hover {
          background: var(--bg-surface);
        }

        .gst-sample-menu-item i {
          font-size: 16px;
          color: var(--brand);
          flex-shrink: 0;
        }

        .gst-sample-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .gst-sample-item-content strong {
          font-size: 12.5px;
          color: var(--text);
        }

        .gst-sample-item-content span {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .gst-mobile-tabs {
          display: none;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .gst-mobile-tab {
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

        .gst-mobile-tab.active {
          color: var(--text);
        }

        .gst-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .gst-mobile-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 9px;
        }

        .gst-mobile-badge.valid {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .gst-mobile-badge.error {
          background: rgba(220, 38, 38, 0.1);
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .gst-mobile-badge.error {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
          }
        }

        .gst-mobile-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        .gst-body {
          display: grid;
          grid-template-columns: 1fr 0.5px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .gst-divider {
          background: var(--border);
          width: 0.5px;
        }

        .gst-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .gst-panel-header {
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

        .gst-panel-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .gst-panel-title i {
          font-size: 12px;
        }

        .gst-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 600;
        }

        .gst-status-pill i {
          font-size: 9px;
        }

        .gst-status-pill.valid {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .gst-view-tabs {
          display: flex;
          gap: 0;
          height: 100%;
        }

        .gst-view-tab {
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

        .gst-view-tab i {
          font-size: 11px;
        }

        .gst-view-tab:hover {
          color: var(--text);
        }

        .gst-view-tab.active {
          color: var(--text);
        }

        .gst-view-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 6px;
          right: 6px;
          height: 1.5px;
          background: var(--brand);
          border-radius: 1.5px 1.5px 0 0;
        }

        .gst-panel-content {
          flex: 1;
          overflow: auto;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .gst-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          gap: 14px;
        }

        .gst-empty-icon {
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

        .gst-empty-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .gst-empty-text {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 0;
          max-width: 300px;
          line-height: 1.5;
        }

        .gst-empty-hint {
          font-size: 11.5px;
          color: var(--text-tertiary);
          margin: 0;
          font-style: italic;
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
          .gst-workspace {
            min-height: auto;
            border-radius: var(--radius-lg);
          }

          .gst-chrome {
            padding: 8px 12px;
          }

          .gst-btn span {
            display: none;
          }

          .gst-btn {
            padding: 0 10px;
          }

          .gst-mobile-tabs {
            display: flex;
          }

          .gst-body {
            display: block;
            position: relative;
          }

          .gst-divider {
            display: none;
          }

          .gst-panel {
            min-height: 420px;
          }

          .gst-panel.mobile-hidden {
            display: none;
          }

          .gst-panel.mobile-visible {
            display: flex;
          }

          .gst-sample-menu {
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
          .gst-workspace {
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
        }

        .gst-btn:focus-visible,
        .gst-mobile-tab:focus-visible,
        .gst-view-tab:focus-visible,
        .gst-sample-menu-item:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
          .gst-spin {
            animation: none;
          }
        }
      `}</style>
        </>
    );
}