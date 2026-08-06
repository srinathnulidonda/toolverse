// features/finance/invoice-generator/Workspace.tsx
"use client";

import { logger } from "@/lib/logger";
import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/lib/tools";
import {
  calculateInvoiceTotals,
  generateInvoiceNumber,
  createEmptyLineItem,
  isValidLineItem,
  type InvoiceData,
  type InvoiceLineItem,
  type CurrencyCode,
} from "./ts/invoiceEngine";
import { useInvoiceStore } from "./ts/invoiceStore";
import { SAMPLE_INVOICES, SAMPLE_INVOICE_LABELS, type SampleInvoiceType } from "./ts/sampleData";
import { CompanyProfileForm } from "./CompanyProfileForm";
import { ClientForm } from "./ClientForm";
import { LineItemsTable } from "./LineItemsTable";
import { TotalsSummary } from "./TotalsSummary";
import { InvoicePreview } from "./InvoicePreview";
import { downloadInvoicePDF } from "./ts/invoicePdfGenerator";
import { DEFAULT_TERMS_TEMPLATES } from "./ts/invoiceRules.config";
import styles from "./style/Workspace.module.css";

type MobilePanel = "edit" | "preview";

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export default function InvoiceGeneratorWorkspace({ tool }: { tool: Tool }) {
  const {
    companyProfiles,
    clients,
    settings,
    saveInvoice,
    saveCompanyProfile,
    saveClient,
    updateLastInvoiceNumber,
  } = useInvoiceStore();

  const [invoiceNumber, setInvoiceNumber] = useState(() =>
    generateInvoiceNumber(settings.lastInvoiceNumber)
  );
  const [invoiceDate, setInvoiceDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState(getDateString(30));
  const [currency, setCurrency] = useState<CurrencyCode>(settings.defaultCurrency);
  const [paymentStatus, setPaymentStatus] = useState<"DRAFT" | "SENT" | "PAID" | "OVERDUE">("DRAFT");

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyGSTIN, setCompanyGSTIN] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientGSTIN, setClientGSTIN] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([createEmptyLineItem()]);

  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT");
  const [discountValue, setDiscountValue] = useState("0");

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("edit");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const parsed = useMemo(() => {
    return {
      discountValue: parseFloat(discountValue) || 0,
    };
  }, [discountValue]);

  const totals = useMemo(() => {
    return calculateInvoiceTotals(lineItems, discountType, parsed.discountValue);
  }, [lineItems, discountType, parsed.discountValue]);

  const currentInvoice = useMemo((): InvoiceData => {
    return {
      invoiceNumber,
      invoiceDate,
      dueDate,
      currency,
      paymentStatus,
      companyName,
      companyAddress,
      companyGSTIN,
      companyEmail,
      companyPhone,
      companyLogo,
      clientName,
      clientAddress,
      clientGSTIN,
      clientEmail,
      clientPhone,
      lineItems,
      discountType,
      discountValue: parsed.discountValue,
      notes,
      terms,
    };
  }, [
    invoiceNumber,
    invoiceDate,
    dueDate,
    currency,
    paymentStatus,
    companyName,
    companyAddress,
    companyGSTIN,
    companyEmail,
    companyPhone,
    companyLogo,
    clientName,
    clientAddress,
    clientGSTIN,
    clientEmail,
    clientPhone,
    lineItems,
    discountType,
    parsed.discountValue,
    notes,
    terms,
  ]);

  const isValidInvoice = useMemo(() => {
    return (
      invoiceNumber.trim() !== "" &&
      companyName.trim() !== "" &&
      clientName.trim() !== "" &&
      lineItems.length > 0 &&
      lineItems.some(isValidLineItem)
    );
  }, [invoiceNumber, companyName, clientName, lineItems]);

  const handleSaveInvoice = useCallback(() => {
    if (!isValidInvoice) return;

    try {
      saveInvoice(currentInvoice);
      updateLastInvoiceNumber(invoiceNumber);
      logger.info("Invoice saved successfully");
    } catch (error) {
      logger.error("Failed to save invoice:", error);
    }
  }, [isValidInvoice, currentInvoice, saveInvoice, updateLastInvoiceNumber, invoiceNumber]);

  const handleDownloadPDF = useCallback(async () => {
    if (!isValidInvoice) return;

    setIsGeneratingPDF(true);
    try {
      await downloadInvoicePDF(currentInvoice, totals);
      updateLastInvoiceNumber(invoiceNumber);
    } catch (error) {
      logger.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [isValidInvoice, currentInvoice, totals, updateLastInvoiceNumber, invoiceNumber]);

  const handleReset = useCallback(() => {
    setInvoiceNumber(generateInvoiceNumber(settings.lastInvoiceNumber));
    setInvoiceDate(getTodayString());
    setDueDate(getDateString(30));
    setCurrency(settings.defaultCurrency);
    setPaymentStatus("DRAFT");
    setCompanyName("");
    setCompanyAddress("");
    setCompanyGSTIN("");
    setCompanyEmail("");
    setCompanyPhone("");
    setCompanyLogo("");
    setClientName("");
    setClientAddress("");
    setClientGSTIN("");
    setClientEmail("");
    setClientPhone("");
    setLineItems([createEmptyLineItem()]);
    setDiscountType("FLAT");
    setDiscountValue("0");
    setNotes("");
    setTerms("");
  }, [settings]);

  const loadSample = useCallback((type: SampleInvoiceType) => {
    const sample = SAMPLE_INVOICES[type];
    setInvoiceNumber(sample.invoiceNumber);
    setInvoiceDate(sample.invoiceDate);
    setDueDate(sample.dueDate);
    setCurrency(sample.currency);
    setPaymentStatus(sample.paymentStatus);
    setCompanyName(sample.companyName);
    setCompanyAddress(sample.companyAddress);
    setCompanyGSTIN(sample.companyGSTIN);
    setCompanyEmail(sample.companyEmail);
    setCompanyPhone(sample.companyPhone);
    setCompanyLogo(sample.companyLogo);
    setClientName(sample.clientName);
    setClientAddress(sample.clientAddress);
    setClientGSTIN(sample.clientGSTIN);
    setClientEmail(sample.clientEmail);
    setClientPhone(sample.clientPhone);
    setLineItems([...sample.lineItems]);
    setDiscountType(sample.discountType);
    setDiscountValue(sample.discountValue.toString());
    setNotes(sample.notes);
    setTerms(sample.terms);
    setShowSampleMenu(false);
    setMobilePanel("edit");
  }, []);

  const handleLoadProfile = useCallback(
    (profileId: string) => {
      const profile = companyProfiles.find((p) => p.id === profileId);
      if (!profile) return;

      setCompanyName(profile.businessName);
      setCompanyAddress(profile.address);
      setCompanyGSTIN(profile.gstin);
      setCompanyEmail(profile.email);
      setCompanyPhone(profile.phone);
      setCompanyLogo(profile.logo || "");
    },
    [companyProfiles]
  );

  const handleSaveProfile = useCallback(() => {
    if (!companyName.trim()) return;

    try {
      saveCompanyProfile({
        name: companyName,
        businessName: companyName,
        address: companyAddress,
        gstin: companyGSTIN,
        email: companyEmail,
        phone: companyPhone,
        logo: companyLogo,
        isDefault: companyProfiles.length === 0,
      });
      logger.info("Company profile saved");
    } catch (error) {
      logger.error("Failed to save profile:", error);
    }
  }, [companyName, companyAddress, companyGSTIN, companyEmail, companyPhone, companyLogo, companyProfiles, saveCompanyProfile]);

  const handleLoadClient = useCallback(
    (clientId: string) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      setClientName(client.name);
      setClientAddress(client.address);
      setClientGSTIN(client.gstin);
      setClientEmail(client.email);
      setClientPhone(client.phone);
    },
    [clients]
  );

  const handleSaveClient = useCallback(() => {
    if (!clientName.trim()) return;

    try {
      saveClient({
        name: clientName,
        address: clientAddress,
        gstin: clientGSTIN,
        email: clientEmail,
        phone: clientPhone,
      });
      logger.info("Client saved");
    } catch (error) {
      logger.error("Failed to save client:", error);
    }
  }, [clientName, clientAddress, clientGSTIN, clientEmail, clientPhone, saveClient]);

  const handleLineItemChange = useCallback(
    (id: string, field: keyof InvoiceLineItem, value: any) => {
      setLineItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    },
    []
  );

  const handleAddLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, createEmptyLineItem()]);
  }, []);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  return (
    <div className={styles.invWorkspace} role="main" aria-label="Invoice Generator">
      <div className={styles.invChrome}>
        <div className={styles.invChromeLeft}>
          <div className={styles.invSampleDropdown}>
            <button
              type="button"
              className={`${styles.invBtn} ${styles.invBtnIcon}`}
              onClick={() => setShowSampleMenu((s) => !s)}
              aria-label="Load sample data"
              aria-haspopup="menu"
              aria-expanded={showSampleMenu}
            >
              <i className="ti ti-wand" aria-hidden="true" />
              <span>Examples</span>
            </button>

            {showSampleMenu && (
              <div className={styles.invSampleMenu} role="menu">
                <div className={styles.invSampleMenuHeader}>
                  <span>Load Sample Invoice</span>
                </div>
                {(Object.keys(SAMPLE_INVOICES) as SampleInvoiceType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="menuitem"
                    className={styles.invSampleMenuItem}
                    onClick={() => loadSample(type)}
                  >
                    <i className={`ti ${SAMPLE_INVOICE_LABELS[type].icon}`} aria-hidden="true" />
                    <div className={styles.invSampleItemContent}>
                      <strong>{SAMPLE_INVOICE_LABELS[type].label}</strong>
                      <span>{SAMPLE_INVOICE_LABELS[type].desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.invChromeRight}>
          <button
            type="button"
            className={`${styles.invBtn} ${styles.invBtnGhost}`}
            onClick={handleReset}
            aria-label="Reset form"
          >
            <i className="ti ti-refresh" aria-hidden="true" />
            <span>Reset</span>
          </button>

          {isValidInvoice && (
            <>
              <button
                type="button"
                className={`${styles.invBtn} ${styles.invBtnPrimary}`}
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                aria-label="Download PDF"
                aria-busy={isGeneratingPDF}
              >
                <i
                  className={`ti ${isGeneratingPDF ? "ti-loader-2 " + styles.invSpin : "ti-file-download"}`}
                  aria-hidden="true"
                />
                <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
              </button>

              <button
                type="button"
                className={`${styles.invBtn} ${styles.invBtnPrimary}`}
                onClick={handleSaveInvoice}
                aria-label="Save invoice"
              >
                <i className="ti ti-device-floppy" aria-hidden="true" />
                <span>Save</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.invMobileTabs} role="tablist" aria-label="Panel selector">
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "edit"}
          className={`${styles.invMobileTab}${mobilePanel === "edit" ? " active" : ""}`}
          onClick={() => setMobilePanel("edit")}
        >
          Edit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobilePanel === "preview"}
          className={`${styles.invMobileTab}${mobilePanel === "preview" ? " active" : ""}`}
          onClick={() => setMobilePanel("preview")}
        >
          Preview
        </button>
      </div>

      <div className={styles.invBody}>
        <div
          className={`${styles.invPanel} ${mobilePanel === "edit" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.invPanelHeader}>
            <div className={styles.invPanelTitle}>
              <i className="ti ti-pencil" aria-hidden="true" />
              Invoice Editor
            </div>
          </div>

          <div className={styles.invPanelContent}>
            <div className={styles.invEditorSections}>
              <div className={styles.invEditorSection}>
                <h3 className={styles.invSectionHeading}>Invoice Details</h3>
                <div className={styles.invMetaGrid}>
                  <div className={styles.invField}>
                    <label htmlFor="invoice-number" className={styles.invLabel}>
                      Invoice Number
                      <span className={styles.invRequired}>*</span>
                    </label>
                    <input
                      id="invoice-number"
                      type="text"
                      className={`${styles.invInput} ${styles.invInputMono}`}
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.invField}>
                    <label htmlFor="invoice-date" className={styles.invLabel}>
                      Invoice Date
                    </label>
                    <input
                      id="invoice-date"
                      type="date"
                      className={styles.invInput}
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.invField}>
                    <label htmlFor="due-date" className={styles.invLabel}>
                      Due Date
                    </label>
                    <input
                      id="due-date"
                      type="date"
                      className={styles.invInput}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.invField}>
                    <label htmlFor="currency" className={styles.invLabel}>
                      Currency
                    </label>
                    <select
                      id="currency"
                      className={styles.invSelect}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    >
                      <option value="INR">₹ INR - Indian Rupee</option>
                      <option value="USD">$ USD - US Dollar</option>
                      <option value="EUR">€ EUR - Euro</option>
                      <option value="GBP">£ GBP - British Pound</option>
                    </select>
                  </div>

                  <div className={styles.invField}>
                    <label htmlFor="payment-status" className={styles.invLabel}>
                      Payment Status
                    </label>
                    <select
                      id="payment-status"
                      className={styles.invSelect}
                      value={paymentStatus}
                      onChange={(e) =>
                        setPaymentStatus(e.target.value as "DRAFT" | "SENT" | "PAID" | "OVERDUE")
                      }
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SENT">Sent</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.invEditorSection}>
                <CompanyProfileForm
                  companyName={companyName}
                  companyAddress={companyAddress}
                  companyGSTIN={companyGSTIN}
                  companyEmail={companyEmail}
                  companyPhone={companyPhone}
                  companyLogo={companyLogo}
                  onCompanyNameChange={setCompanyName}
                  onCompanyAddressChange={setCompanyAddress}
                  onCompanyGSTINChange={setCompanyGSTIN}
                  onCompanyEmailChange={setCompanyEmail}
                  onCompanyPhoneChange={setCompanyPhone}
                  onCompanyLogoChange={setCompanyLogo}
                  savedProfiles={companyProfiles}
                  onLoadProfile={handleLoadProfile}
                  onSaveProfile={handleSaveProfile}
                />
              </div>

              <div className={styles.invEditorSection}>
                <ClientForm
                  clientName={clientName}
                  clientAddress={clientAddress}
                  clientGSTIN={clientGSTIN}
                  clientEmail={clientEmail}
                  clientPhone={clientPhone}
                  onClientNameChange={setClientName}
                  onClientAddressChange={setClientAddress}
                  onClientGSTINChange={setClientGSTIN}
                  onClientEmailChange={setClientEmail}
                  onClientPhoneChange={setClientPhone}
                  savedClients={clients}
                  onLoadClient={handleLoadClient}
                  onSaveClient={handleSaveClient}
                />
              </div>

              <div className={styles.invEditorSection}>
                <LineItemsTable
                  lineItems={lineItems}
                  currency={currency}
                  onLineItemChange={handleLineItemChange}
                  onAddLineItem={handleAddLineItem}
                  onRemoveLineItem={handleRemoveLineItem}
                />
              </div>

              <div className={styles.invEditorSection}>
                <TotalsSummary
                  totals={totals}
                  currency={currency}
                  discountType={discountType}
                  discountValue={discountValue}
                  onDiscountTypeChange={setDiscountType}
                  onDiscountValueChange={setDiscountValue}
                />
              </div>

              <div className={styles.invEditorSection}>
                <h3 className={styles.invSectionHeading}>
                  <i className="ti ti-notes" aria-hidden="true" />
                  Notes & Terms
                </h3>

                <div className={styles.invField}>
                  <label htmlFor="notes" className={styles.invLabel}>
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    className={styles.invTextarea}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes for your client..."
                    rows={3}
                  />
                </div>

                <div className={styles.invField}>
                  <label htmlFor="terms" className={styles.invLabel}>
                    Terms & Conditions
                  </label>
                  <div className={styles.invTermsTemplates}>
                    {DEFAULT_TERMS_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className={styles.invTemplateBtn}
                        onClick={() => setTerms(template.content)}
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    id="terms"
                    className={styles.invTextarea}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Payment terms, bank details, etc..."
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.invDivider} aria-hidden="true" />

        <div
          className={`${styles.invPanel} ${mobilePanel === "preview" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.invPanelHeader}>
            <div className={styles.invPanelTitle}>
              <i className="ti ti-eye" aria-hidden="true" />
              Live Preview
            </div>
          </div>

          <div className={styles.invPanelContent}>
            <InvoicePreview invoice={currentInvoice} totals={totals} />
          </div>
        </div>
      </div>
    </div>
  );
}