// features/dev/url-encoder/UrlBreakdown.tsx
"use client";

import { useState, useCallback } from "react";
import type { UrlParts } from "./utils";
import { exportAsJson, exportAsCsv, copyToClipboard } from "./utils";

interface UrlBreakdownProps {
  urlParts: UrlParts | null;
}

export default function UrlBreakdown({ urlParts }: UrlBreakdownProps) {
  const [copiedKey, setCopiedKey] = useState("");

  const handleCopy = useCallback(async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    }
  }, []);

  if (!urlParts) {
    return (
      <div className="ub-empty">
        <div className="ub-empty-icon">
          <i className="ti ti-layout-list" />
        </div>
        <p className="ub-empty-title">No URL to parse</p>
        <p className="ub-empty-desc">Enter a valid URL to see its components</p>
      </div>
    );
  }

  const components = [
    urlParts.protocol && {
      key: "Protocol",
      value: urlParts.protocol,
      icon: "ti-shield-check",
      color: "proto",
    },
    urlParts.hostname && { key: "Host", value: urlParts.hostname, icon: "ti-world", color: "host" },
    urlParts.port && { key: "Port", value: urlParts.port, icon: "ti-plug", color: "" },
    urlParts.pathname !== "/" && {
      key: "Path",
      value: urlParts.pathname,
      icon: "ti-route",
      color: "path",
    },
    urlParts.hash && { key: "Fragment", value: urlParts.hash, icon: "ti-hash", color: "" },
    urlParts.username && { key: "Username", value: urlParts.username, icon: "ti-user", color: "" },
  ].filter(Boolean) as Array<{ key: string; value: string; icon: string; color: string }>;

  return (
    <>
      <div className="ub-root">
        {/* Components Section */}
        <section className="ub-section">
          <header className="ub-section-header">Components</header>
          <ul className="ub-list">
            {components.map((comp, idx) => (
              <li key={idx} className="ub-row">
                <span className={`ub-icon ${comp.color || "default"}`}>
                  <i className={`ti ${comp.icon}`} />
                </span>
                <span className="ub-key">{comp.key}</span>
                <span className="ub-value">{comp.value}</span>
                <button
                  type="button"
                  className={`ub-copy-btn${copiedKey === `comp-${idx}` ? " copied" : ""}`}
                  onClick={() => handleCopy(comp.value, `comp-${idx}`)}
                  aria-label={`Copy ${comp.key}`}
                >
                  <i className={`ti ${copiedKey === `comp-${idx}` ? "ti-check" : "ti-copy"}`} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Query Parameters */}
        {urlParts.searchParams.length > 0 && (
          <section className="ub-section">
            <header className="ub-section-header">
              Query parameters
              <span className="ub-count-badge">{urlParts.searchParams.length}</span>
            </header>

            <div className="ub-table-wrap">
              <table className="ub-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Key</th>
                    <th>Value</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {urlParts.searchParams.map(([key, value], idx) => (
                    <tr key={idx}>
                      <td className="ub-table-num">{idx + 1}</td>
                      <td className="ub-table-key">{key}</td>
                      <td className="ub-table-value">
                        {value || <em className="ub-table-empty">empty</em>}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`ub-copy-btn${copiedKey === `param-${idx}` ? " copied" : ""}`}
                          onClick={() => handleCopy(`${key}=${value}`, `param-${idx}`)}
                          aria-label={`Copy ${key}`}
                        >
                          <i
                            className={`ti ${copiedKey === `param-${idx}` ? "ti-check" : "ti-copy"}`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ub-export-row">
              <button
                type="button"
                className="ub-export-btn"
                onClick={() => handleCopy(exportAsJson(urlParts), "json")}
              >
                <i className="ti ti-braces" />
                {copiedKey === "json" ? "Copied!" : "Copy as JSON"}
              </button>
              <button
                type="button"
                className="ub-export-btn"
                onClick={() => handleCopy(exportAsCsv(urlParts.searchParams), "csv")}
              >
                <i className="ti ti-table" />
                {copiedKey === "csv" ? "Copied!" : "Copy as CSV"}
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
