// features/finance/itc-calculator/Workspace.tsx
"use client";
import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import {
  calculateITCEligibility,
  type ITCInvoiceInput,
  type ITCCalculationResult,
} from "./itcEngine";
import { useITCStore } from "./itcStore";
import { SAMPLE_INVOICES, SAMPLE_INVOICE_LABELS, type SampleInvoiceType } from "./sampleData";
import { SettingsPanel } from "./SettingsPanel";
import { InvoiceInputForm } from "./InvoiceInputForm";
import { ResultSummary } from "./ResultSummary";
import { ResultDetails } from "./ResultDetails";
import { downloadITCReportPDF, type ITCReportData } from "./itcPdfGenerator";

type ViewTab = "summary" | "details";

interface Props {
  tool: Tool;
}

export default function ITCCalculatorWorkspace({ tool }: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [claimDate, setClaimDate] = useState("");
  const [gstinSupplier, setGSTINSupplier] = useState("");
  const [totalInvoiceValue, setTotalInvoiceValue] = useState("");
  const [gstPaid, setGSTPaid] = useState("");
  const [itcClaimedInBooks, setITCclaimedInBooks] = useState("");
  const [itcAvailableInGSTR2B, setITCAvailableInGSTR2B] = useState("");
  const [isCapitalGood, setIsCapitalGood] = useState(false);
  const [checkTimeLimit, setCheckTimeLimit] = useState(false);

  const [usageTaxable, setUsageTaxable] = useState("100");
  const [usageExempt, setUsageExempt] = useState("0");
  const [usageNonBusiness, setUsageNonBusiness] = useState("0");

  const [daysPastDue, setDaysPastDue] = useState("0");
  const [amountPaid, setAmountPaid] = useState("");
  const [totalPayable, setTotalPayable] = useState("");

  const [blockedCategory, setBlockedCategory] = useState<string | undefined>(undefined);

  const [copiedKey, setCopiedKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const [viewTab, setViewTab] = useState<ViewTab>("summary");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { saveToHistory } = useITCStore();

  const parsed = useMemo(() => {
    return {
      totalInvoiceValue: totalInvoiceValue === "" ? 0 : parseFloat(totalInvoiceValue),
      gstPaid: gstPaid === "" ? 0 : parseFloat(gstPaid),
      itcClaimedInBooks: itcClaimedInBooks === "" ? 0 : parseFloat(itcClaimedInBooks),
      itcAvailableInGSTR2B: itcAvailableInGSTR2B === "" ? 0 : parseFloat(itcAvailableInGSTR2B),
      usageTaxable: usageTaxable === "" ? 0 : parseFloat(usageTaxable),
      usageExempt: usageExempt === "" ? 0 : parseFloat(usageExempt),
      usageNonBusiness: usageNonBusiness === "" ? 0 : parseFloat(usageNonBusiness),
      daysPastDue: daysPastDue === "" ? 0 : parseInt(daysPastDue, 10),
      amountPaid: amountPaid === "" ? 0 : parseFloat(amountPaid),
      totalPayable: totalPayable === "" ? 0 : parseFloat(totalPayable),
    };
  }, [
    totalInvoiceValue,
    gstPaid,
    itcClaimedInBooks,
    itcAvailableInGSTR2B,
    usageTaxable,
    usageExempt,
    usageNonBusiness,
    daysPastDue,
    amountPaid,
    totalPayable,
  ]);

  const usageSplitValid = useMemo(() => {
    const total = parsed.usageTaxable + parsed.usageExempt + parsed.usageNonBusiness;
    return Math.abs(total - 100) < 0.01;
  }, [parsed]);

  const isValidForm = useMemo(() => {
    return (
      invoiceNumber.trim() !== "" &&
      invoiceDate !== "" &&
      claimDate !== "" &&
      gstinSupplier.trim() !== "" &&
      gstinSupplier.trim().length === 15 &&
      parsed.totalInvoiceValue > 0 &&
      parsed.gstPaid >= 0 &&
      parsed.itcClaimedInBooks >= 0 &&
      parsed.itcAvailableInGSTR2B >= 0 &&
      usageSplitValid &&
      parsed.daysPastDue >= 0 &&
      parsed.amountPaid >= 0 &&
      parsed.totalPayable >= 0 &&
      parsed.amountPaid <= parsed.totalPayable &&
      new Date(claimDate) >= new Date(invoiceDate)
    );
  }, [invoiceNumber, invoiceDate, claimDate, gstinSupplier, parsed, usageSplitValid]);

  const calculation = useMemo((): ITCCalculationResult | null => {
    if (!isValidForm) return null;

    const input: ITCInvoiceInput = {
      invoiceNumber,
      invoiceDate,
      claimDate,
      gstinSupplier,
      totalInvoiceValue: parsed.totalInvoiceValue,
      gstPaid: parsed.gstPaid,
      itcClaimedInBooks: parsed.itcClaimedInBooks,
      itcAvailableInGSTR2B: parsed.itcAvailableInGSTR2B,
      isCapitalGood,
      checkTimeLimit,
      usageSplit: {
        taxable: parsed.usageTaxable,
        exempt: parsed.usageExempt,
        nonBusiness: parsed.usageNonBusiness,
      },
      supplierPaymentStatus: {
        daysPastDue: parsed.daysPastDue,
        amountPaid: parsed.amountPaid,
        totalPayable: parsed.totalPayable,
      },
      blockedCategory,
    };

    return calculateITCEligibility(input);
  }, [
    isValidForm,
    invoiceNumber,
    invoiceDate,
    claimDate,
    gstinSupplier,
    parsed,
    isCapitalGood,
    checkTimeLimit,
    blockedCategory,
  ]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      console.warn('Clipboard API not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, []);

  const handleSaveCalculation = useCallback(() => {
    if (!calculation) return;

    try {
      saveToHistory({
        title: `ITC - ${invoiceNumber}`,
        input: {
          invoiceNumber,
          invoiceDate,
          claimDate,
          gstinSupplier,
          totalInvoiceValue: parsed.totalInvoiceValue,
          gstPaid: parsed.gstPaid,
          itcClaimedInBooks: parsed.itcClaimedInBooks,
          itcAvailableInGSTR2B: parsed.itcAvailableInGSTR2B,
          isCapitalGood,
          checkTimeLimit,
          usageSplit: {
            taxable: parsed.usageTaxable,
            exempt: parsed.usageExempt,
            nonBusiness: parsed.usageNonBusiness,
          },
          supplierPaymentStatus: {
            daysPastDue: parsed.daysPastDue,
            amountPaid: parsed.amountPaid,
            totalPayable: parsed.totalPayable,
          },
          blockedCategory,
        },
        calculation,
        isFavorite: false,
        tags: [calculation.status],
      });
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }, [
    calculation,
    invoiceNumber,
    invoiceDate,
    claimDate,
    gstinSupplier,
    parsed,
    isCapitalGood,
    checkTimeLimit,
    blockedCategory,
    saveToHistory,
  ]);

  const handleDownloadPDF = useCallback(async () => {
    if (!calculation) return;

    if (typeof window === "undefined") {
      console.warn('PDF generation not available on server');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const reportData: ITCReportData = {
        invoiceNumber,
        invoiceDate,
        claimDate,
        gstinSupplier,
        totalInvoiceValue: parsed.totalInvoiceValue,
        gstPaid: parsed.gstPaid,
        itcClaimedInBooks: parsed.itcClaimedInBooks,
        itcAvailableInGSTR2B: parsed.itcAvailableInGSTR2B,
        isCapitalGood,
        checkTimeLimit,
        usageTaxable: parsed.usageTaxable,
        usageExempt: parsed.usageExempt,
        usageNonBusiness: parsed.usageNonBusiness,
        daysPastDue: parsed.daysPastDue,
        amountPaid: parsed.amountPaid,
        totalPayable: parsed.totalPayable,
        blockedCategory,
        calculation,
      };

      await downloadITCReportPDF(reportData);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [
    calculation,
    invoiceNumber,
    invoiceDate,
    claimDate,
    gstinSupplier,
    parsed,
    isCapitalGood,
    checkTimeLimit,
    blockedCategory,
  ]);

  const handleReset = useCallback(() => {
    setInvoiceNumber("");
    setInvoiceDate("");
    setClaimDate(new Date().toISOString().split('T')[0]);
    setGSTINSupplier("");
    setTotalInvoiceValue("");
    setGSTPaid("");
    setITCclaimedInBooks("");
    setITCAvailableInGSTR2B("");
    setIsCapitalGood(false);
    setCheckTimeLimit(false);
    setUsageTaxable("100");
    setUsageExempt("0");
    setUsageNonBusiness("0");
    setDaysPastDue("0");
    setAmountPaid("");
    setTotalPayable("");
    setBlockedCategory(undefined);
  }, []);

  const loadSample = useCallback((type: SampleInvoiceType) => {
    const sample = SAMPLE_INVOICES[type];
    setInvoiceNumber(sample.invoiceNumber);
    setInvoiceDate(sample.invoiceDate);
    setClaimDate(sample.claimDate);
    setGSTINSupplier(sample.gstinSupplier);
    setTotalInvoiceValue(sample.totalInvoiceValue.toString());
    setGSTPaid(sample.gstPaid.toString());
    setITCclaimedInBooks(sample.itcClaimedInBooks.toString());
    setITCAvailableInGSTR2B(sample.itcAvailableInGSTR2B.toString());
    setIsCapitalGood(sample.isCapitalGood);
    setCheckTimeLimit(sample.checkTimeLimit);
    setUsageTaxable(sample.usageTaxable.toString());
    setUsageExempt(sample.usageExempt.toString());
    setUsageNonBusiness(sample.usageNonBusiness.toString());
    setDaysPastDue(sample.daysPastDue.toString());
    setAmountPaid(sample.amountPaid.toString());
    setTotalPayable(sample.totalPayable.toString());
    setBlockedCategory(sample.blockedCategory);
    setShowSampleMenu(false);
    setMobilePanel("input");
  }, []);

  const adjustUsageSplit = useCallback(
    (field: "taxable" | "exempt" | "nonBusiness", value: number) => {
      const clampedValue = Math.min(100, Math.max(0, value));

      if (field === "taxable") {
        setUsageTaxable(clampedValue.toString());
        const remaining = 100 - clampedValue;
        const currentExempt = parsed.usageExempt;
        const currentNonBusiness = parsed.usageNonBusiness;
        const currentOtherTotal = currentExempt + currentNonBusiness;

        if (currentOtherTotal > 0) {
          const exemptRatio = currentExempt / currentOtherTotal;
          setUsageExempt(Math.round(remaining * exemptRatio).toString());
          setUsageNonBusiness(Math.round(remaining * (1 - exemptRatio)).toString());
        } else {
          setUsageExempt("0");
          setUsageNonBusiness(remaining.toString());
        }
      } else if (field === "exempt") {
        setUsageExempt(clampedValue.toString());
        const remaining = 100 - clampedValue;
        const currentTaxable = parsed.usageTaxable;
        const currentNonBusiness = parsed.usageNonBusiness;
        const currentOtherTotal = currentTaxable + currentNonBusiness;

        if (currentOtherTotal > 0) {
          const taxableRatio = currentTaxable / currentOtherTotal;
          setUsageTaxable(Math.round(remaining * taxableRatio).toString());
          setUsageNonBusiness(Math.round(remaining * (1 - taxableRatio)).toString());
        } else {
          setUsageTaxable(remaining.toString());
          setUsageNonBusiness("0");
        }
      } else {
        setUsageNonBusiness(clampedValue.toString());
        const remaining = 100 - clampedValue;
        const currentTaxable = parsed.usageTaxable;
        const currentExempt = parsed.usageExempt;
        const currentOtherTotal = currentTaxable + currentExempt;

        if (currentOtherTotal > 0) {
          const taxableRatio = currentTaxable / currentOtherTotal;
          setUsageTaxable(Math.round(remaining * taxableRatio).toString());
          setUsageExempt(Math.round(remaining * (1 - taxableRatio)).toString());
        } else {
          setUsageTaxable(remaining.toString());
          setUsageExempt("0");
        }
      }
    },
    [parsed]
  );

  const handleViewResults = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.innerWidth <= 768) {
      setMobilePanel("output");
    } else {
      const outputPanel = document.querySelector('.itc-panel-output');
      if (outputPanel) {
        outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return (
    <>
      <div className="itc-workspace" role="main" aria-label="ITC Calculator">
        <div className="itc-chrome">
          <div className="itc-chrome-left">
            <button
              type="button"
              className={`itc-btn itc-btn-icon${showSettings ? " active" : ""}`}
              onClick={() => setShowSettings((s) => !s)}
              aria-label="Toggle settings"
              aria-expanded={showSettings}
            >
              <i className="ti ti-adjustments" aria-hidden="true" />
              <span>Settings</span>
            </button>

            <div className="itc-sample-dropdown">
              <button
                type="button"
                className="itc-btn itc-btn-icon"
                onClick={() => setShowSampleMenu((s) => !s)}
                aria-label="Load sample data"
                aria-haspopup="menu"
                aria-expanded={showSampleMenu}
              >
                <i className="ti ti-wand" aria-hidden="true" />
                <span>Examples</span>
              </button>

              {showSampleMenu && (
                <div className="itc-sample-menu" role="menu">
                  <div className="itc-sample-menu-header">
                    <span>Load Sample Invoice</span>
                  </div>
                  {(Object.keys(SAMPLE_INVOICES) as SampleInvoiceType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="menuitem"
                      className="itc-sample-menu-item"
                      onClick={() => loadSample(type)}
                    >
                      <i className={`ti ${SAMPLE_INVOICE_LABELS[type].icon}`} aria-hidden="true" />
                      <div className="itc-sample-item-content">
                        <strong>{SAMPLE_INVOICE_LABELS[type].label}</strong>
                        <span>{SAMPLE_INVOICE_LABELS[type].desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="itc-chrome-right">
            <button
              type="button"
              className="itc-btn itc-btn-ghost"
              onClick={handleReset}
              disabled={!invoiceNumber && !invoiceDate && !gstinSupplier}
              aria-label="Reset form"
            >
              <i className="ti ti-refresh" aria-hidden="true" />
              <span>Reset</span>
            </button>

            {calculation && (
              <button
                type="button"
                className="itc-btn itc-btn-primary"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                aria-label="Download PDF report"
                aria-busy={isGeneratingPDF}
              >
                <i
                  className={`ti ${isGeneratingPDF ? "ti-loader-2 itc-spin" : "ti-file-download"}`}
                  aria-hidden="true"
                />
                <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
              </button>
            )}

            {calculation && (
              <button
                type="button"
                className="itc-btn itc-btn-primary"
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
            usageTaxable={usageTaxable}
            usageExempt={usageExempt}
            usageNonBusiness={usageNonBusiness}
            blockedCategory={blockedCategory}
            onUsageChange={adjustUsageSplit}
            onBlockedCategoryChange={setBlockedCategory}
          />
        )}

        <div className="itc-mobile-tabs" role="tablist" aria-label="Panel selector">
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === "input"}
            className={`itc-mobile-tab${mobilePanel === "input" ? " active" : ""}`}
            onClick={() => setMobilePanel("input")}
          >
            Input
            {!isValidForm && invoiceNumber && (
              <span className="itc-mobile-badge error">
                <i className="ti ti-alert-circle" aria-hidden="true" />
              </span>
            )}
            {isValidForm && (
              <span className="itc-mobile-badge valid">
                <i className="ti ti-check" aria-hidden="true" />
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === "output"}
            className={`itc-mobile-tab${mobilePanel === "output" ? " active" : ""}`}
            onClick={() => setMobilePanel("output")}
          >
            Result
            {calculation && <span className="itc-mobile-dot" />}
          </button>
        </div>

        <div className="itc-body">
          <div
            className={`itc-panel itc-panel-input${mobilePanel === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="itc-panel-header">
              <div className="itc-panel-title">
                <i className="ti ti-pencil" aria-hidden="true" />
                Invoice Details
              </div>
              {isValidForm && (
                <span className="itc-status-pill valid">
                  <i className="ti ti-check" aria-hidden="true" />
                  Valid
                </span>
              )}
            </div>

            <div className="itc-panel-content">
              <InvoiceInputForm
                invoiceNumber={invoiceNumber}
                invoiceDate={invoiceDate}
                claimDate={claimDate}
                gstinSupplier={gstinSupplier}
                totalInvoiceValue={totalInvoiceValue}
                gstPaid={gstPaid}
                itcClaimedInBooks={itcClaimedInBooks}
                itcAvailableInGSTR2B={itcAvailableInGSTR2B}
                isCapitalGood={isCapitalGood}
                checkTimeLimit={checkTimeLimit}
                daysPastDue={daysPastDue}
                amountPaid={amountPaid}
                totalPayable={totalPayable}
                onInvoiceNumberChange={setInvoiceNumber}
                onInvoiceDateChange={setInvoiceDate}
                onClaimDateChange={setClaimDate}
                onGstinSupplierChange={setGSTINSupplier}
                onTotalInvoiceValueChange={setTotalInvoiceValue}
                onGstPaidChange={setGSTPaid}
                onItcClaimedInBooksChange={setITCclaimedInBooks}
                onItcAvailableInGSTR2BChange={setITCAvailableInGSTR2B}
                onIsCapitalGoodChange={setIsCapitalGood}
                onCheckTimeLimitChange={setCheckTimeLimit}
                onDaysPastDueChange={setDaysPastDue}
                onAmountPaidChange={setAmountPaid}
                onTotalPayableChange={setTotalPayable}
                isValidForm={isValidForm}
                hasCalculation={!!calculation}
                onViewResults={handleViewResults}
              />
            </div>
          </div>

          <div className="itc-divider" aria-hidden="true" />

          <div
            className={`itc-panel itc-panel-output${mobilePanel === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="itc-panel-header">
              <div className="itc-panel-title">
                <i className="ti ti-report-money" aria-hidden="true" />
                Calculation Result
              </div>

              {calculation && (
                <div className="itc-view-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    className={`itc-view-tab${viewTab === "summary" ? " active" : ""}`}
                    onClick={() => setViewTab("summary")}
                    aria-selected={viewTab === "summary"}
                  >
                    <i className="ti ti-sum" aria-hidden="true" />
                    Summary
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={`itc-view-tab${viewTab === "details" ? " active" : ""}`}
                    onClick={() => setViewTab("details")}
                    aria-selected={viewTab === "details"}
                  >
                    <i className="ti ti-list-details" aria-hidden="true" />
                    Details
                  </button>
                </div>
              )}
            </div>

            <div className="itc-panel-content">
              {!calculation && (
                <div className="itc-empty">
                  <div className="itc-empty-icon">
                    <i className="ti ti-calculator" aria-hidden="true" />
                  </div>
                  <h3 className="itc-empty-title">No Calculation Yet</h3>
                  <p className="itc-empty-text">
                    Fill in the invoice details to calculate ITC eligibility
                  </p>
                  <p className="itc-empty-hint">
                    Try loading an example from the "Examples" button above
                  </p>
                </div>
              )}

              {calculation && viewTab === "summary" && (
                <ResultSummary
                  calculation={calculation}
                  invoiceNumber={invoiceNumber}
                  onCopy={handleCopy}
                  copiedKey={copiedKey}
                  onDownloadPDF={handleDownloadPDF}
                  isGeneratingPDF={isGeneratingPDF}
                />
              )}

              {calculation && viewTab === "details" && (
                <ResultDetails
                  calculation={calculation}
                  invoiceNumber={invoiceNumber}
                  invoiceDate={invoiceDate}
                  claimDate={claimDate}
                  gstinSupplier={gstinSupplier}
                  totalInvoiceValue={parsed.totalInvoiceValue}
                  gstPaid={parsed.gstPaid}
                  itcClaimedInBooks={parsed.itcClaimedInBooks}
                  itcAvailableInGSTR2B={parsed.itcAvailableInGSTR2B}
                  isCapitalGood={isCapitalGood}
                  checkTimeLimit={checkTimeLimit}
                  usageTaxable={parsed.usageTaxable}
                  usageExempt={parsed.usageExempt}
                  usageNonBusiness={parsed.usageNonBusiness}
                  daysPastDue={parsed.daysPastDue}
                  amountPaid={parsed.amountPaid}
                  totalPayable={parsed.totalPayable}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .itc-workspace {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          font-family: var(--font-sans);
        }

        .itc-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .itc-chrome-left,
        .itc-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .itc-btn {
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

        .itc-btn i {
          font-size: 13px;
        }

        .itc-btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        .itc-btn-icon,
        .itc-btn-ghost {
          background: transparent;
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
        }

        .itc-btn-icon:hover:not(:disabled),
        .itc-btn-ghost:hover:not(:disabled) {
          background: var(--border-faint);
          color: var(--text);
        }

        .itc-btn-icon.active {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .itc-btn-primary {
          background: var(--brand);
          color: white;
          border: none;
        }

        .itc-btn-primary:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .itc-sample-dropdown {
          position: relative;
        }

        .itc-sample-menu {
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
          .itc-sample-menu {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
        }

        .itc-sample-menu-header {
          padding: 10px 12px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .itc-sample-menu-item {
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

        .itc-sample-menu-item:hover {
          background: var(--bg-surface);
        }

        .itc-sample-menu-item i {
          font-size: 16px;
          color: var(--brand);
          flex-shrink: 0;
        }

        .itc-sample-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .itc-sample-item-content strong {
          font-size: 12.5px;
          color: var(--text);
        }

        .itc-sample-item-content span {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .itc-mobile-tabs {
          display: none;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .itc-mobile-tab {
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

        .itc-mobile-tab.active {
          color: var(--text);
        }

        .itc-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .itc-mobile-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 9px;
        }

        .itc-mobile-badge.valid {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .itc-mobile-badge.error {
          background: rgba(220, 38, 38, 0.1);
          color: #b91c1c;
        }

        @media (prefers-color-scheme: dark) {
          .itc-mobile-badge.error {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
          }
        }

        .itc-mobile-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        .itc-body {
          display: grid;
          grid-template-columns: 1fr 0.5px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .itc-divider {
          background: var(--border);
          width: 0.5px;
        }

        .itc-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .itc-panel-header {
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

        .itc-panel-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .itc-panel-title i {
          font-size: 12px;
        }

        .itc-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 600;
        }

        .itc-status-pill i {
          font-size: 9px;
        }

        .itc-status-pill.valid {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .itc-view-tabs {
          display: flex;
          gap: 0;
          height: 100%;
        }

        .itc-view-tab {
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

        .itc-view-tab i {
          font-size: 11px;
        }

        .itc-view-tab:hover {
          color: var(--text);
        }

        .itc-view-tab.active {
          color: var(--text);
        }

        .itc-view-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 6px;
          right: 6px;
          height: 1.5px;
          background: var(--brand);
          border-radius: 1.5px 1.5px 0 0;
        }

        .itc-panel-content {
          flex: 1;
          overflow: auto;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .itc-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          gap: 14px;
        }

        .itc-empty-icon {
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

        .itc-empty-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .itc-empty-text {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin: 0;
          max-width: 300px;
          line-height: 1.5;
        }

        .itc-empty-hint {
          font-size: 11.5px;
          color: var(--text-tertiary);
          margin: 0;
          font-style: italic;
        }

        .itc-spin {
          animation: itc-spin-rotate 0.8s linear infinite;
        }

        @keyframes itc-spin-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .itc-workspace {
            min-height: auto;
            border-radius: var(--radius-lg);
          }

          .itc-chrome {
            padding: 8px 12px;
          }

          .itc-btn span {
            display: none;
          }

          .itc-btn {
            padding: 0 10px;
          }

          .itc-mobile-tabs {
            display: flex;
          }

          .itc-body {
            display: block;
            position: relative;
          }

          .itc-divider {
            display: none;
          }

          .itc-panel {
            min-height: 420px;
          }

          .itc-panel.mobile-hidden {
            display: none;
          }

          .itc-panel.mobile-visible {
            display: flex;
          }

          .itc-panel-header {
            padding: 0 10px;
            gap: 6px;
          }

          .itc-panel-title {
            font-size: 9.5px;
            letter-spacing: 0.02em;
            gap: 5px;
            white-space: nowrap;
            flex-shrink: 0;
          }

          .itc-panel-title i {
            font-size: 12px;
          }

          .itc-view-tabs {
            flex-shrink: 0;
          }

          .itc-view-tab {
            padding: 0 7px;
            font-size: 10px;
            gap: 3px;
          }

          .itc-view-tab i {
            font-size: 10px;
          }

          .itc-sample-menu {
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
          .itc-workspace {
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
        }

        .itc-btn:focus-visible,
        .itc-mobile-tab:focus-visible,
        .itc-view-tab:focus-visible,
        .itc-sample-menu-item:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
          .itc-spin {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}