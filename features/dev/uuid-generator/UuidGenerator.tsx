/* features/dev/uuid-generator/UuidGenerator.tsx */
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  generate,
  analyzeUuid,
  NAMESPACES,
  VERSION_INFO,
  type UuidVersion,
  type UuidFormat,
  type UuidCase,
  type UuidGenerateOptions,
} from "./ts/utils";
import styles from "./style/UuidGenerator.module.css";

interface UuidGeneratorProps {
  version: UuidVersion;
  format: UuidFormat;
  uuidCase: UuidCase;
  onGenerated?: (uuid: string) => void;
}

export default function UuidGenerator({
  version,
  format,
  uuidCase,
  onGenerated,
}: UuidGeneratorProps) {
  const [currentUuid, setCurrentUuid] = useState("");
  const [namespace, setNamespace] = useState<string>(NAMESPACES.DNS);
  const [customNamespace, setCustomNamespace] = useState("");
  const [name, setName] = useState("");
  const [useCustomNamespace, setUseCustomNamespace] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const needsNamespace = version === "v3" || version === "v5";
  const canGenerate = !needsNamespace || (namespace && name);

  const analysis = useMemo(() => {
    if (!currentUuid) return null;
    return analyzeUuid(currentUuid);
  }, [currentUuid]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setGenerating(true);
    try {
      const options: UuidGenerateOptions = {
        version,
        format,
        case: uuidCase,
      };

      if (needsNamespace) {
        options.namespace = useCustomNamespace ? customNamespace : namespace;
        options.name = name;
      }

      const uuid = await generate(options);
      setCurrentUuid(uuid);
      if (onGenerated) onGenerated(uuid);
    } catch (err) {
      logger.error("Generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [
    version,
    format,
    uuidCase,
    namespace,
    customNamespace,
    name,
    useCustomNamespace,
    needsNamespace,
    canGenerate,
    onGenerated,
  ]);

  const handleCopy = useCallback(async () => {
    if (!currentUuid) return;
    try {
      await navigator.clipboard.writeText(currentUuid);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silent */
    }
  }, [currentUuid]);

  // Auto-generate on mount and when settings change
  useEffect(() => {
    if (canGenerate) {
      handleGenerate();
    }
  }, [version, format, uuidCase]);

  return (
    <>
      <div className={styles.ugGenRoot}>
        {/*  UUID Display  */}
        <div className={styles.ugGenDisplay}>
          <div className={styles.ugGenDisplayHeader}>
            <div className={styles.ugGenDisplayLabel}>
              <i className="ti ti-fingerprint" />
              Generated UUID
            </div>
            <div className={styles.ugGenDisplayActions}>
              <button
                type="button"
                className={styles.ugGenIconBtn}
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
                title="Generate new UUID"
              >
                <i className={`ti ti-refresh${generating ? ` ${styles.ugSpinning}` : ""}`} />
              </button>
              <button
                type="button"
                className={`${styles.ugGenCopyBtn}${copied ? ` ${styles.success}` : ""}`}
                onClick={handleCopy}
                disabled={!currentUuid}
                title="Copy to clipboard"
              >
                <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className={styles.ugGenUuidBox}>
            {currentUuid ? (
              <code className={styles.ugGenUuid}>{currentUuid}</code>
            ) : (
              <span className={styles.ugGenPlaceholder}>
                {needsNamespace ? "Enter namespace and name below" : "Click generate"}
              </span>
            )}
          </div>

          {/*  Analysis  */}
          {analysis && analysis.isValid && (
            <div className={styles.ugGenAnalysis}>
              <div className={styles.ugGenAnalysisGrid}>
                <div className={styles.ugGenAnalysisItem}>
                  <span className={styles.ugGenAnalysisLabel}>Version</span>
                  <span className={styles.ugGenAnalysisValue}>{analysis.version}</span>
                </div>
                <div className={styles.ugGenAnalysisItem}>
                  <span className={styles.ugGenAnalysisLabel}>Variant</span>
                  <span className={styles.ugGenAnalysisValue}>{analysis.variant}</span>
                </div>
                {analysis.timestamp && (
                  <div className={`${styles.ugGenAnalysisItem} ${styles.ugGenAnalysisWide}`}>
                    <span className={styles.ugGenAnalysisLabel}>Timestamp</span>
                    <span className={`${styles.ugGenAnalysisValue} ${styles.ugGenTimestamp}`}>
                      {analysis.timestampDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/*  Namespace Input (v3/v5)  */}
        {needsNamespace && (
          <div className={styles.ugGenNamespace}>
            <div className={styles.ugGenSectionLabel}>
              <i className="ti ti-network" />
              Namespace Configuration
            </div>

            <div className={styles.ugGenNamespaceToggle}>
              <label className={styles.ugGenRadio}>
                <input
                  type="radio"
                  name="namespace-type"
                  checked={!useCustomNamespace}
                  onChange={() => setUseCustomNamespace(false)}
                />
                <span className={styles.ugGenRadioLabel}>Standard Namespace</span>
              </label>
              <label className={styles.ugGenRadio}>
                <input
                  type="radio"
                  name="namespace-type"
                  checked={useCustomNamespace}
                  onChange={() => setUseCustomNamespace(true)}
                />
                <span className={styles.ugGenRadioLabel}>Custom Namespace</span>
              </label>
            </div>

            {useCustomNamespace ? (
              <div className={styles.ugGenInputGroup}>
                <label className={styles.ugGenInputLabel} htmlFor="custom-namespace">
                  Custom Namespace UUID
                </label>
                <input
                  id="custom-namespace"
                  type="text"
                  className={styles.ugGenInput}
                  value={customNamespace}
                  onChange={(e) => setCustomNamespace(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
            ) : (
              <div className={styles.ugGenInputGroup}>
                <label className={styles.ugGenInputLabel} htmlFor="std-namespace">
                  Standard Namespace
                </label>
                <select
                  id="std-namespace"
                  className={styles.ugGenSelect}
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                >
                  <option value={NAMESPACES.DNS}>DNS ({NAMESPACES.DNS})</option>
                  <option value={NAMESPACES.URL}>URL ({NAMESPACES.URL})</option>
                  <option value={NAMESPACES.OID}>OID ({NAMESPACES.OID})</option>
                  <option value={NAMESPACES.X500}>X.500 ({NAMESPACES.X500})</option>
                </select>
              </div>
            )}

            <div className={styles.ugGenInputGroup}>
              <label className={styles.ugGenInputLabel} htmlFor="uuid-name">
                Name
              </label>
              <input
                id="uuid-name"
                type="text"
                className={styles.ugGenInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="example.com"
              />
              <span className={styles.ugGenInputHint}>
                Same namespace + name always produces the same UUID
              </span>
            </div>
          </div>
        )}

        {/*  Version Info  */}
        <div className={styles.ugGenInfo}>
          <div className={styles.ugGenInfoHeader}>
            <i className="ti ti-info-circle" />
            <span>About {VERSION_INFO[version].label}</span>
          </div>
          <p className={styles.ugGenInfoDesc}>{VERSION_INFO[version].desc}</p>
          <div className={styles.ugGenInfoMeta}>
            <span className={styles.ugGenInfoTag}>
              <i className="ti ti-target" />
              {VERSION_INFO[version].useCase}
            </span>
            {VERSION_INFO[version].sortable && (
              <span className={styles.ugGenInfoTag}>
                <i className="ti ti-sort-ascending" />
                Sortable
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}