// features/dev/url-encoder/UrlBreakdown.tsx
"use client";

import { useState, useCallback } from "react";
import type { UrlParts } from "./ts/utils";
import { exportAsJson, exportAsCsv, copyToClipboard } from "./ts/utils";
import styles from "./style/UrlBreakdown.module.css";

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
      <div className={styles.ubEmpty}>
        <div className={styles.ubEmptyIcon}>
          <i className="ti ti-layout-list" />
        </div>
        <p className={styles.ubEmptyTitle}>No URL to parse</p>
        <p className={styles.ubEmptyDesc}>Enter a valid URL to see its components</p>
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
      <div className={styles.ubRoot}>
        {/* Components Section */}
        <section className={styles.ubSection}>
          <header className={styles.ubSectionHeader}>Components</header>
          <ul className={styles.ubList}>
            {components.map((comp, idx) => (
              <li key={idx} className={styles.ubRow}>
                <span className={`${styles.ubIcon} ${comp.color ? styles[comp.color] : styles.default}`}>
                  <i className={`ti ${comp.icon}`} />
                </span>
                <span className={styles.ubKey}>{comp.key}</span>
                <span className={styles.ubValue}>{comp.value}</span>
                <button
                  type="button"
                  className={`${styles.ubCopyBtn}${copiedKey === `comp-${idx}` ? ` ${styles.copied}` : ""}`}
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
          <section className={styles.ubSection}>
            <header className={styles.ubSectionHeader}>
              Query parameters
              <span className={styles.ubCountBadge}>{urlParts.searchParams.length}</span>
            </header>

            <div className={styles.ubTableWrap}>
              <table className={styles.ubTable}>
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
                      <td className={styles.ubTableNum}>{idx + 1}</td>
                      <td className={styles.ubTableKey}>{key}</td>
                      <td className={styles.ubTableValue}>
                        {value || <em className={styles.ubTableEmpty}>empty</em>}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`${styles.ubCopyBtn}${copiedKey === `param-${idx}` ? ` ${styles.copied}` : ""}`}
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

            <div className={styles.ubExportRow}>
              <button
                type="button"
                className={styles.ubExportBtn}
                onClick={() => handleCopy(exportAsJson(urlParts), "json")}
              >
                <i className="ti ti-braces" />
                {copiedKey === "json" ? "Copied!" : "Copy as JSON"}
              </button>
              <button
                type="button"
                className={styles.ubExportBtn}
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