// features/dev/json-validator/SchemaValidator.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import {
  generateSchemaFromJSON,
  validateJSON,
  type JSONSchema,
  type ValidationOptions,
} from "./validatorEngine";

interface SchemaValidatorProps {
  jsonInput: string;
  options: ValidationOptions;
}

const SAMPLE_SCHEMAS = {
  user: {
    name: "User Object",
    schema: {
      type: "object",
      required: ["name", "email"],
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        age: { type: "number", minimum: 0, maximum: 150 },
        isActive: { type: "boolean" },
        roles: { type: "array", items: { type: "string" } },
      },
      additionalProperties: false,
    },
  },
  product: {
    name: "Product Object",
    schema: {
      type: "object",
      required: ["id", "name", "price"],
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        price: { type: "number", minimum: 0 },
        category: { type: "string" },
        inStock: { type: "boolean" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  config: {
    name: "Config Object",
    schema: {
      type: "object",
      properties: {
        version: { type: "string" },
        debug: { type: "boolean" },
        port: { type: "number", minimum: 1, maximum: 65535 },
        database: {
          type: "object",
          properties: {
            host: { type: "string" },
            port: { type: "number" },
            name: { type: "string" },
          },
          required: ["host", "name"],
        },
      },
    },
  },
};

export default function SchemaValidator({ jsonInput, options }: SchemaValidatorProps) {
  const [schemaInput, setSchemaInput] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const generatedSchema = useMemo(() => {
    if (!jsonInput.trim()) return null;
    try {
      const parsed = JSON.parse(jsonInput);
      return generateSchemaFromJSON(parsed);
    } catch {
      return null;
    }
  }, [jsonInput]);

  const schemaValidationResult = useMemo(() => {
    if (!jsonInput.trim() || !schemaInput.trim()) return null;

    try {
      const schema = JSON.parse(schemaInput);
      return validateJSON(jsonInput, {
        ...options,
        schemaValidation: schema,
      });
    } catch (e: any) {
      return {
        error: e.message,
      };
    }
  }, [jsonInput, schemaInput, options]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const loadSampleSchema = useCallback((key: keyof typeof SAMPLE_SCHEMAS) => {
    const schema = SAMPLE_SCHEMAS[key].schema;
    setSchemaInput(JSON.stringify(schema, null, 2));
  }, []);

  const useGeneratedSchema = useCallback(() => {
    if (generatedSchema) {
      setSchemaInput(JSON.stringify(generatedSchema, null, 2));
    }
  }, [generatedSchema]);

  return (
    <>
      <div className="sv-root">
        {/* Header */}
        <div className="sv-header">
          <div className="sv-header-left">
            <i className="ti ti-shield-check" />
            <span>JSON Schema Validation</span>
          </div>
          <div className="sv-header-right">
            {Object.entries(SAMPLE_SCHEMAS).map(([key, sample]) => (
              <button
                key={key}
                type="button"
                className="sv-sample-btn"
                onClick={() => loadSampleSchema(key as keyof typeof SAMPLE_SCHEMAS)}
                title={sample.name}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        <div className="sv-body">
          {/* Schema Input */}
          <div className="sv-panel">
            <div className="sv-panel-header">
              <div className="sv-panel-title">
                <i className="ti ti-file-code" />
                JSON Schema
              </div>
              <div className="sv-panel-actions">
                {schemaInput && (
                  <>
                    <button
                      type="button"
                      className={`sv-copy-btn${copiedKey === "schema" ? " copied" : ""}`}
                      onClick={() => handleCopy(schemaInput, "schema")}
                    >
                      <i className={`ti ${copiedKey === "schema" ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className="sv-clear-btn"
                      onClick={() => setSchemaInput("")}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              className="sv-textarea"
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder="Paste JSON Schema here or generate from your JSON..."
              spellCheck={false}
            />
          </div>

          {/* Generated Schema */}
          {generatedSchema && (
            <div className="sv-generated">
              <div className="sv-generated-header">
                <div className="sv-generated-title">
                  <i className="ti ti-sparkles" />
                  Auto-Generated Schema
                </div>
                <button type="button" className="sv-use-btn" onClick={useGeneratedSchema}>
                  <i className="ti ti-arrow-up" />
                  Use This Schema
                </button>
              </div>
              <pre className="sv-schema-preview">{JSON.stringify(generatedSchema, null, 2)}</pre>
            </div>
          )}

          {/* Validation Results */}
          {schemaValidationResult && (
            <div className="sv-results">
              {"error" in schemaValidationResult ? (
                <div className="sv-result-error">
                  <i className="ti ti-alert-circle" />
                  <div>
                    <strong>Invalid Schema</strong>
                    <span>{schemaValidationResult.error}</span>
                  </div>
                </div>
              ) : (
                <div
                  className={`sv-result sv-result--${schemaValidationResult.valid ? "valid" : "invalid"}`}
                >
                  <div className="sv-result-icon">
                    <i
                      className={`ti ${schemaValidationResult.valid ? "ti-circle-check" : "ti-alert-circle"}`}
                    />
                  </div>
                  <div className="sv-result-content">
                    <h3 className="sv-result-title">
                      {schemaValidationResult.valid ? "Schema Valid" : "Schema Validation Failed"}
                    </h3>
                    <p className="sv-result-desc">
                      {schemaValidationResult.valid
                        ? "Your JSON conforms to the provided schema."
                        : `Found ${schemaValidationResult.errors.length} schema violation(s).`}
                    </p>
                    {!schemaValidationResult.valid && schemaValidationResult.errors.length > 0 && (
                      <div className="sv-schema-errors">
                        {schemaValidationResult.errors
                          .filter((e) => e.type === "schema")
                          .map((error, idx) => (
                            <div key={idx} className="sv-schema-error">
                              <i className="ti ti-point-filled" />
                              <span>{error.message}</span>
                              {error.path && <code>{error.path}</code>}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!generatedSchema && !schemaInput && (
            <div className="sv-empty">
              <div className="sv-empty-icon">
                <i className="ti ti-shield-check" />
              </div>
              <h3 className="sv-empty-title">JSON Schema Validation</h3>
              <p className="sv-empty-desc">
                Validate your JSON data against a JSON Schema. Load a sample schema or generate one
                from your JSON.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sv-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          overflow: hidden;
          min-height: 0;
        }

        .sv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-card);
          border-bottom: 0.5px solid var(--border);
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .sv-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sv-header-left i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .sv-header-right {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sv-sample-btn {
          height: 28px;
          padding: 0 10px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }

        .sv-sample-btn:hover {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .sv-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          overflow: auto;
          min-height: 0;
        }

        .sv-panel {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
        }

        .sv-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
        }

        .sv-panel-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sv-panel-title i {
          font-size: 13px;
        }

        .sv-panel-actions {
          display: flex;
          gap: 4px;
        }

        .sv-copy-btn,
        .sv-clear-btn {
          width: 28px;
          height: 28px;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text-tertiary);
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
        }

        .sv-copy-btn:hover,
        .sv-clear-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .sv-copy-btn.copied {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .sv-textarea {
          min-height: 200px;
          padding: 14px 16px;
          border: none;
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: var(--font-mono);
          line-height: 1.6;
          resize: vertical;
          outline: none;
        }

        .sv-textarea::placeholder {
          color: var(--text-disabled);
        }

        .sv-generated {
          background: var(--bg-card);
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          flex-shrink: 0;
        }

        .sv-generated-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--brand-light);
          border-bottom: 0.5px solid var(--brand-border);
        }

        .sv-generated-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--brand-text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .sv-generated-title i {
          font-size: 13px;
        }

        .sv-use-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 10px;
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--brand-text);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .sv-use-btn:hover {
          background: var(--brand);
          color: white;
        }

        .sv-use-btn i {
          font-size: 12px;
        }

        .sv-schema-preview {
          margin: 0;
          padding: 14px 16px;
          background: var(--bg-card);
          color: var(--text);
          font-size: 12px;
          font-family: var(--font-mono);
          line-height: 1.6;
          overflow-x: auto;
          max-height: 300px;
        }

        .sv-results {
          flex-shrink: 0;
        }

        .sv-result-error {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          background: #fef2f2;
          border: 0.5px solid #fecaca;
          border-radius: var(--radius-lg);
          color: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          .sv-result-error {
            background: #1f1517;
            border-color: #7f1d1d;
            color: #f87171;
          }
        }

        .sv-result-error i {
          font-size: 18px;
          flex-shrink: 0;
        }

        .sv-result-error strong {
          display: block;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .sv-result-error span {
          font-size: 12px;
          font-family: var(--font-mono);
        }

        .sv-result {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          gap: 16px;
        }

        .sv-result--valid {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .sv-result--invalid {
          background: #fef2f2;
          border-color: #fecaca;
        }

        @media (prefers-color-scheme: dark) {
          .sv-result--valid {
            background: #052e16;
            border-color: #166534;
          }
          .sv-result--invalid {
            background: #1f1517;
            border-color: #7f1d1d;
          }
        }

        .sv-result-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .sv-result--valid .sv-result-icon {
          background: #16a34a;
          color: white;
        }

        .sv-result--invalid .sv-result-icon {
          background: #dc2626;
          color: white;
        }

        @media (prefers-color-scheme: dark) {
          .sv-result--valid .sv-result-icon {
            background: #4ade80;
            color: #052e16;
          }
          .sv-result--invalid .sv-result-icon {
            background: #f87171;
            color: #1f1517;
          }
        }

        .sv-result-content {
          flex: 1;
        }

        .sv-result-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px;
        }

        .sv-result--valid .sv-result-title {
          color: #16a34a;
        }

        .sv-result--invalid .sv-result-title {
          color: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          .sv-result--valid .sv-result-title {
            color: #4ade80;
          }
          .sv-result--invalid .sv-result-title {
            color: #f87171;
          }
        }

        .sv-result-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 16px;
          line-height: 1.5;
        }

        .sv-schema-errors {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sv-schema-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: var(--text);
        }

        .sv-schema-error i {
          font-size: 8px;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .sv-schema-error code {
          margin-left: 8px;
          font-size: 11px;
        }

        .sv-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px 24px;
          text-align: center;
        }

        .sv-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: var(--text-disabled);
        }

        .sv-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .sv-empty-desc {
          font-size: 14px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 400px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .sv-header {
            flex-direction: column;
            align-items: stretch;
          }

          .sv-header-right {
            justify-content: flex-start;
          }

          .sv-body {
            padding: 12px;
          }

          .sv-result {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
