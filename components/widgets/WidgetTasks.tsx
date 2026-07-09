// components/widgets/WidgetTasks.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Task,
  Priority,
  WidgetVariant,
  PRIORITY_ORDER,
  PRIORITY_META,
  getPriority,
  timeAgo,
  uid,
} from "./widgetTypes";

type Filter = "all" | "active" | "completed";

interface WidgetTasksProps {
  variant?: WidgetVariant;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  onExpand?: () => void;
}

export default function WidgetTasks({
  variant = "compact",
  tasks,
  setTasks,
  onExpand,
}: WidgetTasksProps) {
  const isFull = variant === "full";

  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [showPicker, setShowPicker] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
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
    if (currentPage.includes("/tools/")) context = currentPage.split("/").pop() || "";

    setTasks([
      { id: uid(), text, completed: false, priority, createdAt: Date.now(), context },
      ...tasks,
    ]);
    setInput("");
    inputRef.current?.focus();
  }

  const toggle = (id: string) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const remove = (id: string) => setTasks(tasks.filter((t) => t.id !== id));
  const clearCompleted = () => setTasks(tasks.filter((t) => !t.completed));
  const markAllDone = () => setTasks(tasks.map((t) => ({ ...t, completed: true })));

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const activeCount = total - done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;

  const searched = search.trim()
    ? tasks.filter((t) => t.text.toLowerCase().includes(search.trim().toLowerCase()))
    : tasks;

  const filtered =
    filter === "active"
      ? searched.filter((t) => !t.completed)
      : filter === "completed"
      ? searched.filter((t) => t.completed)
      : searched;

  const activeSorted = PRIORITY_ORDER.flatMap((p) =>
    filtered.filter((t) => !t.completed && getPriority(t) === p)
  );
  const completedSorted = filtered.filter((t) => t.completed);

  const ringRadius = isFull ? 16 : 11;
  const circumference = 2 * Math.PI * ringRadius;
  const ringSize = isFull ? 36 : 30;

  const emptyMessage =
    search.trim().length > 0
      ? `No tasks match "${search.trim()}"`
      : filter === "completed"
      ? "Nothing completed yet"
      : filter === "active"
      ? "No active tasks — you're all caught up"
      : "No tasks yet";

  return (
    <>
      <div className={`wt-root ${isFull ? "wt-full" : "wt-compact"}`}>
        {/* Header */}
        <div className="wt-header">
          <div className="wt-header-left">
            {isFull ? <h2 className="wt-title">Tasks</h2> : <span className="wt-eyebrow">Tasks</span>}
            {isFull && total > 0 && (
              <span className="wt-header-sub">
                {activeCount === 0 ? "All done" : `${activeCount} left to do`}
              </span>
            )}
          </div>

          <div className="wt-header-right">
            {total > 0 && (
              <div className="wt-ring-wrap">
                <svg width={ringSize} height={ringSize} viewBox="0 0 30 30" aria-hidden="true">
                  <circle cx="15" cy="15" r={ringRadius} fill="none" stroke="var(--border)" strokeWidth="2.5" />
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

            {!isFull && onExpand && (
              <button className="wt-expand-btn" onClick={onExpand} aria-label="Open full task view">
                <ExpandIcon />
              </button>
            )}
          </div>
        </div>

        {/* Search + filters */}
        {isFull && (
          <div className="wt-toolbar">
            <div className="wt-search-wrap">
              <SearchIcon />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="wt-search-input"
                aria-label="Search tasks"
              />
              {search && (
                <button className="wt-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                  ×
                </button>
              )}
            </div>

            <div className="wt-filter-tabs" role="tablist" aria-label="Filter tasks">
              <button
                role="tab"
                aria-selected={filter === "all"}
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All <span className="wt-filter-count">{total}</span>
              </button>
              <button
                role="tab"
                aria-selected={filter === "active"}
                className={filter === "active" ? "active" : ""}
                onClick={() => setFilter("active")}
              >
                Active <span className="wt-filter-count">{activeCount}</span>
              </button>
              <button
                role="tab"
                aria-selected={filter === "completed"}
                className={filter === "completed" ? "active" : ""}
                onClick={() => setFilter("completed")}
              >
                Done <span className="wt-filter-count">{done}</span>
              </button>
            </div>
          </div>
        )}

        <div className="wt-divider" />

        {/* Add row */}
        {filter !== "completed" && (
          <form className="wt-add-row" onSubmit={add} autoComplete="off">
            <div ref={pickerRef} className="wt-picker-wrap">
              <button
                type="button"
                className="wt-priority-btn"
                onClick={() => setShowPicker((p) => !p)}
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
              placeholder={isFull ? "Add a task and press Enter…" : "Add a task…"}
              maxLength={120}
              className="wt-input"
            />

            <button type="submit" className={`wt-submit${input.trim() ? " active" : ""}`} aria-label="Add task">
              <PlusIcon />
            </button>
          </form>
        )}

        <div className="wt-divider" />

        {/* List */}
        <div className="wt-scroll">
          {filtered.length === 0 && (
            <div className="wt-empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                <circle cx="7" cy="7" r="6.5" fill="var(--brand-light)" stroke="var(--brand)" strokeWidth="0.8" />
                <path d="M4.5 7l1.8 1.8L9.5 5" stroke="var(--brand)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All done — great work today
            </div>
          )}

          {/* Active tasks */}
          {filter !== "completed" &&
            (isFull
              ? PRIORITY_ORDER.map((p) => {
                  const group = activeSorted.filter((t) => getPriority(t) === p);
                  if (group.length === 0) return null;
                  return (
                    <div key={p} className="wt-group">
                      <div className="wt-group-header">
                        <span className="wt-group-dot" style={{ background: PRIORITY_META[p].color }} />
                        {PRIORITY_META[p].label}
                        <span className="wt-group-count">{group.length}</span>
                      </div>
                      {group.map((task) => (
                        <TaskRow key={task.id} task={task} isFull={isFull} onToggle={toggle} onRemove={remove} />
                      ))}
                    </div>
                  );
                })
              : activeSorted.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
                )))}

          {/* Completed tasks */}
          {completedSorted.length > 0 && filter !== "active" && (
            <>
              {isFull ? (
                <div className="wt-completed-section">
                  <button className="wt-completed-toggle" onClick={() => setShowCompleted((s) => !s)}>
                    <ChevronIcon open={showCompleted} />
                    Completed
                    <span className="wt-group-count">{completedSorted.length}</span>
                  </button>
                  {showCompleted &&
                    completedSorted.map((task) => (
                      <TaskRow key={task.id} task={task} isFull onToggle={toggle} onRemove={remove} />
                    ))}
                </div>
              ) : (
                <>
                  <div className="wt-sep" />
                  {completedSorted.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={toggle} onRemove={remove} />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {(done > 0 || (isFull && activeCount > 0)) && (
          <>
            <div className="wt-divider" />
            <div className="wt-footer">
              <span className="wt-footer-label">
                {done} completed{isFull ? ` · ${activeCount} active` : ""}
              </span>
              <div className="wt-footer-actions">
                {isFull && activeCount > 0 && (
                  <button onClick={markAllDone} className="wt-footer-btn">
                    Mark all done
                  </button>
                )}
                {done > 0 && (
                  <button onClick={clearCompleted} className="wt-footer-btn wt-clear-btn">
                    <TrashIcon />
                    Clear done
                  </button>
                )}
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
          padding: ${isFull ? "18px 22px 12px" : "12px 14px 8px"};
        }
        .wt-header-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .wt-eyebrow {
          font-size: 11px; font-weight: 500; color: var(--text-tertiary);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .wt-title { font-size: 18px; font-weight: 600; letter-spacing: -0.3px; color: var(--text); margin: 0; }
        .wt-header-sub { font-size: 12.5px; color: var(--text-tertiary); }

        .wt-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .wt-ring-wrap { display: flex; align-items: center; gap: 8px; }
        .wt-ring-label { font-size: 12px; color: var(--text-tertiary); }
        .wt-ring-label strong { color: var(--text); font-weight: 500; }

        .wt-expand-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: none;
          background: none;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          flex-shrink: 0;
          cursor: pointer;
        }
        .wt-expand-btn:hover { background: var(--bg-surface); color: var(--text); }
        .wt-expand-btn:active { transform: scale(0.95); }

        .wt-toolbar {
          display: flex; align-items: center; gap: 12px;
          padding: 0 22px 14px; flex-wrap: wrap;
        }
        .wt-search-wrap {
          position: relative; display: flex; align-items: center; flex: 1; min-width: 200px;
        }
        .wt-search-wrap svg { position: absolute; left: 10px; color: var(--text-tertiary); pointer-events: none; }
        .wt-search-input {
          width: 100%; background: var(--bg-surface); border: 0.5px solid var(--border);
          border-radius: 8px; padding: 9px 32px 9px 32px; font-size: 13px; color: var(--text);
          font-family: var(--font-sans); outline: none; transition: border-color 0.15s;
        }
        .wt-search-input:focus { border-color: var(--text-tertiary); }
        .wt-search-clear {
          position: absolute; right: 8px; width: 20px; height: 20px; border: none; background: none;
          color: var(--text-tertiary); font-size: 18px; border-radius: 4px; display: flex;
          align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s;
        }
        .wt-search-clear:hover { background: var(--border); color: var(--text); }

        .wt-filter-tabs {
          display: flex; gap: 4px; background: var(--bg-surface); padding: 4px; border-radius: 8px;
        }
        .wt-filter-tabs button {
          display: flex; align-items: center; gap: 5px; border: none; background: none;
          font-size: 12.5px; font-weight: 500; color: var(--text-tertiary); padding: 7px 12px;
          border-radius: 6px; font-family: var(--font-sans); white-space: nowrap;
          transition: all 0.15s ease; cursor: pointer;
        }
        .wt-filter-tabs button:hover { color: var(--text); }
        .wt-filter-tabs button.active { background: var(--text); color: var(--bg); }
        .wt-filter-count { font-size: 11px; opacity: 0.7; }

        .wt-divider { height: 0.5px; background: var(--border); flex-shrink: 0; }

        .wt-add-row {
          display: flex; align-items: center; gap: 8px;
          padding: ${isFull ? "12px 22px" : "8px 12px"}; flex-shrink: 0;
        }
        .wt-picker-wrap { position: relative; flex-shrink: 0; }
        .wt-priority-btn {
          width: ${isFull ? 32 : 28}px;
          height: ${isFull ? 32 : 28}px;
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
        .wt-priority-btn:hover { border-color: var(--text-tertiary); }
        .wt-priority-btn:active { transform: scale(0.95); }
        .wt-dot { width: 7px; height: 7px; border-radius: 50%; display: block; pointer-events: none; }

        .wt-picker {
          position: absolute; top: calc(100% + 6px); left: 0; background: var(--bg-card);
          border: 0.5px solid var(--border); border-radius: 8px; padding: 4px; z-index: 50;
          min-width: 130px; box-shadow: 0 4px 16px rgba(0,0,0,0.14);
        }
        .wt-picker-opt {
          display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 10px; border-radius: 6px;
          border: none; background: transparent; font-size: 12.5px; font-family: var(--font-sans);
          color: var(--text-secondary); transition: all 0.1s; cursor: pointer;
        }
        .wt-picker-opt:hover { background: var(--bg-surface); color: var(--text); }
        .wt-picker-opt.sel { background: var(--bg-surface); color: var(--text); font-weight: 500; }

        .wt-input {
          flex: 1; background: none; border: none; font-size: ${isFull ? 14 : 13}px; font-family: var(--font-sans);
          color: var(--text); outline: none; min-width: 0; letter-spacing: -0.1px; caret-color: var(--brand);
        }
        .wt-input::placeholder { color: var(--text-tertiary); }

        .wt-submit {
          width: ${isFull ? 32 : 28}px;
          height: ${isFull ? 32 : 28}px;
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
        .wt-submit.active:hover { background: var(--brand-hover); }
        .wt-submit.active:active { transform: scale(0.95); }

        .wt-scroll {
          flex: 1; overflow-y: auto;
          scrollbar-width: thin; scrollbar-color: var(--border) transparent;
        }
        .wt-scroll::-webkit-scrollbar { width: 4px; }
        .wt-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        .wt-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: ${isFull ? "56px 16px" : "32px 16px"}; gap: 8px; color: var(--text-tertiary);
          font-size: 12.5px; font-family: var(--font-sans); text-align: center;
        }
        .wt-empty-hint { font-size: 11px; color: var(--text-disabled); }
        .wt-empty-hint kbd {
          font-size: 10px; color: var(--text-tertiary); background: var(--bg-surface);
          border: 0.5px solid var(--border); border-radius: 3px; padding: 2px 5px; font-family: var(--font-mono);
        }

        .wt-all-done {
          display: flex; align-items: center; gap: 7px; padding: 10px ${isFull ? 22 : 14}px 4px;
          font-size: 11.5px; font-family: var(--font-sans); color: var(--brand); font-weight: 500;
        }

        .wt-group { margin-top: 4px; }
        .wt-group-header {
          display: flex; align-items: center; gap: 7px; padding: 10px 22px 6px; font-size: 11.5px;
          font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.06em;
        }
        .wt-group-dot { width: 6px; height: 6px; border-radius: 50%; }
        .wt-group-count { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--text-disabled); margin-left: 2px; }

        .wt-completed-section { margin-top: 6px; border-top: 0.5px solid var(--border-faint); padding-top: 4px; }
        .wt-completed-toggle {
          display: flex; align-items: center; gap: 7px; width: 100%; padding: 10px 22px; border: none; background: none;
          font-size: 11.5px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.06em;
          cursor: pointer; transition: color 0.15s;
        }
        .wt-completed-toggle:hover { color: var(--text-secondary); }

        .wt-sep { height: 0.5px; background: var(--border); margin: 2px 14px; }

        .wt-footer {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          padding: ${isFull ? "12px 22px" : "8px 12px 10px"};
        }
        .wt-footer-label { font-size: 11.5px; color: var(--text-tertiary); font-family: var(--font-sans); }
        .wt-footer-actions { display: flex; align-items: center; gap: 14px; }
        .wt-footer-btn {
          display: flex; align-items: center; gap: 5px; background: none; border: none; cursor: pointer;
          font-size: 11.5px; font-family: var(--font-sans); color: var(--text-tertiary);
          padding: 0; transition: color 0.12s;
        }
        .wt-footer-btn:hover { color: var(--text); }

        @media (max-width: 640px) {
          .wt-toolbar { flex-direction: column; align-items: stretch; }
          .wt-filter-tabs { justify-content: space-between; }
        }
      `}</style>
    </>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────

function TaskRow({
  task,
  isFull,
  onToggle,
  onRemove,
}: {
  task: Task;
  isFull?: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const meta = PRIORITY_META[getPriority(task)];

  return (
    <>
      <div className={`wt-row${isFull ? " wt-row-full" : ""}`}>
        <button
          className={`wt-check${task.completed ? " done" : ""}`}
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed && (
            <svg width="9" height="9" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {!task.completed && !isFull && (
          <span className="wt-row-dot" style={{ background: meta.color }} aria-hidden="true" />
        )}

        <span className={`wt-row-text${task.completed ? " done" : ""}`} onClick={() => onToggle(task.id)}>
          {task.text}
        </span>

        {isFull && <span className="wt-row-time">{timeAgo(task.createdAt)}</span>}
        {task.context && <span className="wt-row-tag">{task.context}</span>}

        <button className="wt-row-del" onClick={() => onRemove(task.id)} aria-label="Remove task">
          ×
        </button>
      </div>

      <style>{`
        .wt-row {
          display: flex; align-items: center; gap: 9px;
          padding: ${isFull ? "9px 22px" : "6px 12px"};
          transition: background 0.1s;
        }
        .wt-row:hover { background: var(--bg-surface); }
        .wt-row:hover .wt-row-del { opacity: 1; }

        .wt-check {
          width: ${isFull ? 18 : 16}px;
          height: ${isFull ? 18 : 16}px;
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
        .wt-check.done { background: #145C3C; border-color: #145C3C; }
        .wt-check:hover:not(.done) { border-color: var(--text-tertiary); }
        .wt-check:active { transform: scale(0.92); }

        .wt-row-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; opacity: 0.75; }

        .wt-row-text {
          flex: 1; font-size: ${isFull ? 13.5 : 13}px; font-family: var(--font-sans); color: var(--text);
          line-height: 1.45; cursor: pointer; user-select: none; min-width: 0; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap; transition: color 0.15s; letter-spacing: -0.1px;
        }
        .wt-row-text.done {
          text-decoration: line-through;
          text-decoration-color: var(--text-disabled);
          color: var(--text-tertiary);
        }

        .wt-row-time { font-size: 11px; color: var(--text-disabled); flex-shrink: 0; white-space: nowrap; }

        .wt-row-tag {
          font-size: 10px; color: var(--text-tertiary); background: var(--bg-surface);
          border: 0.5px solid var(--border); padding: 2px 6px; border-radius: 4px; flex-shrink: 0;
        }

        .wt-row-del {
          width: 20px;
          height: 20px;
          border-radius: 5px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0;
          opacity: 0;
          transition: all 0.12s ease;
        }
        .wt-row-del:hover { color: #E05252; background: var(--error-bg); }
        .wt-row-del:active { transform: scale(0.9); }
      `}</style>
    </>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────

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

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

function ChevronIcon({ open }: { open: boolean }) {
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
      style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}