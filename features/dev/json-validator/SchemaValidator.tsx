// features/dev/json-validator/SchemaValidator.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import {
  generateSchemaFromJSON,
  validateJSON,
  type JSONSchema,
  type ValidationOptions,
} from "./ts/validatorEngine";
import styles from "./style/SchemaValidator.module.css";

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
      <div className={styles.svRoot}>
        {/* Header */}
        <div className={styles.svHeader}>
          <div className={styles.svHeaderLeft}>
            <i className="ti ti-shield-check" />
            <span>JSON Schema Validation</span>
          </div>
          <div className={styles.svHeaderRight}>
            {Object.entries(SAMPLE_SCHEMAS).map(([key, sample]) => (
              <button
                key={key}
                type="button"
                className={styles.svSampleBtn}
                onClick={() => loadSampleSchema(key as keyof typeof SAMPLE_SCHEMAS)}
                title={sample.name}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.svBody}>
          {/* Schema Input */}
          <div className={styles.svPanel}>
            <div className={styles.svPanelHeader}>
              <div className={styles.svPanelTitle}>
                <i className="ti ti-file-code" />
                JSON Schema
              </div>
              <div className={styles.svPanelActions}>
                {schemaInput && (
                  <>
                    <button
                      type="button"
                      className={`${styles.svCopyBtn}${copiedKey === "schema" ? " copied" : ""}`}
                      onClick={() => handleCopy(schemaInput, "schema")}
                    >
                      <i className={`ti ${copiedKey === "schema" ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className={styles.svClearBtn}
                      onClick={() => setSchemaInput("")}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              className={styles.svTextarea}
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder="Paste JSON Schema here or generate from your JSON..."
              spellCheck={false}
            />
          </div>

          {/* Generated Schema */}
          {generatedSchema && (
            <div className={styles.svGenerated}>
              <div className={styles.svGeneratedHeader}>
                <div className={styles.svGeneratedTitle}>
                  <i className="ti ti-sparkles" />
                  Auto-Generated Schema
                </div>
                <button type="button" className={styles.svUseBtn} onClick={useGeneratedSchema}>
                  <i className="ti ti-arrow-up" />
                  Use This Schema
                </button>
              </div>
              <pre className={styles.svSchemaPreview}>{JSON.stringify(generatedSchema, null, 2)}</pre>
            </div>
          )}

          {/* Validation Results */}
          {schemaValidationResult && (
            <div className={styles.svResults}>
              {"error" in schemaValidationResult ? (
                <div className={styles.svResultError}>
                  <i className="ti ti-alert-circle" />
                  <div>
                    <strong>Invalid Schema</strong>
                    <span>{schemaValidationResult.error}</span>
                  </div>
                </div>
              ) : (
                <div
                  className={`${styles.svResult} ${styles[`svResult${schemaValidationResult.valid ? "Valid" : "Invalid"}`]}`}
                >
                  <div className={styles.svResultIcon}>
                    <i
                      className={`ti ${schemaValidationResult.valid ? "ti-circle-check" : "ti-alert-circle"}`}
                    />
                  </div>
                  <div className={styles.svResultContent}>
                    <h3 className={styles.svResultTitle}>
                      {schemaValidationResult.valid ? "Schema Valid" : "Schema Validation Failed"}
                    </h3>
                    <p className={styles.svResultDesc}>
                      {schemaValidationResult.valid
                        ? "Your JSON conforms to the provided schema."
                        : `Found ${schemaValidationResult.errors.length} schema violation(s).`}
                    </p>
                    {!schemaValidationResult.valid && schemaValidationResult.errors.length > 0 && (
                      <div className={styles.svSchemaErrors}>
                        {schemaValidationResult.errors
                          .filter((e) => e.type === "schema")
                          .map((error, idx) => (
                            <div key={idx} className={styles.svSchemaError}>
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
            <div className={styles.svEmpty}>
              <div className={styles.svEmptyIcon}>
                <i className="ti ti-shield-check" />
              </div>
              <h3 className={styles.svEmptyTitle}>JSON Schema Validation</h3>
              <p className={styles.svEmptyDesc}>
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