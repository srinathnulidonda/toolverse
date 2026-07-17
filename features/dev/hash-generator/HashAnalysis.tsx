// features/dev/hash-generator/HashAnalysis.tsx
"use client";

import { useMemo } from "react";
import type { HashResult } from "./hashEngine";
import { HASH_ALGORITHMS, calculateHashRate } from "./hashEngine";

interface HashAnalysisProps {
  results: HashResult[];
  inputSize: number;
}

export default function HashAnalysis({ results, inputSize }: HashAnalysisProps) {
  const analysis = useMemo(() => {
    if (results.length === 0) return null;

    const totalExecutionTime = results.reduce((sum, result) => sum + result.executionTime, 0);
    const averageExecutionTime = totalExecutionTime / results.length;
    const fastestHash = results.reduce((fastest, current) =>
      current.executionTime < fastest.executionTime ? current : fastest
    );
    const slowestHash = results.reduce((slowest, current) =>
      current.executionTime > slowest.executionTime ? current : slowest
    );

    const securityAnalysis = {
      secure: results.filter((r) => HASH_ALGORITHMS[r.algorithm].isSecure).length,
      deprecated: results.filter((r) => HASH_ALGORITHMS[r.algorithm].isDeprecated).length,
      recommended: results.filter(
        (r) =>
          HASH_ALGORITHMS[r.algorithm].isSecure &&
          !HASH_ALGORITHMS[r.algorithm].isDeprecated &&
          HASH_ALGORITHMS[r.algorithm].bitLength >= 256
      ).length,
    };

    const performanceMetrics = calculateHashRate(results.length, totalExecutionTime);

    const strengthDistribution = results.reduce(
      (acc, result) => {
        acc[result.strength] = (acc[result.strength] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const bitLengthDistribution = results.reduce(
      (acc, result) => {
        const bitLength = HASH_ALGORITHMS[result.algorithm].bitLength;
        acc[bitLength] = (acc[bitLength] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    return {
      totalExecutionTime,
      averageExecutionTime,
      fastestHash,
      slowestHash,
      securityAnalysis,
      performanceMetrics,
      strengthDistribution,
      bitLengthDistribution,
      inputSize,
    };
  }, [results, inputSize]);

  if (!analysis) {
    return (
      <div className="ha-empty">
        <div className="ha-empty-icon">
          <i className="ti ti-chart-pie" />
        </div>
        <p className="ha-empty-text">Generate hashes to see detailed analysis</p>
      </div>
    );
  }

  return (
    <>
      <div className="ha-root">
        {/* Performance Metrics */}
        <div className="ha-section">
          <div className="ha-section-header">
            <i className="ti ti-gauge" />
            <span>Performance Metrics</span>
          </div>
          <div className="ha-metrics-grid">
            <div className="ha-metric">
              <div className="ha-metric-value">{analysis.performanceMetrics.formattedRate}</div>
              <div className="ha-metric-label">Hash Rate</div>
            </div>
            <div className="ha-metric">
              <div className="ha-metric-value">{analysis.averageExecutionTime.toFixed(2)}ms</div>
              <div className="ha-metric-label">Avg. Time</div>
            </div>
            <div className="ha-metric">
              <div className="ha-metric-value">{(inputSize / 1024).toFixed(1)}KB</div>
              <div className="ha-metric-label">Input Size</div>
            </div>
            <div className="ha-metric">
              <div className="ha-metric-value">{results.length}</div>
              <div className="ha-metric-label">Algorithms</div>
            </div>
          </div>
        </div>

        {/* Security Analysis */}
        <div className="ha-section">
          <div className="ha-section-header">
            <i className="ti ti-shield-check" />
            <span>Security Analysis</span>
          </div>
          <div className="ha-security-grid">
            <div className="ha-security-item ha-security-item--secure">
              <div className="ha-security-count">{analysis.securityAnalysis.secure}</div>
              <div className="ha-security-label">
                <i className="ti ti-shield-check" />
                Secure
              </div>
            </div>
            <div className="ha-security-item ha-security-item--deprecated">
              <div className="ha-security-count">{analysis.securityAnalysis.deprecated}</div>
              <div className="ha-security-label">
                <i className="ti ti-shield-x" />
                Deprecated
              </div>
            </div>
            <div className="ha-security-item ha-security-item--recommended">
              <div className="ha-security-count">{analysis.securityAnalysis.recommended}</div>
              <div className="ha-security-label">
                <i className="ti ti-shield-star" />
                Recommended
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Comparison */}
        <div className="ha-section">
          <div className="ha-section-header">
            <i className="ti ti-timeline" />
            <span>Algorithm Comparison</span>
          </div>
          <div className="ha-comparison">
            {results.map((result) => {
              const algorithmInfo = HASH_ALGORITHMS[result.algorithm];
              const relativeSpeed =
                (analysis.fastestHash.executionTime / result.executionTime) * 100;

              return (
                <div key={result.algorithm} className="ha-comparison-item">
                  <div className="ha-comparison-header">
                    <div className="ha-comparison-name">
                      <i
                        className={`ti ${algorithmInfo.icon}`}
                        style={{ color: algorithmInfo.color }}
                      />
                      <span>{result.algorithm}</span>
                      {algorithmInfo.isDeprecated && (
                        <span className="ha-deprecated-badge">Deprecated</span>
                      )}
                    </div>
                    <div className="ha-comparison-time">{result.executionTime.toFixed(2)}ms</div>
                  </div>
                  <div className="ha-comparison-bar">
                    <div
                      className="ha-comparison-fill"
                      style={{
                        width: `${relativeSpeed}%`,
                        backgroundColor: algorithmInfo.color,
                      }}
                    />
                  </div>
                  <div className="ha-comparison-details">
                    <span className="ha-comparison-bits">{algorithmInfo.bitLength} bits</span>
                    <span className="ha-comparison-strength">
                      {result.strength.replace("-", " ")}
                    </span>
                    <span className="ha-comparison-entropy">
                      {result.metadata.entropy}% entropy
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bit Length Distribution */}
        <div className="ha-section">
          <div className="ha-section-header">
            <i className="ti ti-chart-bar" />
            <span>Hash Length Distribution</span>
          </div>
          <div className="ha-distribution">
            {Object.entries(analysis.bitLengthDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([bitLength, count]) => {
                const percentage = (count / results.length) * 100;
                return (
                  <div key={bitLength} className="ha-distribution-item">
                    <div className="ha-distribution-label">{bitLength} bits</div>
                    <div className="ha-distribution-bar">
                      <div className="ha-distribution-fill" style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="ha-distribution-count">
                      {count} hash{count !== 1 ? "es" : ""}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="ha-section">
          <div className="ha-section-header">
            <i className="ti ti-bulb" />
            <span>Recommendations</span>
          </div>
          <div className="ha-recommendations">
            {analysis.securityAnalysis.deprecated > 0 && (
              <div className="ha-recommendation ha-recommendation--warning">
                <i className="ti ti-alert-triangle" />
                <div>
                  <strong>Security Warning:</strong> You're using{" "}
                  {analysis.securityAnalysis.deprecated} deprecated algorithm
                  {analysis.securityAnalysis.deprecated !== 1 ? "s" : ""}. Consider using SHA-256 or
                  SHA-3 instead.
                </div>
              </div>
            )}

            {analysis.securityAnalysis.recommended === 0 && (
              <div className="ha-recommendation ha-recommendation--info">
                <i className="ti ti-info-circle" />
                <div>
                  <strong>Recommendation:</strong> For maximum security, consider using SHA-256,
                  SHA-512, or SHA-3 algorithms.
                </div>
              </div>
            )}

            {analysis.fastestHash.executionTime > 100 && (
              <div className="ha-recommendation ha-recommendation--performance">
                <i className="ti ti-rocket" />
                <div>
                  <strong>Performance:</strong> For better performance with large inputs, consider
                  using BLAKE2b or BLAKE2s.
                </div>
              </div>
            )}

            {inputSize > 1024 * 1024 && (
              <div className="ha-recommendation ha-recommendation--info">
                <i className="ti ti-database" />
                <div>
                  <strong>Large File:</strong> For files over 1MB, consider streaming hash
                  computation for better memory usage.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ha-root {
          flex: 1;
          padding: 16px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: var(--bg-surface);
        }

        .ha-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px 24px;
        }

        .ha-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-disabled);
        }

        .ha-empty-text {
          font-size: 14px;
          color: var(--text-tertiary);
          margin: 0;
          text-align: center;
        }

        .ha-section {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .ha-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ha-section-header i {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .ha-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1px;
          background: var(--border);
        }

        .ha-metric {
          background: var(--bg-card);
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px;
        }

        .ha-metric-value {
          font-size: 18px;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--text);
          line-height: 1;
        }

        .ha-metric-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ha-security-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
        }

        .ha-security-item {
          background: var(--bg-card);
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
        }

        .ha-security-count {
          font-size: 24px;
          font-weight: 700;
          font-family: var(--font-mono);
          line-height: 1;
        }

        .ha-security-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ha-security-item--secure .ha-security-count,
        .ha-security-item--secure .ha-security-label {
          color: #22c55e;
        }

        .ha-security-item--deprecated .ha-security-count,
        .ha-security-item--deprecated .ha-security-label {
          color: #ef4444;
        }

        .ha-security-item--recommended .ha-security-count,
        .ha-security-item--recommended .ha-security-label {
          color: #3b82f6;
        }

        .ha-comparison {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ha-comparison-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ha-comparison-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .ha-comparison-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .ha-comparison-name i {
          font-size: 14px;
        }

        .ha-deprecated-badge {
          font-size: 9px;
          font-weight: 600;
          padding: 1px 4px;
          border-radius: 3px;
          background: #fef2f2;
          color: #dc2626;
          border: 0.5px solid #fecaca;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (prefers-color-scheme: dark) {
          .ha-deprecated-badge {
            background: #1f1517;
            color: #f87171;
            border-color: #3c1518;
          }
        }

        .ha-comparison-time {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .ha-comparison-bar {
          width: 100%;
          height: 6px;
          background: var(--bg-surface);
          border-radius: 3px;
          overflow: hidden;
        }

        .ha-comparison-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .ha-comparison-details {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 10px;
          color: var(--text-tertiary);
        }

        .ha-comparison-bits,
        .ha-comparison-strength,
        .ha-comparison-entropy {
          font-family: var(--font-mono);
        }

        .ha-distribution {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ha-distribution-item {
          display: grid;
          grid-template-columns: 80px 1fr 80px;
          align-items: center;
          gap: 12px;
        }

        .ha-distribution-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }

        .ha-distribution-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-surface);
          border-radius: 4px;
          overflow: hidden;
        }

        .ha-distribution-fill {
          height: 100%;
          background: var(--brand);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .ha-distribution-count {
          font-size: 10px;
          color: var(--text-tertiary);
          text-align: right;
          font-family: var(--font-mono);
        }

        .ha-recommendations {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ha-recommendation {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 12px;
          line-height: 1.5;
        }

        .ha-recommendation i {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .ha-recommendation--warning {
          background: #fef3c7;
          color: #92400e;
          border: 0.5px solid #fde68a;
        }

        .ha-recommendation--warning i {
          color: #d97706;
        }

        .ha-recommendation--info {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }

        .ha-recommendation--info i {
          color: var(--brand);
        }

        .ha-recommendation--performance {
          background: #ecfdf5;
          color: #065f46;
          border: 0.5px solid #d1fae5;
        }

        .ha-recommendation--performance i {
          color: #059669;
        }

        @media (prefers-color-scheme: dark) {
          .ha-recommendation--warning {
            background: #451a03;
            color: #fbbf24;
            border-color: #78350f;
          }

          .ha-recommendation--warning i {
            color: #f59e0b;
          }

          .ha-recommendation--performance {
            background: #022c22;
            color: #6ee7b7;
            border-color: #065f46;
          }

          .ha-recommendation--performance i {
            color: #10b981;
          }
        }

        @media (max-width: 768px) {
          .ha-root {
            padding: 12px;
            gap: 16px;
          }

          .ha-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ha-security-grid {
            grid-template-columns: 1fr;
          }

          .ha-distribution-item {
            grid-template-columns: 60px 1fr 60px;
            gap: 8px;
          }

          .ha-comparison-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </>
  );
}
