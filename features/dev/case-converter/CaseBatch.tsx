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
    </>
  );
}
