// features/dev/hash-generator/HashAnalysis.tsx
"use client";

import { useMemo } from "react";
import type { HashResult } from "./ts/hashEngine";
import { HASH_ALGORITHMS, calculateHashRate } from "./ts/hashEngine";
import styles from "./style/HashAnalysis.module.css";

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
      <div className={styles.haEmpty}>
        <div className={styles.haEmptyIcon}>
          <i className="ti ti-chart-pie" />
        </div>
        <p className={styles.haEmptyText}>Generate hashes to see detailed analysis</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.haRoot}>
        {/* Performance Metrics */}
        <div className={styles.haSection}>
          <div className={styles.haSectionHeader}>
            <i className="ti ti-gauge" />
            <span>Performance Metrics</span>
          </div>
          <div className={styles.haMetricsGrid}>
            <div className={styles.haMetric}>
              <div className={styles.haMetricValue}>{analysis.performanceMetrics.formattedRate}</div>
              <div className={styles.haMetricLabel}>Hash Rate</div>
            </div>
            <div className={styles.haMetric}>
              <div className={styles.haMetricValue}>{analysis.averageExecutionTime.toFixed(2)}ms</div>
              <div className={styles.haMetricLabel}>Avg. Time</div>
            </div>
            <div className={styles.haMetric}>
              <div className={styles.haMetricValue}>{(inputSize / 1024).toFixed(1)}KB</div>
              <div className={styles.haMetricLabel}>Input Size</div>
            </div>
            <div className={styles.haMetric}>
              <div className={styles.haMetricValue}>{results.length}</div>
              <div className={styles.haMetricLabel}>Algorithms</div>
            </div>
          </div>
        </div>

        {/* Security Analysis */}
        <div className={styles.haSection}>
          <div className={styles.haSectionHeader}>
            <i className="ti ti-shield-check" />
            <span>Security Analysis</span>
          </div>
          <div className={styles.haSecurityGrid}>
            <div className={`${styles.haSecurityItem} ${styles.haSecurityItemSecure}`}>
              <div className={styles.haSecurityCount}>{analysis.securityAnalysis.secure}</div>
              <div className={styles.haSecurityLabel}>
                <i className="ti ti-shield-check" />
                Secure
              </div>
            </div>
            <div className={`${styles.haSecurityItem} ${styles.haSecurityItemDeprecated}`}>
              <div className={styles.haSecurityCount}>{analysis.securityAnalysis.deprecated}</div>
              <div className={styles.haSecurityLabel}>
                <i className="ti ti-shield-x" />
                Deprecated
              </div>
            </div>
            <div className={`${styles.haSecurityItem} ${styles.haSecurityItemRecommended}`}>
              <div className={styles.haSecurityCount}>{analysis.securityAnalysis.recommended}</div>
              <div className={styles.haSecurityLabel}>
                <i className="ti ti-shield-star" />
                Recommended
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Comparison */}
        <div className={styles.haSection}>
          <div className={styles.haSectionHeader}>
            <i className="ti ti-timeline" />
            <span>Algorithm Comparison</span>
          </div>
          <div className={styles.haComparison}>
            {results.map((result) => {
              const algorithmInfo = HASH_ALGORITHMS[result.algorithm];
              const relativeSpeed =
                (analysis.fastestHash.executionTime / result.executionTime) * 100;

              return (
                <div key={result.algorithm} className={styles.haComparisonItem}>
                  <div className={styles.haComparisonHeader}>
                    <div className={styles.haComparisonName}>
                      <i
                        className={`ti ${algorithmInfo.icon}`}
                        style={{ color: algorithmInfo.color }}
                      />
                      <span>{result.algorithm}</span>
                      {algorithmInfo.isDeprecated && (
                        <span className={styles.haDeprecatedBadge}>Deprecated</span>
                      )}
                    </div>
                    <div className={styles.haComparisonTime}>{result.executionTime.toFixed(2)}ms</div>
                  </div>
                  <div className={styles.haComparisonBar}>
                    <div
                      className={styles.haComparisonFill}
                      style={{
                        width: `${relativeSpeed}%`,
                        backgroundColor: algorithmInfo.color,
                      }}
                    />
                  </div>
                  <div className={styles.haComparisonDetails}>
                    <span className={styles.haComparisonBits}>{algorithmInfo.bitLength} bits</span>
                    <span className={styles.haComparisonStrength}>
                      {result.strength.replace("-", " ")}
                    </span>
                    <span className={styles.haComparisonEntropy}>
                      {result.metadata.entropy}% entropy
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bit Length Distribution */}
        <div className={styles.haSection}>
          <div className={styles.haSectionHeader}>
            <i className="ti ti-chart-bar" />
            <span>Hash Length Distribution</span>
          </div>
          <div className={styles.haDistribution}>
            {Object.entries(analysis.bitLengthDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([bitLength, count]) => {
                const percentage = (count / results.length) * 100;
                return (
                  <div key={bitLength} className={styles.haDistributionItem}>
                    <div className={styles.haDistributionLabel}>{bitLength} bits</div>
                    <div className={styles.haDistributionBar}>
                      <div className={styles.haDistributionFill} style={{ width: `${percentage}%` }} />
                    </div>
                    <div className={styles.haDistributionCount}>
                      {count} hash{count !== 1 ? "es" : ""}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recommendations */}
        <div className={styles.haSection}>
          <div className={styles.haSectionHeader}>
            <i className="ti ti-bulb" />
            <span>Recommendations</span>
          </div>
          <div className={styles.haRecommendations}>
            {analysis.securityAnalysis.deprecated > 0 && (
              <div className={`${styles.haRecommendation} ${styles.haRecommendationWarning}`}>
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
              <div className={`${styles.haRecommendation} ${styles.haRecommendationInfo}`}>
                <i className="ti ti-info-circle" />
                <div>
                  <strong>Recommendation:</strong> For maximum security, consider using SHA-256,
                  SHA-512, or SHA-3 algorithms.
                </div>
              </div>
            )}

            {analysis.fastestHash.executionTime > 100 && (
              <div className={`${styles.haRecommendation} ${styles.haRecommendationPerformance}`}>
                <i className="ti ti-rocket" />
                <div>
                  <strong>Performance:</strong> For better performance with large inputs, consider
                  using BLAKE2b or BLAKE2s.
                </div>
              </div>
            )}

            {inputSize > 1024 * 1024 && (
              <div className={`${styles.haRecommendation} ${styles.haRecommendationInfo}`}>
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