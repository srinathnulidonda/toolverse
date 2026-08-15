// features/dev/case-converter/CaseBatch.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { convertCase, CASE_FORMATS, type CaseType, type ConversionOptions } from "./ts/utils";
import styles from "./style/CaseBatch.module.css";

interface BatchItem {
  id: string;
  input: string;
  outputs: Partial<Record<CaseType, string>>;
}

interface CaseBatchProps {
  preserveNumbers: boolean;
  preserveAcronyms: boolean;
  onItemsChange?: (count: number) => void;
}

const SEPARATORS: { value: string; label: string }[] = [
  { value: "\n", label: "New Line" },
  { value: ",", label: "Comma (,)" },
  { value: ";", label: "Semicolon (;)" },
  { value: "|", label: "Pipe (|)" },
  { value: "\t", label: "Tab" },
];

const DEFAULT_FORMATS: CaseType[] = ["camel", "pascal", "snake", "kebab", "upper", "lower"];

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function CaseBatch({ preserveNumbers, preserveAcronyms, onItemsChange }: CaseBatchProps) {
  const [batchInput, setBatchInput] = useState("");
  const [separator, setSeparator] = useState("\n");
  const [selectedFormats, setSelectedFormats] = useState<CaseType[]>(DEFAULT_FORMATS);
  const [convertedFormats, setConvertedFormats] = useState<CaseType[]>([]);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  const lines = useMemo(() => {
    if (!batchInput.trim()) return [];
    return batchInput
      .split(separator)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [batchInput, separator]);

  const isStale =
    items.length > 0 &&
    (selectedFormats.length !== convertedFormats.length ||
      selectedFormats.some((f) => !convertedFormats.includes(f)));

  useEffect(() => {
    onItemsChange?.(items.length);
  }, [items.length, onItemsChange]);

  const handleCopy = useCallback((text: string, cellId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCell(cellId);
      setTimeout(() => setCopiedCell(null), 1500);
    });
  }, []);

  const processBatch = useCallback(() => {
    if (!lines.length || !selectedFormats.length) return;

    const options: ConversionOptions = { preserveNumbers, preserveAcronyms };

    const newItems: BatchItem[] = lines.map((input) => {
      const outputs: Partial<Record<CaseType, string>> = {};
      selectedFormats.forEach((format) => {
        outputs[format] = convertCase(input, format, options);
      });
      return { id: makeId(), input, outputs };
    });

    setItems(newItems);
    setConvertedFormats(selectedFormats);
  }, [lines, selectedFormats, preserveNumbers, preserveAcronyms]);

  const handleClear = useCallback(() => {
    setBatchInput("");
    setItems([]);
    setConvertedFormats([]);
  }, []);

  const toggleFormat = useCallback((id: CaseType) => {
    setSelectedFormats((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const selectAllFormats = useCallback(() => {
    setSelectedFormats(CASE_FORMATS.map((f) => f.id));
  }, []);

  const selectNoFormats = useCallback(() => {
    setSelectedFormats([]);
  }, []);

  const activeFormats = convertedFormats.length ? convertedFormats : selectedFormats;

  const handleCopyAll = useCallback(() => {
    if (!items.length) return;
    const header = ["#", "Input", ...activeFormats.map((f) => CASE_FORMATS.find((c) => c.id === f)?.label || f)];
    const rows = items.map((item, idx) => [
      String(idx + 1),
      item.input,
      ...activeFormats.map((f) => item.outputs[f] || ""),
    ]);
    const text = [header, ...rows].map((r) => r.join("\t")).join("\n");
    handleCopy(text, "all");
  }, [items, activeFormats, handleCopy]);

  const handleDownloadCSV = useCallback(() => {
    if (!items.length) return;
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const header = ["#", "Input", ...activeFormats.map((f) => CASE_FORMATS.find((c) => c.id === f)?.label || f)];
    const rows = items.map((item, idx) => [
      String(idx + 1),
      item.input,
      ...activeFormats.map((f) => item.outputs[f] || ""),
    ]);
    const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-batch-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items, activeFormats]);

  return (
    <div className={styles.cbRoot}>
      <div className={styles.cbSection}>
        <div className={styles.cbSectionHeader}>
          <div className={styles.cbSectionLabel}>
            <i className="ti ti-menu-2" />
            Batch Input
          </div>
          <div className={styles.cbSectionActions}>
            <button
              type="button"
              className={`${styles.cbBtn} ${styles.cbBtnPrimary}`}
              onClick={processBatch}
              disabled={!lines.length || !selectedFormats.length}
            >
              <i className="ti ti-shuffle" />
              Convert
            </button>
            <button type="button" className={styles.cbBtn} onClick={handleClear} disabled={!batchInput && !items.length}>
              <i className="ti ti-trash" />
              Clear
            </button>
          </div>
        </div>

        <textarea
          className={styles.cbTextarea}
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          placeholder="Enter multiple texts, separated by the chosen separator below..."
          spellCheck={false}
          aria-label="Batch text input"
        />

        <div className={styles.cbInputFooter}>
          <span className={styles.cbInputCount}>
            {lines.length} item{lines.length !== 1 ? "s" : ""} detected
          </span>
          <div className={styles.cbSeparatorGroup}>
            <span className={styles.cbSeparatorLabel}>Split by:</span>
            <select
              className={styles.cbSelect}
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              aria-label="Line separator"
            >
              {SEPARATORS.map((s) => (
                <option key={s.label} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.cbFormatSection}>
        <div className={styles.cbFormatHeader}>
          <span className={styles.cbFormatLabel}>Output Formats</span>
          <div className={styles.cbFormatActions}>
            <button type="button" className={styles.cbFormatActionBtn} onClick={selectAllFormats}>
              Select All
            </button>
            <button type="button" className={styles.cbFormatActionBtn} onClick={selectNoFormats}>
              Clear
            </button>
          </div>
        </div>
        <div className={styles.cbFormatGrid}>
          {CASE_FORMATS.map((format) => {
            const active = selectedFormats.includes(format.id);
            return (
              <label key={format.id} className={`${styles.cbFormatChip} ${active ? styles.active : ""}`}>
                <input type="checkbox" checked={active} onChange={() => toggleFormat(format.id)} />
                <span className={styles.cbFormatChipLabel}>{format.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {items.length > 0 && (
        <div className={styles.cbResultsSection}>
          <div className={styles.cbResultsHeader}>
            <div className={styles.cbResultsLabel}>
              <i className="ti ti-layout-template-3" />
              Results
              <span className={styles.cbResultsCount}>{items.length}</span>
            </div>
            <div className={styles.cbResultsActions}>
              <button type="button" className={styles.cbBtn} onClick={handleCopyAll}>
                <i className={`ti ${copiedCell === "all" ? "ti-check" : "ti-copy"}`} />
                {copiedCell === "all" ? "Copied" : "Copy All"}
              </button>
              <button type="button" className={styles.cbBtn} onClick={handleDownloadCSV}>
                <i className="ti ti-download" />
                CSV
              </button>
              <button type="button" className={styles.cbBtn} onClick={handleClear}>
                <i className="ti ti-trash" />
                Clear
              </button>
            </div>
          </div>

          {isStale && (
            <div className={styles.cbStaleBanner}>
              <i className="ti ti-alert-triangle" />
              <span>Formats changed since last conversion — click Convert to refresh results.</span>
            </div>
          )}

          <div className={styles.cbTableWrapper}>
            <table className={styles.cbTable}>
              <thead>
                <tr>
                  <th className={`${styles.cbTh} ${styles.cbThIndex}`}>#</th>
                  <th className={`${styles.cbTh} ${styles.cbThInput}`}>Input</th>
                  {activeFormats.map((format) => {
                    const formatInfo = CASE_FORMATS.find((f) => f.id === format);
                    return (
                      <th key={format} className={styles.cbTh}>
                        {formatInfo?.label || format}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className={styles.cbTr}>
                    <td className={`${styles.cbTd} ${styles.cbTdIndex}`}>{idx + 1}</td>
                    <td className={`${styles.cbTd} ${styles.cbTdInput}`}>
                      <code className={styles.cbCode}>{item.input}</code>
                    </td>
                    {activeFormats.map((format) => {
                      const cellId = `${item.id}-${format}`;
                      const value = item.outputs[format] || "";
                      return (
                        <td key={format} className={styles.cbTd}>
                          <div className={styles.cbCell}>
                            <code className={styles.cbCode}>{value}</code>
                            <button
                              type="button"
                              className={`${styles.cbCellBtn} ${copiedCell === cellId ? styles.copied : ""}`}
                              onClick={() => handleCopy(value, cellId)}
                              title="Copy"
                              aria-label={`Copy ${format} value`}
                            >
                              <i className={`ti ${copiedCell === cellId ? "ti-check" : "ti-copy"}`} />
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.cbMobileList}>
            {items.map((item, idx) => (
              <div key={item.id} className={styles.cbMobileCard}>
                <div className={styles.cbMobileCardHeader}>
                  <span className={styles.cbMobileIndex}>#{idx + 1}</span>
                  <span className={styles.cbMobileInput}>{item.input}</span>
                </div>
                <div className={styles.cbMobileCardBody}>
                  {activeFormats.map((format) => {
                    const formatInfo = CASE_FORMATS.find((f) => f.id === format);
                    const cellId = `${item.id}-${format}`;
                    const value = item.outputs[format] || "";
                    return (
                      <div key={format} className={styles.cbMobileRow}>
                        <span className={styles.cbMobileRowLabel}>{formatInfo?.label || format}</span>
                        <span className={styles.cbMobileRowValue}>{value}</span>
                        <button
                          type="button"
                          className={`${styles.cbCellBtn} ${copiedCell === cellId ? styles.copied : ""}`}
                          style={{ opacity: 1 }}
                          onClick={() => handleCopy(value, cellId)}
                          title="Copy"
                          aria-label={`Copy ${format} value`}
                        >
                          <i className={`ti ${copiedCell === cellId ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && !batchInput && (
        <div className={styles.cbEmpty}>
          <div className={styles.cbEmptyIcon}>
            <i className="ti ti-table" />
          </div>
          <h3 className={styles.cbEmptyTitle}>Batch Case Conversion</h3>
          <p className={styles.cbEmptyDesc}>
            Convert multiple texts at once. Enter your text above, choose a separator and output
            formats, then click Convert.
          </p>
        </div>
      )}
    </div>
  );
}