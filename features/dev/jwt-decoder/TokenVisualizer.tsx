// features/dev/jwt-decoder/TokenVisualizer.tsx
"use client";

import { useMemo } from "react";
import type { DecodedToken } from "./ts/jwtParser";
import styles from "./style/TokenVisualizer.module.css";

interface TokenVisualizerProps {
  token: DecodedToken;
}

export default function TokenVisualizer({ token }: TokenVisualizerProps) {
  const stats = useMemo(() => {
    const { parts, decoded } = token;

    const headerSize = parts.header.length;
    const payloadSize = parts.payload.length;
    const signatureSize = parts.signature.length;
    const total = headerSize + payloadSize + signatureSize + 2; // +2 for dots

    const headerPercent = (headerSize / total) * 100;
    const payloadPercent = (payloadSize / total) * 100;
    const signaturePercent = (signatureSize / total) * 100;

    return {
      total,
      header: {
        size: headerSize,
        percent: headerPercent,
        claims: Object.keys(decoded.header).length,
      },
      payload: {
        size: payloadSize,
        percent: payloadPercent,
        claims: Object.keys(decoded.payload).length,
      },
      signature: { size: signatureSize, percent: signaturePercent },
    };
  }, [token]);

  return (
    <>
      <div className={styles.tvRoot}>
        <div className={styles.tvVisual}>
          <div className={`${styles.tvPart} ${styles.tvPartHeader}`} style={{ flex: stats.header.percent }}>
            <div className={styles.tvPartLabel}>Header</div>
            <div className={styles.tvPartSize}>{stats.header.size}B</div>
          </div>
          <div className={styles.tvDot}>·</div>
          <div className={`${styles.tvPart} ${styles.tvPartPayload}`} style={{ flex: stats.payload.percent }}>
            <div className={styles.tvPartLabel}>Payload</div>
            <div className={styles.tvPartSize}>{stats.payload.size}B</div>
          </div>
          <div className={styles.tvDot}>·</div>
          <div className={`${styles.tvPart} ${styles.tvPartSignature}`} style={{ flex: stats.signature.percent }}>
            <div className={styles.tvPartLabel}>Signature</div>
            <div className={styles.tvPartSize}>{stats.signature.size}B</div>
          </div>
        </div>

        <div className={styles.tvStats}>
          <div className={styles.tvStat}>
            <div className={styles.tvStatLabel}>Total Size</div>
            <div className={styles.tvStatValue}>{stats.total} bytes</div>
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

        <div className={styles.tvBreakdown}>
          <div className={styles.tvBreakdownItem}>
            <div className={`${styles.tvBreakdownColor} ${styles.tvBreakdownColorHeader}`}></div>
            <span>Header ({stats.header.percent.toFixed(1)}%)</span>
          </div>
          <div className={styles.tvBreakdownItem}>
            <div className={`${styles.tvBreakdownColor} ${styles.tvBreakdownColorPayload}`}></div>
            <span>Payload ({stats.payload.percent.toFixed(1)}%)</span>
          </div>
          <div className={styles.tvBreakdownItem}>
            <div className={`${styles.tvBreakdownColor} ${styles.tvBreakdownColorSignature}`}></div>
            <span>Signature ({stats.signature.percent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </>
  );
}