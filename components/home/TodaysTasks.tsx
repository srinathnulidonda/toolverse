// components/home/TodaysTasks.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useTasks } from "@/lib/useTasks";
import {
  Task,
  Priority,
  PRIORITY_META,
  PRIORITY_ORDER,
  getPriority,
  formatContext,
} from "@/components/widgets/widgetTypes";

export default function TodaysTasks() {
  const { tasks, addTask, toggleTask, removeTask, clearCompleted } = useTasks();

  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [mounted, setMounted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mounted]);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPicker(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showPicker]);

  useEffect(() => {
    if (!mounted) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mounted]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }

    addTask(text, priority);
    setInput("");
    inputRef.current?.focus();
  }

  const handleClearDone = () => {
    clearCompleted();
  };

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;

  const sorted = [
    ...PRIORITY_ORDER.flatMap((p) => tasks.filter((t) => !t.completed && getPriority(t) === p)),
    ...tasks.filter((t) => t.completed),
  ];

  const circumference = 2 * Math.PI * 11;

  const getDateLabel = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const showTasks = mounted && total > 0;
  const showEmptyState = mounted && total === 0;
  const showProgress = mounted && total > 0;

  return (
    <>
      <div className="td-card">
        <div className="td-header">
          <div className="td-header-left">
            <span className="td-label">Today</span>
            <span className="td-date">{mounted ? getDateLabel() : ""}</span>
          </div>

          {showProgress && (
            <div className="td-progress">
              <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                <circle cx="15" cy="15" r="11" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                <circle
                  cx="15"
                  cy="15"
                  r="11"
                  fill="none"
                  stroke={allDone ? "#4CAF82" : "var(--brand)"}
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
              <span className="td-progress-label">
                <strong>{done}</strong>/{total}
              </span>
            </div>
          )}
        </div>

        <div className="td-divider" />

        <form className="td-add-row" onSubmit={add} autoComplete="off">
          <div ref={pickerRef} className="td-picker-wrap">
            <button
              type="button"
              className="td-priority-btn"
              onClick={() => setShowPicker((p) => !p)}
              aria-label={`Priority: ${priority}`}
              aria-haspopup="listbox"
              aria-expanded={showPicker}
            >
              <span className="td-dot" style={{ background: PRIORITY_META[priority].color }} />
            </button>

            {showPicker && (
              <div className="td-picker" role="listbox" aria-label="Select priority">
                {PRIORITY_ORDER.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="option"
                    aria-selected={priority === p}
                    className={`td-picker-opt${priority === p ? " sel" : ""}`}
                    onClick={() => {
                      setPriority(p);
                      setShowPicker(false);
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
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task…"
            maxLength={120}
            className="td-input"
            aria-label="New task"
          />

          <button type="submit" className={`td-submit${input.trim() ? " active" : ""}`} aria-label="Add task">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 1v10M1 6h10" />
            </svg>
          </button>
        </form>

        <div className="td-divider" />

        <div className="td-tasks-scroll">
          {showEmptyState && (
            <div className="td-empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>No tasks yet</span>
              <span className="td-empty-hint">
                Press <kbd>/</kbd> to start
              </span>
            </div>
          )}

          {showTasks && allDone && (
            <div className="td-all-done">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6.5" fill="var(--brand-light)" stroke="var(--brand)" strokeWidth="0.8" />
                <path d="M4.5 7l1.8 1.8L9.5 5" stroke="var(--brand)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All done — great work today
            </div>
          )}

          {showTasks &&
            sorted.map((task, i) => {
              const isFirstCompleted =
                task.completed &&
                (i === 0 || !sorted[i - 1].completed) &&
                !allDone &&
                tasks.some((t) => !t.completed);

              return (
                <div key={task.id}>
                  {isFirstCompleted && <div className="td-sep" />}
                  <TaskRow task={task} onToggle={toggleTask} onRemove={removeTask} />
                </div>
              );
            })}
        </div>

        {showTasks && done > 0 && (
          <>
            <div className="td-divider" />
            <div className="td-footer">
              <span className="td-footer-label">{done} completed</span>
              <button onClick={handleClearDone} className="td-clear-btn">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 4h8M4.5 4V2.5h3V4M10 4l-.8 6H2.8L2 4" />
                </svg>
                Clear done
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .td-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          width: 100%;
          display: flex;
          flex-direction: column;
          min-height: 300px;
        }

        .td-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 10px;
          gap: 8px;
        }
        .td-header-left { display: flex; flex-direction: column; gap: 2px; }
        .td-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }
        .td-date { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-sans); min-height: 16px; }
        .td-progress { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .td-progress-label { font-size: 12px; color: var(--text-tertiary); font-family: var(--font-sans); }
        .td-progress-label strong { color: var(--text); font-weight: 500; }

        .td-divider { height: 0.5px; background: var(--border); flex-shrink: 0; }

        .td-add-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; flex-shrink: 0; }

        .td-picker-wrap { position: relative; flex-shrink: 0; }

        .td-priority-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 0.5px solid var(--border);
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: border-color 0.15s;
        }
        .td-priority-btn:hover { border-color: var(--text-tertiary); }

        .td-dot { width: 7px; height: 7px; border-radius: 50%; display: block; pointer-events: none; }

        .td-picker {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 4px;
          z-index: 50;
          min-width: 110px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .td-picker-opt {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px;
          min-height: 36px;
          border-radius: 5px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-family: var(--font-sans);
          color: var(--text-secondary);
          transition: background 0.1s;
        }
        .td-picker-opt:hover { background: var(--bg-surface); color: var(--text); }
        .td-picker-opt.sel { background: var(--bg-surface); color: var(--text); font-weight: 500; }

        .td-input {
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
        .td-input::placeholder { color: var(--text-tertiary); }

        .td-submit {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: none;
          cursor: default;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          transition: background 0.15s, color 0.15s;
        }
        .td-submit.active { background: var(--brand); color: #fff; cursor: pointer; }
        .td-submit.active:hover { background: var(--brand-hover); }

        .td-tasks-scroll {
          flex: 1;
          overflow-y: auto;
          max-height: 240px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .td-tasks-scroll::-webkit-scrollbar { width: 4px; }
        .td-tasks-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        .td-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          gap: 8px;
          color: var(--text-tertiary);
          font-size: 12px;
          font-family: var(--font-sans);
          text-align: center;
        }
        .td-empty-hint { font-size: 11px; color: var(--text-disabled); }
        .td-empty-hint kbd {
          font-size: 10px;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 3px;
          padding: 1px 4px;
          font-family: var(--font-mono);
        }

        .td-all-done {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px 4px;
          font-size: 11px;
          font-family: var(--font-sans);
          color: var(--brand);
          font-weight: 500;
        }

        .td-sep { height: 0.5px; background: var(--border); margin: 2px 14px; }

        .td-footer { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 10px; }
        .td-footer-label { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-sans); }
        .td-clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          min-height: 32px;
          font-size: 11px;
          font-family: var(--font-sans);
          color: var(--text-tertiary);
          padding: 0 4px;
          transition: color 0.12s;
        }
        .td-clear-btn:hover { color: var(--text); }

        .td-row { display: flex; align-items: center; gap: 9px; padding: 8px 12px; min-height: 40px; transition: background 0.1s; }
        .td-row:hover { background: var(--bg-surface); }
        .td-row:hover .td-row-del { opacity: 1; }

        .td-check {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1.2px solid var(--border-faint);
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          transition: all 0.15s;
        }
        .td-check.done { background: var(--brand); border-color: var(--brand); }
        .td-check:hover:not(.done) { border-color: var(--text-tertiary); }

        .td-row-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; opacity: 0.75; }

        .td-row-text {
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
        .td-row-text.done { text-decoration: line-through; text-decoration-color: var(--text-disabled); color: var(--text-tertiary); }

        .td-context-tag {
          font-size: 10px;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .td-row-del {
          width: 28px;
          height: 28px;
          border-radius: 6px;
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
          font-size: 16px;
          line-height: 1;
          transition: opacity 0.12s, color 0.12s, background 0.12s;
        }
        .td-row-del:hover { color: #E05252; background: var(--error-bg); }
        .td-row-del:focus-visible { opacity: 1; }

        @media (hover: none) { .td-row-del { opacity: 1; } }

        .td-priority-btn:focus-visible,
        .td-picker-opt:focus-visible,
        .td-check:focus-visible,
        .td-row-del:focus-visible,
        .td-clear-btn:focus-visible,
        .td-submit:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          .td-header { padding: 12px 14px 8px; }
          .td-add-row { padding: 8px 10px; }
          .td-tasks-scroll { max-height: 220px; }
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
    <div className="td-row">
      <button
        className={`td-check${task.completed ? " done" : ""}`}
        onClick={() => onToggle(task.id)}
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
            <path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {!task.completed && <span className="td-row-dot" style={{ background: meta.color }} aria-hidden="true" />}

      <span
        className={`td-row-text${task.completed ? " done" : ""}`}
        onClick={() => onToggle(task.id)}
        title={task.text}
      >
        {task.text}
      </span>

      {task.context && (
        <span className="td-context-tag" title={formatContext(task.context)}>
          {formatContext(task.context)}
        </span>
      )}

      <button className="td-row-del" onClick={() => onRemove(task.id)} aria-label="Remove task">
        ×
      </button>
    </div>
  );
}