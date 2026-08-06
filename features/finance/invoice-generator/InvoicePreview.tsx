// features/finance/invoice-generator/InvoicePreview.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import { CURRENCY_CONFIG, PAYMENT_STATUS_CONFIG } from "./ts/invoiceRules.config";
import type { InvoiceData, InvoiceTotals } from "./ts/invoiceEngine";
import { calculateLineTotal } from "./ts/invoiceEngine";
import styles from "./style/InvoicePreview.module.css";

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
    <div className={styles.invPreview}>
      <div className={styles.invPreviewPaper}>
        <div className={styles.invPreviewHeader}>
          {invoice.companyLogo ? (
            <img src={invoice.companyLogo} alt="Company logo" className={styles.invPreviewLogo} />
          ) : invoice.companyName ? (
            <div className={styles.invPreviewWordmark}>{invoice.companyName}</div>
          ) : (
            <div className={styles.invPreviewPlaceholder}>Your Logo</div>
          )}

          <div className={styles.invPreviewTitleBlock}>
            <h1 className={styles.invPreviewTitle}>INVOICE</h1>
            <div className={styles.invPreviewMeta}>
              <div className={styles.invPreviewMetaRow}>
                <span className={styles.invPreviewMetaLabel}>Invoice #</span>
                <strong className={styles.invPreviewMetaValue}>{invoice.invoiceNumber || "—"}</strong>
              </div>
              <div className={styles.invPreviewMetaRow}>
                <span className={styles.invPreviewMetaLabel}>Issue Date:</span>
                <span className={styles.invPreviewMetaValue}>{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className={styles.invPreviewMetaRow}>
                <span className={styles.invPreviewMetaLabel}>Due Date:</span>
                <span className={styles.invPreviewMetaValue}>{formatDate(invoice.dueDate)}</span>
              </div>
              <div className={styles.invPreviewStatus} style={{ backgroundColor: `rgb(${statusConfig.bg.join(",")})`, borderColor: `rgb(${statusConfig.color.join(",")})`, color: `rgb(${statusConfig.color.join(",")})` }}>
                {statusConfig.label}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.invPreviewParties}>
          <div className={styles.invPreviewParty}>
            <div className={styles.invPreviewPartyLabel}>FROM</div>
            <div className={styles.invPreviewPartyName}>{invoice.companyName || "—"}</div>
            {invoice.companyAddress && <div className={styles.invPreviewPartyText}>{invoice.companyAddress}</div>}
            {invoice.companyGSTIN && <div className={styles.invPreviewPartyText}>GSTIN: {invoice.companyGSTIN}</div>}
            {invoice.companyEmail && <div className={styles.invPreviewPartyText}>{invoice.companyEmail}</div>}
            {invoice.companyPhone && <div className={styles.invPreviewPartyText}>{invoice.companyPhone}</div>}
          </div>

          <div className={styles.invPreviewParty}>
            <div className={styles.invPreviewPartyLabel}>BILL TO</div>
            <div className={styles.invPreviewPartyName}>{invoice.clientName || "—"}</div>
            {invoice.clientAddress && <div className={styles.invPreviewPartyText}>{invoice.clientAddress}</div>}
            {invoice.clientGSTIN && <div className={styles.invPreviewPartyText}>GSTIN: {invoice.clientGSTIN}</div>}
            {invoice.clientEmail && <div className={styles.invPreviewPartyText}>{invoice.clientEmail}</div>}
            {invoice.clientPhone && <div className={styles.invPreviewPartyText}>{invoice.clientPhone}</div>}
          </div>
        </div>

        <div className={styles.invPreviewItems}>
          <table className={styles.invPreviewTable}>
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
                  <td colSpan={5} className={styles.invPreviewEmpty}>No line items added yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.invPreviewTotals}>
          <div className={styles.invPreviewTotalsRow}>
            <span>Subtotal:</span>
            <strong>{formatCurrency(totals.subtotal, invoice.currency)}</strong>
          </div>

          {totals.taxGroups.map((group, index) => (
            <div key={index} className={styles.invPreviewTotalsRow}>
              <span>Tax @ {group.rate.toFixed(2)}%:</span>
              <strong>{formatCurrency(group.taxAmount, invoice.currency)}</strong>
            </div>
          ))}

          {totals.discountAmount > 0 && (
            <div className={`${styles.invPreviewTotalsRow} ${styles.invTotalsDiscount}`}>
              <span>Discount:</span>
              <strong>−{formatCurrency(totals.discountAmount, invoice.currency)}</strong>
            </div>
          )}

          <div className={styles.invPreviewTotalsDivider} />

          <div className={`${styles.invPreviewTotalsRow} ${styles.invTotalsGrand}`}>
            <span>GRAND TOTAL:</span>
            <strong>{formatCurrency(totals.grandTotal, invoice.currency)}</strong>
          </div>
        </div>

        {(invoice.notes || invoice.terms) && (
          <div className={styles.invPreviewNotes}>
            {invoice.notes && (
              <div className={styles.invPreviewNoteSection}>
                <div className={styles.invPreviewNoteTitle}>Notes</div>
                <div className={styles.invPreviewNoteText}>{invoice.notes}</div>
              </div>
            )}

            {invoice.terms && (
              <div className={styles.invPreviewNoteSection}>
                <div className={styles.invPreviewNoteTitle}>Terms & Conditions</div>
                <div className={styles.invPreviewNoteText}>{invoice.terms}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}