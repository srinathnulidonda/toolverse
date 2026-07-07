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
            header: { size: headerSize, percent: headerPercent, claims: Object.keys(decoded.header).length },
            payload: { size: payloadSize, percent: payloadPercent, claims: Object.keys(decoded.payload).length },
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
            
            <style jsx>{`
                .tv-root {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    background: var(--bg-card);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-lg);
                }
                
                .tv-visual {
                    display: flex;
                    align-items: stretch;
                    gap: 0;
                    height: 80px;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    border: 0.5px solid var(--border);
                }
                
                .tv-part {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    min-width: 60px;
                    position: relative;
                    transition: all 0.2s;
                }
                
                .tv-part:hover {
                    filter: brightness(1.1);
                    z-index: 1;
                    transform: scale(1.02);
                }
                
                .tv-part--header {
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                }
                
                .tv-part--payload {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                }
                
                .tv-part--signature {
                    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
                }
                
                .tv-part-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.95);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .tv-part-size {
                    font-size: 13px;
                    font-weight: 700;
                    color: white;
                    font-family: var(--font-mono);
                }
                
                .tv-dot {
                    display: flex;
                    align-items: center;
                    padding: 0 2px;
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text-disabled);
                    background: var(--bg-surface);
                }
                
                .tv-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }
                
                .tv-stat {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 12px;
                    background: var(--bg-surface);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-md);
                }
                
                .tv-stat-label {
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .tv-stat-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text);
                    font-family: var(--font-mono);
                }
                
                .tv-breakdown {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    padding-top: 8px;
                    border-top: 0.5px solid var(--border-faint);
                }
                
                .tv-breakdown-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                
                .tv-breakdown-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                    flex-shrink: 0;
                }
                
                .tv-breakdown-color--header {
                    background: #3B82F6;
                }
                
                .tv-breakdown-color--payload {
                    background: #10B981;
                }
                
                .tv-breakdown-color--signature {
                    background: #8B5CF6;
                }
                
                @media (max-width: 768px) {
                    .tv-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .tv-visual {
                        height: 60px;
                    }
                    
                    .tv-part-label {
                        font-size: 9px;
                    }
                    
                    .tv-part-size {
                        font-size: 11px;
                    }
                }
            `}</style>
        </>
    );
}