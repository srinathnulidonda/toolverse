// components/widgets/FloatingWidget.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useLocalStorage from "@/lib/useLocalStorage";
import WidgetTasks from "./WidgetTasks";
import WidgetNotes from "./WidgetNotes";
import { Task, Note, TASKS_STORAGE_KEY, NOTES_STORAGE_KEY } from "./widgetTypes";

type ViewMode = "minimized" | "expanded" | "full";
type ActiveTab = "tasks" | "notes";

const WIDGET_POSITION_KEY = "tv:widget-position";
const ACTIVE_TAB_KEY = "tv:active-tab";

export default function FloatingWidget() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("minimized");
  const [activeTab, setActiveTab] = useLocalStorage<ActiveTab>(ACTIVE_TAB_KEY, "tasks");
  const [position, setPosition] = useLocalStorage(WIDGET_POSITION_KEY, {
    bottom: 24,
    right: 24,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [tasks, setTasks] = useLocalStorage<Task[]>(TASKS_STORAGE_KEY, []);
  const [notes, setNotes] = useLocalStorage<Note[]>(NOTES_STORAGE_KEY, []);

  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setViewMode((prev) => (prev === "minimized" ? "expanded" : "minimized"));
      }
      if (e.key === "Escape") {
        setViewMode((prev) => (prev === "full" ? "expanded" : prev === "expanded" ? "minimized" : prev));
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === "minimized") {
      setIsDragging(true);
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newBottom = window.innerHeight - e.clientY - dragOffset.y;
      const newRight = window.innerWidth - e.clientX - dragOffset.x;
      setPosition({
        bottom: Math.max(10, Math.min(newBottom, window.innerHeight - 100)),
        right: Math.max(10, Math.min(newRight, window.innerWidth - 100)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, setPosition]);

  if (!mounted) return null;

  const pendingCount = tasks.filter((t) => !t.completed).length;

  if (viewMode === "full") {
    return createPortal(
      <div className="fw-overlay" onClick={() => setViewMode("expanded")}>
        <div className="fw-full-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <div className="fw-full-header">
            <div className="fw-tab-track">
              <button className={`fw-tab ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
                <TasksTabIcon size={15} /> Tasks
              </button>
              <button className={`fw-tab ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
                <NotesTabIcon size={15} /> Notes
              </button>
            </div>
            <div className="fw-full-header-actions">
              <button className="fw-icon-btn" onClick={() => setViewMode("expanded")} aria-label="Shrink to panel" title="Shrink">
                <ShrinkIcon />
              </button>
              <button className="fw-icon-btn fw-icon-btn-close" onClick={() => setViewMode("minimized")} aria-label="Close" title="Close">
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className="fw-full-content">
            {activeTab === "tasks" ? (
              <WidgetTasks variant="full" tasks={tasks} setTasks={setTasks} />
            ) : (
              <WidgetNotes variant="full" notes={notes} setNotes={setNotes} />
            )}
          </div>
        </div>

        <style>{`
          .fw-overlay {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(10, 10, 8, 0.5);
            backdrop-filter: blur(4px);
            animation: fwFadeIn 0.15s ease;
          }
          .fw-full-panel {
            width: 100%;
            max-width: 920px;
            height: 100%;
            max-height: 680px;
            background: var(--bg-card);
            border: 0.5px solid var(--border);
            border-radius: 16px;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: var(--font-sans);
            animation: fwSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .fw-full-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            border-bottom: 1px solid var(--border);
            background: var(--bg-surface);
            flex-shrink: 0;
            gap: 12px;
          }
          
          .fw-tab-track {
            display: flex;
            align-items: center;
            gap: 2px;
            padding: 3px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 10px;
          }
          .fw-tab {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 13px;
            border-radius: 7px;
            border: none;
            background: none;
            color: var(--text-tertiary);
            font-size: 12.5px;
            font-weight: 500;
            font-family: var(--font-sans);
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
          }
          .fw-tab:hover {
            color: var(--text-secondary);
          }
          .fw-tab svg {
            opacity: 0.8;
            transition: opacity 0.15s ease, color 0.15s ease;
          }
          .fw-tab.active {
            background: var(--bg-card);
            color: var(--text);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          }
          .fw-tab.active svg {
            opacity: 1;
            color: #4CAF82;
          }

          .fw-full-header-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
          }
          .fw-icon-btn {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            border: none;
            background: none;
            color: var(--text-tertiary);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s ease, color 0.15s ease;
            cursor: pointer;
          }
          .fw-icon-btn:hover {
            background: var(--bg-card);
            color: var(--text);
          }
          .fw-icon-btn:active {
            transform: scale(0.94);
          }
          .fw-icon-btn-close:hover {
            background: rgba(224, 82, 82, 0.12);
            color: #E05252;
          }

          .fw-full-content {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          @keyframes fwFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fwSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 768px) {
            .fw-overlay {
              padding: 16px;
            }
            .fw-full-panel {
              max-width: 100%;
              max-height: 100%;
              border-radius: 12px;
            }
            .fw-full-header {
              padding: 12px 14px;
            }
            .fw-tab {
              padding: 6px 11px;
              font-size: 12px;
            }
          }

          @media (max-width: 480px) {
            .fw-overlay {
              padding: 12px;
            }
            .fw-tab {
              padding: 6px 9px;
              gap: 4px;
              font-size: 11.5px;
            }
            .fw-tab-track {
              padding: 2px;
            }
          }
        `}</style>
      </div>,
      document.body
    );
  }

  const widget = (
    <div
      ref={widgetRef}
      className={`fw-root ${isDragging ? "dragging" : ""}`}
      style={{ position: "fixed", bottom: `${position.bottom}px`, right: `${position.right}px`, zIndex: 9999 }}
    >
      {viewMode === "minimized" && (
        <button
          className="fw-fab"
          onMouseDown={handleMouseDown}
          onClick={() => !isDragging && setViewMode("expanded")}
          aria-label="Open widget"
        >
          {activeTab === "tasks" ? <TasksTabIcon size={20} /> : <NotesTabIcon size={20} />}
          {pendingCount > 0 && <span className="fw-badge">{pendingCount > 9 ? "9+" : pendingCount}</span>}
        </button>
      )}

      {viewMode === "expanded" && (
        <div className="fw-panel">
          <div className="fw-header">
            <div className="fw-tab-track">
              <button className={`fw-tab ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
                <TasksTabIcon /> Tasks
              </button>
              <button className={`fw-tab ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
                <NotesTabIcon /> Notes
              </button>
            </div>
            <div className="fw-header-actions">
              <button className="fw-icon-btn" onClick={() => setViewMode("full")} aria-label="Expand to full view" title="Expand">
                <ExpandIcon />
              </button>
              <button className="fw-icon-btn fw-icon-btn-close" onClick={() => setViewMode("minimized")} aria-label="Close" title="Close">
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="fw-content">
            {activeTab === "tasks" ? (
              <WidgetTasks variant="compact" tasks={tasks} setTasks={setTasks} onExpand={() => setViewMode("full")} />
            ) : (
              <WidgetNotes variant="compact" notes={notes} setNotes={setNotes} onExpand={() => setViewMode("full")} />
            )}
          </div>
        </div>
      )}

      <style>{`
        .fw-root {
          font-family: var(--font-sans);
        }
        .fw-root.dragging {
          cursor: grabbing;
        }

        /* FAB */
        .fw-fab {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--text);
          border: none;
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fw-fab:hover {
          background: var(--text-secondary);
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.12);
        }
        .fw-fab:active {
          transform: scale(0.98);
        }
        .fw-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 10px;
          background: #E05252;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg);
          line-height: 1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        /* Mobile responsive FAB */
        @media (max-width: 768px) {
          .fw-fab {
            width: 48px;
            height: 48px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .fw-fab:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 5px rgba(0, 0, 0, 0.12);
          }
          .fw-fab svg {
            width: 18px;
            height: 18px;
          }
          .fw-badge {
            top: -1px;
            right: -1px;
            min-width: 18px;
            height: 18px;
            font-size: 10px;
            border-width: 1.5px;
          }
        }

        @media (max-width: 480px) {
          .fw-fab {
            width: 44px;
            height: 44px;
          }
          .fw-fab svg {
            width: 17px;
            height: 17px;
          }
          .fw-badge {
            min-width: 16px;
            height: 16px;
            font-size: 9px;
          }
        }

        /* Panel */
        .fw-panel {
          width: 380px;
          max-height: 600px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(255, 255, 255, 0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: fwPanelIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fwPanelIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Header */
        .fw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface);
          gap: 8px;
        }
        .fw-header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .fw-tab-track {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .fw-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          background: none;
          color: var(--text-tertiary);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .fw-tab:hover {
          color: var(--text-secondary);
        }
        .fw-tab svg {
          opacity: 0.8;
          transition: opacity 0.15s ease, color 0.15s ease;
        }
        .fw-tab.active {
          background: var(--bg-card);
          color: var(--text);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
        }
        .fw-tab.active svg {
          opacity: 1;
          color: #4CAF82;
        }

        .fw-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: none;
          background: none;
          color: var(--text-tertiary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, color 0.15s ease;
          flex-shrink: 0;
        }
        .fw-icon-btn:hover {
          background: var(--bg-card);
          color: var(--text);
        }
        .fw-icon-btn:active {
          transform: scale(0.94);
        }
        .fw-icon-btn-close:hover {
          background: rgba(224, 82, 82, 0.12);
          color: #E05252;
        }

        /* Content */
        .fw-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .fw-panel {
            width: calc(100vw - 32px);
            max-width: 380px;
          }
        }

        @media (max-width: 480px) {
          .fw-panel {
            width: calc(100vw - 24px);
            max-height: calc(100vh - 120px);
          }
          .fw-header {
            padding: 9px 10px;
          }
          .fw-tab {
            padding: 6px 8px;
            gap: 4px;
            font-size: 11.5px;
          }
          .fw-tab-track {
            padding: 2px;
          }
          .fw-icon-btn {
            width: 26px;
            height: 26px;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(widget, document.body);
}

// ── Icons ────────────────────────────────────────────────────────────────

function TasksTabIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function NotesTabIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function ShrinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}