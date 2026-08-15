// features/dev/jwt-decoder/TokenVisualizer.tsx
"use client";

import { useMemo } from "react";
import type { DecodedToken } from "./ts/jwtParser";
import styles from "./style/TokenVisualizer.module.css";

interface TokenVisualizerProps {
  token: DecodedToken;
}

const PART_COLORS = {
  header: { bg: "#3b82f6", fill: styles.tvBreakdownColorHeader, partClass: styles.tvPartHeader },
  payload: { bg: "#10b981", fill: styles.tvBreakdownColorPayload, partClass: styles.tvPartPayload },
  signature: { bg: "#8b5cf6", fill: styles.tvBreakdownColorSignature, partClass: styles.tvPartSignature },
};

export default function TokenVisualizer({ token }: TokenVisualizerProps) {
  const stats = useMemo(() => {
    const { parts, decoded } = token;
    const headerSize = parts.header.length;
    const payloadSize = parts.payload.length;
    const signatureSize = parts.signature.length;
    const total = headerSize + payloadSize + signatureSize + 2;

    return {
      total,
      header: {
        size: headerSize,
        percent: (headerSize / total) * 100,
        claims: Object.keys(decoded.header).length,
      },
      payload: {
        size: payloadSize,
        percent: (payloadSize / total) * 100,
        claims: Object.keys(decoded.payload).length,
      },
      signature: {
        size: signatureSize,
        percent: (signatureSize / total) * 100,
      },
    };
  }, [token]);

  const partDetails = [
    {
      key: "header" as const,
      label: "Header",
      size: stats.header.size,
      percent: stats.header.percent,
      color: "#3b82f6",
      colorClass: styles.tvBreakdownColorHeader,
    },
    {
      key: "payload" as const,
      label: "Payload",
      size: stats.payload.size,
      percent: stats.payload.percent,
      color: "#10b981",
      colorClass: styles.tvBreakdownColorPayload,
    },
    {
      key: "signature" as const,
      label: "Signature",
      size: stats.signature.size,
      percent: stats.signature.percent,
      color: "#8b5cf6",
      colorClass: styles.tvBreakdownColorSignature,
    },
  ];

  return (
    <div className={styles.tvRoot}>
      <div className={styles.tvCard}>
        <div className={styles.tvCardHeader}>
          <i className="ti ti-chart-pie" />
          Token Structure
        </div>
        <div className={styles.tvCardBody}>
          <div className={styles.tvVisual}>
            <div
              className={`${styles.tvPart} ${styles.tvPartHeader}`}
              style={{ flex: stats.header.percent }}
              title={`Header: ${stats.header.size} bytes (${stats.header.percent.toFixed(1)}%)`}
            >
              <div className={styles.tvPartLabel}>Header</div>
              <div className={styles.tvPartSize}>{stats.header.size}B</div>
              <div className={styles.tvPartPct}>{stats.header.percent.toFixed(0)}%</div>
            </div>
            <div className={styles.tvDot}>·</div>
            <div
              className={`${styles.tvPart} ${styles.tvPartPayload}`}
              style={{ flex: stats.payload.percent }}
              title={`Payload: ${stats.payload.size} bytes (${stats.payload.percent.toFixed(1)}%)`}
            >
              <div className={styles.tvPartLabel}>Payload</div>
              <div className={styles.tvPartSize}>{stats.payload.size}B</div>
              <div className={styles.tvPartPct}>{stats.payload.percent.toFixed(0)}%</div>
            </div>
            <div className={styles.tvDot}>·</div>
            <div
              className={`${styles.tvPart} ${styles.tvPartSignature}`}
              style={{ flex: stats.signature.percent }}
              title={`Signature: ${stats.signature.size} bytes (${stats.signature.percent.toFixed(1)}%)`}
            >
              <div className={styles.tvPartLabel}>Sig</div>
              <div className={styles.tvPartSize}>{stats.signature.size}B</div>
              <div className={styles.tvPartPct}>{stats.signature.percent.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tvStats}>
        <div className={styles.tvStat}>
          <div className={styles.tvStatLabel}>Total Size</div>
          <div className={styles.tvStatValue}>{stats.total}B</div>
        </div>
        <div className={styles.tvStat}>
          <div className={styles.tvStatLabel}>Header Claims</div>
          <div className={styles.tvStatValue}>{stats.header.claims}</div>
        </div>
        <div className={styles.tvStat}>
          <div className={styles.tvStatLabel}>Payload Claims</div>
          <div className={styles.tvStatValue}>{stats.payload.claims}</div>
        </div>
        <div className={styles.tvStat}>
          <div className={styles.tvStatLabel}>Algorithm</div>
          <div className={styles.tvStatValue}>{token.metadata.algorithm}</div>
        </div>
      </div>

      <div className={styles.tvCard}>
        <div className={styles.tvCardHeader}>
          <i className="ti ti-layout-rows" />
          Part Breakdown
        </div>
        <div className={styles.tvPartDetails}>
          {partDetails.map((part) => (
            <div key={part.key} className={styles.tvPartDetail}>
              <div
                className={`${styles.tvPartDetailColor} ${part.colorClass}`}
              />
              <div className={styles.tvPartDetailName}>{part.label}</div>
              <div className={styles.tvPartDetailMeta}>
                <span className={styles.tvPartDetailSize}>{part.size} bytes</span>
                <span className={styles.tvPartDetailPct}>{part.percent.toFixed(1)}%</span>
                <div className={styles.tvPartDetailBar}>
                  <div
                    className={styles.tvPartDetailFill}
                    style={{ width: `${part.percent}%`, background: part.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tvBreakdown}>
        {partDetails.map((part) => (
          <div key={part.key} className={styles.tvBreakdownItem}>
            <div className={`${styles.tvBreakdownColor} ${part.colorClass}`} />
            <span>
              {part.label} ({part.percent.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}