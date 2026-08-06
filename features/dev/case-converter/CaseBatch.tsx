// features/dev/case-converter/CaseBatch.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { convertCase, CASE_FORMATS, type CaseType, type ConversionOptions } from "./ts/utils";
import styles from "./style/CaseBatch.module.css";

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
  const [items, setItems] = useState<BatchItem[]>([]);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  const selectedFormats = useMemo(() => {
    return ["camel", "pascal", "snake", "kebab", "upper", "lower"];
  }, []);

  const handleCopy = useCallback((text: string, cellId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCell(cellId);
      setTimeout(() => setCopiedCell(null), 1500);
    });
  }, []);

  const processBatch = useCallback(() => {
    if (!batchInput.trim()) return;

    const lines = batchInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newItems: BatchItem[] = lines.map((input) => {
      const options: ConversionOptions = {
        preserveNumbers,
        preserveAcronyms,
      };

      const outputs: Record<CaseType, string> = {} as Record<CaseType, string>;
      selectedFormats.forEach((format) => {
        outputs[format as CaseType] = convertCase(input, format as CaseType, options);
      });

      return {
        id: Math.random().toString(36).substr(2, 9),
        input,
        outputs,
        status: "done",
      };
    });

    setItems(newItems);
    if (onComplete) onComplete(newItems.length);
  }, [batchInput, preserveNumbers, preserveAcronyms, selectedFormats, convertCase, onComplete]);

  const handleClear = useCallback(() => {
    setBatchInput("");
    setItems([]);
  }, []);

  const handleAddLine = useCallback((text: string) => {
    setBatchInput((prev) => (prev ? `${prev}\n${text}` : text));
    processBatch();
  }, [processBatch]);

  return (
    <div className={styles.cbRoot}>
      {/*  Input Section  */}
      <div className={styles.cbSection}>
        <div className={styles.cbSectionHeader}>
          <div className={styles.cbSectionLabel}>
            <i className="ti ti-menu-2" />
            Batch Input
          </div>
          <div className={styles.cbSectionActions}>
            <button
              className={`${styles.cbBtn} ${styles.cbBtnPrimary}`}
              onClick={processBatch}
              disabled={!batchInput.trim()}
            >
              <i className="ti ti-shuffle" />
              Convert
            </button>
            <button className={styles.cbBtn} onClick={handleClear}>
              <i className="ti ti-trash" />
              Clear
            </button>
          </div>
        </div>

        <textarea
          className={styles.cbTextarea}
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          placeholder="Enter one text per line..."
          spellCheck={false}
        />

        <div className={styles.cbInputFooter}>
          <span className={styles.cbInputCount}>
            {batchInput.split("\n").filter((line) => line.trim().length > 0).length > 0}</span>
          <div className={styles.cbSeparatorGroup}>
            <span className={styles.cbSeparatorLabel}>Separator:</span>
            <select className={styles.cbSelect} onChange={(e) => setBatchInput(batchInput.split("\n").join(e.target.value))}>
              <option value="\n">New Line (\\n)</option>
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="|">Pipe (|)</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </div>
      </div>

      {/*  Format Selection  */}
      <div className={styles.cbFormatSection}>
        <div className={styles.cbFormatHeader}>
          <span className={styles.cbFormatLabel}>Output Formats</span>
        </div>
        <div className={styles.cbFormatGrid}>
          {selectedFormats.map((format) => {
            const formatInfo = CASE_FORMATS.find((f: any) => f.id === format);
            return (
              <label key={format} className={styles.cbFormatChip}>
                <input
                  type="checkbox"
                  checked={selectedFormats.includes(format as CaseType)}
                  readOnly
                />
                <span className={styles.cbFormatChipLabel}>
                  {formatInfo?.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/*  Results Section  */}
      {items.length > 0 && (
        <div className={styles.cbResultsSection}>
          <div className={styles.cbResultsHeader}>
            <div className={styles.cbResultsLabel}>
              <i className="ti ti-layout-template-3" />
              Results
            </div>
            <span className={styles.cbResultsCount}>{items.length}</span>
            <div className={styles.cbResultsActions}>
              <button className={styles.cbBtn} onClick={handleClear}>
                <i className="ti ti-trash" />
                Clear All
              </button>
            </div>
          </div>
          <div className={styles.cbTableWrapper}>
            <table className={styles.cbTable}>
              <thead>
                <tr>
                  <th className={`${styles.cbTh} ${styles.cbThIndex}`}>#</th>
                  <th className={`${styles.cbTh} ${styles.cbThInput}`}>Input</th>
                  {selectedFormats.map((format) => {
                    const formatInfo = CASE_FORMATS.find((f: any) => f.id === format);
                    return (
                      <th key={format} className={styles.cbTh}>
                        {formatInfo?.label}
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
                    {selectedFormats.map((format) => {
                      const cellId = `${item.id}-${format}`;
                      return (
                        <td key={format} className={styles.cbTd}>
                          <div className={styles.cbCell}>
                            <code className={styles.cbCode}>{item.outputs[format as CaseType]}</code>
                            <button
                              type="button"
                              className={`${styles.cbCellBtn}${copiedCell === cellId ? " copied" : ""
                                }`}
                              onClick={() => handleCopy(item.outputs[format as CaseType], cellId)}
                              title="Copy"
                            >
                              <i
                                className={`ti ${copiedCell === cellId ? "ti-check" : "ti-copy"
                                  }`}
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
        <div className={styles.cbEmpty}>
          <div className={styles.cbEmptyIcon}>
            <i className="ti ti-table" />
          </div>
          <p className={styles.cbEmptyTitle}>Batch Case Conversion</p>
          <p className={styles.cbEmptyDesc}>
            Convert multiple texts at once. Enter one text per line above and select your desired
            output formats.
          </p>
        </div>
      )}
    </div>
  );
}