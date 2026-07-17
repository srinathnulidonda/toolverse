// features/dev/case-converter/CaseBatch.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { convertCase, CASE_FORMATS, type CaseType, type ConversionOptions } from "./utils";

interface BatchItem {
  id: string;
  input: string;
  outputs: Record<CaseType, string>;
  status: "pending" | "done";
}

interface CaseBatchProps {
  preserveNumbers: boolean;
  preserveAcronyms: boolean;
  onComplete?: (count: number) => void;
}

export default function CaseBatch({
  preserveNumbers,
  preserveAcronyms,
  onComplete,
}: CaseBatchProps) {
  const [batchInput, setBatchInput] = useState("");
  const [separator, setSeparator] = useState<"newline" | "comma" | "semicolon">("newline");
  const [selectedFormats, setSelectedFormats] = useState<CaseType[]>([
    "camel",
    "pascal",
    "snake",
    "kebab",
  ]);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [copiedCell, setCopiedCell] = useState("");

  const options: ConversionOptions = {
    preserveNumbers,
    preserveAcronyms,
  };

  const handleProcess = useCallback(() => {
    if (!batchInput.trim()) return;

    const separatorMap = {
      newline: "\n",
      comma: ",",
      semicolon: ";",
    };

    const inputs = batchInput
      .split(separatorMap[separator])
      .map((s) => s.trim())
      .filter(Boolean);

    const newItems: BatchItem[] = inputs.map((input, i) => {
      const outputs: Record<string, string> = {};

      selectedFormats.forEach((format) => {
        outputs[format] = convertCase(input, format, options);
      });

      return {
        id: `${Date.now()}-${i}`,
        input,
        outputs: outputs as Record<CaseType, string>,
        status: "done" as const,
      };
    });

    setItems(newItems);
    if (onComplete) onComplete(newItems.length);
  }, [batchInput, separator, selectedFormats, options, onComplete]);

  const handleCopy = useCallback(async (text: string, cellId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCell(cellId);
    setTimeout(() => setCopiedCell(""), 1500);
  }, []);

  const handleCopyAll = useCallback(async () => {
    const csv = [
      ["Input", ...selectedFormats].join(","),
      ...items.map((item) =>
        [item.input, ...selectedFormats.map((f) => item.outputs[f])].join(",")
      ),
    ].join("\n");

    await navigator.clipboard.writeText(csv);
  }, [items, selectedFormats]);

  const handleDownload = useCallback(() => {
    const csv = [
      ["Input", ...selectedFormats].join(","),
      ...items.map((item) =>
        [item.input, ...selectedFormats.map((f) => item.outputs[f])].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "case-conversions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [items, selectedFormats]);

  const handleClear = useCallback(() => {
    setBatchInput("");
    setItems([]);
  }, []);

  const inputCount = useMemo(() => {
    const separatorMap = {
      newline: "\n",
      comma: ",",
      semicolon: ";",
    };
    return batchInput.split(separatorMap[separator]).filter((s) => s.trim()).length;
  }, [batchInput, separator]);

  return (
    <>
      <div className="cb-root">
        {/*  Input Section  */}
        <div className="cb-section">
          <div className="cb-section-header">
            <div className="cb-section-label">
              <i className="ti ti-files" />
              Batch Input
            </div>
            <div className="cb-section-actions">
              <div className="cb-separator-group">
                <span className="cb-separator-label">Split by:</span>
                <select
                  className="cb-select"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value as any)}
                >
                  <option value="newline">New line</option>
                  <option value="comma">Comma (,)</option>
                  <option value="semicolon">Semicolon (;)</option>
                </select>
              </div>
              <button
                type="button"
                className="cb-btn"
                onClick={handleClear}
                disabled={!batchInput && items.length === 0}
              >
                <i className="ti ti-trash" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="cb-textarea"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Enter multiple texts (one per line)..."
            rows={6}
            spellCheck={false}
          />
          <div className="cb-input-footer">
            <span className="cb-input-count">{inputCount} items</span>
            <button
              type="button"
              className="cb-btn cb-btn-primary"
              onClick={handleProcess}
              disabled={!batchInput.trim()}
            >
              <i className="ti ti-wand" />
              Convert All
            </button>
          </div>
        </div>

        {/*  Format Selection  */}
        <div className="cb-format-section">
          <div className="cb-format-header">
            <span className="cb-format-label">Output Formats:</span>
          </div>
          <div className="cb-format-grid">
            {CASE_FORMATS.map((format) => (
              <label key={format.id} className="cb-format-chip">
                <input
                  type="checkbox"
                  checked={selectedFormats.includes(format.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFormats([...selectedFormats, format.id]);
                    } else {
                      setSelectedFormats(selectedFormats.filter((f) => f !== format.id));
                    }
                  }}
                />
                <span className="cb-format-chip-label">{format.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/*  Results Table  */}
        {items.length > 0 && (
          <div className="cb-results-section">
            <div className="cb-results-header">
              <div className="cb-results-label">
                <i className="ti ti-table" />
                Results
                <span className="cb-results-count">{items.length}</span>
              </div>
              <div className="cb-results-actions">
                <button type="button" className="cb-btn" onClick={handleCopyAll}>
                  <i className="ti ti-copy" />
                  Copy All (CSV)
                </button>
                <button type="button" className="cb-btn" onClick={handleDownload}>
                  <i className="ti ti-download" />
                  Download CSV
                </button>
              </div>
            </div>

            <div className="cb-table-wrapper">
              <table className="cb-table">
                <thead>
                  <tr>
                    <th className="cb-th cb-th-index">#</th>
                    <th className="cb-th cb-th-input">Input</th>
                    {selectedFormats.map((format) => {
                      const formatInfo = CASE_FORMATS.find((f) => f.id === format);
                      return (
                        <th key={format} className="cb-th">
                          {formatInfo?.label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="cb-tr">
                      <td className="cb-td cb-td-index">{idx + 1}</td>
                      <td className="cb-td cb-td-input">
                        <code className="cb-code">{item.input}</code>
                      </td>
                      {selectedFormats.map((format) => {
                        const cellId = `${item.id}-${format}`;
                        return (
                          <td key={format} className="cb-td">
                            <div className="cb-cell">
                              <code className="cb-code">{item.outputs[format]}</code>
                              <button
                                type="button"
                                className={`cb-cell-btn${copiedCell === cellId ? " copied" : ""}`}
                                onClick={() => handleCopy(item.outputs[format], cellId)}
                                title="Copy"
                              >
                                <i
                                  className={`ti ${copiedCell === cellId ? "ti-check" : "ti-copy"}`}
                                />
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
          </div>
        )}

        {/*  Empty State  */}
        {items.length === 0 && !batchInput && (
          <div className="cb-empty">
            <div className="cb-empty-icon">
              <i className="ti ti-table" />
            </div>
            <p className="cb-empty-title">Batch Case Conversion</p>
            <p className="cb-empty-desc">
              Convert multiple texts at once. Enter one text per line above and select your desired
              output formats.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .cb-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        /*  Section  */
        .cb-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--cc-radius-lg);
          overflow: hidden;
        }

        .cb-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .cb-section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .cb-section-label i {
          font-size: 12px;
        }

        .cb-section-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .cb-separator-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cb-separator-label {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .cb-select {
          height: 28px;
          padding: 0 10px;
          border-radius: var(--cc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
        }

        .cb-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--cc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .cb-btn i {
          font-size: 12px;
        }

        .cb-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .cb-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cb-btn-primary {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .cb-btn-primary:hover:not(:disabled) {
          background: var(--brand);
          color: white;
        }

        .cb-textarea {
          width: 100%;
          padding: 12px 14px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.7;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          resize: vertical;
          min-height: 100px;
        }

        .cb-textarea::placeholder {
          color: var(--text-disabled);
        }

        .cb-input-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border);
          gap: 12px;
        }

        .cb-input-count {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        /*  Format Selection  */
        .cb-format-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--cc-radius-lg);
          padding: 14px 16px;
        }

        .cb-format-header {
          margin-bottom: 10px;
        }

        .cb-format-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .cb-format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
        }

        .cb-format-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: var(--cc-radius-md);
          cursor: pointer;
          transition: all 0.12s;
          user-select: none;
        }

        .cb-format-chip:has(input:checked) {
          background: var(--brand-light);
          border-color: var(--brand-border);
        }

        .cb-format-chip input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--brand);
        }

        .cb-format-chip-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
          font-family: var(--font-mono);
        }

        /*  Results Section  */
        .cb-results-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--cc-radius-lg);
          overflow: hidden;
          min-height: 0;
        }

        .cb-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .cb-results-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .cb-results-label i {
          font-size: 12px;
        }

        .cb-results-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 10px;
          font-weight: 600;
        }

        .cb-results-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cb-table-wrapper {
          flex: 1;
          overflow: auto;
          min-height: 0;
        }

        .cb-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .cb-th {
          position: sticky;
          top: 0;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          padding: 10px 14px;
          text-align: left;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
          z-index: 1;
        }

        .cb-th-index {
          width: 50px;
          text-align: center;
        }

        .cb-th-input {
          min-width: 150px;
        }

        .cb-tr {
          border-bottom: 0.5px solid var(--border-faint);
        }

        .cb-tr:hover {
          background: var(--bg-surface);
        }

        .cb-td {
          padding: 10px 14px;
          vertical-align: top;
        }

        .cb-td-index {
          text-align: center;
          color: var(--text-tertiary);
          font-weight: 600;
          font-family: var(--font-mono);
        }

        .cb-td-input {
          font-weight: 500;
        }

        .cb-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 24px;
        }

        .cb-code {
          flex: 1;
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--text);
          word-break: break-word;
        }

        .cb-cell-btn {
          width: 24px;
          height: 24px;
          border-radius: 5px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
          flex-shrink: 0;
          opacity: 0;
        }

        .cb-tr:hover .cb-cell-btn {
          opacity: 1;
        }

        .cb-cell-btn i {
          font-size: 11px;
        }

        .cb-cell-btn:hover {
          background: var(--bg-card);
          color: var(--text);
        }

        .cb-cell-btn.copied {
          opacity: 1;
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        /*  Empty State  */
        .cb-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 60px 24px;
          text-align: center;
        }

        .cb-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-disabled);
          margin-bottom: 6px;
        }

        .cb-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .cb-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 360px;
          line-height: 1.6;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .cb-root {
            padding: 12px;
          }

          .cb-format-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .cb-table {
            font-size: 11px;
          }

          .cb-th,
          .cb-td {
            padding: 8px 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cb-btn,
          .cb-format-chip,
          .cb-cell-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
