// components/widgets/WidgetTasks.tsx
"use client";

import { useEffect, useRef, useMemo } from "react";
import { Task, Priority, PRIORITY_ORDER, PRIORITY_META, getPriority, uid } from "./widgetTypes";

type Filter = "all" | "active" | "completed";

interface TasksDraft {
  input: string;
  priority: Priority;
  showPicker: boolean;
  search: string;
  filter: Filter;
  showCompleted: boolean;
}

interface WidgetTasksProps {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  draft: TasksDraft;
  setDraft: (draft: TasksDraft | ((prev: TasksDraft) => TasksDraft)) => void;
}

export default function WidgetTasks({ tasks, setTasks, draft, setDraft }: WidgetTasksProps) {
  const { input, priority, showPicker, filter } = draft;

  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Simplified outside click handler
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setDraft((d) => ({ ...d, showPicker: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setDraft]);

  // Improved / shortcut check
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }

    const currentPage = typeof window !== "undefined" ? window.location.pathname : "";
    let context = "";
    if (currentPage.includes("/tools/")) {
      const cleanPath = currentPage.replace(/\/$/, "");
      context = cleanPath.split("/").pop() || "";
    }

    setTasks((prevTasks) => [
      { id: uid(), text, completed: false, priority, createdAt: Date.now(), context },
      ...prevTasks,
    ]);

    setDraft((d) => ({ ...d, input: "" }));
    inputRef.current?.focus();
  }

  const toggle = (id: string) =>
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const remove = (id: string) => setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));

  const clearCompleted = () => {
    const filteredIds = new Set(filtered.filter((t) => t.completed).map((t) => t.id));
    setTasks((prevTasks) => prevTasks.filter((t) => !filteredIds.has(t.id)));
  };

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const activeCount = total - done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;

  // No search functionality in compact view
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

  // Always use compact sizing
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
      <div className="wt-root wt-compact">
        <div className="wt-header">
          <div className="wt-header-left">
            <span className="wt-eyebrow">Tasks</span>
          </div>

          <div className="wt-header-right">
            {total > 0 && (
              <div className="wt-ring-wrap">
                <svg width={ringSize} height={ringSize} viewBox="0 0 30 30" aria-hidden="true">
                  <circle
                    cx="15"
                    cy="15"
                    r={ringRadius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="15"
                    cy="15"
                    r={ringRadius}
                    fill="none"
                    stroke={allDone ? "#4CAF82" : "#145C3C"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)}
                    transform="rotate(-90 15 15)"
                    style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s" }}
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
        </div>

        <div className="wt-divider" />

        {filter !== "completed" && (
          <form className="wt-add-row" onSubmit={add} autoComplete="off">
            <div ref={pickerRef} className="wt-picker-wrap">
              <button
                type="button"
                className="wt-priority-btn"
                onClick={() => setDraft((d) => ({ ...d, showPicker: !d.showPicker }))}
                aria-label={`Priority: ${priority}`}
              >
                <span className="wt-dot" style={{ background: PRIORITY_META[priority].color }} />
              </button>

              {showPicker && (
                <div className="wt-picker" role="listbox" aria-label="Select priority">
                  {PRIORITY_ORDER.map((p) => (
                    <button
                      key={p}
                      type="button"
                      role="option"
                      aria-selected={priority === p}
                      className={`wt-picker-opt${priority === p ? " sel" : ""}`}
                      onClick={() => {
                        setDraft((d) => ({ ...d, priority: p, showPicker: false }));
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: PRIORITY_META[p].color,
                          flexShrink: 0,
                          display: "block",
                        }}
                      />
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
              maxLength={120}
              className="wt-input"
            />

            <button
              type="submit"
              className={`wt-submit${input.trim() ? " active" : ""}`}
              aria-label="Add task"
            >
              <PlusIcon />
            </button>
          </form>
        )}

        <div className="wt-divider" />

        <div className="wt-scroll">
          {filtered.length === 0 && (
            <div className="wt-empty">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--border)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M9 12l2 2 4-4" />
              </svg>
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
                <circle
                  cx="7"
                  cy="7"
                  r="6.5"
                  fill="var(--brand-light)"
                  stroke="var(--brand)"
                  strokeWidth="0.8"
                />
                <path
                  d="M4.5 7l1.8 1.8L9.5 5"
                  stroke="var(--brand)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              All done — great work today
            </div>
          )}

          {/* Compact view: flat list with priority dots, no grouping */}
          {filter !== "completed" &&
            activeSorted.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
            ))}

          {/* Completed: simple flat list */}
          {completedSorted.length > 0 && filter !== "active" && (
            <>
              <div className="wt-sep" />
              {completedSorted.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
              ))}
            </>
          )}
        </div>

        {showClearAction && (
          <>
            <div className="wt-divider" />
            <div className="wt-footer">
              <span className="wt-footer-label">{done} completed</span>
              <div className="wt-footer-actions">
                <button onClick={clearCompleted} className="wt-footer-btn wt-clear-btn">
                  <TrashIcon />
                  Clear done
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .wt-root {
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          font-family: var(--font-sans);
        }
        .wt-compact {
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .wt-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 14px 8px;
        }
        .wt-header-left { 
          display: flex; 
          flex-direction: column; 
          gap: 2px; 
          min-width: 0; 
        }
        .wt-eyebrow {
          font-size: 11px; 
          font-weight: 500; 
          color: var(--text-tertiary);
          text-transform: uppercase; 
          letter-spacing: 0.08em;
        }

        .wt-header-right { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          flex-shrink: 0; 
        }
        .wt-ring-wrap { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
        }
        .wt-ring-label { 
          font-size: 12px; 
          color: var(--text-tertiary); 
        }
        .wt-ring-label strong { 
          color: var(--text); 
          font-weight: 500; 
        }

        .wt-divider { 
          height: 0.5px; 
          background: var(--border); 
          flex-shrink: 0; 
        }

        .wt-add-row {
          display: flex; 
          align-items: center; 
          gap: 8px;
          padding: 8px 12px; 
          flex-shrink: 0;
        }
        .wt-picker-wrap { 
          position: relative; 
          flex-shrink: 0; 
        }
        .wt-priority-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .wt-priority-btn:hover { 
          border-color: var(--text-tertiary); 
        }
        .wt-priority-btn:active { 
          transform: scale(0.95); 
        }
        .wt-dot { 
          width: 7px; 
          height: 7px; 
          border-radius: 50%; 
          display: block; 
          pointer-events: none; 
        }

        .wt-picker {
          position: absolute; 
          top: calc(100% + 6px); 
          left: 0; 
          background: var(--bg-card);
          border: 0.5px solid var(--border); 
          border-radius: 8px; 
          padding: 4px; 
          z-index: 50;
          min-width: 130px; 
          box-shadow: 0 4px 16px rgba(0,0,0,0.14);
        }
        .wt-picker-opt {
          display: flex; 
          align-items: center; 
          gap: 8px; 
          width: 100%; 
          padding: 7px 10px; 
          border-radius: 6px;
          border: none; 
          background: transparent; 
          font-size: 12.5px; 
          font-family: var(--font-sans);
          color: var(--text-secondary); 
          transition: all 0.1s; 
          cursor: pointer;
        }
        .wt-picker-opt:hover { 
          background: var(--bg-surface); 
          color: var(--text); 
        }
        .wt-picker-opt.sel { 
          background: var(--bg-surface); 
          color: var(--text); 
          font-weight: 500; 
        }

        .wt-input {
          flex: 1; 
          background: none; 
          border: none; 
          font-size: 13px; 
          font-family: var(--font-sans);
          color: var(--text); 
          outline: none; 
          min-width: 0; 
          letter-spacing: -0.1px; 
          caret-color: var(--brand);
        }
        .wt-input::placeholder { 
          color: var(--text-tertiary); 
        }

        .wt-submit {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: none;
          cursor: default;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          transition: all 0.15s ease;
        }
        .wt-submit.active {
          background: #145C3C;
          color: #fff;
          cursor: pointer;
        }
        .wt-submit.active:hover { 
          background: var(--brand-hover); 
        }
        .wt-submit.active:active { 
          transform: scale(0.95); 
        }

        .wt-scroll {
          flex: 1; 
          overflow-y: auto;
          scrollbar-width: thin; 
          scrollbar-color: var(--border) transparent;
        }
        .wt-scroll::-webkit-scrollbar { 
          width: 4px; 
        }
        .wt-scroll::-webkit-scrollbar-thumb { 
          background: var(--border); 
          border-radius: 2px; 
        }

        .wt-empty {
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center;
          padding: 32px 16px; 
          gap: 8px; 
          color: var(--text-tertiary);
          font-size: 12.5px; 
          font-family: var(--font-sans); 
          text-align: center;
        }
        .wt-empty-hint { 
          font-size: 11px; 
          color: var(--text-disabled); 
        }
        .wt-empty-hint kbd {
          font-size: 10px; 
          color: var(--text-tertiary); 
          background: var(--bg-surface);
          border: 0.5px solid var(--border); 
          border-radius: 3px; 
          padding: 2px 5px; 
          font-family: var(--font-mono);
        }

        .wt-all-done {
          display: flex; 
          align-items: center; 
          gap: 7px; 
          padding: 10px 14px 4px;
          font-size: 11.5px; 
          font-family: var(--font-sans); 
          color: var(--brand); 
          font-weight: 500;
        }

        .wt-sep { 
          height: 0.5px; 
          background: var(--border); 
          margin: 2px 14px; 
        }

        .wt-footer {
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: 12px; 
          flex-wrap: wrap;
          padding: 8px 12px 10px;
        }
        .wt-footer-label { 
          font-size: 11.5px; 
          color: var(--text-tertiary); 
          font-family: var(--font-sans); 
        }
        .wt-footer-actions { 
          display: flex; 
          align-items: center; 
          gap: 14px; 
        }
        .wt-footer-btn {
          display: flex; 
          align-items: center; 
          gap: 5px; 
          background: none; 
          border: none; 
          cursor: pointer;
          font-size: 11.5px; 
          font-family: var(--font-sans); 
          color: var(--text-tertiary);
          padding: 0; 
          transition: color 0.12s;
        }
        .wt-footer-btn:hover { 
          color: var(--text); 
        }

        @media (hover: none) {
          .wt-row-del {
            opacity: 1 !important;
          }
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

  return (
    <>
      <div className="wt-row">
        <button
          className={`wt-check${task.completed ? " done" : ""}`}
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed && (
            <svg width="9" height="9" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path
                d="M1.5 4l2 2 3-3"
                stroke="#fff"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Always show priority dot in compact view */}
        {!task.completed && (
          <span className="wt-row-dot" style={{ background: meta.color }} aria-hidden="true" />
        )}

        <span
          className={`wt-row-text${task.completed ? " done" : ""}`}
          onClick={() => onToggle(task.id)}
        >
          {task.text}
        </span>

        {task.context && <span className="wt-row-tag">{task.context}</span>}

        <button className="wt-row-del" onClick={() => onRemove(task.id)} aria-label="Remove task">
          <CloseIcon />
        </button>
      </div>

      <style>{`
        .wt-row {
          display: flex; 
          align-items: center; 
          gap: 9px;
          padding: 6px 12px;
          transition: background 0.1s;
        }
        .wt-row:hover { 
          background: var(--bg-surface); 
        }
        .wt-row:hover .wt-row-del { 
          opacity: 1; 
        }

        .wt-check {
          width: 16px;
          height: 16px;
          border-radius: 5px;
          border: 1.5px solid var(--border);
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .wt-check.done { 
          background: #145C3C; 
          border-color: #145C3C; 
        }
        .wt-check:hover:not(.done) { 
          border-color: var(--text-tertiary); 
        }
        .wt-check:active { 
          transform: scale(0.92); 
        }

        .wt-row-dot { 
          width: 5px; 
          height: 5px; 
          border-radius: 50%; 
          flex-shrink: 0; 
          opacity: 0.75; 
        }

        .wt-row-text {
          flex: 1; 
          font-size: 13px; 
          font-family: var(--font-sans); 
          color: var(--text);
          line-height: 1.45; 
          cursor: pointer; 
          user-select: none; 
          min-width: 0; 
          overflow: hidden;
          text-overflow: ellipsis; 
          white-space: nowrap; 
          transition: color 0.15s; 
          letter-spacing: -0.1px;
        }
        .wt-row-text.done {
          text-decoration: line-through;
          text-decoration-color: var(--text-disabled);
          color: var(--text-tertiary);
        }

        .wt-row-tag {
          font-size: 10px; 
          color: var(--text-tertiary); 
          background: var(--bg-surface);
          border: 0.5px solid var(--border); 
          padding: 2px 6px; 
          border-radius: 4px; 
          flex-shrink: 0;
        }

        .wt-row-del {
          width: 28px;
          height: 28px;
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
          transition: all 0.15s ease;
        }
        .wt-row-del:hover { 
          color: #E05252; 
          background: rgba(224, 82, 82, 0.15); 
        }
        .wt-row-del:active { 
          transform: scale(0.94); 
        }
        .wt-row-del:focus-visible { 
          opacity: 1; 
        }

        @media (hover: none) {
          .wt-row-del {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

function PlusIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 1v10M1 6h10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 4h8M4.5 4V2.5h3V4M10 4l-.8 6H2.8L2 4" />
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
