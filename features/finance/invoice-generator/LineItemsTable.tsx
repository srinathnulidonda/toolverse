// features/finance/invoice-generator/LineItemsTable.tsx

"use client";

import { formatCurrency } from "@/lib/utils";
import { calculateLineTotal } from "./invoiceEngine";
import type { InvoiceLineItem, CurrencyCode } from "./invoiceEngine";
import { TAX_RATE_PRESETS } from "./invoiceRules.config";

type LineItemsTableProps = {
    lineItems: InvoiceLineItem[];
    currency: CurrencyCode;
    onLineItemChange: (id: string, field: keyof InvoiceLineItem, value: any) => void;
    onAddLineItem: () => void;
    onRemoveLineItem: (id: string) => void;
};

export function LineItemsTable({
    lineItems,
    currency,
    onLineItemChange,
    onAddLineItem,
    onRemoveLineItem,
}: LineItemsTableProps) {
    return (
        <div className="inv-line-items">
            <div className="inv-items-header">
                <h3 className="inv-items-title">
                    <i className="ti ti-list" aria-hidden="true" />
                    Line Items
                </h3>
                <button type="button" className="inv-btn inv-btn-add" onClick={onAddLineItem}>
                    <i className="ti ti-plus" aria-hidden="true" />
                    Add Item
                </button>
            </div>

            <div className="inv-items-desktop">
                <table className="inv-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Tax %</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <input
                                        type="text"
                                        className="inv-table-input"
                                        value={item.description}
                                        onChange={(e) => onLineItemChange(item.id, "description", e.target.value)}
                                        placeholder="Item description"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="inv-table-input inv-table-input-number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            onLineItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)
                                        }
                                        min="0"
                                        step="1"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="inv-table-input inv-table-input-number"
                                        value={item.unitPrice}
                                        onChange={(e) =>
                                            onLineItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                                        }
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <select
                                        className="inv-table-select"
                                        value={item.taxRate}
                                        onChange={(e) =>
                                            onLineItemChange(item.id, "taxRate", parseFloat(e.target.value))
                                        }
                                    >
                                        {TAX_RATE_PRESETS.map((preset) => (
                                            <option key={preset.rate} value={preset.rate}>
                                                {preset.rate}%
                                            </option>
                                        ))}
                                        {!TAX_RATE_PRESETS.find((p) => p.rate === item.taxRate) && (
                                            <option value={item.taxRate}>{item.taxRate}%</option>
                                        )}
                                    </select>
                                </td>
                                <td className="inv-table-total">{formatCurrency(calculateLineTotal(item), currency)}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="inv-table-remove"
                                        onClick={() => onRemoveLineItem(item.id)}
                                        aria-label="Remove item"
                                    >
                                        <i className="ti ti-trash" aria-hidden="true" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="inv-items-mobile">
                {lineItems.map((item, index) => (
                    <div key={item.id} className="inv-item-card">
                        <div className="inv-item-card-header">
                            <span className="inv-item-number">#{index + 1}</span>
                            <button
                                type="button"
                                className="inv-item-remove"
                                onClick={() => onRemoveLineItem(item.id)}
                                aria-label="Remove item"
                            >
                                <i className="ti ti-trash" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="inv-item-field">
                            <label className="inv-item-label">Description</label>
                            <input
                                type="text"
                                className="inv-item-input"
                                value={item.description}
                                onChange={(e) => onLineItemChange(item.id, "description", e.target.value)}
                                placeholder="Item description"
                            />
                        </div>

                        <div className="inv-item-row">
                            <div className="inv-item-field">
                                <label className="inv-item-label">Qty</label>
                                <input
                                    type="number"
                                    className="inv-item-input"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        onLineItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)
                                    }
                                    min="0"
                                    step="1"
                                />
                            </div>

                            <div className="inv-item-field">
                                <label className="inv-item-label">Unit Price</label>
                                <input
                                    type="number"
                                    className="inv-item-input"
                                    value={item.unitPrice}
                                    onChange={(e) =>
                                        onLineItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                                    }
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="inv-item-field">
                                <label className="inv-item-label">Tax</label>
                                <select
                                    className="inv-item-select"
                                    value={item.taxRate}
                                    onChange={(e) =>
                                        onLineItemChange(item.id, "taxRate", parseFloat(e.target.value))
                                    }
                                >
                                    {TAX_RATE_PRESETS.map((preset) => (
                                        <option key={preset.rate} value={preset.rate}>
                                            {preset.rate}%
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="inv-item-total-row">
                            <span className="inv-item-total-label">Total:</span>
                            <strong className="inv-item-total-value">
                                {formatCurrency(calculateLineTotal(item), currency)}
                            </strong>
                        </div>
                    </div>
                ))}
            </div>

            {lineItems.length === 0 && (
                <div className="inv-items-empty">
                    <i className="ti ti-package-off" aria-hidden="true" />
                    <p>No line items yet. Click "Add Item" to get started.</p>
                </div>
            )}

            <style jsx>{`
        .inv-line-items {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inv-items-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .inv-items-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          font-family: var(--font-sans);
        }

        .inv-items-title i {
          font-size: 16px;
          color: var(--text-secondary);
        }

        .inv-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.12s;
          border: none;
          outline: none;
        }

        .inv-btn i {
          font-size: 14px;
        }

        .inv-btn-add {
          background: var(--brand);
          color: white;
        }

        .inv-btn-add:hover {
          background: var(--brand-hover);
        }

        .inv-items-desktop {
          display: block;
          overflow-x: auto;
        }

        .inv-items-mobile {
          display: none;
        }

        .inv-table {
          width: 100%;
          border-collapse: collapse;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .inv-table thead {
          background: var(--bg-surface);
        }

        .inv-table th {
          padding: 10px 8px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 0.5px solid var(--border);
          font-family: var(--font-sans);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .inv-table th:nth-child(2),
        .inv-table th:nth-child(3),
        .inv-table th:nth-child(4),
        .inv-table th:nth-child(5) {
          text-align: center;
          width: 100px;
        }

        .inv-table th:last-child {
          width: 40px;
        }

        .inv-table tbody tr {
          border-bottom: 0.5px solid var(--border-faint);
        }

        .inv-table tbody tr:last-child {
          border-bottom: none;
        }

        .inv-table td {
          padding: 8px;
        }

        .inv-table-input {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          color: var(--text);
          font-size: 12.5px;
          font-family: var(--font-sans);
          outline: none;
          transition: all 0.12s;
        }

        .inv-table-input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 2px var(--brand-light);
        }

        .inv-table-input-number {
          font-family: var(--font-mono);
          text-align: right;
        }

        .inv-table-select {
          width: 100%;
          height: 36px;
          padding: 0 28px 0 10px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          color: var(--text);
          font-size: 12.5px;
          font-family: var(--font-mono);
          cursor: pointer;
          outline: none;
          transition: all 0.12s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
        }

        .inv-table-select:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 2px var(--brand-light);
        }

        .inv-table-total {
          text-align: right;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-mono);
        }

        .inv-table-remove {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .inv-table-remove:hover {
          background: rgba(220, 38, 38, 0.1);
          color: #DC2626;
        }

        .inv-table-remove i {
          font-size: 16px;
        }

        .inv-item-card {
          padding: 14px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .inv-item-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .inv-item-number {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }

        .inv-item-remove {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: none;
          background: rgba(220, 38, 38, 0.1);
          color: #DC2626;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .inv-item-remove i {
          font-size: 16px;
        }

        .inv-item-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .inv-item-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .inv-item-input,
        .inv-item-select {
          height: 36px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
        }

        .inv-item-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 32px;
        }

        .inv-item-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .inv-item-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          border-radius: var(--radius-sm);
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
        }

        .inv-item-total-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .inv-item-total-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--brand-text);
          font-family: var(--font-mono);
        }

        .inv-items-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 40px 20px;
          text-align: center;
          color: var(--text-tertiary);
        }

        .inv-items-empty i {
          font-size: 32px;
        }

        .inv-items-empty p {
          margin: 0;
          font-size: 12.5px;
          font-family: var(--font-sans);
        }

        @media (max-width: 768px) {
          .inv-items-desktop {
            display: none;
          }

          .inv-items-mobile {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .inv-btn,
          .inv-table-input,
          .inv-table-select,
          .inv-table-remove {
            transition: none;
          }
        }
      `}</style>
        </div>
    );
}