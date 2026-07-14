// features/finance/gst-calculator/GSTAnalysis.tsx
"use client";

import { useMemo } from "react";
import { formatCurrency, applyRounding } from "./gstEngine";
import type { GSTCalculation, GSTOptions } from "./gstEngine";

interface GSTAnalysisProps {
    calculation: GSTCalculation;
    options: GSTOptions;
    amount: number;
}

export default function GSTAnalysis({ calculation, options, amount }: GSTAnalysisProps) {
    const insights = useMemo(() => {
        const effectiveTaxRate = calculation.originalAmount > 0 
            ? ((calculation.gstAmount + calculation.cessAmount) / calculation.originalAmount) * 100 
            : 0;
        const savingsFromDiscount = calculation.discountAmount;
        const taxBurden = calculation.finalAmount > 0 
            ? ((calculation.gstAmount + calculation.cessAmount) / calculation.finalAmount) * 100 
            : 0;
        
        return {
            effectiveTaxRate: isFinite(effectiveTaxRate) ? parseFloat(effectiveTaxRate.toFixed(2)) : 0,
            savingsFromDiscount,
            taxBurden: isFinite(taxBurden) ? parseFloat(taxBurden.toFixed(2)) : 0,
            isHighTax: options.gstRate >= 18,
            hasDiscount: calculation.discountAmount > 0,
            hasCess: calculation.cessAmount > 0,
        };
    }, [calculation, options]);

    const breakdown = useMemo(() => {
        const items = [];
        
        if (options.gstType === "intra") {
            items.push(
                { label: "CGST", value: calculation.cgst, percentage: options.gstRate / 2 },
                { label: "SGST", value: calculation.sgst, percentage: options.gstRate / 2 }
            );
        } else {
            items.push({ label: "IGST", value: calculation.igst, percentage: options.gstRate });
        }

        if (calculation.cessAmount > 0) {
            items.push({ label: "Cess", value: calculation.cessAmount, percentage: options.cessRate });
        }

        return items;
    }, [calculation, options]);

    const comparison = useMemo(() => {
        const rates = [0, 5, 12, 18, 28];
        return rates.map(rate => {
            const gst = (calculation.originalAmount * rate) / 100;
            const roundedTotal = applyRounding(
                calculation.originalAmount + gst + calculation.cessAmount - calculation.discountAmount,
                options.roundingMode
            );
            return {
                rate,
                gst,
                total: roundedTotal,
                isCurrent: rate === options.gstRate,
            };
        });
    }, [calculation, options]);

    const flowSteps = useMemo(() => {
        const steps = [];
        
        steps.push({
            number: 1,
            label: options.mode === "exclusive" ? "Base Amount (Excl. GST)" :
                   options.mode === "inclusive" ? "Total Amount (Incl. GST)" :
                   "Final Total",
            value: amount,
        });

        steps.push({
            number: 2,
            label: "Original Amount",
            value: calculation.originalAmount,
        });

        steps.push({
            number: 3,
            label: `Add GST (${options.gstRate}%)`,
            value: calculation.gstAmount,
            isAdd: true,
        });

        if (calculation.cessAmount > 0) {
            steps.push({
                number: 4,
                label: `Add Cess (${options.cessRate}%)`,
                value: calculation.cessAmount,
                isAdd: true,
            });
        }

        if (calculation.discountAmount > 0) {
            steps.push({
                number: steps.length + 1,
                label: `Subtract Discount (${options.discountPercent}%)`,
                value: calculation.discountAmount,
                isSub: true,
            });
        }

        if (calculation.roundOffAmount !== 0) {
            steps.push({
                number: steps.length + 1,
                label: "Round-off Adjustment",
                value: calculation.roundOffAmount,
                isAdd: calculation.roundOffAmount > 0,
                isSub: calculation.roundOffAmount < 0,
            });
        }

        steps.push({
            number: 'final',
            label: "Final Amount",
            value: calculation.finalAmount,
            isFinal: true,
        });

        return steps;
    }, [calculation, options, amount]);

    return (
        <>
            <div className="ga-root">
                {/* Summary Cards */}
                <div className="ga-cards">
                    <div className="ga-card ga-card--primary">
                        <div className="ga-card-icon">
                            <i className="ti ti-receipt-tax" />
                        </div>
                        <div className="ga-card-body">
                            <div className="ga-card-label">Effective Tax Rate</div>
                            <div className="ga-card-value">{insights.effectiveTaxRate}%</div>
                            <div className="ga-card-meta">
                                {insights.hasCess ? "GST + Cess combined" : "GST only"}
                            </div>
                        </div>
                    </div>

                    <div className="ga-card ga-card--secondary">
                        <div className="ga-card-icon">
                            <i className="ti ti-percentage" />
                        </div>
                        <div className="ga-card-body">
                            <div className="ga-card-label">Tax Burden</div>
                            <div className="ga-card-value">{insights.taxBurden}%</div>
                            <div className="ga-card-meta">of final amount</div>
                        </div>
                    </div>

                    <div className="ga-card ga-card--tertiary">
                        <div className="ga-card-icon">
                            <i className="ti ti-calculator" />
                        </div>
                        <div className="ga-card-body">
                            <div className="ga-card-label">Base Amount</div>
                            <div className="ga-card-value">{formatCurrency(calculation.originalAmount)}</div>
                            <div className="ga-card-meta">before taxes</div>
                        </div>
                    </div>

                    {insights.hasDiscount && (
                        <div className="ga-card ga-card--success">
                            <div className="ga-card-icon">
                                <i className="ti ti-discount" />
                            </div>
                            <div className="ga-card-body">
                                <div className="ga-card-label">Discount Savings</div>
                                <div className="ga-card-value">{formatCurrency(insights.savingsFromDiscount)}</div>
                                <div className="ga-card-meta">{options.discountPercent}% off</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tax Breakdown */}
                <div className="ga-section">
                    <div className="ga-section-header">
                        <i className="ti ti-chart-pie" />
                        <span>Tax Component Breakdown</span>
                    </div>
                    <div className="ga-breakdown">
                        {breakdown.map((item, idx) => {
                            const barWidth = calculation.finalAmount > 0 && isFinite(calculation.finalAmount)
                                ? (item.value / calculation.finalAmount) * 100
                                : 0;
                            const safeBarWidth = isFinite(barWidth) && barWidth >= 0 ? barWidth : 0;
                            
                            return (
                                <div key={idx} className="ga-breakdown-item">
                                    <div className="ga-breakdown-info">
                                        <div className="ga-breakdown-label">{item.label}</div>
                                        <div className="ga-breakdown-percent">{item.percentage}%</div>
                                    </div>
                                    <div className="ga-breakdown-bar-wrap">
                                        <div
                                            className={`ga-breakdown-bar ga-breakdown-bar--${idx}`}
                                            style={{ width: `${safeBarWidth}%` }}
                                        />
                                    </div>
                                    <div className="ga-breakdown-value">{formatCurrency(item.value)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* GST Rate Comparison */}
                <div className="ga-section">
                    <div className="ga-section-header">
                        <i className="ti ti-arrows-sort" />
                        <span>GST Rate Comparison</span>
                    </div>
                    <div className="ga-comparison">
                        <div className="ga-comparison-table">
                            {comparison.map(item => (
                                <div
                                    key={item.rate}
                                    className={`ga-comparison-row ${item.isCurrent ? "ga-comparison-row--current" : ""}`}
                                >
                                    <div className="ga-comparison-rate">
                                        {item.rate}%
                                        {item.isCurrent && <span className="ga-comparison-badge">Current</span>}
                                    </div>
                                    <div className="ga-comparison-gst">{formatCurrency(item.gst)}</div>
                                    <div className="ga-comparison-total">{formatCurrency(item.total)}</div>
                                    {item.isCurrent && (
                                        <div className="ga-comparison-diff">—</div>
                                    )}
                                    {!item.isCurrent && (
                                        <div className={`ga-comparison-diff ${item.total < calculation.finalAmount ? "positive" : "negative"}`}>
                                            {item.total < calculation.finalAmount ? "-" : "+"}
                                            {formatCurrency(Math.abs(item.total - calculation.finalAmount))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="ga-comparison-legend">
                            <span>Rate</span>
                            <span>GST Amount</span>
                            <span>Final Total</span>
                            <span>Difference</span>
                        </div>
                    </div>
                </div>

                {/* Calculation Flow */}
                <div className="ga-section">
                    <div className="ga-section-header">
                        <i className="ti ti-timeline" />
                        <span>Calculation Flow</span>
                    </div>
                    <div className="ga-flow">
                        {flowSteps.map((step, index) => (
                            <div key={index}>
                                <div className={`ga-flow-step ${step.isFinal ? 'ga-flow-step--final' : ''}`}>
                                    <div className="ga-flow-number">
                                        {step.isFinal ? <i className="ti ti-check" /> : step.number}
                                    </div>
                                    <div className="ga-flow-content">
                                        <div className="ga-flow-label">{step.label}</div>
                                        <div className={`ga-flow-value ${
                                            step.isAdd ? 'ga-flow-value--add' :
                                            step.isSub ? 'ga-flow-value--sub' :
                                            step.isFinal ? 'ga-flow-value--final' : ''
                                        }`}>
                                            {step.isAdd && '+ '}
                                            {step.isSub && '- '}
                                            {formatCurrency(Math.abs(step.value))}
                                        </div>
                                    </div>
                                </div>
                                {!step.isFinal && (
                                    <div className="ga-flow-arrow">
                                        <i className="ti ti-arrow-down" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insights */}
                <div className="ga-section">
                    <div className="ga-section-header">
                        <i className="ti ti-bulb" />
                        <span>Insights & Tips</span>
                    </div>
                    <div className="ga-insights">
                        <div className="ga-insight ga-insight--info">
                            <div className="ga-insight-icon">
                                <i className="ti ti-info-circle" />
                            </div>
                            <div className="ga-insight-content">
                                <div className="ga-insight-title">Tax Type: {options.gstType === "intra" ? "Intra-State" : "Inter-State"}</div>
                                <div className="ga-insight-text">
                                    {options.gstType === "intra" 
                                        ? "CGST and SGST are applicable as buyer and seller are in the same state. Each is 50% of total GST."
                                        : "IGST is applicable as buyer and seller are in different states. Full GST goes to central government."
                                    }
                                </div>
                            </div>
                        </div>

                        {insights.isHighTax && (
                            <div className="ga-insight ga-insight--warning">
                                <div className="ga-insight-icon">
                                    <i className="ti ti-alert-triangle" />
                                </div>
                                <div className="ga-insight-content">
                                    <div className="ga-insight-title">High Tax Rate</div>
                                    <div className="ga-insight-text">
                                        This item falls under {options.gstRate}% GST slab, typically for luxury goods or non-essential items. Consider if input tax credit (ITC) is available to offset this cost.
                                    </div>
                                </div>
                            </div>
                        )}

                        {insights.hasCess && (
                            <div className="ga-insight ga-insight--info">
                                <div className="ga-insight-icon">
                                    <i className="ti ti-plus" />
                                </div>
                                <div className="ga-insight-content">
                                    <div className="ga-insight-title">Additional Cess Applied</div>
                                    <div className="ga-insight-text">
                                        Cess of {options.cessRate}% is charged over and above GST. Common for tobacco, luxury cars, and aerated drinks. Cess goes to compensation fund.
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="ga-insight ga-insight--tip">
                            <div className="ga-insight-icon">
                                <i className="ti ti-bulb" />
                            </div>
                            <div className="ga-insight-content">
                                <div className="ga-insight-title">Business Tip</div>
                                <div className="ga-insight-text">
                                    If you're a registered taxpayer, you can claim input tax credit (ITC) of {formatCurrency(calculation.gstAmount)} on this purchase, subject to eligibility rules.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .ga-root {
                    flex: 1;
                    padding: 16px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--bg-surface);
                }

                .ga-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 12px;
                }

                .ga-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                }

                .ga-card--primary {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .ga-card--secondary,
                .ga-card--tertiary,
                .ga-card--success {
                    background: var(--bg-card);
                }

                .ga-card-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: var(--bg-surface);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: var(--brand);
                    flex-shrink: 0;
                }

                .ga-card--primary .ga-card-icon {
                    background: white;
                    color: var(--brand);
                }

                .ga-card--secondary .ga-card-icon {
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                }

                .ga-card--tertiary .ga-card-icon {
                    background: var(--bg-surface);
                    color: var(--text-tertiary);
                }

                .ga-card--success .ga-card-icon {
                    background: var(--success-light, var(--bg-surface));
                    color: var(--success, var(--brand));
                }

                .ga-card-body {
                    flex: 1;
                    min-width: 0;
                }

                .ga-card-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .ga-card-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                    margin-bottom: 2px;
                }

                .ga-card-meta {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }

                .ga-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .ga-section-header {
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

                .ga-section-header i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .ga-breakdown {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .ga-breakdown-item {
                    display: grid;
                    grid-template-columns: 140px 1fr 120px;
                    gap: 12px;
                    align-items: center;
                }

                .ga-breakdown-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .ga-breakdown-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }

                .ga-breakdown-percent {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono);
                }

                .ga-breakdown-bar-wrap {
                    height: 8px;
                    background: var(--bg-surface);
                    border-radius: 99px;
                    overflow: hidden;
                }

                .ga-breakdown-bar {
                    height: 100%;
                    border-radius: 99px;
                    transition: width 0.4s ease;
                }

                .ga-breakdown-bar--0 {
                    background: var(--success, #10b981);
                }

                .ga-breakdown-bar--1 {
                    background: var(--info, #3b82f6);
                }

                .ga-breakdown-bar--2 {
                    background: var(--warning, #f59e0b);
                }

                .ga-breakdown-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                    text-align: right;
                }

                .ga-comparison {
                    padding: 16px;
                }

                .ga-comparison-table {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .ga-comparison-row {
                    display: grid;
                    grid-template-columns: 100px 1fr 1fr 1fr;
                    gap: 12px;
                    align-items: center;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border-faint);
                    border-radius: 8px;
                    transition: all 0.12s;
                }

                .ga-comparison-row:hover {
                    background: var(--bg-card);
                    border-color: var(--border);
                }

                .ga-comparison-row--current {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .ga-comparison-rate {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .ga-comparison-badge {
                    font-size: 9px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: var(--brand);
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .ga-comparison-gst,
                .ga-comparison-total {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    font-family: var(--font-mono);
                }

                .ga-comparison-diff {
                    font-size: 12px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                    text-align: right;
                }

                .ga-comparison-diff.positive {
                    color: var(--success, #16a34a);
                }

                .ga-comparison-diff.negative {
                    color: var(--error, #dc2626);
                }

                .ga-comparison-legend {
                    display: grid;
                    grid-template-columns: 100px 1fr 1fr 1fr;
                    gap: 12px;
                    padding: 0 12px;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--text-disabled);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .ga-comparison-legend span:last-child {
                    text-align: right;
                }

                .ga-flow {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                }

                .ga-flow-step {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 18px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 10px;
                    min-width: 320px;
                }

                .ga-flow-step--final {
                    background: var(--brand-light);
                    border-color: var(--brand-border);
                }

                .ga-flow-number {
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

                .ga-flow-step--final .ga-flow-number {
                    background: var(--brand);
                    border-color: var(--brand);
                    color: white;
                }

                .ga-flow-content {
                    flex: 1;
                    min-width: 0;
                }

                .ga-flow-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    margin-bottom: 3px;
                }

                .ga-flow-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }

                .ga-flow-value--add {
                    color: var(--success, #16a34a);
                }

                .ga-flow-value--sub {
                    color: var(--error, #dc2626);
                }

                .ga-flow-value--final {
                    font-size: 20px;
                    color: var(--brand);
                }

                .ga-flow-arrow {
                    width: 32px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-disabled);
                    font-size: 20px;
                }

                .ga-insights {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .ga-insight {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 14px;
                    border-radius: 10px;
                    border: 0.5px solid var(--border);
                    background: var(--bg-surface);
                }

                .ga-insight--info {
                    background: var(--info-light, var(--bg-surface));
                    border-color: var(--info-border, var(--border));
                }

                .ga-insight--warning {
                    background: var(--warning-light, var(--bg-surface));
                    border-color: var(--warning-border, var(--border));
                }

                .ga-insight--tip {
                    background: var(--success-light, var(--bg-surface));
                    border-color: var(--success-border, var(--border));
                }

                .ga-insight-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                    background: var(--bg-card);
                    color: var(--text-secondary);
                }

                .ga-insight--info .ga-insight-icon {
                    background: var(--info-bg, var(--bg-card));
                    color: var(--info, var(--text-secondary));
                }

                .ga-insight--warning .ga-insight-icon {
                    background: var(--warning-bg, var(--bg-card));
                    color: var(--warning, var(--text-secondary));
                }

                .ga-insight--tip .ga-insight-icon {
                    background: var(--success-bg, var(--bg-card));
                    color: var(--success, var(--text-secondary));
                }

                .ga-insight-content {
                    flex: 1;
                    min-width: 0;
                }

                .ga-insight-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    margin-bottom: 4px;
                }

                .ga-insight-text {
                    font-size: 12px;
                    line-height: 1.6;
                    color: var(--text-secondary);
                }

                @media (max-width: 768px) {
                    .ga-root {
                        padding: 12px;
                    }

                    .ga-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .ga-breakdown-item {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }

                    .ga-comparison-row,
                    .ga-comparison-legend {
                        grid-template-columns: 70px 1fr 1fr 1fr;
                        font-size: 11px;
                    }

                    .ga-flow-step {
                        min-width: 0;
                        width: 100%;
                    }
                }

                @media (max-width: 380px) {
                    .ga-root {
                        padding: 10px;
                        gap: 12px;
                    }

                    .ga-cards {
                        grid-template-columns: 1fr;
                    }

                    .ga-card-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 16px;
                    }

                    .ga-card-value {
                        font-size: 16px;
                    }

                    .ga-comparison-row {
                        grid-template-columns: 1fr;
                        gap: 4px;
                    }

                    .ga-comparison-diff {
                        text-align: left;
                    }

                    .ga-comparison-gst,
                    .ga-comparison-total,
                    .ga-comparison-legend {
                        display: none;
                    }

                    .ga-flow-step {
                        min-width: 0;
                        padding: 10px 12px;
                    }
                }
            `}</style>
        </>
    );
}