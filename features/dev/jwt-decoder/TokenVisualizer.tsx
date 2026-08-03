// features/dev/jwt-decoder/TokenVisualizer.tsx
"use client";

import { useMemo } from "react";
import type { DecodedToken } from "./jwtParser";

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
      <div className="tv-root">
        <div className="tv-visual">
          <div className="tv-part tv-part--header" style={{ flex: stats.header.percent }}>
            <div className="tv-part-label">Header</div>
            <div className="tv-part-size">{stats.header.size}B</div>
          </div>
          <div className="tv-dot">·</div>
          <div className="tv-part tv-part--payload" style={{ flex: stats.payload.percent }}>
            <div className="tv-part-label">Payload</div>
            <div className="tv-part-size">{stats.payload.size}B</div>
          </div>
          <div className="tv-dot">·</div>
          <div className="tv-part tv-part--signature" style={{ flex: stats.signature.percent }}>
            <div className="tv-part-label">Signature</div>
            <div className="tv-part-size">{stats.signature.size}B</div>
          </div>
        </div>

        <div className="tv-stats">
          <div className="tv-stat">
            <div className="tv-stat-label">Total Size</div>
            <div className="tv-stat-value">{stats.total} bytes</div>
          </div>
          <div className="tv-stat">
            <div className="tv-stat-label">Header Claims</div>
            <div className="tv-stat-value">{stats.header.claims}</div>
          </div>
          <div className="tv-stat">
            <div className="tv-stat-label">Payload Claims</div>
            <div className="tv-stat-value">{stats.payload.claims}</div>
          </div>
          <div className="tv-stat">
            <div className="tv-stat-label">Algorithm</div>
            <div className="tv-stat-value">{token.metadata.algorithm}</div>
          </div>
        </div>

        <div className="tv-breakdown">
          <div className="tv-breakdown-item">
            <div className="tv-breakdown-color tv-breakdown-color--header"></div>
            <span>Header ({stats.header.percent.toFixed(1)}%)</span>
          </div>
          <div className="tv-breakdown-item">
            <div className="tv-breakdown-color tv-breakdown-color--payload"></div>
            <span>Payload ({stats.payload.percent.toFixed(1)}%)</span>
          </div>
          <div className="tv-breakdown-item">
            <div className="tv-breakdown-color tv-breakdown-color--signature"></div>
            <span>Signature ({stats.signature.percent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </>
  );
}
