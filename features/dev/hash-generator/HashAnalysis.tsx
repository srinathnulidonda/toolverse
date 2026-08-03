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
    </>
  );
}
