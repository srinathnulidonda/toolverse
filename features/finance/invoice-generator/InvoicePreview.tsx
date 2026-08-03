// features/finance/invoice-generator/InvoicePreview.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import { CURRENCY_CONFIG, PAYMENT_STATUS_CONFIG } from "./invoiceRules.config";
import type { InvoiceData, InvoiceTotals } from "./invoiceEngine";
import { calculateLineTotal } from "./invoiceEngine";

type InvoicePreviewProps = {
    invoice: InvoiceData;
    totals: InvoiceTotals;
};

export function InvoicePreview({ invoice, totals }: InvoicePreviewProps) {
    const statusConfig = PAYMENT_STATUS_CONFIG[invoice.paymentStatus];
    const currencySymbol = CURRENCY_CONFIG[invoice.currency].symbol;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="inv-preview">
            <div className="inv-preview-paper">
                <div className="inv-preview-header">
                    {invoice.companyLogo ? (
                        <img src={invoice.companyLogo} alt="Company logo" className="inv-preview-logo" />
                    ) : invoice.companyName ? (
                        <div className="inv-preview-wordmark">{invoice.companyName}</div>
                    ) : (
                        <div className="inv-preview-placeholder">Your Logo</div>
                    )}

                    <div className="inv-preview-title-block">
                        <h1 className="inv-preview-title">INVOICE</h1>
                        <div className="inv-preview-meta">
                            <div className="inv-preview-meta-row">
                                <span className="inv-preview-meta-label">Invoice #</span>
                                <strong className="inv-preview-meta-value">{invoice.invoiceNumber || "—"}</strong>
                            </div>
                            <div className="inv-preview-meta-row">
                                <span className="inv-preview-meta-label">Issue Date:</span>
                                <span className="inv-preview-meta-value">{formatDate(invoice.invoiceDate)}</span>
                            </div>
                            <div className="inv-preview-meta-row">
                                <span className="inv-preview-meta-label">Due Date:</span>
                                <span className="inv-preview-meta-value">{formatDate(invoice.dueDate)}</span>
                            </div>
                            <div className="inv-preview-status" style={{ backgroundColor: `rgb(${statusConfig.bg.join(",")})`, borderColor: `rgb(${statusConfig.color.join(",")})`, color: `rgb(${statusConfig.color.join(",")})` }}>
                                {statusConfig.label}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="inv-preview-parties">
                    <div className="inv-preview-party">
                        <div className="inv-preview-party-label">FROM</div>
                        <div className="inv-preview-party-name">{invoice.companyName || "—"}</div>
                        {invoice.companyAddress && <div className="inv-preview-party-text">{invoice.companyAddress}</div>}
                        {invoice.companyGSTIN && <div className="inv-preview-party-text">GSTIN: {invoice.companyGSTIN}</div>}
                        {invoice.companyEmail && <div className="inv-preview-party-text">{invoice.companyEmail}</div>}
                        {invoice.companyPhone && <div className="inv-preview-party-text">{invoice.companyPhone}</div>}
                    </div>

                    <div className="inv-preview-party">
                        <div className="inv-preview-party-label">BILL TO</div>
                        <div className="inv-preview-party-name">{invoice.clientName || "—"}</div>
                        {invoice.clientAddress && <div className="inv-preview-party-text">{invoice.clientAddress}</div>}
                        {invoice.clientGSTIN && <div className="inv-preview-party-text">GSTIN: {invoice.clientGSTIN}</div>}
                        {invoice.clientEmail && <div className="inv-preview-party-text">{invoice.clientEmail}</div>}
                        {invoice.clientPhone && <div className="inv-preview-party-text">{invoice.clientPhone}</div>}
                    </div>
                </div>

                <div className="inv-preview-items">
                    <table className="inv-preview-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Tax</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lineItems.length > 0 ? (
                                invoice.lineItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.description || "—"}</td>
                                        <td>{item.quantity}</td>
                                        <td>{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                                        <td>{item.taxRate.toFixed(2)}%</td>
                                        <td>{formatCurrency(calculateLineTotal(item), invoice.currency)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="inv-preview-empty">No line items added yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="inv-preview-totals">
                    <div className="inv-preview-totals-row">
                        <span>Subtotal:</span>
                        <strong>{formatCurrency(totals.subtotal, invoice.currency)}</strong>
                    </div>

                    {totals.taxGroups.map((group, index) => (
                        <div key={index} className="inv-preview-totals-row">
                            <span>Tax @ {group.rate.toFixed(2)}%:</span>
                            <strong>{formatCurrency(group.taxAmount, invoice.currency)}</strong>
                        </div>
                    ))}

                    {totals.discountAmount > 0 && (
                        <div className="inv-preview-totals-row inv-totals-discount">
                            <span>Discount:</span>
                            <strong>−{formatCurrency(totals.discountAmount, invoice.currency)}</strong>
                        </div>
                    )}

                    <div className="inv-preview-totals-divider" />

                    <div className="inv-preview-totals-row inv-totals-grand">
                        <span>GRAND TOTAL:</span>
                        <strong>{formatCurrency(totals.grandTotal, invoice.currency)}</strong>
                    </div>
                </div>

                {(invoice.notes || invoice.terms) && (
                    <div className="inv-preview-notes">
                        {invoice.notes && (
                            <div className="inv-preview-note-section">
                                <div className="inv-preview-note-title">Notes</div>
                                <div className="inv-preview-note-text">{invoice.notes}</div>
                            </div>
                        )}

                        {invoice.terms && (
                            <div className="inv-preview-note-section">
                                <div className="inv-preview-note-title">Terms & Conditions</div>
                                <div className="inv-preview-note-text">{invoice.terms}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
        .inv-preview {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          justify-content: center;
        }

        .inv-preview-paper {
          width: 100%;
          max-width: 800px;
          background: white;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          color: #1f2937;
          font-family: var(--font-sans);
        }

        @media (prefers-color-scheme: dark) {
          .inv-preview-paper {
            background: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        }

        .inv-preview-header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          margin-bottom: 32px;
          align-items: start;
        }

        .inv-preview-logo {
          max-width: 200px;
          max-height: 80px;
          object-fit: contain;
        }

        .inv-preview-wordmark {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .inv-preview-placeholder {
          padding: 20px 40px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          color: #9ca3af;
          font-size: 14px;
          text-align: center;
        }

        .inv-preview-title-block {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .inv-preview-title {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .inv-preview-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .inv-preview-meta-row {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          font-size: 13px;
        }

        .inv-preview-meta-label {
          color: #6b7280;
        }

        .inv-preview-meta-value {
          color: #1f2937;
          font-family: var(--font-mono);
        }

        .inv-preview-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          align-self: flex-end;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid;
          margin-top: 4px;
        }

        .inv-preview-parties {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          margin-bottom: 32px;
        }

        .inv-preview-party {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .inv-preview-party-label {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .inv-preview-party-name {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .inv-preview-party-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .inv-preview-items {
          margin-bottom: 24px;
        }

        .inv-preview-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .inv-preview-table thead {
          background: #145c3c;
        }

        .inv-preview-table th {
          padding: 10px 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .inv-preview-table th:nth-child(2),
        .inv-preview-table th:nth-child(3),
        .inv-preview-table th:nth-child(4),
        .inv-preview-table th:nth-child(5) {
          text-align: right;
        }

        .inv-preview-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
        }

        .inv-preview-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .inv-preview-table tbody tr:last-child {
          border-bottom: none;
        }

        .inv-preview-table td {
          padding: 10px 12px;
          font-size: 13px;
          color: #1f2937;
        }

        .inv-preview-table td:nth-child(2),
        .inv-preview-table td:nth-child(3),
        .inv-preview-table td:nth-child(4),
        .inv-preview-table td:nth-child(5) {
          text-align: right;
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .inv-preview-empty {
          text-align: center !important;
          color: #9ca3af !important;
          font-style: italic;
        }

        .inv-preview-totals {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-left: auto;
          width: 280px;
        }

        .inv-preview-totals-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          font-size: 13px;
        }

        .inv-preview-totals-row span {
          color: #6b7280;
        }

        .inv-preview-totals-row strong {
          color: #1f2937;
          font-family: var(--font-mono);
        }

        .inv-totals-discount strong {
          color: #dc2626;
        }

        .inv-preview-totals-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 4px 0;
        }

        .inv-totals-grand {
          padding: 10px;
          background: #dcfce7;
          border-radius: 6px;
          margin-top: 4px;
        }

        .inv-totals-grand span {
          font-weight: 700;
          color: #0d3f29;
        }

        .inv-totals-grand strong {
          font-size: 16px;
          font-weight: 700;
          color: #0d3f29;
        }

        .inv-preview-notes {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .inv-preview-note-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .inv-preview-note-title {
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .inv-preview-note-text {
          font-size: 12px;
          color: #4b5563;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .inv-preview {
            padding: 16px;
          }

          .inv-preview-paper {
            padding: 24px;
          }

          .inv-preview-header {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .inv-preview-title-block {
            text-align: left;
          }

          .inv-preview-title {
            font-size: 24px;
          }

          .inv-preview-meta-row {
            justify-content: flex-start;
          }

          .inv-preview-status {
            align-self: flex-start;
          }

          .inv-preview-parties {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .inv-preview-totals {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}