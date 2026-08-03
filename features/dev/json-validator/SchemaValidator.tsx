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
    </>
  );
}
