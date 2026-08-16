// components/widgets/WidgetTasks.tsx
"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  Task,
  Priority,
  TasksDraft,
  PRIORITY_ORDER,
  PRIORITY_META,
  getPriority,
  formatContext,
  MAX_TASK_LENGTH,
} from "./widgetTypes";

interface WidgetTasksProps {
  tasks: Task[];
  addTask: (text: string, priority?: Priority, context?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: (ids?: string[]) => void;
  draft: TasksDraft;
  setDraft: (draft: TasksDraft | ((prev: TasksDraft) => TasksDraft)) => void;
}

export default function WidgetTasks({
  tasks,
  addTask,
  toggleTask,
  removeTask,
  clearCompleted,
  draft,
  setDraft,
}: WidgetTasksProps) {
  const { input, priority, showPicker, filter, showCompleted } = draft;

  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const ringStyle: React.CSSProperties = useMemo(() => ({
    transition: "stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s"
  }), []);
  const priorityDotStyle: React.CSSProperties = useMemo(() => ({ background: PRIORITY_META[priority].color }), [priority]);
  const PRIORITY_DOT_STYLES = PRIORITY_ORDER.map(p => ({ background: PRIORITY_META[p].color }));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setDraft((d) => ({ ...d, showPicker: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setDraft]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        if (filter === "completed") {
          setDraft((d) => ({ ...d, filter: "all" }));
          requestAnimationFrame(() => inputRef.current?.focus());
        } else {
          inputRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [filter, setDraft]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }

    addTask(text, priority);
    setDraft((d) => ({ ...d, input: "" }));
    inputRef.current?.focus();
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;

  const filtered = useMemo(
    () =>
      filter === "active"
        ? tasks.filter((t) => !t.completed)
        : filter === "completed"
          ? tasks.filter((t) => t.completed)
          : tasks,
    [tasks, filter]
  );

  const activeSorted = useMemo(
    () =>
      PRIORITY_ORDER.flatMap((p) => filtered.filter((t) => !t.completed && getPriority(t) === p)),
    [filtered]
  );

  const completedSorted = useMemo(() => filtered.filter((t) => t.completed), [filtered]);

  const handleClearCompleted = () => {
    clearCompleted(completedSorted.map((t) => t.id));
  };

  const ringRadius = 11;
  const circumference = 2 * Math.PI * ringRadius;
  const ringSize = 30;

  const emptyMessage =
    filter === "completed"
      ? "Nothing completed yet"
      : filter === "active"
        ? "No active tasks — you're all caught up"
        : "No tasks yet";

  const showClearAction = filter !== "active" && completedSorted.length > 0;

  return (
    <>
      <div className="wt-root">
        <div className="wt-header">
          <span className="wt-eyebrow">Tasks</span>

          {total > 0 && (
            <div className="wt-ring-wrap">
              <svg width={ringSize} height={ringSize} viewBox="0 0 30 30" aria-hidden="true">
                <circle cx="15" cy="15" r={ringRadius} fill="none" stroke="var(--border)" strokeWidth="2.5" />
                <circle
                  cx="15"
                  cy="15"
                  r={ringRadius}
                  fill="none"
                  stroke={allDone ? "#4CAF82" : "var(--brand)"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct / 100)}
                  transform="rotate(-90 15 15)"
                  style={ringStyle}
                />
                {allDone && (
                  <path
                    d="M10.5 15l2.5 2.5L19.5 11"
                    stroke="#4CAF82"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
              </svg>
              <span className="wt-ring-label">
                <strong>{done}</strong>/{total}
              </span>
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="wt-filter-tabs" role="tablist" aria-label="Filter tasks">
            <button
              role="tab"
              aria-selected={filter === "all"}
              className={`wt-filter-tab${filter === "all" ? " active" : ""}`}
              onClick={() => setDraft((d) => ({ ...d, filter: "all" }))}
            >
              All
            </button>
            <button
              role="tab"
              aria-selected={filter === "active"}
              className={`wt-filter-tab${filter === "active" ? " active" : ""}`}
              onClick={() => setDraft((d) => ({ ...d, filter: "active" }))}
            >
              Active
            </button>
            <button
              role="tab"
              aria-selected={filter === "completed"}
              className={`wt-filter-tab${filter === "completed" ? " active" : ""}`}
              onClick={() => setDraft((d) => ({ ...d, filter: "completed" }))}
            >
              Done
            </button>
          </div>
        )}

        <div className="wt-divider" />

        {filter !== "completed" && (
          <form className="wt-add-row" onSubmit={add} autoComplete="off">
            <div ref={pickerRef} className="wt-picker-wrap">
              <button
                type="button"
                className="wt-priority-btn"
                onClick={() => setDraft((d) => ({ ...d, showPicker: !d.showPicker }))}
                aria-label={`Priority: ${priority}`}
                aria-haspopup="listbox"
                aria-expanded={showPicker}
              >
                <span className="wt-dot" style={priorityDotStyle} />
              </button>

              {showPicker && (
                <div className="wt-picker" role="listbox" aria-label="Select priority">
                  {PRIORITY_ORDER.map((p, index) => (
                    <button
                      key={p}
                      type="button"
                      role="option"
                      aria-selected={priority === p}
                      className={`wt-picker-opt${priority === p ? " sel" : ""}`}
                      onClick={() => setDraft((d) => ({ ...d, priority: p, showPicker: false }))}
                    >
                      <span style={PRIORITY_DOT_STYLES[index]} />
                      {PRIORITY_META[p].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setDraft((d) => ({ ...d, input: e.target.value }))}
              placeholder="Add a task…"
              maxLength={MAX_TASK_LENGTH}
              className="wt-input"
              aria-label="New task"
            />

            <button type="submit" className={`wt-submit${input.trim() ? " active" : ""}`} aria-label="Add task">
              <PlusIcon />
            </button>
          </form>
        )}

        <div className="wt-divider" />

        <div className="wt-scroll">
          {filtered.length === 0 && (
            <div className="wt-empty">
              <ChecklistEmptyIcon />
              <span>{emptyMessage}</span>
              {total === 0 && (
                <span className="wt-empty-hint">
                  Press <kbd>/</kbd> to start
                </span>
              )}
            </div>
          )}

          {allDone && filter !== "completed" && filtered.length > 0 && (
            <div className="wt-all-done">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6.5" fill="var(--brand-light)" stroke="var(--brand)" strokeWidth="0.8" />
                <path d="M4.5 7l1.8 1.8L9.5 5" stroke="var(--brand)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All done — great work today
            </div>
          )}

          {filter !== "completed" &&
            activeSorted.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />
            ))}

          {filter === "completed" &&
            completedSorted.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />
            ))}

          {filter === "all" && completedSorted.length > 0 && (
            <>
              <div className="wt-sep" />
              <button
                className="wt-completed-toggle"
                onClick={() => setDraft((d) => ({ ...d, showCompleted: !d.showCompleted }))}
                aria-expanded={showCompleted}
              >
                <ChevronIcon open={showCompleted} />
                {completedSorted.length} completed
              </button>
              {showCompleted &&
                completedSorted.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />
                ))}
            </>
          )}
        </div>

        {showClearAction && (
          <>
            <div className="wt-divider" />
            <div className="wt-footer">
              <span className="wt-footer-label">{done} completed</span>
              <button onClick={handleClearCompleted} className="wt-footer-btn">
                <TrashIcon />
                Clear done
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .wt-root {
          background: transparent;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          font-family: var(--font-sans);
        }

        .wt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 13px 15px 8px;
        }
        .wt-eyebrow {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .wt-ring-wrap { display: flex; align-items: center; gap: 8px; }
        .wt-ring-label { font-size: 12px; color: var(--text-tertiary); }
        .wt-ring-label strong { color: var(--text); font-weight: 600; }

        .wt-filter-tabs {
          display: flex;
          align-items: center;
          gap: 2px;
          margin: 0 12px 10px;
          padding: 2px;
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 9px;
        }
        .wt-filter-tab {
          flex: 1;
          padding: 7px 10px;
          min-height: 32px;
          border-radius: 7px;
          border: none;
          background: none;
          color: var(--text-tertiary);
          font-size: 11.5px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .wt-filter-tab:hover { color: var(--text-secondary); }
        .wt-filter-tab.active {
          background: var(--bg-card);
          color: var(--text);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        }

        .wt-divider { height: 0.5px; background: var(--border); flex-shrink: 0; }

        .wt-add-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          flex-shrink: 0;
        }
        .wt-picker-wrap { position: relative; flex-shrink: 0; }
        .wt-priority-btn {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .wt-priority-btn:hover { border-color: var(--text-tertiary); }
        .wt-priority-btn:active { transform: scale(0.94); }
        .wt-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: block;
          pointer-events: none;
          box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 18%, transparent);
        }

        .wt-picker {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          padding: 5px;
          z-index: 50;
          min-width: 132px;
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.4);
        }
        .wt-picker-opt {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-secondary);
          cursor: pointer;
        }
        .wt-picker-opt:hover { background: var(--bg-surface); color: var(--text); }
        .wt-picker-opt.sel { background: var(--bg-surface); color: var(--text); font-weight: 600; }

        .wt-input {
          flex: 1;
          background: none;
          border: none;
          font-size: 13.5px;
          font-family: var(--font-sans);
          color: var(--text);
          outline: none;
          min-width: 0;
          letter-spacing: -0.1px;
          caret-color: var(--brand);
        }
        .wt-input::placeholder { color: var(--text-tertiary); }

        .wt-submit {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          border: none;
          cursor: default;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          transition: background 0.15s ease, color 0.15s ease;
        }
        .wt-submit.active { background: var(--brand); color: #fff; cursor: pointer; }
        .wt-submit.active:hover { background: var(--brand-hover, var(--brand)); }
        .wt-submit.active:active { transform: scale(0.92); }

        .wt-scroll {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .wt-scroll::-webkit-scrollbar { width: 5px; }
        .wt-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        .wt-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 16px;
          gap: 8px;
          color: var(--text-tertiary);
          font-size: 12.5px;
          text-align: center;
        }
        .wt-empty svg { opacity: 0.5; }
        .wt-empty-hint { font-size: 11px; color: var(--text-disabled); }
        .wt-empty-hint kbd {
          font-size: 10px;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 4px;
          padding: 2px 5px;
          font-family: var(--font-mono);
        }

        .wt-all-done {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px 4px;
          font-size: 11.5px;
          color: var(--brand);
          font-weight: 600;
        }

        .wt-sep { height: 0.5px; background: var(--border); margin: 2px 14px; }

        .wt-completed-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: calc(100% - 24px);
          margin: 4px 12px;
          padding: 9px;
          min-height: 36px;
          border: none;
          background: none;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 9px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .wt-completed-toggle:hover { background: var(--bg-surface); color: var(--text); }

        .wt-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 12px 11px;
        }
        .wt-footer-label { font-size: 11.5px; color: var(--text-tertiary); }
        .wt-footer-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          min-height: 32px;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-tertiary);
          padding: 0 4px;
          transition: color 0.15s ease;
        }
        .wt-footer-btn:hover { color: var(--text); }

        .wt-priority-btn:focus-visible,
        .wt-picker-opt:focus-visible,
        .wt-submit:focus-visible,
        .wt-filter-tab:focus-visible,
        .wt-completed-toggle:focus-visible,
        .wt-footer-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (hover: none) {
          .wt-row-del { opacity: 1 !important; }
        }

        @media (max-width: 480px) {
          .wt-header { padding: 12px 13px 8px; }
          .wt-filter-tabs { margin: 0 10px 9px; }
        }
      `}</style>
    </>
  );
}

function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const meta = PRIORITY_META[getPriority(task)];
  const taskDotStyle: React.CSSProperties = useMemo(() => ({ background: meta.color }), [meta.color]);
  const contextLabel = task.context ? formatContext(task.context) : "";

  return (
    <>
      <div className="wt-row">
        <button
          className={`wt-check${task.completed ? " done" : ""}`}
          onClick={() => onToggle(task.id)}
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed && (
            <svg width="9" height="9" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {!task.completed && (
          <span className="wt-row-dot" style={taskDotStyle} aria-hidden="true" />
        )}

        <span
          className={`wt-row-text${task.completed ? " done" : ""}`}
          onClick={() => onToggle(task.id)}
          title={task.text}
        >
          {task.text}
        </span>

        {contextLabel && (
          <span className="wt-row-tag" title={contextLabel}>
            {contextLabel}
          </span>
        )}

        <button className="wt-row-del" onClick={() => onRemove(task.id)} aria-label="Remove task">
          <CloseIcon />
        </button>
      </div>

      <style>{`
        .wt-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 13px;
          min-height: 40px;
          transition: background 0.14s ease;
        }
        .wt-row:hover { background: var(--bg-surface); }
        .wt-row:hover .wt-row-del { opacity: 1; }

        .wt-check {
          width: 19px;
          height: 19px;
          border-radius: 6px;
          border: 1.5px solid var(--border-faint);
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .wt-check.done { background: var(--brand); border-color: var(--brand); }
        .wt-check:hover:not(.done) { border-color: var(--text-tertiary); }
        .wt-check:active { transform: scale(0.9); }
        .wt-check:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

        .wt-row-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.85;
          box-shadow: 0 0 0 2.5px color-mix(in srgb, currentColor 16%, transparent);
        }

        .wt-row-text {
          flex: 1;
          font-size: 13px;
          color: var(--text);
          line-height: 1.45;
          cursor: pointer;
          user-select: none;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          letter-spacing: -0.1px;
        }
        .wt-row-text.done {
          text-decoration: line-through;
          text-decoration-color: var(--text-disabled);
          color: var(--text-tertiary);
        }

        .wt-row-tag {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          padding: 2px 7px;
          border-radius: 999px;
          flex-shrink: 0;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wt-row-del {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          opacity: 0;
          transition: opacity 0.15s ease, color 0.15s ease, background 0.15s ease;
        }
        .wt-row-del:hover { color: #E05252; background: rgba(224, 82, 82, 0.14); }
        .wt-row-del:active { transform: scale(0.9); }
        .wt-row-del:focus-visible { opacity: 1; outline: 2px solid var(--brand); outline-offset: 2px; }

        @media (hover: none) { .wt-row-del { opacity: 1; } }
      `}</style>
    </>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  const chevronIconStyle: React.CSSProperties = useMemo(() => ({
    transform: open ? "rotate(0deg)" : "rotate(-90deg)",
    transition: "transform 0.18s ease"
  }), [open]);

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={chevronIconStyle}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 1v10M1 6h10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4h8M4.5 4V2.5h3V4M10 4l-.8 6H2.8L2 4" />
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

function ChecklistEmptyIcon() {
  const checklistEmptyIconStyle: React.CSSProperties = useMemo(() => ({ opacity: 0.55 }), []);

  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={checklistEmptyIconStyle}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M8.5 12l2.3 2.3L16 9" />
    </svg>
  );
}