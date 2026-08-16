// features/social/og-preview/ValidationPanel.tsx
"use client";

import { useMemo } from "react";
import type { MetaData, Platform, ValidationResult } from "./ts/types";
import { validateMetaForPlatform, getPlatformLabel, getPlatformIcon } from "./ts/utils";
import styles from "./style/ValidationPanel.module.css";

const VALIDATION_PLATFORMS: Platform[] = ["facebook", "twitter", "linkedin"];

type ValidationPanelProps = {
  meta: MetaData;
};

export default function ValidationPanel({ meta }: ValidationPanelProps) {
  const validations = useMemo(() => {
    const results: Record<Platform, ValidationResult[]> = {} as any;
    VALIDATION_PLATFORMS.forEach((platform) => {
      results[platform] = validateMetaForPlatform(meta, platform);
    });
    return results;
  }, [meta]);

  const totalIssues = useMemo(() => {
    let errors = 0;
    let warnings = 0;
    Object.values(validations).forEach((results) => {
      results.forEach((r) => {
        if (r.level === "error") errors++;
        else if (r.level === "warning") warnings++;
      });
    });
    return { errors, warnings };
  }, [validations]);

  const overallScore = useMemo(() => {
    const total = totalIssues.errors * 2 + totalIssues.warnings;
    const maxScore = 100;
    const score = Math.max(0, maxScore - total * 5);
    return Math.round(score);
  }, [totalIssues]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "var(--brand)";
    if (score >= 70) return "#D97706";
    return "#B91C1C";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Work";
  };

  return (
    <>
      <div className={styles.vpRoot}>
        {/* Score card */}
        <div className={styles.vpScoreCard}>
          <div className={styles.vpScoreRing} style={{ "--score": overallScore } as any}>
            <svg className={styles.vpScoreSvg} viewBox="0 0 120 120">
              <circle
                className={styles.vpScoreBg}
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--border)"
                strokeWidth="8"
              />
              <circle
                className={styles.vpScoreFg}
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={getScoreColor(overallScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="339.292"
                strokeDashoffset={339.292 - (339.292 * overallScore) / 100}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className={styles.vpScoreValue} style={{ color: getScoreColor(overallScore) }}>
              {overallScore}
            </div>
          </div>
          <div className={styles.vpScoreInfo}>
            <div className={styles.vpScoreLabel} style={{ color: getScoreColor(overallScore) }}>
              {getScoreLabel(overallScore)}
            </div>
            <p className={styles.vpScoreDesc}>SEO & Social Score</p>
            <div className={styles.vpScoreStats}>
              {totalIssues.errors > 0 && (
                <span className={`${styles.vpStat} ${styles.vpStatError}`}>
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  {totalIssues.errors} error{totalIssues.errors !== 1 ? "s" : ""}
                </span>
              )}
              {totalIssues.warnings > 0 && (
                <span className={`${styles.vpStat} ${styles.vpStatWarning}`}>
                  <i className="ti ti-alert-triangle" aria-hidden="true" />
                  {totalIssues.warnings} warning{totalIssues.warnings !== 1 ? "s" : ""}
                </span>
              )}
              {totalIssues.errors === 0 && totalIssues.warnings === 0 && (
                <span className={`${styles.vpStat} ${styles.vpStatSuccess}`}>
                  <i className="ti ti-circle-check" aria-hidden="true" />
                  No issues found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Platform validations */}
        <div className={styles.vpPlatforms}>
          {VALIDATION_PLATFORMS.map((platform) => {
            const results = validations[platform];
            const hasErrors = results.some((r) => r.level === "error");
            const hasWarnings = results.some((r) => r.level === "warning");
            const isPerfect = results.length === 0;

            return (
              <div key={platform} className={styles.vpPlatform}>
                <div className={styles.vpPlatformHeader}>
                  <i className={`ti ${getPlatformIcon(platform)}`} aria-hidden="true" />
                  <span className={styles.vpPlatformName}>{getPlatformLabel(platform)}</span>
                  {isPerfect && (
                    <span className={`${styles.vpPlatformBadge} ${styles.vpBadgeSuccess}`}>
                      <i className="ti ti-check" aria-hidden="true" />
                      Perfect
                    </span>
                  )}
                  {hasErrors && (
                    <span className={`${styles.vpPlatformBadge} ${styles.vpBadgeError}`}>
                      {results.filter((r) => r.level === "error").length} error
                      {results.filter((r) => r.level === "error").length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {!hasErrors && hasWarnings && (
                    <span className={`${styles.vpPlatformBadge} ${styles.vpBadgeWarning}`}>
                      {results.filter((r) => r.level === "warning").length} warning
                      {results.filter((r) => r.level === "warning").length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {results.length > 0 && (
                  <div className={styles.vpIssues}>
                    {results.map((result, idx) => {
                      const issueKey = `vpIssue${result.level.charAt(0).toUpperCase() + result.level.slice(1)}`;
                      const issueClass = `${styles.vpIssue} ${styles[issueKey]}`;
                      return (
                        <div key={idx} className={issueClass}>
                          <div className={styles.vpIssueHeader}>
                            <i
                              className={`ti ${result.level === "error" ? "ti-alert-circle" : "ti-alert-triangle"
                                }`}
                              aria-hidden="true"
                            />
                            <span className={styles.vpIssueMessage}>{result.message}</span>
                          </div>
                          {result.recommendation && (
                            <div className={styles.vpIssueRec}>
                              <i className="ti ti-bulb" aria-hidden="true" />
                              {result.recommendation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Best practices */}
        <div className={styles.vpTips}>
          <div className={styles.vpTipsHeader}>
            <i className="ti ti-lightbulb" aria-hidden="true" />
            <span>Best Practices</span>
          </div>
          <ul className={styles.vpTipsList}>
            <li>Use 1200×630px images for optimal display across all platforms</li>
            <li>Keep titles under 60 characters for Facebook and Twitter</li>
            <li>Descriptions should be 125-155 characters for best engagement</li>
            <li>Include image alt text for accessibility</li>
            <li>Test your meta tags with platform-specific debuggers</li>
            <li>Use unique images and descriptions for each page</li>
          </ul>
        </div>
      </div>
    </>
  );
}