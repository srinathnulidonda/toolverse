// features/finance/itc-calculator/ITCAnalysis.tsx
"use client";

import { useMemo } from "react";
import { formatCurrency, formatNumber } from "./itcEngine";
import type { ITCCalculation, ITCOptions } from "./itcEngine";

interface ITCAnalysisProps {
    calculation: ITCCalculation;
    options: ITCOptions;
    purchaseAmount: number;
}

export default function ITCAnalysis({ calculation, options, purchaseAmount }: ITCAnalysisProps) {
    const insights = useMemo(() => {
        const itcRate = (calculation.totalITC / purchaseAmount) * 100;
        const blockedPercentage = calculation.blockedITC > 0 ? (calculation.blockedITC / calculation.totalITC) * 100 : 0;
        const utilizationRate = calculation.eligibleITC > 0 ? (calculation.itcUtilized / calculation.eligibleITC) * 100 : 0;
        const cashflowImpact = calculation.itcBalance;
        const monthlySavings = options.period === "annual" ? calculation.itcBalance / 12 : 
                              options.period === "quarterly" ? calculation.itcBalance / 3 : 
                              calculation.itcBalance;

        return {
            itcRate: parseFloat(itcRate.toFixed(2)),
            blockedPercentage: parseFloat(blockedPercentage.toFixed(1)),
            utilizationRate: parseFloat(utilizationRate.toFixed(1)),
            cashflowImpact,
            monthlySavings,
            isHighBlocked: blockedPercentage > 20,
            isLowUtilization: utilizationRate < 50 && calculation.itcUtilized > 0,
            hasAvailableCredit: calculation.itcBalance > 0,
        };
    }, [calculation, options, purchaseAmount]);

    const breakdown = useMemo(() => {
        const baseAmount = purchaseAmount - calculation.totalITC;
        return [
            { label: "Base Amount", value: baseAmount, color: "#6b7280" },
            { label: "GST Paid", value: calculation.totalITC, color: "#3b82f6" },
            { label: "Blocked ITC", value: calculation.blockedITC, color: "#dc2626" },
            { label: "Eligible ITC", value: calculation.eligibleITC, color: "#10b981" },
        ];
    }, [calculation, purchaseAmount]);

    const monthlyProjection = useMemo(() => {
        if (options.period === "monthly") return null;
        
        const monthlyPurchase = options.period === "annual" ? purchaseAmount / 12 : purchaseAmount / 3;
        const monthlyITC = options.period === "annual" ? calculation.eligibleITC / 12 : calculation.eligibleITC / 3;
        const monthlyBalance = options.period === "annual" ? calculation.itcBalance / 12 : calculation.itcBalance / 3;

        return {
            purchase: monthlyPurchase,
            itc: monthlyITC,
            balance: monthlyBalance,
        };
    }, [calculation, options, purchaseAmount]);

    const comparianceScore = useMemo(() => {
        let score = 85; // Base score
        
        // Reduce score for high blocked ITC
        if (insights.blockedPercentage > 30) score -= 15;
        else if (insights.blockedPercentage > 20) score -= 10;
        else if (insights.blockedPercentage > 10) score -= 5;
        
        // Reduce score for low utilization
        if (insights.utilizationRate < 30 && calculation.itcUtilized > 0) score -= 10;
        else if (insights.utilizationRate < 60 && calculation.itcUtilized > 0) score -= 5;
        
        // Add score for good utilization
        if (insights.utilizationRate > 80) score += 5;
        
        return Math.max(60, Math.min(100, score));
    }, [insights, calculation]);

    return (
        <>
            <div className="ia-root">
                {/* Summary Cards */}
                <div className="ia-cards">
                    <div className="ia-card ia-card--primary">
                        <div className="ia-card-icon">
                            <i className="ti ti-percentage" />
                        </div>
                        <div className="ia-card-body">
                            <div className="ia-card-label">ITC Rate</div>
                            <div className="ia-card-value">{insights.itcRate}%</div>
                            <div className="ia-card-meta">of purchase amount</div>
                        </div>
                    </div>

                    <div className="ia-card">
                        <div className="ia-card-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>
                            <i className="ti ti-ban" />
                        </div>
                        <div className="ia-card-body">
                            <div className="ia-card-label">Blocked ITC</div>
                            <div className="ia-card-value">{insights.blockedPercentage}%</div>
                            <div className="ia-card-meta">of total GST</div>
                        </div>
                    </div>

                    <div className="ia-card">
                        <div className="ia-card-icon" style={{ background: "#dcfce7", color: "#166534" }}>
                            <i className="ti ti-trending-up" />
                        </div>
                        <div className="ia-card-body">
                            <div className="ia-card-label">Utilization</div>
                            <div className="ia-card-value">{insights.utilizationRate}%</div>
                            <div className="ia-card-meta">of eligible ITC</div>
                        </div>
                    </div>

                    <div className="ia-card">
                        <div className="ia-card-icon" style={{ background: "#fef3c7", color: "#92400e" }}>
                            <i className="ti ti-trophy" />
                        </div>
                        <div className="ia-card-body">
                            <div className="ia-card-label">Compliance Score</div>
                            <div className="ia-card-value">{comparianceScore}</div>
                            <div className="ia-card-meta">out of 100</div>
                        </div>
                    </div>
                </div>

                {/* Purchase Breakdown */}
                <div className="ia-section">
                    <div className="ia-section-header">
                        <i className="ti ti-chart-pie" />
                        <span>Purchase Amount Breakdown</span>
                    </div>
                    <div className="ia-breakdown">
                        {breakdown.map((item, idx) => (
                            <div key={idx} className="ia-breakdown-item">
                                <div className="ia-breakdown-info">
                                    <div className="ia-breakdown-label">{item.label}</div>
                                    <div className="ia-breakdown-percent">
                                        {((item.value / purchaseAmount) * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div className="ia-breakdown-bar-wrap">
                                    <div
                                        className="ia-breakdown-bar"
                                        style={{
                                            width: `${(item.value / purchaseAmount) * 100}%`,
                                            background: item.color
                                        }}
                                    />
                                </div>
                                <div className="ia-breakdown-value">{formatCurrency(item.value)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ITC Flow */}
                <div className="ia-section">
                    <div className="ia-section-header">
                        <i className="ti ti-timeline" />
                        <span>ITC Calculation Flow</span>
                    </div>
                    <div className="ia-flow">
                        <div className="ia-flow-step">
                            <div className="ia-flow-number">1</div>
                            <div className="ia-flow-content">
                                <div className="ia-flow-label">Total Purchase (incl. GST)</div>
                                <div className="ia-flow-value">{formatCurrency(purchaseAmount)}</div>
                            </div>
                        </div>

                        <div className="ia-flow-arrow">
                            <i className="ti ti-arrow-down" />
                        </div>

                        <div className="ia-flow-step">
                            <div className="ia-flow-number">2</div>
                            <div className="ia-flow-content">
                                <div className="ia-flow-label">Extract GST ({options.gstRate}%)</div>
                                <div className="ia-flow-value ia-flow-value--add">= {formatCurrency(calculation.totalITC)}</div>
                            </div>
                        </div>

                        {calculation.blockedITC > 0 && (
                            <>
                                <div className="ia-flow-arrow">
                                    <i className="ti ti-arrow-down" />
                                </div>
                                <div className="ia-flow-step">
                                    <div className="ia-flow-number">3</div>
                                    <div className="ia-flow-content">
                                        <div className="ia-flow-label">Less: Blocked ITC</div>
                                        <div className="ia-flow-value ia-flow-value--sub">- {formatCurrency(calculation.blockedITC)}</div>
                                    </div>
                                </div>
                            </>
                        )}

                        {calculation.reversedITC > 0 && (
                            <>
                                <div className="ia-flow-arrow">
                                    <i className="ti ti-arrow-down" />
                                </div>
                                <div className="ia-flow-step">
                                    <div className="ia-flow-number">{calculation.blockedITC > 0 ? 4 : 3}</div>
                                    <div className="ia-flow-content">
                                        <div className="ia-flow-label">Less: Reversed ITC</div>
                                        <div className="ia-flow-value ia-flow-value--sub">- {formatCurrency(calculation.reversedITC)}</div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="ia-flow-arrow">
                            <i className="ti ti-arrow-down" />
                        </div>

                        <div className="ia-flow-step ia-flow-step--highlight">
                            <div className="ia-flow-number">
                                <i className="ti ti-check" />
                            </div>
                            <div className="ia-flow-content">
                                <div className="ia-flow-label">Eligible ITC</div>
                                <div className="ia-flow-value ia-flow-value--final">{formatCurrency(calculation.eligibleITC)}</div>
                            </div>
                        </div>

                        {calculation.itcUtilized > 0 && (
                            <>
                                <div className="ia-flow-arrow">
                                    <i className="ti ti-arrow-down" />
                                </div>
                                <div className="ia-flow-step">
                                    <div className="ia-flow-number">
                                        {(calculation.blockedITC > 0 ? 1 : 0) + (calculation.reversedITC > 0 ? 1 : 0) + 4}
                                    </div>
                                    <div className="ia-flow-content">
                                        <div className="ia-flow-label">Less: ITC Utilized</div>
                                        <div className="ia-flow-value">- {formatCurrency(calculation.itcUtilized)}</div>
                                    </div>
                                </div>

                                <div className="ia-flow-arrow">
                                    <i className="ti ti-arrow-down" />
                                </div>

                                <div className="ia-flow-step ia-flow-step--final">
                                    <div className="ia-flow-number">
                                        <i className="ti ti-wallet" />
                                    </div>
                                    <div className="ia-flow-content">
                                        <div className="ia-flow-label">ITC Balance</div>
                                        <div className="ia-flow-value ia-flow-value--balance">{formatCurrency(calculation.itcBalance)}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Monthly Projection */}
                {monthlyProjection && (
                    <div className="ia-section">
                        <div className="ia-section-header">
                            <i className="ti ti-calendar" />
                            <span>Monthly Projection</span>
                        </div>
                        <div className="ia-projection">
                            <div className="ia-projection-card">
                                <div className="ia-projection-icon">
                                    <i className="ti ti-shopping-cart" />
                                </div>
                                <div className="ia-projection-content">
                                    <div className="ia-projection-label">Monthly Purchases</div>
                                    <div className="ia-projection-value">{formatCurrency(monthlyProjection.purchase)}</div>
                                </div>
                            </div>
                            <div className="ia-projection-card">
                                <div className="ia-projection-icon">
                                    <i className="ti ti-receipt-refund" />
                                </div>
                                <div className="ia-projection-content">
                                    <div className="ia-projection-label">Monthly ITC</div>
                                    <div className="ia-projection-value">{formatCurrency(monthlyProjection.itc)}</div>
                                </div>
                            </div>
                            <div className="ia-projection-card">
                                <div className="ia-projection-icon">
                                    <i className="ti ti-piggy-bank" />
                                </div>
                                <div className="ia-projection-content">
                                    <div className="ia-projection-label">Monthly Savings</div>
                                    <div className="ia-projection-value">{formatCurrency(monthlyProjection.balance)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Insights */}
                <div className="ia-section">
                    <div className="ia-section-header">
                        <i className="ti ti-bulb" />
                        <span>Insights & Recommendations</span>
                    </div>
                    <div className="ia-insights">
                        <div className="ia-insight ia-insight--info">
                            <div className="ia-insight-icon">
                                <i className="ti ti-info-circle" />
                            </div>
                            <div className="ia-insight-content">
                                <div className="ia-insight-title">ITC Rate Analysis</div>
                                <div className="ia-insight-text">
                                    Your effective ITC rate is {insights.itcRate}% of total purchases. 
                                    {insights.itcRate >= options.gstRate - 1 
                                        ? " This indicates most purchases qualify for full ITC."
                                        : ` This is lower than the ${options.gstRate}% GST rate due to blocked/reversed credits.`
                                    }
                                </div>
                            </div>
                        </div>

                        {insights.isHighBlocked && (
                            <div className="ia-insight ia-insight--warning">
                                <div className="ia-insight-icon">
                                    <i className="ti ti-alert-triangle" />
                                </div>
                                <div className="ia-insight-content">
                                    <div className="ia-insight-title">High Blocked ITC</div>
                                    <div className="ia-insight-text">
                                        {insights.blockedPercentage}% of your GST cannot be claimed as ITC. Consider reviewing your purchase patterns to minimize blocked credits (motor vehicles, personal use items, etc.).
                                    </div>
                                </div>
                            </div>
                        )}

                        {insights.isLowUtilization && (
                            <div className="ia-insight ia-insight--tip">
                                <div className="ia-insight-icon">
                                    <i className="ti ti-bulb" />
                                </div>
                                <div className="ia-insight-content">
                                    <div className="ia-insight-title">Low ITC Utilization</div>
                                    <div className="ia-insight-text">
                                        You've only utilized {insights.utilizationRate}% of eligible ITC. Consider using remaining credits before they expire or become time-barred.
                                    </div>
                                </div>
                            </div>
                        )}

                        {insights.hasAvailableCredit && (
                            <div className="ia-insight ia-insight--success">
                                <div className="ia-insight-icon">
                                    <i className="ti ti-coin" />
                                </div>
                                <div className="ia-insight-content">
                                    <div className="ia-insight-title">Available ITC Balance</div>
                                    <div className="ia-insight-text">
                                        You have {formatCurrency(calculation.itcBalance)} in available ITC. This can offset your next GST payment, improving cash flow by {formatCurrency(insights.monthlySavings)} {options.period === "monthly" ? "monthly" : "per month"}.
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="ia-insight ia-insight--compliance">
                            <div className="ia-insight-icon">
                                <i className="ti ti-shield-check" />
                            </div>
                            <div className="ia-insight-content">
                                <div className="ia-insight-title">Compliance Score: {comparianceScore}/100</div>
                                <div className="ia-insight-text">
                                    {comparianceScore >= 90 ? "Excellent ITC management! " : 
                                     comparianceScore >= 80 ? "Good ITC practices. " : 
                                     comparianceScore >= 70 ? "Room for improvement in ITC optimization. " : 
                                     "Consider reviewing your ITC strategy. "}
                                    Ensure proper documentation for all ITC claims and regular reconciliation with GSTR-2A.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .ia-root {
                    flex: 1;
                    padding: 16px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--bg-surface);
                }

                /* Cards */
                .ia-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 12px;
                }

                .ia-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                }

                .ia-card--primary {
                    background: #3b82f615;
                    border-color: #3b82f640;
                }

                .ia-card-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: var(--bg-surface);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: #3b82f6;
                    flex-shrink: 0;
                }

                .ia-card--primary .ia-card-icon {
                    background: white;
                }

                .ia-card-body {
                    flex: 1;
                    min-width: 0;
                }

                .ia-card-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .ia-card-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                    margin-bottom: 2px;
                }

                .ia-card-meta {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                /* Section */
                .ia-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .ia-section-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .ia-section-header i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                /* Breakdown */
                .ia-breakdown {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .ia-breakdown-item {
                    display: grid;
                    grid-template-columns: 140px 1fr 120px;
                    gap: 12px;
                    align-items: center;
                }

                .ia-breakdown-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .ia-breakdown-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .ia-breakdown-percent {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .ia-breakdown-bar-wrap {
                    height: 8px;
                    background: var(--bg-surface);
                    border-radius: 99px;
                    overflow: hidden;
                }

                .ia-breakdown-bar {
                    height: 100%;
                    border-radius: 99px;
                    transition: width 0.4s ease;
                }

                .ia-breakdown-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                    text-align: right;
                }

                /* Flow */
                .ia-flow {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                }

                .ia-flow-step {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 18px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 10px;
                    min-width: 320px;
                }

                .ia-flow-step--highlight {
                    background: #3b82f615;
                    border-color: #3b82f640;
                }

                .ia-flow-step--final {
                    background: #fef3c7;
                    border-color: #fde68a;
                }

                @media (prefers-color-scheme: dark) {
                    .ia-flow-step--final {
                        background: #451a03;
                        border-color: #78350f;
                    }
                }

                .ia-flow-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--bg-card);
                    border: 2px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text);
                    flex-shrink: 0;
                }

                .ia-flow-step--highlight .ia-flow-number {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                }

                .ia-flow-step--final .ia-flow-number {
                    background: #f59e0b;
                    border-color: #f59e0b;
                    color: white;
                }

                .ia-flow-content {
                    flex: 1;
                    min-width: 0;
                }

                .ia-flow-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    margin-bottom: 3px;
                }

                .ia-flow-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .ia-flow-value--add {
                    color: #10b981;
                }

                .ia-flow-value--sub {
                    color: #dc2626;
                }

                .ia-flow-value--final {
                    font-size: 18px;
                    color: #3b82f6;
                }

                .ia-flow-value--balance {
                    font-size: 18px;
                    color: #f59e0b;
                }

                .ia-flow-arrow {
                    width: 32px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-disabled);
                    font-size: 20px;
                }

                /* Projection */
                .ia-projection {
                    padding: 16px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .ia-projection-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 10px;
                }

                .ia-projection-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #3b82f615;
                    color: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .ia-projection-content {
                    flex: 1;
                }

                .ia-projection-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .ia-projection-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                /* Insights */
                .ia-insights {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .ia-insight {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 14px;
                    border-radius: 10px;
                    border: 0.5px solid;
                }

                .ia-insight--info {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                }

                .ia-insight--warning {
                    background: #fef3c7;
                    border-color: #fde68a;
                }

                .ia-insight--success {
                    background: #dcfce7;
                    border-color: #bbf7d0;
                }

                .ia-insight--tip {
                    background: #f0f9ff;
                    border-color: #7dd3fc;
                }

                .ia-insight--compliance {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                @media (prefers-color-scheme: dark) {
                    .ia-insight--info { background: #0a1628; border-color: #1e3a5f; }
                    .ia-insight--warning { background: #451a03; border-color: #78350f; }
                    .ia-insight--success { background: #022c22; border-color: #064e3b; }
                    .ia-insight--tip { background: #0c1e2e; border-color: #1e3a8a; }
                    .ia-insight--compliance { background: #111827; border-color: #374151; }
                }

                .ia-insight-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .ia-insight--info .ia-insight-icon {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .ia-insight--warning .ia-insight-icon {
                    background: #fde68a;
                    color: #92400e;
                }

                .ia-insight--success .ia-insight-icon {
                    background: #bbf7d0;
                    color: #166534;
                }

                .ia-insight--tip .ia-insight-icon {
                    background: #bfdbfe;
                    color: #1e40af;
                }

                .ia-insight--compliance .ia-insight-icon {
                    background: #e5e7eb;
                    color: #374151;
                }

                @media (prefers-color-scheme: dark) {
                    .ia-insight--info .ia-insight-icon { background: #1e3a5f; color: #93c5fd; }
                    .ia-insight--warning .ia-insight-icon { background: #78350f; color: #fbbf24; }
                    .ia-insight--success .ia-insight-icon { background: #064e3b; color: #4ade80; }
                    .ia-insight--tip .ia-insight-icon { background: #1e3a8a; color: #60a5fa; }
                    .ia-insight--compliance .ia-insight-icon { background: #374151; color: #9ca3af; }
                }

                .ia-insight-content {
                    flex: 1;
                    min-width: 0;
                }

                .ia-insight-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    margin-bottom: 4px;
                }

                .ia-insight-text {
                    font-size: 12px;
                    line-height: 1.6;
                    color: var(--text-secondary);
                }

                @media (max-width: 768px) {
                    .ia-root {
                        padding: 12px;
                    }

                    .ia-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .ia-breakdown-item {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }

                    .ia-projection {
                        grid-template-columns: 1fr;
                    }

                    .ia-flow-step {
                        min-width: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}