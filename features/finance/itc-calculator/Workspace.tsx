// features/finance/itc-calculator/Workspace.tsx
"use client";
import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import {
  calculateITCEligibility,
  type ITCInvoiceInput,
  type ITCCalculationResult,
} from "./ts/itcEngine";
import { useITCStore } from "./ts/itcStore";
import { SAMPLE_INVOICES, SAMPLE_INVOICE_LABELS, type SampleInvoiceType } from "./ts/sampleData";
import { SettingsPanel } from "./SettingsPanel";
import { InvoiceInputForm } from "./InvoiceInputForm";
import { ResultSummary } from "./ResultSummary";
import { ResultDetails } from "./ResultDetails";
import { downloadITCReportPDF, type ITCReportData } from "./ts/itcPdfGenerator";
import styles from "./style/Workspace.module.css";

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
    <div className={styles.itcWorkspace} role="main" aria-label="ITC Calculator">
      <div className={styles.itcChrome}>
        <div className={styles.itcChromeLeft}>
          <button
            type="button"
            className={`${styles.itcBtn} ${styles.itcBtnIcon}${showSettings ? " active" : ""}`}
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Toggle settings"
            aria-expanded={showSettings}
          >
            <i className="ti ti-adjustments" aria-hidden="true" />
            <span>Settings</span>
          </button>

          <div className={styles.itcSampleDropdown}>
            <button
              type="button"
              className={`${styles.itcBtn} ${styles.itcBtnIcon}`}
              onClick={() => setShowSampleMenu((s) => !s)}
              aria-label="Load sample data"
              aria-haspopup="menu"
              aria-expanded={showSampleMenu}
            >
              <i className="ti ti-wand" aria-hidden="true" />
              <span>Examples</span>
            </button>

            {showSampleMenu && (
              <div className={styles.itcSampleMenu} role="menu">
                <div className={styles.itcSampleMenuHeader}>
                  <span>Load Sample Invoice</span>
                </div>
                {(Object.keys(SAMPLE_INVOICES) as SampleInvoiceType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="menuitem"
                    className={styles.itcSampleMenuItem}
                    onClick={() => loadSample(type)}
                  >
                    <i className={`ti ${SAMPLE_INVOICE_LABELS[type].icon}`} aria-hidden="true" />
                    <div className={styles.itcSampleItemContent}>
                      <strong>{SAMPLE_INVOICE_LABELS[type].label}</strong>
                      <span>{SAMPLE_INVOICE_LABELS[type].desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.itcChromeRight}>
          <button
            type="button"
            className={`${styles.itcBtn} ${styles.itcBtnGhost}`}
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
              className={`${styles.itcBtn} ${styles.itcBtnPrimary}`}
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              aria-label="Download PDF report"
              aria-busy={isGeneratingPDF}
            >
              <i
                className={`ti ${isGeneratingPDF ? `ti-loader-2 ${styles.itcSpin}` : "ti-file-download"}`}
                aria-hidden="true"
              />
              <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
            </button>
          )}

          {calculation && (
            <button
              type="button"
              className={`${styles.itcBtn} ${styles.itcBtnPrimary}`}
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

      <div className={styles.itcMobileTabs} role="tablist" aria-label="Panel selector">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "input"}
          className={`${styles.itcMobileTab}${mobilePanel === "input" ? " active" : ""}`}
          onClick={() => setMobilePanel("input")}
        >
          Input
          {!isValidForm && invoiceNumber && (
            <span className={`${styles.itcMobileBadge} error`}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
            </span>
          )}
          {isValidForm && (
            <span className={`${styles.itcMobileBadge} valid`}>
              <i className="ti ti-check" aria-hidden="true" />
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "output"}
          className={`${styles.itcMobileTab}${mobilePanel === "output" ? " active" : ""}`}
          onClick={() => setMobilePanel("output")}
        >
          Result
          {calculation && <span className={styles.itcMobileDot} />}
        </button>
      </div>

      <div className={styles.itcBody}>
        <div
          className={`${styles.itcPanel} ${mobilePanel === "input" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.itcPanelHeader}>
            <div className={styles.itcPanelTitle}>
              <i className="ti ti-pencil" aria-hidden="true" />
              Invoice Details
            </div>
            {isValidForm && (
              <span className={`${styles.itcStatusPill} valid`}>
                <i className="ti ti-check" aria-hidden="true" />
                Valid
              </span>
            )}
          </div>

          <div className={styles.itcPanelContent}>
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

        <div className={styles.itcDivider} aria-hidden="true" />

        <div
          className={`${styles.itcPanel} ${mobilePanel === "output" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.itcPanelHeader}>
            <div className={styles.itcPanelTitle}>
              <i className="ti ti-report-money" aria-hidden="true" />
              Calculation Result
            </div>

            {calculation && (
              <div className={styles.itcViewTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  className={`${styles.itcViewTab}${viewTab === "summary" ? " active" : ""}`}
                  onClick={() => setViewTab("summary")}
                  aria-selected={viewTab === "summary"}
                >
                  <i className="ti ti-sum" aria-hidden="true" />
                  Summary
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`${styles.itcViewTab}${viewTab === "details" ? " active" : ""}`}
                  onClick={() => setViewTab("details")}
                  aria-selected={viewTab === "details"}
                >
                  <i className="ti ti-list-details" aria-hidden="true" />
                  Details
                </button>
              </div>
            )}
          </div>

          <div className={styles.itcPanelContent}>
            {!calculation && (
              <div className={styles.itcEmpty}>
                <div className={styles.itcEmptyIcon}>
                  <i className="ti ti-calculator" aria-hidden="true" />
                </div>
                <h3 className={styles.itcEmptyTitle}>No Calculation Yet</h3>
                <p className={styles.itcEmptyText}>
                  Fill in the invoice details to calculate ITC eligibility
                </p>
                <p className={styles.itcEmptyHint}>
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
  );
}