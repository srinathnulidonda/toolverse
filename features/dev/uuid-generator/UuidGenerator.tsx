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

      <style jsx>{`
        .ug-gen-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
        }

        /*  Display  */
        .ug-gen-display {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .ug-gen-display-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          gap: 12px;
        }

        .ug-gen-display-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ug-gen-display-label i {
          font-size: 13px;
        }

        .ug-gen-display-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ug-gen-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .ug-gen-icon-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ug-gen-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ug-gen-icon-btn i {
          font-size: 14px;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .ug-spinning {
          animation: spin 1s linear infinite;
        }

        .ug-gen-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
        }

        .ug-gen-copy-btn i {
          font-size: 12px;
        }

        .ug-gen-copy-btn:hover:not(:disabled) {
          background: var(--bg-surface);
          color: var(--text);
        }

        .ug-gen-copy-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ug-gen-copy-btn.success {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .ug-gen-uuid-box {
          padding: 20px 18px;
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ug-gen-uuid {
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 600;
          color: var(--brand);
          letter-spacing: 0.02em;
          word-break: break-all;
          text-align: center;
          line-height: 1.6;
        }

        .ug-gen-placeholder {
          font-size: 13px;
          color: var(--text-disabled);
          font-style: italic;
        }

        .ug-gen-analysis {
          padding: 12px 14px;
          background: var(--bg-surface);
          border-top: 0.5px solid var(--border-faint);
        }

        .ug-gen-analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .ug-gen-analysis-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ug-gen-analysis-wide {
          grid-column: 1 / -1;
        }

        .ug-gen-analysis-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .ug-gen-analysis-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .ug-gen-timestamp {
          font-family: var(--font-mono);
          font-size: 11.5px;
        }

        /*  Namespace  */
        .ug-gen-namespace {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ug-gen-section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ug-gen-section-label i {
          font-size: 13px;
        }

        .ug-gen-namespace-toggle {
          display: flex;
          gap: 16px;
          padding: 10px 0;
        }

        .ug-gen-radio {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          user-select: none;
        }

        .ug-gen-radio input[type="radio"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--brand);
        }

        .ug-gen-radio-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .ug-gen-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ug-gen-input-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .ug-gen-input,
        .ug-gen-select {
          width: 100%;
          height: 36px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text);
          font-size: 12.5px;
          font-family: var(--font-mono);
          outline: none;
          transition: border-color 0.12s;
        }

        .ug-gen-input:focus,
        .ug-gen-select:focus {
          border-color: var(--brand-border);
        }

        .ug-gen-input::placeholder {
          color: var(--text-disabled);
        }

        .ug-gen-select {
          cursor: pointer;
          font-size: 11.5px;
        }

        .ug-gen-input-hint {
          font-size: 10.5px;
          color: var(--text-tertiary);
          font-style: italic;
          line-height: 1.4;
        }

        /*  Info  */
        .ug-gen-info {
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-lg);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ug-gen-info-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--brand-text);
        }

        .ug-gen-info-header i {
          font-size: 14px;
        }

        .ug-gen-info-desc {
          font-size: 12px;
          color: var(--brand-text);
          margin: 0;
          line-height: 1.5;
          opacity: 0.9;
        }

        .ug-gen-info-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ug-gen-info-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
          background: var(--bg-card);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .ug-gen-info-tag i {
          font-size: 11px;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .ug-gen-root {
            padding: 12px;
          }

          .ug-gen-uuid {
            font-size: 14px;
          }

          .ug-gen-namespace-toggle {
            flex-direction: column;
            gap: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ug-gen-icon-btn,
          .ug-gen-copy-btn,
          .ug-gen-input,
          .ug-gen-select {
            transition: none;
          }

          .ug-spinning {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
