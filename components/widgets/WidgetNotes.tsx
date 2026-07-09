// components/widgets/WidgetNotes.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Note,
  NoteColor,
  WidgetVariant,
  NOTE_COLORS,
  timeAgo,
  uid,
} from "./widgetTypes";

interface WidgetNotesProps {
  variant?: WidgetVariant;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  onExpand?: () => void;
}

export default function WidgetNotes({
  variant = "compact",
  notes,
  setNotes,
  onExpand,
}: WidgetNotesProps) {
  const isFull = variant === "full";

  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(!isFull);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (composerOpen && !activeNote) titleRef.current?.focus();
  }, [composerOpen, activeNote]);

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setColor("default");
    setActiveNote(null);
    if (isFull) setComposerOpen(false);
  };

  const createNote = () => {
    if (!title.trim() && !content.trim()) return resetEditor();
    const newNote: Note = {
      id: uid(),
      title: title.trim(),
      content: content.trim(),
      color,
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    resetEditor();
    titleRef.current?.focus();
  };

  const updateNote = (id: string) => {
    setNotes(
      notes.map((n) =>
        n.id === id
          ? { ...n, title: title.trim(), content: content.trim(), color, updatedAt: Date.now() }
          : n
      )
    );
    resetEditor();
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    if (activeNote === id) resetEditor();
  };

  const togglePin = (id: string) =>
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));

  const editNote = (note: Note) => {
    setActiveNote(note.id);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setComposerOpen(true);
  };

  const handleSave = () => (activeNote ? updateNote(activeNote) : createNote());
  const handleCancel = () => resetEditor();

  const hasContent = title.trim().length > 0 || content.trim().length > 0;

  const searched = search.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.trim().toLowerCase()) ||
          n.content.toLowerCase().includes(search.trim().toLowerCase())
      )
    : notes;

  const pinned = searched.filter((n) => n.pinned);
  const others = searched.filter((n) => !n.pinned);

  return (
    <>
      <div className={`wn-root ${isFull ? "wn-full" : "wn-compact"}`}>
        {/* Header */}
        <div className="wn-header">
          <div className="wn-header-left">
            {isFull ? <h2 className="wn-title">Notes</h2> : <span className="wn-eyebrow">Notes</span>}
            {notes.length > 0 && (
              <span className="wn-header-sub">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            )}
          </div>
          {!isFull && onExpand && (
            <button className="wn-expand-btn" onClick={onExpand} aria-label="Open full notes view">
              <ExpandIcon />
            </button>
          )}
        </div>

        {/* Toolbar */}
        {isFull && (
          <div className="wn-toolbar">
            <div className="wn-search-wrap">
              <SearchIcon />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="wn-search-input"
                aria-label="Search notes"
              />
              {search && (
                <button className="wn-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                  ×
                </button>
              )}
            </div>
            {!composerOpen && (
              <button className="wn-new-btn" onClick={() => setComposerOpen(true)}>
                <PlusIcon /> New note
              </button>
            )}
          </div>
        )}

        <div className="wn-body">
          {/* Composer */}
          {(!isFull || composerOpen) && (
            <div className={`wn-editor wn-color-${color}`}>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="wn-title-input"
                maxLength={100}
                onKeyDown={(e) => e.key === "Escape" && handleCancel()}
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Take a note…"
                className="wn-content-input"
                rows={isFull ? 4 : 3}
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleCancel();
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSave();
                }}
              />

              <div className="wn-colors">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`wn-color-btn wn-color-${c.value}${color === c.value ? " active" : ""}`}
                    onClick={() => setColor(c.value)}
                    aria-label={c.label}
                    title={c.label}
                  />
                ))}
              </div>

              {(hasContent || isFull) && (
                <div className="wn-actions">
                  {(activeNote || isFull) && (
                    <button className="wn-cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                  )}
                  <button className="wn-save-btn" onClick={handleSave} disabled={!hasContent}>
                    {activeNote ? "Update" : "Save"}
                  </button>
                </div>
              )}
            </div>
          )}

          {(!isFull || composerOpen) && <div className="wn-divider" />}

          {/* Notes */}
          {isFull ? (
            <div className="wn-grid-scroll">
              {searched.length === 0 && (
                <div className="wn-empty">
                  {search.trim() ? `No notes match "${search.trim()}"` : "No notes yet — jot down your first one above"}
                </div>
              )}

              {pinned.length > 0 && (
                <>
                  <div className="wn-section-label">Pinned</div>
                  <div className="wn-grid">
                    {pinned.map((note) => (
                      <NoteCard key={note.id} note={note} onEdit={editNote} onDelete={deleteNote} onTogglePin={togglePin} />
                    ))}
                  </div>
                </>
              )}

              {others.length > 0 && (
                <>
                  {pinned.length > 0 && <div className="wn-section-label">Others</div>}
                  <div className="wn-grid">
                    {others.map((note) => (
                      <NoteCard key={note.id} note={note} onEdit={editNote} onDelete={deleteNote} onTogglePin={togglePin} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="wn-list">
              {notes.length === 0 && <div className="wn-empty">No notes yet</div>}
              {notes.map((note) => (
                <NoteRow key={note.id} note={note} onEdit={editNote} onDelete={deleteNote} onTogglePin={togglePin} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .wn-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: var(--font-sans);
        }

        .wn-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          padding: ${isFull ? "18px 22px 12px" : "12px 14px 8px"};
        }
        .wn-header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .wn-eyebrow {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .wn-title {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.3px;
          color: var(--text);
          margin: 0;
        }
        .wn-header-sub {
          font-size: 12.5px;
          color: var(--text-tertiary);
        }
        .wn-expand-btn {
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
        .wn-expand-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }
        .wn-expand-btn:active {
          transform: scale(0.95);
        }

        .wn-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 22px 14px;
          flex-wrap: wrap;
        }
        .wn-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 200px;
        }
        .wn-search-wrap svg {
          position: absolute;
          left: 10px;
          color: var(--text-tertiary);
          pointer-events: none;
        }
        .wn-search-input {
          width: 100%;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 9px 32px 9px 32px;
          font-size: 13px;
          color: var(--text);
          font-family: var(--font-sans);
          outline: none;
          transition: border-color 0.15s;
        }
        .wn-search-input:focus {
          border-color: var(--text-tertiary);
        }
        .wn-search-clear {
          position: absolute;
          right: 8px;
          width: 20px;
          height: 20px;
          border: none;
          background: none;
          color: var(--text-tertiary);
          font-size: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .wn-search-clear:hover {
          background: var(--border);
          color: var(--text);
        }

        .wn-new-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 8px;
          padding: 9px 16px;
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          white-space: nowrap;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .wn-new-btn:hover {
          background: var(--text-secondary);
        }
        .wn-new-btn:active {
          transform: scale(0.98);
        }

        .wn-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .wn-body::-webkit-scrollbar {
          width: 4px;
        }
        .wn-body::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 2px;
        }

        /* Editor */
        .wn-editor {
          padding: ${isFull ? "0 22px 14px" : "0 12px 12px"};
          margin: ${isFull ? "0 22px 12px" : "0 12px 12px"};
          border-radius: 10px;
          border: 0.5px solid var(--border);
          transition: all 0.2s ease;
        }
        .wn-title-input {
          width: 100%;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--text);
          padding: 12px 12px 6px;
          outline: none;
        }
        .wn-title-input::placeholder {
          color: var(--text-disabled);
          font-weight: 500;
        }
        .wn-content-input {
          width: 100%;
          background: none;
          border: none;
          font-size: 13px;
          font-family: var(--font-sans);
          color: var(--text);
          padding: 4px 12px 8px;
          outline: none;
          resize: none;
          line-height: 1.5;
        }
        .wn-content-input::placeholder {
          color: var(--text-disabled);
        }

        .wn-colors {
          display: flex;
          gap: 7px;
          padding: 6px 12px 8px;
          flex-wrap: wrap;
        }
        .wn-color-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.15s ease;
          cursor: pointer;
          padding: 0;
        }
        .wn-color-btn:hover {
          transform: scale(1.15);
        }
        .wn-color-btn:active {
          transform: scale(1.05);
        }
        .wn-color-btn.active {
          border-color: var(--text);
          transform: scale(1.2);
          box-shadow: 0 0 0 2px var(--bg-card);
        }
        .wn-color-default {
          background: var(--bg-card);
          border-color: var(--border);
        }
        .wn-color-default.active {
          border-color: var(--text);
        }
        .wn-color-yellow {
          background: #FFF9C4;
        }
        .wn-color-green {
          background: #C8E6C9;
        }
        .wn-color-blue {
          background: #BBDEFB;
        }
        .wn-color-pink {
          background: #F8BBD0;
        }
        .wn-color-purple {
          background: #E1BEE7;
        }

        .wn-editor.wn-color-default {
          background: var(--bg-surface);
        }
        .wn-editor.wn-color-yellow {
          background: #FFFDE7;
          border-color: rgba(255, 235, 59, 0.3);
        }
        .wn-editor.wn-color-green {
          background: #F1F8E9;
          border-color: rgba(139, 195, 74, 0.3);
        }
        .wn-editor.wn-color-blue {
          background: #E3F2FD;
          border-color: rgba(33, 150, 243, 0.3);
        }
        .wn-editor.wn-color-pink {
          background: #FCE4EC;
          border-color: rgba(233, 30, 99, 0.3);
        }
        .wn-editor.wn-color-purple {
          background: #F3E5F5;
          border-color: rgba(156, 39, 176, 0.3);
        }

        .wn-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 8px 12px 6px;
        }
        .wn-cancel-btn,
        .wn-save-btn {
          padding: 7px 16px;
          border-radius: 7px;
          border: none;
          font-size: 12.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .wn-cancel-btn {
          background: none;
          color: var(--text-tertiary);
        }
        .wn-cancel-btn:hover {
          background: var(--bg-card);
          color: var(--text);
        }
        .wn-cancel-btn:active {
          transform: scale(0.97);
        }
        .wn-save-btn {
          background: var(--text);
          color: var(--bg);
        }
        .wn-save-btn:hover:not(:disabled) {
          background: var(--text-secondary);
        }
        .wn-save-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .wn-save-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .wn-divider {
          height: 0.5px;
          background: var(--border);
          margin: 0 ${isFull ? 22 : 12}px 8px;
        }

        .wn-empty {
          text-align: center;
          padding: ${isFull ? "56px 16px" : "32px 16px"};
          font-size: 12.5px;
          color: var(--text-disabled);
        }

        /* Compact list */
        .wn-list {
          flex: 1;
          padding: 0 8px 8px;
        }
        .wn-section-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 8px 22px 10px;
        }

        /* Full masonry grid */
        .wn-grid-scroll {
          flex: 1;
          padding: 0 22px 24px;
        }
        .wn-grid {
          column-count: 1;
          column-gap: 14px;
        }
        @media (min-width: 560px) {
          .wn-grid {
            column-count: 2;
          }
        }
        @media (min-width: 820px) {
          .wn-grid {
            column-count: 3;
          }
        }
      `}</style>
    </>
  );
}

// ── Compact list row ────────────────────────────────────────────────────

function NoteRow({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  return (
    <>
      <div className={`wn-note wn-color-${note.color}`} onClick={() => onEdit(note)}>
        {note.pinned && (
          <span className="wn-pin-badge">
            <PinIcon filled />
          </span>
        )}
        {note.title && <div className="wn-note-title">{note.title}</div>}
        {note.content && <div className="wn-note-content">{note.content}</div>}
        <div className="wn-note-actions">
          <button
            className="wn-note-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
          >
            <PinIcon filled={note.pinned} />
          </button>
          <button
            className="wn-note-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            aria-label="Delete note"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <style>{`
        .wn-note {
          position: relative;
          padding: 12px 14px;
          border: 0.5px solid var(--border);
          border-radius: 10px;
          margin: 0 4px 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .wn-note:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }
        .wn-note:active {
          transform: translateY(0);
        }
        .wn-note:hover .wn-note-actions {
          opacity: 1;
        }
        .wn-note.wn-color-default {
          background: var(--bg-card);
        }
        .wn-note.wn-color-yellow {
          background: #FFF9C4;
          border-color: rgba(255, 235, 59, 0.3);
        }
        .wn-note.wn-color-green {
          background: #C8E6C9;
          border-color: rgba(139, 195, 74, 0.3);
        }
        .wn-note.wn-color-blue {
          background: #BBDEFB;
          border-color: rgba(33, 150, 243, 0.3);
        }
        .wn-note.wn-color-pink {
          background: #F8BBD0;
          border-color: rgba(233, 30, 99, 0.3);
        }
        .wn-note.wn-color-purple {
          background: #E1BEE7;
          border-color: rgba(156, 39, 176, 0.3);
        }
        .wn-note-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
          padding-right: 50px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wn-note-content {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .wn-pin-badge {
          position: absolute;
          top: 10px;
          right: 38px;
          color: var(--text-tertiary);
          opacity: 0.7;
        }
        .wn-note-actions {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 3px;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .wn-note-icon-btn {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: none;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .wn-note-icon-btn:hover {
          background: var(--bg-card);
          color: var(--text);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .wn-note-icon-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
}

// ── Full-view masonry card ──────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  return (
    <>
      <div className={`wnc-card wnc-color-${note.color}`} onClick={() => onEdit(note)}>
        <div className="wnc-top">
          {note.title && <div className="wnc-title">{note.title}</div>}
          <button
            className="wnc-pin-btn"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
          >
            <PinIcon filled={note.pinned} />
          </button>
        </div>
        {note.content && <div className="wnc-content">{note.content}</div>}
        <div className="wnc-footer">
          <span className="wnc-time">{timeAgo(note.updatedAt)}</span>
          <button
            className="wnc-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            aria-label="Delete note"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <style>{`
        .wnc-card {
          break-inside: avoid;
          margin-bottom: 14px;
          padding: 14px 14px 12px;
          border: 0.5px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .wnc-card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .wnc-card:active {
          transform: translateY(-1px);
        }
        .wnc-card:hover .wnc-delete-btn {
          opacity: 1;
        }
        .wnc-color-default {
          background: var(--bg-card);
        }
        .wnc-color-yellow {
          background: #FFF9C4;
          border-color: rgba(255, 235, 59, 0.3);
        }
        .wnc-color-green {
          background: #C8E6C9;
          border-color: rgba(139, 195, 74, 0.3);
        }
        .wnc-color-blue {
          background: #BBDEFB;
          border-color: rgba(33, 150, 243, 0.3);
        }
        .wnc-color-pink {
          background: #F8BBD0;
          border-color: rgba(233, 30, 99, 0.3);
        }
        .wnc-color-purple {
          background: #E1BEE7;
          border-color: rgba(156, 39, 176, 0.3);
        }

        .wnc-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: ${note.content ? "8px" : "0"};
        }
        .wnc-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.4;
          flex: 1;
        }
        .wnc-pin-btn {
          border: none;
          background: none;
          color: var(--text-tertiary);
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .wnc-pin-btn:hover {
          background: rgba(0, 0, 0, 0.06);
          color: var(--text);
        }
        .wnc-pin-btn:active {
          transform: scale(0.95);
        }

        .wnc-content {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .wnc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.06);
        }
        .wnc-time {
          font-size: 10.5px;
          color: var(--text-tertiary);
          opacity: 0.8;
        }
        .wnc-delete-btn {
          border: none;
          background: none;
          color: var(--text-tertiary);
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .wnc-delete-btn:hover {
          color: #E05252;
          background: var(--error-bg);
        }
        .wnc-delete-btn:active {
          transform: scale(0.95);
        }
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function PinIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  );
}