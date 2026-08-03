// features/dev/uuid-generator/UuidGenerator.tsx
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
} from "./utils";

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
      <div className="ug-gen-root">
        {/*  UUID Display  */}
        <div className="ug-gen-display">
          <div className="ug-gen-display-header">
            <div className="ug-gen-display-label">
              <i className="ti ti-fingerprint" />
              Generated UUID
            </div>
            <div className="ug-gen-display-actions">
              <button
                type="button"
                className="ug-gen-icon-btn"
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
                title="Generate new UUID"
              >
                <i className={`ti ti-refresh${generating ? " ug-spinning" : ""}`} />
              </button>
              <button
                type="button"
                className={`ug-gen-copy-btn${copied ? " success" : ""}`}
                onClick={handleCopy}
                disabled={!currentUuid}
                title="Copy to clipboard"
              >
                <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="ug-gen-uuid-box">
            {currentUuid ? (
              <code className="ug-gen-uuid">{currentUuid}</code>
            ) : (
              <span className="ug-gen-placeholder">
                {needsNamespace ? "Enter namespace and name below" : "Click generate"}
              </span>
            )}
          </div>

          {/*  Analysis  */}
          {analysis && analysis.isValid && (
            <div className="ug-gen-analysis">
              <div className="ug-gen-analysis-grid">
                <div className="ug-gen-analysis-item">
                  <span className="ug-gen-analysis-label">Version</span>
                  <span className="ug-gen-analysis-value">{analysis.version}</span>
                </div>
                <div className="ug-gen-analysis-item">
                  <span className="ug-gen-analysis-label">Variant</span>
                  <span className="ug-gen-analysis-value">{analysis.variant}</span>
                </div>
                {analysis.timestamp && (
                  <div className="ug-gen-analysis-item ug-gen-analysis-wide">
                    <span className="ug-gen-analysis-label">Timestamp</span>
                    <span className="ug-gen-analysis-value ug-gen-timestamp">
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
          <div className="ug-gen-namespace">
            <div className="ug-gen-section-label">
              <i className="ti ti-network" />
              Namespace Configuration
            </div>

            <div className="ug-gen-namespace-toggle">
              <label className="ug-gen-radio">
                <input
                  type="radio"
                  name="namespace-type"
                  checked={!useCustomNamespace}
                  onChange={() => setUseCustomNamespace(false)}
                />
                <span className="ug-gen-radio-label">Standard Namespace</span>
              </label>
              <label className="ug-gen-radio">
                <input
                  type="radio"
                  name="namespace-type"
                  checked={useCustomNamespace}
                  onChange={() => setUseCustomNamespace(true)}
                />
                <span className="ug-gen-radio-label">Custom Namespace</span>
              </label>
            </div>

            {useCustomNamespace ? (
              <div className="ug-gen-input-group">
                <label className="ug-gen-input-label" htmlFor="custom-namespace">
                  Custom Namespace UUID
                </label>
                <input
                  id="custom-namespace"
                  type="text"
                  className="ug-gen-input"
                  value={customNamespace}
                  onChange={(e) => setCustomNamespace(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
            ) : (
              <div className="ug-gen-input-group">
                <label className="ug-gen-input-label" htmlFor="std-namespace">
                  Standard Namespace
                </label>
                <select
                  id="std-namespace"
                  className="ug-gen-select"
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

            <div className="ug-gen-input-group">
              <label className="ug-gen-input-label" htmlFor="uuid-name">
                Name
              </label>
              <input
                id="uuid-name"
                type="text"
                className="ug-gen-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="example.com"
              />
              <span className="ug-gen-input-hint">
                Same namespace + name always produces the same UUID
              </span>
            </div>
          </div>
        )}

        {/*  Version Info  */}
        <div className="ug-gen-info">
          <div className="ug-gen-info-header">
            <i className="ti ti-info-circle" />
            <span>About {VERSION_INFO[version].label}</span>
          </div>
          <p className="ug-gen-info-desc">{VERSION_INFO[version].desc}</p>
          <div className="ug-gen-info-meta">
            <span className="ug-gen-info-tag">
              <i className="ti ti-target" />
              {VERSION_INFO[version].useCase}
            </span>
            {VERSION_INFO[version].sortable && (
              <span className="ug-gen-info-tag">
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
