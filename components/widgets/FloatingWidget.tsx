//components/widgets/FloatingWidget.tsx
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import useLocalStorage from "@/lib/useLocalStorage";
import WidgetTasks from "./WidgetTasks";
import WidgetNotes from "./WidgetNotes";
import {
  Task,
  Note,
  Priority,
  ChecklistItem,
  TASKS_STORAGE_KEY,
  NOTES_STORAGE_KEY,
  TASKS_DRAFT_KEY,
  NOTES_DRAFT_KEY,
  cleanTasks,
  cleanNotes,
} from "./widgetTypes";

type ViewMode = "minimized" | "expanded" | "full";
type ActiveTab = "tasks" | "notes";
type Filter = "all" | "active" | "completed";

const WIDGET_POSITION_KEY = "tv:widget-position";
const ACTIVE_TAB_KEY = "tv:active-tab";

const MAX_PANEL_HEIGHT = 600; // Match actual CSS
const MAX_PANEL_WIDTH = 380; // Match actual CSS
const DRAG_THRESHOLD = 4;

interface TasksDraft {
  input: string;
  priority: Priority;
  showPicker: boolean;
  search: string;
  filter: Filter;
  showCompleted: boolean;
}

interface NotesDraft {
  activeNote: string | null;
  title: string;
  content: string;
  type?: "note" | "checklist";
  items?: ChecklistItem[];
  composerOpen: boolean;
  showCompleted?: boolean;
}

const DEFAULT_TASKS_DRAFT: TasksDraft = {
  input: "",
  priority: "medium",
  showPicker: false,
  search: "",
  filter: "all",
  showCompleted: true,
};

const DEFAULT_NOTES_DRAFT: NotesDraft = {
  activeNote: null,
  title: "",
  content: "",
  type: "note",
  items: [],
  composerOpen: false,
  showCompleted: true,
};

export default function FloatingWidget() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("minimized");
  const [activeTab, setActiveTab] = useLocalStorage<ActiveTab>(ACTIVE_TAB_KEY, "notes");

  const [persistedPosition, setPersistedPosition] = useLocalStorage(WIDGET_POSITION_KEY, {
    bottom: 24,
    right: 24,
  });

  const [livePosition, setLivePosition] = useState(persistedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [rawTasks, setRawTasks] = useLocalStorage<Task[]>(TASKS_STORAGE_KEY, []);
  const [rawNotes, setRawNotes] = useLocalStorage<Note[]>(NOTES_STORAGE_KEY, []);

  const tasks = useMemo(() => cleanTasks(rawTasks), [rawTasks]);
  const notes = useMemo(() => cleanNotes(rawNotes), [rawNotes]);

  const setTasks = (value: Task[] | ((prev: Task[]) => Task[])) => setRawTasks(value);
  const setNotes = (value: Note[] | ((prev: Note[]) => Note[])) => setRawNotes(value);

  const [notesDraft, setNotesDraft] = useLocalStorage<NotesDraft>(
    NOTES_DRAFT_KEY,
    DEFAULT_NOTES_DRAFT
  );
  const [tasksDraft, setTasksDraft] = useLocalStorage<TasksDraft>(
    TASKS_DRAFT_KEY,
    DEFAULT_TASKS_DRAFT
  );

  const widgetRef = useRef<HTMLDivElement>(null);
  const hasDraggedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const livePositionRef = useRef(livePosition);
  const isDraggingRef = useRef(isDragging);

  useEffect(() => {
    livePositionRef.current = livePosition;
  }, [livePosition]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isDragging) {
      setLivePosition(persistedPosition);
    }
  }, [mounted, persistedPosition, isDragging]);

  // Auto-drop to expanded when switching to tasks while in full mode
  useEffect(() => {
    if (viewMode === "full" && activeTab === "tasks") {
      setViewMode("expanded");
    }
  }, [activeTab, viewMode]);

  const clampPosition = (
    pos: { bottom: number; right: number },
    currentViewMode: ViewMode = viewMode
  ) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Use actual measured panel size on mobile
    let maxHeight = currentViewMode === "expanded" ? MAX_PANEL_HEIGHT : 100;
    let maxWidth = currentViewMode === "expanded" ? MAX_PANEL_WIDTH : 100;

    if (viewportWidth < 768) {
      maxWidth = Math.min(MAX_PANEL_WIDTH, viewportWidth - 32);
    }

    if (viewportHeight < 768) {
      maxHeight = Math.min(MAX_PANEL_HEIGHT, viewportHeight - 120);
    }

    if (viewportWidth < MAX_PANEL_WIDTH + 20) {
      return {
        bottom: Math.max(10, Math.min(pos.bottom, viewportHeight - maxHeight)),
        right: 10,
      };
    }

    return {
      bottom: Math.max(10, Math.min(pos.bottom, viewportHeight - maxHeight)),
      right: Math.max(10, Math.min(pos.right, viewportWidth - maxWidth)),
    };
  };

  useEffect(() => {
    const handleResize = () => {
      const clamped = clampPosition(persistedPosition);
      setPersistedPosition(clamped);
      if (!isDraggingRef.current) {
        setLivePosition(clamped);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [persistedPosition, setPersistedPosition, viewMode]);

  useEffect(() => {
    if (viewMode === "expanded") {
      const clampedForExpanded = clampPosition(livePositionRef.current, "expanded");
      setLivePosition(clampedForExpanded);
      if (!isDraggingRef.current) {
        setPersistedPosition(clampedForExpanded);
      }
    }
  }, [viewMode, setPersistedPosition]);

  // Tab-aware keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !isTyping) {
        e.preventDefault();
        setViewMode((prev) => {
          if (prev === "minimized") return "expanded";
          // Don't allow full mode when tasks tab is active
          if (prev === "expanded" && activeTab === "notes") return "full";
          return "minimized";
        });
      }

      if (e.key === "Escape" && !isTyping) {
        setViewMode((prev) => {
          if (prev === "full") return "expanded";
          if (prev === "expanded") return "minimized";
          return prev;
        });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [activeTab]); // Add activeTab dependency

  useEffect(() => {
    if (viewMode !== "full") return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    setTimeout(() => {
      widgetRef.current
        ?.querySelector<HTMLElement>(
          "button:not(:disabled), input, [tabindex]:not([tabindex='-1'])"
        )
        ?.focus();
    }, 100);

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const modal = widgetRef.current?.querySelector(".fw-full-panel");
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, input, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", trapFocus);
      previouslyFocused?.focus();
    };
  }, [viewMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };

    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: rect.right - e.clientX,
        y: rect.bottom - e.clientY,
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    hasDraggedRef.current = false;
    startPosRef.current = { x: touch.clientX, y: touch.clientY };

    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: rect.right - touch.clientX,
        y: rect.bottom - touch.clientY,
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const clamp = (clientX: number, clientY: number) => {
      const dx = clientX - startPosRef.current.x;
      const dy = clientY - startPosRef.current.y;

      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
      }

      const newBottom = window.innerHeight - clientY - dragOffset.y;
      const newRight = window.innerWidth - clientX - dragOffset.x;

      setLivePosition(clampPosition({ bottom: newBottom, right: newRight }));
    };

    const handleMouseMove = (e: MouseEvent) => clamp(e.clientX, e.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      clamp(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setPersistedPosition(livePositionRef.current);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setPersistedPosition(livePositionRef.current);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset, setPersistedPosition, viewMode]);

  const handleDragKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 10;
    let newPos = { ...livePosition };

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        newPos.right += step;
        break;
      case "ArrowRight":
        e.preventDefault();
        newPos.right -= step;
        break;
      case "ArrowUp":
        e.preventDefault();
        newPos.bottom += step;
        break;
      case "ArrowDown":
        e.preventDefault();
        newPos.bottom -= step;
        break;
      default:
        return;
    }

    const clamped = clampPosition(newPos);
    setLivePosition(clamped);
    setPersistedPosition(clamped);
  };

  if (!mounted) return null;

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const renderWidgetContent = () => {
    if (activeTab === "tasks") {
      return (
        <WidgetTasks
          tasks={tasks}
          setTasks={setTasks}
          draft={tasksDraft}
          setDraft={setTasksDraft}
          // No onExpand prop - tasks are always compact
        />
      );
    } else {
      return (
        <WidgetNotes
          variant={viewMode === "full" ? "full" : "compact"}
          notes={notes}
          setNotes={setNotes}
          draft={notesDraft}
          setDraft={setNotesDraft}
          onExpand={() => setViewMode("full")}
        />
      );
    }
  };

  if (viewMode === "full") {
    return createPortal(
      <div className="fw-overlay" onClick={() => setViewMode("expanded")}>
        <div
          ref={widgetRef}
          className="fw-full-panel"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="fw-full-header">
            <div className="fw-tab-track">
              <button
                className={`fw-tab ${activeTab === "tasks" ? "active" : ""}`}
                onClick={() => setActiveTab("tasks")}
              >
                <TasksTabIcon size={15} /> Tasks
              </button>
              <button
                className={`fw-tab ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <NotesTabIcon size={15} /> Notes
              </button>
            </div>
            <div className="fw-full-header-actions">
              <button
                className="fw-icon-btn"
                onClick={() => setViewMode("expanded")}
                aria-label="Shrink to panel"
                title="Shrink"
              >
                <ShrinkIcon />
              </button>
              <button
                className="fw-icon-btn fw-icon-btn-close"
                onClick={() => setViewMode("minimized")}
                aria-label="Close"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className="fw-full-content">{renderWidgetContent()}</div>
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
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(6px);
            animation: fwFadeIn 0.15s ease;
          }
          .fw-full-panel {
            width: 100%;
            max-width: 920px;
            height: 100%;
            max-height: 680px;
            background: var(--bg-card);
            border: 0.5px solid var(--border);
            border-radius: 14px;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.08);
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
            border-bottom: 0.5px solid var(--border);
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
            border: 0.5px solid var(--border);
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
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
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
            border-radius: 50%;
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
            background: rgba(255, 255, 255, 0.08);
            color: var(--text);
          }
          .fw-icon-btn:active {
            transform: scale(0.94);
          }
          .fw-icon-btn-close:hover {
            background: rgba(224, 82, 82, 0.15);
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
      style={{
        position: "fixed",
        bottom: `${livePosition.bottom}px`,
        right: `${livePosition.right}px`,
        zIndex: 9999,
      }}
    >
      {viewMode === "minimized" && (
        <button
          className="fw-fab"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={() => {
            if (!hasDraggedRef.current) {
              setViewMode("expanded");
            }
          }}
          aria-label="Open widget"
        >
          {activeTab === "tasks" ? <TasksTabIcon size={20} /> : <NotesTabIcon size={20} />}
          {pendingCount > 0 && (
            <span className="fw-badge">{pendingCount > 9 ? "9+" : pendingCount}</span>
          )}
        </button>
      )}

      {viewMode === "expanded" && (
        <div className="fw-panel">
          <div className="fw-header">
            <button
              className="fw-drag-handle"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onKeyDown={handleDragKeyDown}
              tabIndex={0}
              role="button"
              aria-label="Drag to move (use arrow keys)"
            >
              <DragHandleIcon />
            </button>
            <div className="fw-tab-track">
              <button
                className={`fw-tab ${activeTab === "tasks" ? "active" : ""}`}
                onClick={() => setActiveTab("tasks")}
              >
                <TasksTabIcon /> Tasks
              </button>
              <button
                className={`fw-tab ${activeTab === "notes" ? "active" : ""}`}
                onClick={() => setActiveTab("notes")}
              >
                <NotesTabIcon /> Notes
              </button>
            </div>
            <div className="fw-header-actions">
              {activeTab === "notes" && ( // Only show expand for notes
                <button
                  className="fw-icon-btn"
                  onClick={() => setViewMode("full")}
                  aria-label="Expand to full view"
                  title="Expand"
                >
                  <ExpandIcon />
                </button>
              )}
              <button
                className="fw-icon-btn fw-icon-btn-close"
                onClick={() => setViewMode("minimized")}
                aria-label="Close"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="fw-content">{renderWidgetContent()}</div>
        </div>
      )}

      <style>{`
        .fw-root {
          font-family: var(--font-sans);
        }
        .fw-root.dragging {
          cursor: grabbing;
        }
        .fw-root.dragging * {
          cursor: grabbing !important;
        }

        .fw-fab {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: none;
        }
        .fw-fab:hover {
          background: var(--bg-surface);
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 3px 8px rgba(0, 0, 0, 0.25);
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
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .fw-fab {
            width: 48px;
            height: 48px;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2);
          }
          .fw-fab:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.25);
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

        .fw-panel {
          width: 380px;
          max-height: 600px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 0.5px rgba(255, 255, 255, 0.05);
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

        .fw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          gap: 8px;
        }

        .fw-drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          cursor: grab;
          color: var(--text-tertiary);
          border-radius: 50%;
          transition: all 0.15s ease;
          flex-shrink: 0;
          touch-action: none;
          border: none;
          background: none;
          padding: 0;
        }
        .fw-drag-handle:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }
        .fw-drag-handle:focus {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .fw-drag-handle:active {
          cursor: grabbing;
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
          border: 0.5px solid var(--border);
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
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        .fw-tab.active svg {
          opacity: 1;
          color: #4CAF82;
        }

        .fw-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
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
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }
        .fw-icon-btn:active {
          transform: scale(0.94);
        }
        .fw-icon-btn-close:hover {
          background: rgba(224, 82, 82, 0.15);
          color: #E05252;
        }

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
            max-height: calc(100dvh - 120px);
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
          .fw-drag-handle {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(widget, document.body);
}

function TasksTabIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function NotesTabIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function ShrinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
