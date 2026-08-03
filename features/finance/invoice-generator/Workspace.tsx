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
} from "./invoiceEngine";
import { useInvoiceStore } from "./invoiceStore";
import { SAMPLE_INVOICES, SAMPLE_INVOICE_LABELS, type SampleInvoiceType } from "./sampleData";
import { CompanyProfileForm } from "./CompanyProfileForm";
import { ClientForm } from "./ClientForm";
import { LineItemsTable } from "./LineItemsTable";
import { TotalsSummary } from "./TotalsSummary";
import { InvoicePreview } from "./InvoicePreview";
import { downloadInvoicePDF } from "./invoicePdfGenerator";
import { DEFAULT_TERMS_TEMPLATES } from "./invoiceRules.config";

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
    <>
      <div className="inv-workspace" role="main" aria-label="Invoice Generator">
        <div className="inv-chrome">
          <div className="inv-chrome-left">
            <div className="inv-sample-dropdown">
              <button
                type="button"
                className="inv-btn inv-btn-icon"
                onClick={() => setShowSampleMenu((s) => !s)}
                aria-label="Load sample data"
                aria-haspopup="menu"
                aria-expanded={showSampleMenu}
              >
                <i className="ti ti-wand" aria-hidden="true" />
                <span>Examples</span>
              </button>

              {showSampleMenu && (
                <div className="inv-sample-menu" role="menu">
                  <div className="inv-sample-menu-header">
                    <span>Load Sample Invoice</span>
                  </div>
                  {(Object.keys(SAMPLE_INVOICES) as SampleInvoiceType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="menuitem"
                      className="inv-sample-menu-item"
                      onClick={() => loadSample(type)}
                    >
                      <i className={`ti ${SAMPLE_INVOICE_LABELS[type].icon}`} aria-hidden="true" />
                      <div className="inv-sample-item-content">
                        <strong>{SAMPLE_INVOICE_LABELS[type].label}</strong>
                        <span>{SAMPLE_INVOICE_LABELS[type].desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="inv-chrome-right">
            <button
              type="button"
              className="inv-btn inv-btn-ghost"
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
                  className="inv-btn inv-btn-primary"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  aria-label="Download PDF"
                  aria-busy={isGeneratingPDF}
                >
                  <i
                    className={`ti ${isGeneratingPDF ? "ti-loader-2 inv-spin" : "ti-file-download"}`}
                    aria-hidden="true"
                  />
                  <span>{isGeneratingPDF ? "Generating…" : "Export PDF"}</span>
                </button>

                <button
                  type="button"
                  className="inv-btn inv-btn-primary"
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

        <div className="inv-mobile-tabs" role="tablist" aria-label="Panel selector">
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === "edit"}
            className={`inv-mobile-tab${mobilePanel === "edit" ? " active" : ""}`}
            onClick={() => setMobilePanel("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === "preview"}
            className={`inv-mobile-tab${mobilePanel === "preview" ? " active" : ""}`}
            onClick={() => setMobilePanel("preview")}
          >
            Preview
          </button>
        </div>

        <div className="inv-body">
          <div
            className={`inv-panel inv-panel-edit${mobilePanel === "edit" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="inv-panel-header">
              <div className="inv-panel-title">
                <i className="ti ti-pencil" aria-hidden="true" />
                Invoice Editor
              </div>
            </div>

            <div className="inv-panel-content">
              <div className="inv-editor-sections">
                <div className="inv-editor-section">
                  <h3 className="inv-section-heading">Invoice Details</h3>
                  <div className="inv-meta-grid">
                    <div className="inv-field">
                      <label htmlFor="invoice-number" className="inv-label">
                        Invoice Number
                        <span className="inv-required">*</span>
                      </label>
                      <input
                        id="invoice-number"
                        type="text"
                        className="inv-input inv-input-mono"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="inv-field">
                      <label htmlFor="invoice-date" className="inv-label">
                        Invoice Date
                      </label>
                      <input
                        id="invoice-date"
                        type="date"
                        className="inv-input"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                      />
                    </div>

                    <div className="inv-field">
                      <label htmlFor="due-date" className="inv-label">
                        Due Date
                      </label>
                      <input
                        id="due-date"
                        type="date"
                        className="inv-input"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>

                    <div className="inv-field">
                      <label htmlFor="currency" className="inv-label">
                        Currency
                      </label>
                      <select
                        id="currency"
                        className="inv-select"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      >
                        <option value="INR">₹ INR - Indian Rupee</option>
                        <option value="USD">$ USD - US Dollar</option>
                        <option value="EUR">€ EUR - Euro</option>
                        <option value="GBP">£ GBP - British Pound</option>
                      </select>
                    </div>

                    <div className="inv-field">
                      <label htmlFor="payment-status" className="inv-label">
                        Payment Status
                      </label>
                      <select
                        id="payment-status"
                        className="inv-select"
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

                <div className="inv-editor-section">
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

                <div className="inv-editor-section">
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

                <div className="inv-editor-section">
                  <LineItemsTable
                    lineItems={lineItems}
                    currency={currency}
                    onLineItemChange={handleLineItemChange}
                    onAddLineItem={handleAddLineItem}
                    onRemoveLineItem={handleRemoveLineItem}
                  />
                </div>

                <div className="inv-editor-section">
                  <TotalsSummary
                    totals={totals}
                    currency={currency}
                    discountType={discountType}
                    discountValue={discountValue}
                    onDiscountTypeChange={setDiscountType}
                    onDiscountValueChange={setDiscountValue}
                  />
                </div>

                <div className="inv-editor-section">
                  <h3 className="inv-section-heading">
                    <i className="ti ti-notes" aria-hidden="true" />
                    Notes & Terms
                  </h3>

                  <div className="inv-field">
                    <label htmlFor="notes" className="inv-label">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      className="inv-textarea"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes for your client..."
                      rows={3}
                    />
                  </div>

                  <div className="inv-field">
                    <label htmlFor="terms" className="inv-label">
                      Terms & Conditions
                    </label>
                    <div className="inv-terms-templates">
                      {DEFAULT_TERMS_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          className="inv-template-btn"
                          onClick={() => setTerms(template.content)}
                        >
                          {template.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      id="terms"
                      className="inv-textarea"
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

          <div className="inv-divider" aria-hidden="true" />

          <div
            className={`inv-panel inv-panel-preview${mobilePanel === "preview" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="inv-panel-header">
              <div className="inv-panel-title">
                <i className="ti ti-eye" aria-hidden="true" />
                Live Preview
              </div>
            </div>

            <div className="inv-panel-content">
              <InvoicePreview invoice={currentInvoice} totals={totals} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .inv-workspace {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 680px;
          font-family: var(--font-sans);
        }

        .inv-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }

        .inv-chrome-left,
        .inv-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .inv-btn {
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

        .inv-btn i {
          font-size: 13px;
        }

        .inv-btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        .inv-btn-icon,
        .inv-btn-ghost {
          background: transparent;
          border: 0.5px solid var(--border);
          color: var(--text-secondary);
        }

        .inv-btn-icon:hover:not(:disabled),
        .inv-btn-ghost:hover:not(:disabled) {
          background: var(--border-faint);
          color: var(--text);
        }

        .inv-btn-primary {
          background: var(--brand);
          color: white;
          border: none;
        }

        .inv-btn-primary:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .inv-sample-dropdown {
          position: relative;
        }

        .inv-sample-menu {
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
          .inv-sample-menu {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
        }

        .inv-sample-menu-header {
          padding: 10px 12px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border-faint);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .inv-sample-menu-item {
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

        .inv-sample-menu-item:hover {
          background: var(--bg-surface);
        }

        .inv-sample-menu-item i {
          font-size: 16px;
          color: var(--brand);
          flex-shrink: 0;
        }

        .inv-sample-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .inv-sample-item-content strong {
          font-size: 12.5px;
          color: var(--text);
        }

        .inv-sample-item-content span {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .inv-mobile-tabs {
          display: none;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .inv-mobile-tab {
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

        .inv-mobile-tab.active {
          color: var(--text);
        }

        .inv-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .inv-body {
          display: grid;
          grid-template-columns: 1fr 0.5px 1fr;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .inv-divider {
          background: var(--border);
          width: 0.5px;
        }

        .inv-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .inv-panel-header {
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

        .inv-panel-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .inv-panel-title i {
          font-size: 12px;
        }

        .inv-panel-content {
          flex: 1;
          overflow: auto;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .inv-editor-sections {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .inv-editor-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inv-section-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .inv-section-heading i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .inv-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .inv-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .inv-label {
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-sans);
        }

        .inv-required {
          color: #B91C1C;
          font-size: 13px;
        }

        @media (prefers-color-scheme: dark) {
          .inv-required {
            color: #F87171;
          }
        }

        .inv-input,
        .inv-select,
        .inv-textarea {
          padding: 0 12px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
          transition: all 0.12s;
        }

        .inv-input {
          height: 40px;
        }

        .inv-select {
          height: 40px;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        .inv-textarea {
          padding: 10px 12px;
          resize: vertical;
          min-height: 60px;
        }

        .inv-input:focus,
        .inv-select:focus,
        .inv-textarea:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px var(--brand-light);
        }

        .inv-input-mono {
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .inv-terms-templates {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .inv-template-btn {
          padding: 4px 10px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .inv-template-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .inv-spin {
          animation: inv-spin-rotate 0.8s linear infinite;
        }

        @keyframes inv-spin-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .inv-workspace {
            min-height: auto;
            border-radius: var(--radius-lg);
          }

          .inv-chrome {
            padding: 8px 12px;
          }

          .inv-btn span {
            display: none;
          }

          .inv-btn {
            padding: 0 10px;
          }

          .inv-mobile-tabs {
            display: flex;
          }

          .inv-body {
            display: block;
            position: relative;
          }

          .inv-divider {
            display: none;
          }

          .inv-panel {
            min-height: 420px;
          }

          .inv-panel.mobile-hidden {
            display: none;
          }

          .inv-panel.mobile-visible {
            display: flex;
          }

          .inv-panel-header {
            padding: 0 10px;
            gap: 6px;
          }

          .inv-panel-title {
            font-size: 9.5px;
            letter-spacing: 0.02em;
            gap: 5px;
            white-space: nowrap;
            flex-shrink: 0;
          }

          .inv-panel-title i {
            font-size: 12px;
          }

          .inv-editor-sections {
            padding: 16px;
          }

          /* Mobile-specific layout for invoice details */
          .inv-meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          /* Invoice Number - full width */
          .inv-meta-grid .inv-field:nth-child(1) {
            grid-column: 1 / -1;
          }

          /* Invoice Date and Due Date - side by side */
          .inv-meta-grid .inv-field:nth-child(2) {
            grid-column: 1;
          }

          .inv-meta-grid .inv-field:nth-child(3) {
            grid-column: 2;
          }

          /* Currency and Payment Status - side by side */
          .inv-meta-grid .inv-field:nth-child(4) {
            grid-column: 1;
          }

          .inv-meta-grid .inv-field:nth-child(5) {
            grid-column: 2;
          }

          /* Extra small screens - stack everything */
          @media (max-width: 320px) {
            .inv-meta-grid {
              grid-template-columns: 1fr;
            }

            .inv-meta-grid .inv-field:nth-child(1),
            .inv-meta-grid .inv-field:nth-child(2),
            .inv-meta-grid .inv-field:nth-child(3),
            .inv-meta-grid .inv-field:nth-child(4),
            .inv-meta-grid .inv-field:nth-child(5) {
              grid-column: 1 / -1;
            }
          }

          .inv-section-heading {
            font-size: 13px;
          }

          .inv-section-heading i {
            font-size: 16px;
          }

          .inv-label {
            font-size: 11.5px;
          }

          .inv-input,
          .inv-select,
          .inv-textarea {
            padding: 0 12px;
            height: 40px;
            font-size: 13px;
          }

          .inv-textarea {
            padding: 10px 12px;
            min-height: 60px;
          }

          .inv-template-btn {
            padding: 4px 10px;
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .inv-workspace {
            border-radius: 0;
            border-left: none;
            border-right: none;
          }

          .inv-panel-header {
            padding: 0 10px;
            gap: 6px;
          }

          .inv-panel-title {
            font-size: 9.5px;
            letter-spacing: 0.02em;
            gap: 5px;
            white-space: nowrap;
            flex-shrink: 0;
          }

          .inv-panel-title i {
            font-size: 12px;
          }

          .inv-editor-sections {
            padding: 16px;
          }

          .inv-meta-grid {
            grid-template-columns: 1fr;
          }

          .inv-section-heading {
            font-size: 13px;
          }

          .inv-section-heading i {
            font-size: 16px;
          }

          .inv-label {
            font-size: 11.5px;
          }

          .inv-input,
          .inv-select,
          .inv-textarea {
            padding: 0 12px;
            height: 40px;
            font-size: 13px;
          }

          .inv-textarea {
            padding: 10px 12px;
            min-height: 60px;
          }

          .inv-template-btn {
            padding: 4px 10px;
            font-size: 11px;
          }

          /* Additional tweaks for very small screens (like 320px width) */
          @media (max-width: 320px) {
            .inv-section-heading {
              font-size: 12px;
            }

            .inv-section-heading i {
              font-size: 14px;
            }

            .inv-label {
              font-size: 11px;
            }

            .inv-input,
            .inv-select,
            .inv-textarea {
              font-size: 12px;
              height: 36px;
            }

            .inv-textarea {
              min-height: 50px;
            }

            .inv-template-btn {
              font-size: 10px;
              padding: 3px 8px;
            }
          }
        }

        .inv-btn:focus-visible,
        .inv-mobile-tab:focus-visible,
        .inv-sample-menu-item:focus-visible,
        .inv-template-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
          .inv-spin {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}