// features/finance/invoice-generator/LineItemsTable.tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import { calculateLineTotal } from "./ts/invoiceEngine";
import type { InvoiceLineItem, CurrencyCode } from "./ts/invoiceEngine";
import { TAX_RATE_PRESETS } from "./ts/invoiceRules.config";
import styles from "./style/LineItemsTable.module.css";

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
    <div className={styles.invLineItems}>
      <div className={styles.invItemsHeader}>
        <h3 className={styles.invItemsTitle}>
          <i className="ti ti-list" aria-hidden="true" />
          Line Items
        </h3>
        <button type="button" className={`${styles.invBtn} ${styles.invBtnAdd}`} onClick={onAddLineItem}>
          <i className="ti ti-plus" aria-hidden="true" />
          Add Item
        </button>
      </div>

      <div className={styles.invItemsDesktop}>
        <table className={styles.invTable}>
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
                    className={styles.invTableInput}
                    value={item.description}
                    onChange={(e) => onLineItemChange(item.id, "description", e.target.value)}
                    placeholder="Item description"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={`${styles.invTableInput} ${styles.invTableInputNumber}`}
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
                    className={`${styles.invTableInput} ${styles.invTableInputNumber}`}
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
                    className={styles.invTableSelect}
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
                <td className={styles.invTableTotal}>{formatCurrency(calculateLineTotal(item), currency)}</td>
                <td>
                  <button
                    type="button"
                    className={styles.invTableRemove}
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

      <div className={styles.invItemsMobile}>
        {lineItems.map((item, index) => (
          <div key={item.id} className={styles.invItemCard}>
            <div className={styles.invItemCardHeader}>
              <span className={styles.invItemNumber}>#{index + 1}</span>
              <button
                type="button"
                className={styles.invItemRemove}
                onClick={() => onRemoveLineItem(item.id)}
                aria-label="Remove item"
              >
                <i className="ti ti-trash" aria-hidden="true" />
              </button>
            </div>

            <div className={styles.invItemField}>
              <label className={styles.invItemLabel}>Description</label>
              <input
                type="text"
                className={styles.invItemInput}
                value={item.description}
                onChange={(e) => onLineItemChange(item.id, "description", e.target.value)}
                placeholder="Item description"
              />
            </div>

            <div className={styles.invItemRow}>
              <div className={styles.invItemField}>
                <label className={styles.invItemLabel}>Qty</label>
                <input
                  type="number"
                  className={styles.invItemInput}
                  value={item.quantity}
                  onChange={(e) =>
                    onLineItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="1"
                />
              </div>

              <div className={styles.invItemField}>
                <label className={styles.invItemLabel}>Unit Price</label>
                <input
                  type="number"
                  className={styles.invItemInput}
                  value={item.unitPrice}
                  onChange={(e) =>
                    onLineItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.invItemRow}>
              <div className={styles.invItemField}>
                <label className={styles.invItemLabel}>Tax</label>
                <select
                  className={styles.invItemSelect}
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

              <div className={styles.invItemField}>
                <strong className={styles.invItemTotalValue}>
                  {formatCurrency(calculateLineTotal(item), currency)}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lineItems.length === 0 && (
        <div className={styles.invItemsEmpty}>
          <i className="ti ti-package-off" aria-hidden="true" />
          <p>No line items yet. Click "Add Item" to get started.</p>
        </div>
      )}
    </div>
  );
}