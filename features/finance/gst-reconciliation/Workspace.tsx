// features/finance/gst-reconciliation/Workspace.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Tool } from "@/data/tools";
import {
    reconcileGSTReturns,
    formatCurrency,
    RECONCILIATION_TYPES,
    MISMATCH_REASONS,
    type ReconciliationData,
    type ReconciliationResult,
    type ReconciliationType,
} from "./reconcileEngine";
import ReconcileAnalysis from "./ReconcileAnalysis";
import { useReconcileStore } from "./reconcileStore";

export default function GSTReconciliationWorkspace({ tool }: { tool: Tool }) {
    const [activeType, setActiveType] = useState<ReconciliationType>("sales");
    const [salesData, setSalesData] = useState({
        booksAmount: "",
        gstr1Amount: "",
        period: new Date().toISOString().slice(0, 7), // YYYY-MM
    });
    const [purchaseData, setPurchaseData] = useState({
        booksAmount: "",
        gstr2aAmount: "",
        period: new Date().toISOString().slice(0, 7),
    });
    const [itcData, setITCData] = useState({
        claimedAmount: "",
        availableAmount: "",
        period: new Date().toISOString().slice(0, 7),
    });
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const { addToHistory } = useReconcileStore();

    const reconciliationResult = useMemo((): ReconciliationResult | null => {
        const data: ReconciliationData = {
            sales: {
                books: parseFloat(salesData.booksAmount) || 0,
                gstr1: parseFloat(salesData.gstr1Amount) || 0,
                period: salesData.period,
            },
            purchases: {
                books: parseFloat(purchaseData.booksAmount) || 0,
                gstr2a: parseFloat(purchaseData.gstr2aAmount) || 0,
                period: purchaseData.period,
            },
            itc: {
                claimed: parseFloat(itcData.claimedAmount) || 0,
                available: parseFloat(itcData.availableAmount) || 0,
                period: itcData.period,
            },
        };

        // Only calculate if we have data
        if (data.sales.books > 0 || data.purchases.books > 0 || data.itc.claimed > 0) {
            return reconcileGSTReturns(data);
        }
        return null;
    }, [salesData, purchaseData, itcData]);

    const handleSaveReconciliation = useCallback(() => {
        if (!reconciliationResult) return;
        
        addToHistory({
            title: `Reconciliation - ${salesData.period}`,
            result: reconciliationResult,
            period: salesData.period,
            timestamp: Date.now(),
            tags: [salesData.period, activeType],
        });
    }, [reconciliationResult, salesData.period, activeType, addToHistory]);

    const handleFileUpload = useCallback((files: FileList | null) => {
        if (!files) return;
        setUploadedFiles(Array.from(files));
    }, []);

    const processFiles = useCallback(async () => {
        if (uploadedFiles.length === 0) return;
        
        setIsProcessing(true);
        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock data extraction
        setSalesData(prev => ({
            ...prev,
            booksAmount: "500000",
            gstr1Amount: "485000",
        }));
        setPurchaseData(prev => ({
            ...prev,
            booksAmount: "300000",
            gstr2aAmount: "295000",
        }));
        setITCData(prev => ({
            ...prev,
            claimedAmount: "45000",
            availableAmount: "42000",
        }));
        
        setIsProcessing(false);
    }, [uploadedFiles]);

    return (
        <>
            <div className="gr-root">
                {/* Chrome */}
                <div className="gr-chrome">
                    <div className="gr-chrome-left">
                        <div className="gr-title">
                            <div className="gr-title-icon">
                                <i className="ti ti-database-import" />
                            </div>
                            GST Reconciliation
                            <span className="gr-title-badge">Beta</span>
                        </div>
                    </div>
                    <div className="gr-chrome-right">
                        <div className="gr-period-input">
                            <label className="gr-period-label">Period:</label>
                            <input
                                type="month"
                                className="gr-period-select"
                                value={salesData.period}
                                onChange={e => {
                                    const period = e.target.value;
                                    setSalesData(prev => ({ ...prev, period }));
                                    setPurchaseData(prev => ({ ...prev, period }));
                                    setITCData(prev => ({ ...prev, period }));
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Helper */}
                <div className="gr-helper">
                    <div className="gr-helper-content">
                        <i className="ti ti-info-circle" />
                        <span>
                            Reconcile your books with GST returns to identify mismatches and ensure compliance. Upload CSV/Excel files or enter amounts manually.
                        </span>
                    </div>
                </div>

                {/* File Upload Section */}
                <div className="gr-upload-section">
                    <div className="gr-upload-header">
                        <h3 className="gr-upload-title">
                            <i className="ti ti-upload" />
                            Quick Upload
                        </h3>
                        <p className="gr-upload-desc">Upload your books data and GST return files for automatic reconciliation</p>
                    </div>
                    
                    <div className="gr-upload-area">
                        <input
                            type="file"
                            id="file-upload"
                            className="gr-file-input"
                            multiple
                            accept=".csv,.xlsx,.xls"
                            onChange={e => handleFileUpload(e.target.files)}
                        />
                        <label htmlFor="file-upload" className="gr-file-label">
                            <div className="gr-upload-icon">
                                <i className="ti ti-cloud-upload" />
                            </div>
                            <div className="gr-upload-text">
                                <strong>Drop files here or click to browse</strong>
                                <span>Supports CSV, Excel files (GSTR-1, GSTR-2A, Books data)</span>
                            </div>
                        </label>

                        {uploadedFiles.length > 0 && (
                            <div className="gr-uploaded-files">
                                <div className="gr-files-header">
                                    <span>{uploadedFiles.length} file(s) uploaded</span>
                                    <button
                                        type="button"
                                        className="gr-process-btn"
                                        onClick={processFiles}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <i className="ti ti-loader gr-spinning" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="ti ti-play" />
                                                Process Files
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="gr-files-list">
                                    {uploadedFiles.map((file, idx) => (
                                        <div key={idx} className="gr-file-item">
                                            <i className="ti ti-file-text" />
                                            <span className="gr-file-name">{file.name}</span>
                                            <span className="gr-file-size">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reconciliation Types */}
                <div className="gr-types-bar">
                    <div className="gr-types">
                        {RECONCILIATION_TYPES.map(type => (
                            <button
                                key={type.id}
                                type="button"
                                className={`gr-type ${activeType === type.id ? "active" : ""}`}
                                onClick={() => setActiveType(type.id)}
                            >
                                <i className={`ti ${type.icon}`} />
                                <span>{type.name}</span>
                                <span className="gr-type-desc">{type.description}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="gr-content">
                    {/* Input Panel */}
                    <div className="gr-input-panel">
                        <div className="gr-panel-header">
                            <i className="ti ti-edit" />
                            <span>Enter Amounts</span>
                        </div>

                        {/* Sales Reconciliation */}
                        {activeType === "sales" && (
                            <div className="gr-input-section">
                                <div className="gr-input-group">
                                    <label className="gr-label">Sales as per Books (₹)</label>
                                    <input
                                        type="number"
                                        className="gr-input"
                                        value={salesData.booksAmount}
                                        onChange={e => setSalesData(prev => ({ ...prev, booksAmount: e.target.value }))}
                                        placeholder="Enter total sales from your books"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="gr-input-group">
                                    <label className="gr-label">Sales as per GSTR-1 (₹)</label>
                                    <input
                                        type="number"
                                        className="gr-input"
                                        value={salesData.gstr1Amount}
                                        onChange={e => setSalesData(prev => ({ ...prev, gstr1Amount: e.target.value }))}
                                        placeholder="Enter total from filed GSTR-1"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="gr-input-help">
                                    <i className="ti ti-bulb" />
                                    <span>Compare your book sales with what you reported in GSTR-1 to identify missing invoices or reporting errors.</span>
                                </div>
                            </div>
                        )}

                        {/* Purchase Reconciliation */}
                        {activeType === "purchases" && (
                            <div className="gr-input-section">
                                <div className="gr-input-group">
                                    <label className="gr-label">Purchases as per Books (₹)</label>
                                    <input
                                        type="number"
                                        className="gr-input"
                                        value={purchaseData.booksAmount}
                                        onChange={e => setPurchaseData(prev => ({ ...prev, booksAmount: e.target.value }))}
                                        placeholder="Enter total purchases from your books"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="gr-input-group">
                                    <label className="gr-label">Purchases as per GSTR-2A (₹)</label>
                                    <input
                                        type="number"
                                        className="gr-input"
                                        value={purchaseData.gstr2aAmount}
                                        onChange={e => setPurchaseData(prev => ({ ...prev, gstr2aAmount: e.target.value }))}
                                        placeholder="Enter total from GSTR-2A"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="gr-input-help">
                                    <i className="ti ti-bulb" />
                                    <span>Match your purchase records with supplier filings (GSTR-2A) to ensure you can claim valid ITC.</span>
                                </div>
                            </div>
                        )}

                        {/* ITC Reconciliation */}
                        {activeType === "itc" && (
                            <div className="gr-input-section">
                                <div className="gr-input-group">
                                    <label className="gr-label">ITC Claimed in GSTR-3B (₹)</label>
                                    <input
                                        type="number"
                                        className="gr-input"
                                        value={itcData.claimedAmount}
                                        onChange={e => setITCData(prev => ({ ...prev, claimedAmount: e.target.value }))}
                                        placeholder="Enter ITC claimed in return"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="gr-input-group">
                                    <label className="gr-label">ITC Available in GSTR-2A (₹)</label>
                                    <input
                                        type="number"
                                        className="gr-input"
                                        value={itcData.availableAmount}
                                        onChange={e => setITCData(prev => ({ ...prev, availableAmount: e.target.value }))}
                                        placeholder="Enter ITC available as per GSTR-2A"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="gr-input-help">
                                    <i className="ti ti-bulb" />
                                    <span>Verify that your ITC claims match the credits available from supplier filings.</span>
                                </div>
                            </div>
                        )}

                        {/* Quick Examples */}
                        <div className="gr-examples">
                            <div className="gr-examples-header">
                                <span>Quick Examples:</span>
                            </div>
                            <div className="gr-examples-list">
                                <button type="button" className="gr-example-btn" onClick={() => {
                                    if (activeType === "sales") {
                                        setSalesData(prev => ({ ...prev, booksAmount: "500000", gstr1Amount: "485000" }));
                                    } else if (activeType === "purchases") {
                                        setPurchaseData(prev => ({ ...prev, booksAmount: "300000", gstr2aAmount: "295000" }));
                                    } else {
                                        setITCData(prev => ({ ...prev, claimedAmount: "45000", availableAmount: "42000" }));
                                    }
                                }}>
                                    Small Business
                                </button>
                                <button type="button" className="gr-example-btn" onClick={() => {
                                    if (activeType === "sales") {
                                        setSalesData(prev => ({ ...prev, booksAmount: "2500000", gstr1Amount: "2480000" }));
                                    } else if (activeType === "purchases") {
                                        setPurchaseData(prev => ({ ...prev, booksAmount: "1500000", gstr2aAmount: "1485000" }));
                                    } else {
                                        setITCData(prev => ({ ...prev, claimedAmount: "225000", availableAmount: "218000" }));
                                    }
                                }}>
                                    Medium Business
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="gr-results-panel">
                        <div className="gr-panel-header">
                            <i className="ti ti-report-analytics" />
                            <span>Reconciliation Results</span>
                            {reconciliationResult && (
                                <div className="gr-panel-actions">
                                    <button
                                        type="button"
                                        className="gr-save-btn"
                                        onClick={handleSaveReconciliation}
                                        title="Save reconciliation"
                                    >
                                        <i className="ti ti-bookmark" />
                                    </button>
                                    <button
                                        type="button"
                                        className={`gr-analysis-btn ${showAnalysis ? "active" : ""}`}
                                        onClick={() => setShowAnalysis(s => !s)}
                                    >
                                        <i className="ti ti-chart-line" />
                                        {showAnalysis ? "Hide" : "Show"} Analysis
                                    </button>
                                </div>
                            )}
                        </div>

                        {!reconciliationResult && (
                            <div className="gr-empty">
                                <div className="gr-empty-icon">
                                    <i className="ti ti-database-import" />
                                </div>
                                <h3 className="gr-empty-title">GST Reconciliation</h3>
                                <p className="gr-empty-desc">
                                    Enter amounts above or upload files to start reconciling your GST returns with book records
                                </p>
                            </div>
                        )}

                        {reconciliationResult && (
                            <div className="gr-results">
                                {/* Summary Cards */}
                                <div className="gr-summary-cards">
                                    <div className="gr-summary-card gr-summary-card--sales">
                                        <div className="gr-summary-icon">
                                            <i className="ti ti-trending-up" />
                                        </div>
                                        <div className="gr-summary-content">
                                            <div className="gr-summary-label">Sales Variance</div>
                                            <div className="gr-summary-value">
                                                {formatCurrency(Math.abs(reconciliationResult.salesVariance))}
                                            </div>
                                            <div className="gr-summary-status">
                                                {reconciliationResult.salesVariance === 0 ? (
                                                    <span className="gr-status gr-status--success">
                                                        <i className="ti ti-check" />
                                                        Matched
                                                    </span>
                                                ) : (
                                                    <span className="gr-status gr-status--warning">
                                                        <i className="ti ti-alert-triangle" />
                                                        {reconciliationResult.salesVariance > 0 ? "Under-reported" : "Over-reported"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="gr-summary-card gr-summary-card--purchases">
                                        <div className="gr-summary-icon">
                                            <i className="ti ti-shopping-cart" />
                                        </div>
                                        <div className="gr-summary-content">
                                            <div className="gr-summary-label">Purchase Variance</div>
                                            <div className="gr-summary-value">
                                                {formatCurrency(Math.abs(reconciliationResult.purchaseVariance))}
                                            </div>
                                            <div className="gr-summary-status">
                                                {reconciliationResult.purchaseVariance === 0 ? (
                                                    <span className="gr-status gr-status--success">
                                                        <i className="ti ti-check" />
                                                        Matched
                                                    </span>
                                                ) : (
                                                    <span className="gr-status gr-status--error">
                                                        <i className="ti ti-x" />
                                                        {reconciliationResult.purchaseVariance > 0 ? "Missing from GSTR-2A" : "Extra in GSTR-2A"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="gr-summary-card gr-summary-card--itc">
                                        <div className="gr-summary-icon">
                                            <i className="ti ti-receipt-refund" />
                                        </div>
                                        <div className="gr-summary-content">
                                            <div className="gr-summary-label">ITC Variance</div>
                                            <div className="gr-summary-value">
                                                {formatCurrency(Math.abs(reconciliationResult.itcVariance))}
                                            </div>
                                            <div className="gr-summary-status">
                                                {reconciliationResult.itcVariance === 0 ? (
                                                    <span className="gr-status gr-status--success">
                                                        <i className="ti ti-check" />
                                                        Matched
                                                    </span>
                                                ) : (
                                                    <span className="gr-status gr-status--error">
                                                        <i className="ti ti-alert-circle" />
                                                        {reconciliationResult.itcVariance > 0 ? "Excess claimed" : "Under-claimed"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="gr-summary-card gr-summary-card--compliance">
                                        <div className="gr-summary-icon">
                                            <i className="ti ti-shield-check" />
                                        </div>
                                        <div className="gr-summary-content">
                                            <div className="gr-summary-label">Compliance Score</div>
                                            <div className="gr-summary-value">
                                                {reconciliationResult.complianceScore}%
                                            </div>
                                            <div className="gr-summary-status">
                                                {reconciliationResult.complianceScore >= 95 ? (
                                                    <span className="gr-status gr-status--success">Excellent</span>
                                                ) : reconciliationResult.complianceScore >= 85 ? (
                                                    <span className="gr-status gr-status--warning">Good</span>
                                                ) : (
                                                    <span className="gr-status gr-status--error">Needs Review</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Breakdown */}
                                <div className="gr-breakdown">
                                    <div className="gr-breakdown-header">
                                        <i className="ti ti-list-details" />
                                        <span>Detailed Breakdown</span>
                                    </div>
                                    <div className="gr-breakdown-items">
                                        {/* Sales */}
                                        <div className="gr-breakdown-section">
                                            <h4 className="gr-breakdown-title">
                                                <i className="ti ti-trending-up" />
                                                Sales Reconciliation
                                            </h4>
                                            <div className="gr-breakdown-rows">
                                                <div className="gr-breakdown-row">
                                                    <span className="gr-breakdown-label">Books Amount</span>
                                                    <span className="gr-breakdown-value">{formatCurrency(reconciliationResult.details.sales.books)}</span>
                                                </div>
                                                <div className="gr-breakdown-row">
                                                    <span className="gr-breakdown-label">GSTR-1 Amount</span>
                                                    <span className="gr-breakdown-value">{formatCurrency(reconciliationResult.details.sales.gstr1)}</span>
                                                </div>
                                                <div className={`gr-breakdown-row gr-breakdown-row--${reconciliationResult.salesVariance === 0 ? 'success' : 'warning'}`}>
                                                    <span className="gr-breakdown-label">
                                                        <strong>Variance</strong>
                                                    </span>
                                                    <span className="gr-breakdown-value">
                                                        <strong>
                                                            {reconciliationResult.salesVariance > 0 ? '+' : ''}
                                                            {formatCurrency(reconciliationResult.salesVariance)}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Purchases */}
                                        <div className="gr-breakdown-section">
                                            <h4 className="gr-breakdown-title">
                                                <i className="ti ti-shopping-cart" />
                                                Purchase Reconciliation
                                            </h4>
                                            <div className="gr-breakdown-rows">
                                                <div className="gr-breakdown-row">
                                                    <span className="gr-breakdown-label">Books Amount</span>
                                                    <span className="gr-breakdown-value">{formatCurrency(reconciliationResult.details.purchases.books)}</span>
                                                </div>
                                                <div className="gr-breakdown-row">
                                                    <span className="gr-breakdown-label">GSTR-2A Amount</span>
                                                    <span className="gr-breakdown-value">{formatCurrency(reconciliationResult.details.purchases.gstr2a)}</span>
                                                </div>
                                                <div className={`gr-breakdown-row gr-breakdown-row--${reconciliationResult.purchaseVariance === 0 ? 'success' : 'error'}`}>
                                                    <span className="gr-breakdown-label">
                                                        <strong>Variance</strong>
                                                    </span>
                                                    <span className="gr-breakdown-value">
                                                        <strong>
                                                            {reconciliationResult.purchaseVariance > 0 ? '+' : ''}
                                                            {formatCurrency(reconciliationResult.purchaseVariance)}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ITC */}
                                        <div className="gr-breakdown-section">
                                            <h4 className="gr-breakdown-title">
                                                <i className="ti ti-receipt-refund" />
                                                ITC Reconciliation
                                            </h4>
                                            <div className="gr-breakdown-rows">
                                                <div className="gr-breakdown-row">
                                                    <span className="gr-breakdown-label">Claimed in GSTR-3B</span>
                                                    <span className="gr-breakdown-value">{formatCurrency(reconciliationResult.details.itc.claimed)}</span>
                                                </div>
                                                <div className="gr-breakdown-row">
                                                    <span className="gr-breakdown-label">Available in GSTR-2A</span>
                                                    <span className="gr-breakdown-value">{formatCurrency(reconciliationResult.details.itc.available)}</span>
                                                </div>
                                                <div className={`gr-breakdown-row gr-breakdown-row--${reconciliationResult.itcVariance === 0 ? 'success' : 'error'}`}>
                                                    <span className="gr-breakdown-label">
                                                        <strong>Variance</strong>
                                                    </span>
                                                    <span className="gr-breakdown-value">
                                                        <strong>
                                                            {reconciliationResult.itcVariance > 0 ? '+' : ''}
                                                            {formatCurrency(reconciliationResult.itcVariance)}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                {reconciliationResult.recommendations.length > 0 && (
                                    <div className="gr-recommendations">
                                        <div className="gr-recommendations-header">
                                            <i className="ti ti-lightbulb" />
                                            <span>Recommendations</span>
                                        </div>
                                        <div className="gr-recommendations-list">
                                            {reconciliationResult.recommendations.map((rec, idx) => (
                                                <div key={idx} className={`gr-recommendation gr-recommendation--${rec.severity}`}>
                                                    <div className="gr-recommendation-icon">
                                                        <i className={`ti ${rec.icon}`} />
                                                    </div>
                                                    <div className="gr-recommendation-content">
                                                        <div className="gr-recommendation-title">{rec.title}</div>
                                                        <div className="gr-recommendation-desc">{rec.description}</div>
                                                        {rec.action && (
                                                            <div className="gr-recommendation-action">
                                                                <strong>Action:</strong> {rec.action}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Analysis Section */}
                {showAnalysis && reconciliationResult && (
                    <div className="gr-analysis-section">
                        <ReconcileAnalysis
                            result={reconciliationResult}
                            period={salesData.period}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="gr-footer">
                    <div className="gr-footer-left">
                        <i className="ti ti-shield-lock" />
                        <span>All data is processed locally. Files are not uploaded to any server.</span>
                    </div>
                    {reconciliationResult && (
                        <div className="gr-footer-right">
                            <span>Period: {salesData.period}</span>
                            <span>·</span>
                            <span>Compliance: {reconciliationResult.complianceScore}%</span>
                            <span>·</span>
                            <span>Variances: {(Math.abs(reconciliationResult.salesVariance) + Math.abs(reconciliationResult.purchaseVariance) + Math.abs(reconciliationResult.itcVariance)) === 0 ? 'None' : 'Found'}</span>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .gr-root {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    min-height: 680px;
                    overflow: hidden;
                }

                /* Chrome */
                .gr-chrome {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                    flex-wrap: wrap;
                }

                .gr-chrome-left,
                .gr-chrome-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .gr-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text);
                }

                .gr-title-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 7px;
                    background: #8b5cf620;
                    color: #8b5cf6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                }

                .gr-title-badge {
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 7px;
                    border-radius: 99px;
                    background: #fbbf24;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .gr-period-input {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .gr-period-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .gr-period-select {
                    height: 30px;
                    padding: 0 8px;
                    border: 0.5px solid var(--border);
                    border-radius: 7px;
                    background: var(--bg-card);
                    color: var(--text);
                    font-size: 12px;
                    outline: none;
                    cursor: pointer;
                }

                /* Helper */
                .gr-helper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px 16px;
                    background: #f0f9ff;
                    border-bottom: 0.5px solid #bae6fd;
                    flex-shrink: 0;
                }

                @media (prefers-color-scheme: dark) {
                    .gr-helper {
                        background: #0c1e2e;
                        border-color: #1e3a8a;
                    }
                }

                .gr-helper-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    text-align: center;
                    max-width: 600px;
                }

                .gr-helper-content i {
                    font-size: 16px;
                    color: #0ea5e9;
                    flex-shrink: 0;
                }

                /* Upload Section */
                .gr-upload-section {
                    padding: 16px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    flex-shrink: 0;
                }

                .gr-upload-header {
                    text-align: center;
                    margin-bottom: 16px;
                }

                .gr-upload-title {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0 0 4px 0;
                }

                .gr-upload-title i {
                    font-size: 18px;
                    color: var(--brand);
                }

                .gr-upload-desc {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                }

                .gr-upload-area {
                    max-width: 500px;
                    margin: 0 auto;
                }

                .gr-file-input {
                    display: none;
                }

                .gr-file-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 24px;
                    border: 2px dashed var(--border);
                    border-radius: 12px;
                    background: var(--bg-card);
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .gr-file-label:hover {
                    border-color: var(--brand);
                    background: var(--brand-light);
                }

                .gr-upload-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: var(--brand-light);
                    color: var(--brand);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .gr-upload-text {
                    text-align: center;
                }

                .gr-upload-text strong {
                    display: block;
                    font-size: 14px;
                    color: var(--text);
                    margin-bottom: 4px;
                }

                .gr-upload-text span {
                    font-size: 12px;
                    color: var(--text-tertiary);
                }

                .gr-uploaded-files {
                    margin-top: 16px;
                    padding: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                }

                .gr-files-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                }

                .gr-process-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    height: 26px;
                    padding: 0 10px;
                    border: none;
                    border-radius: 6px;
                    background: var(--brand);
                    color: white;
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.12s;
                }

                .gr-process-btn:hover:not(:disabled) {
                    background: var(--brand-hover);
                }

                .gr-process-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .gr-spinning {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .gr-files-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .gr-file-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 8px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 6px;
                    font-size: 11px;
                }

                .gr-file-item i {
                    color: var(--text-tertiary);
                }

                .gr-file-name {
                    flex: 1;
                    color: var(--text);
                    font-weight: 500;
                }

                .gr-file-size {
                    color: var(--text-tertiary);
                }

                /* Types Bar */
                .gr-types-bar {
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    padding: 8px 16px;
                    flex-shrink: 0;
                }

                .gr-types {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                }

                .gr-type {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 12px;
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    background: var(--bg-card);
                    color: var(--text-tertiary);
                    cursor: pointer;
                    transition: all 0.12s;
                    min-width: 120px;
                    text-align: center;
                }

                .gr-type:hover {
                    border-color: var(--brand-border);
                    background: var(--brand-light);
                    color: var(--text);
                }

                .gr-type.active {
                    border-color: var(--brand);
                    background: var(--brand);
                    color: white;
                }

                .gr-type i {
                    font-size: 18px;
                }

                .gr-type span:nth-child(2) {
                    font-size: 12px;
                    font-weight: 600;
                }

                .gr-type-desc {
                    font-size: 10px !important;
                    opacity: 0.8;
                }

                /* Content */
                .gr-content {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 0;
                    overflow: hidden;
                }

                .gr-input-panel,
                .gr-results-panel {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-height: 0;
                }

                .gr-input-panel {
                    border-right: 0.5px solid var(--border);
                }

                .gr-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    height: 38px;
                    padding: 0 14px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.09em;
                    flex-shrink: 0;
                }

                .gr-panel-header i {
                    font-size: 12px;
                }

                .gr-panel-actions {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .gr-save-btn,
                .gr-analysis-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    height: 26px;
                    padding: 0 9px;
                    border: 0.5px solid var(--border);
                    border-radius: 7px;
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                    white-space: nowrap;
                }

                .gr-save-btn:hover,
                .gr-analysis-btn:hover {
                    background: var(--bg-surface);
                    color: var(--text);
                }

                .gr-analysis-btn.active {
                    background: var(--brand);
                    color: white;
                    border-color: var(--brand);
                }

                /* Input Section */
                .gr-input-section {
                    flex: 1;
                    padding: 20px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    background: var(--bg-card);
                }

                .gr-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .gr-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .gr-input {
                    height: 44px;
                    padding: 0 12px;
                    border: 2px solid var(--border);
                    border-radius: 8px;
                    background: var(--bg-surface);
                    color: var(--text);
                    font-size: 16px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                    outline: none;
                    transition: all 0.12s;
                }

                .gr-input:focus {
                    border-color: var(--brand);
                    box-shadow: 0 0 0 3px var(--brand-light);
                }

                .gr-input-help {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    padding: 10px;
                    background: #eff6ff;
                    border: 0.5px solid #bfdbfe;
                    border-radius: 6px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                @media (prefers-color-scheme: dark) {
                    .gr-input-help {
                        background: #0a1628;
                        border-color: #1e3a5f;
                    }
                }

                .gr-input-help i {
                    font-size: 14px;
                    color: #0ea5e9;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .gr-examples {
                    margin-top: auto;
                    padding-top: 16px;
                    border-top: 0.5px solid var(--border);
                }

                .gr-examples-header {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .gr-examples-list {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .gr-example-btn {
                    height: 28px;
                    padding: 0 10px;
                    border: 0.5px solid var(--border);
                    border-radius: 6px;
                    background: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.12s;
                }

                .gr-example-btn:hover {
                    background: var(--brand-light);
                    color: var(--brand-text);
                    border-color: var(--brand-border);
                }

                /* Results */
                .gr-results {
                    flex: 1;
                    padding: 20px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--bg-card);
                }

                .gr-summary-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .gr-summary-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                }

                .gr-summary-card--sales {
                    border-color: #10b98140;
                    background: linear-gradient(135deg, #10b98110 0%, var(--bg-surface) 100%);
                }

                .gr-summary-card--purchases {
                    border-color: #3b82f640;
                    background: linear-gradient(135deg, #3b82f610 0%, var(--bg-surface) 100%);
                }

                .gr-summary-card--itc {
                    border-color: #f59e0b40;
                    background: linear-gradient(135deg, #f59e0b10 0%, var(--bg-surface) 100%);
                }

                .gr-summary-card--compliance {
                    border-color: #8b5cf640;
                    background: linear-gradient(135deg, #8b5cf610 0%, var(--bg-surface) 100%);
                }

                .gr-summary-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: var(--bg-card);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .gr-summary-card--sales .gr-summary-icon {
                    color: #10b981;
                }

                .gr-summary-card--purchases .gr-summary-icon {
                    color: #3b82f6;
                }

                .gr-summary-card--itc .gr-summary-icon {
                    color: #f59e0b;
                }

                .gr-summary-card--compliance .gr-summary-icon {
                    color: #8b5cf6;
                }

                .gr-summary-content {
                    flex: 1;
                    min-width: 0;
                }

                .gr-summary-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .gr-summary-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                    margin-bottom: 6px;
                }

                .gr-summary-status {
                    display: flex;
                    align-items: center;
                }

                .gr-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .gr-status--success {
                    background: #dcfce7;
                    color: #166534;
                }

                .gr-status--warning {
                    background: #fef3c7;
                    color: #92400e;
                }

                .gr-status--error {
                    background: #fef2f2;
                    color: #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .gr-status--success { background: #022c22; color: #4ade80; }
                    .gr-status--warning { background: #451a03; color: #fbbf24; }
                    .gr-status--error { background: #1f1517; color: #f87171; }
                }

                .gr-status i {
                    font-size: 10px;
                }

                /* Breakdown */
                .gr-breakdown {
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .gr-breakdown-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .gr-breakdown-header i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .gr-breakdown-items {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .gr-breakdown-section {
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .gr-breakdown-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: var(--bg-surface);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    margin: 0;
                }

                .gr-breakdown-title i {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .gr-breakdown-rows {
                    padding: 8px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--border);
                }

                .gr-breakdown-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 10px;
                    background: var(--bg-card);
                    font-size: 13px;
                }

                .gr-breakdown-row--success {
                    background: #dcfce7;
                }

                .gr-breakdown-row--warning {
                    background: #fef3c7;
                }

                .gr-breakdown-row--error {
                    background: #fef2f2;
                }

                @media (prefers-color-scheme: dark) {
                    .gr-breakdown-row--success { background: #022c22; }
                    .gr-breakdown-row--warning { background: #451a03; }
                    .gr-breakdown-row--error { background: #1f1517; }
                }

                .gr-breakdown-label {
                    color: var(--text-secondary);
                }

                .gr-breakdown-value {
                    color: var(--text);
                    font-family: var(--font-mono);
                    font-weight: 600;
                }

                /* Recommendations */
                .gr-recommendations {
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .gr-recommendations-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--bg-card);
                    border-bottom: 0.5px solid var(--border);
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .gr-recommendations-header i {
                    font-size: 14px;
                    color: #fbbf24;
                }

                .gr-recommendations-list {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .gr-recommendation {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 0.5px solid;
                }

                .gr-recommendation--info {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                }

                .gr-recommendation--warning {
                    background: #fef3c7;
                    border-color: #fde68a;
                }

                .gr-recommendation--error {
                    background: #fef2f2;
                    border-color: #fecaca;
                }

                @media (prefers-color-scheme: dark) {
                    .gr-recommendation--info { background: #0a1628; border-color: #1e3a5f; }
                    .gr-recommendation--warning { background: #451a03; border-color: #78350f; }
                    .gr-recommendation--error { background: #1f1517; border-color: #3c1518; }
                }

                .gr-recommendation-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .gr-recommendation--info .gr-recommendation-icon {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .gr-recommendation--warning .gr-recommendation-icon {
                    background: #fde68a;
                    color: #92400e;
                }

                .gr-recommendation--error .gr-recommendation-icon {
                    background: #fecaca;
                    color: #dc2626;
                }

                @media (prefers-color-scheme: dark) {
                    .gr-recommendation--info .gr-recommendation-icon { background: #1e3a5f; color: #93c5fd; }
                    .gr-recommendation--warning .gr-recommendation-icon { background: #78350f; color: #fbbf24; }
                    .gr-recommendation--error .gr-recommendation-icon { background: #3c1518; color: #f87171; }
                }

                .gr-recommendation-content {
                    flex: 1;
                }

                .gr-recommendation-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    margin-bottom: 4px;
                }

                .gr-recommendation-desc {
                    font-size: 12px;
                    line-height: 1.5;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                }

                .gr-recommendation-action {
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .gr-recommendation-action strong {
                    color: var(--text);
                }

                /* Empty State */
                .gr-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    padding: 60px 24px;
                    text-align: center;
                }

                .gr-empty-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: var(--text-disabled);
                }

                .gr-empty-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0;
                }

                .gr-empty-desc {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    margin: 0;
                    max-width: 380px;
                    line-height: 1.6;
                }

                /* Analysis Section */
                .gr-analysis-section {
                    border-top: 0.5px solid var(--border);
                    background: var(--bg-surface);
                    max-height: 600px;
                    overflow: auto;
                    flex-shrink: 0;
                }

                /* Footer */
                .gr-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 9px 16px;
                    background: var(--bg-surface);
                    border-top: 0.5px solid var(--border);
                    font-size: 11px;
                    flex-shrink: 0;
                    flex-wrap: wrap;
                }

                .gr-footer-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-tertiary);
                }

                .gr-footer-left i {
                    font-size: 13px;
                    color: #8b5cf6;
                }

                .gr-footer-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-disabled);
                    font-family: var(--font-mono);
                    flex-wrap: wrap;
                }

                /* Mobile Responsive */
                @media (max-width: 968px) {
                    .gr-root {
                        border-radius: 0;
                        border-left: none;
                        border-right: none;
                        min-height: 100dvh;
                    }

                    .gr-content {
                        grid-template-columns: 1fr;
                    }

                    .gr-input-panel {
                        border-right: none;
                        border-bottom: 0.5px solid var(--border);
                    }

                    .gr-summary-cards {
                        grid-template-columns: 1fr;
                    }

                    .gr-types {
                        flex-direction: column;
                        gap: 6px;
                    }

                    .gr-type {
                        flex-direction: row;
                        justify-content: flex-start;
                        text-align: left;
                        min-width: 0;
                    }

                    .gr-footer {
                        flex-direction: column;
                        text-align: center;
                        gap: 6px;
                    }

                    .gr-footer-right {
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}