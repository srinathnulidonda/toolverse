// components/widgets/WidgetNotes.tsx
"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import {
  Note,
  ChecklistItem,
  WidgetVariant,
  NotesDraft,
  DEFAULT_NOTES_DRAFT,
  MAX_NOTE_TITLE_LENGTH,
  MAX_NOTE_CONTENT_LENGTH,
  MAX_CHECKLIST_ITEM_LENGTH,
  timeAgo,
  uid,
} from "./widgetTypes";
import type { SaveNoteInput } from "@/lib/useNotes";

interface WidgetNotesProps {
  variant?: WidgetVariant;
  notes: Note[];
  saveNote: (input: SaveNoteInput) => string | null;
  deleteNote: (id: string) => Note | null;
  restoreNote: (note: Note) => void;
  togglePin: (id: string) => void;
  draft: NotesDraft;
  setDraft: (draft: NotesDraft | ((prev: NotesDraft) => NotesDraft)) => void;
}

interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const MODAL_DRAG_THRESHOLD = 4;

export default function WidgetNotes({
  variant = "compact",
  notes,
  saveNote,
  deleteNote,
  restoreNote,
  togglePin,
  draft,
  setDraft,
}: WidgetNotesProps) {
  const isFull = variant === "full";
  const {
    activeNote,
    title,
    content,
    type = "note",
    items = [],
    composerOpen,
    showCompleted = true,
  } = draft;

  const [toast, setToast] = useState<ToastState | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDraggingModal, setIsDraggingModal] = useState(false);

  const toastTimerRef = useRef<NodeJS.Timeout>();
  const modalDragStartRef = useRef({ x: 0, y: 0, modalX: 0, modalY: 0 });
  const hasDraggedModalRef = useRef(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
const modalTransformStyle: React.CSSProperties = useMemo(() => ({
  transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`
}), [modalPosition.x, modalPosition.y]);

  const activeNoteData = useMemo(
    () => (activeNote ? notes.find((n) => n.id === activeNote) : null),
    [activeNote, notes]
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!composerOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    setModalPosition({ x: 0, y: 0 });

    const frame = requestAnimationFrame(() => {
      if (!activeNote && type === "checklist" && items[0]) {
        modalRef.current
          ?.querySelector<HTMLInputElement>(`[data-item-id="${items[0].id}"]`)
          ?.focus();
      } else {
        titleRef.current?.focus();
      }
    });

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

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
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapFocus);
      previouslyFocused?.focus();
    };
  }, [composerOpen]);

  useEffect(() => {
    if (!isDraggingModal) return;

    const move = (clientX: number, clientY: number) => {
      const dx = clientX - modalDragStartRef.current.x;
      const dy = clientY - modalDragStartRef.current.y;

      if (!hasDraggedModalRef.current) {
        if (Math.abs(dx) < MODAL_DRAG_THRESHOLD && Math.abs(dy) < MODAL_DRAG_THRESHOLD) return;
        hasDraggedModalRef.current = true;
      }

      const newX = modalDragStartRef.current.modalX + dx;
      const newY = modalDragStartRef.current.modalY + dy;

      const modal = modalRef.current;
      if (modal) {
        const rect = modal.getBoundingClientRect();
        const maxX = (window.innerWidth - rect.width) / 2;
        const maxY = (window.innerHeight - rect.height) / 2;

        setModalPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      move(touch.clientX, touch.clientY);
    };
    const handleEnd = () => setIsDraggingModal(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDraggingModal]);

  const showToast = (message: string, actionLabel?: string, onAction?: () => void) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, actionLabel, onAction });
    toastTimerRef.current = setTimeout(() => setToast(null), actionLabel ? 5000 : 3000);
  };

  const resetEditor = () => {
    setDraft(() => ({ ...DEFAULT_NOTES_DRAFT }));
  };

  const handleSaveNote = () => {
    saveNote({
      id: activeNote,
      title,
      content,
      type,
      items,
    });
    resetEditor();
  };

  const handleDeleteNote = (id: string) => {
    const removed = deleteNote(id);
    if (!removed) return;

    if (activeNote === id) resetEditor();

    showToast("Note deleted", "Undo", () => {
      restoreNote(removed);
      setToast(null);
    });
  };

  const deleteCurrentNote = () => {
    if (!activeNote) return;
    handleDeleteNote(activeNote);
  };

  const togglePinAndSave = () => {
    if (!activeNote) {
      const isChecklist = type === "checklist";
      const hasContent =
        title.trim() || (isChecklist ? items.some((i) => i.text.trim()) : content.trim());
      if (!hasContent) return;

      const newId = saveNote({ id: null, title, content, type, items, pinned: true });
      if (newId) setDraft((d) => ({ ...d, activeNote: newId }));
    } else {
      togglePin(activeNote);
    }
  };

  const toggleNoteType = () => {
    const newType: "note" | "checklist" = type === "checklist" ? "note" : "checklist";

    if (newType === "note" && items.some((i) => i.text.trim())) {
      const combinedContent = items
        .filter((i) => i.text.trim())
        .map((i) => i.text.trim())
        .join("\n");
      setDraft((d) => ({ ...d, type: newType, content: combinedContent, items: [] }));
      return;
    }

    if (newType === "checklist" && content.trim()) {
      const firstItem: ChecklistItem = { id: uid(), text: content.trim(), checked: false };
      setDraft((d) => ({ ...d, type: newType, content: "", items: [firstItem] }));
      return;
    }

    setDraft((d) => ({
      ...d,
      type: newType,
      items: newType === "checklist" ? d.items : [],
      content: newType === "note" ? d.content : "",
    }));
  };

  const editNote = (note: Note) => {
    setDraft((d) => ({
      ...d,
      activeNote: note.id,
      title: note.title,
      content: note.content || "",
      type: note.type || "note",
      items: note.items || [],
      composerOpen: true,
      showCompleted: true,
    }));
  };

  const openComposer = (noteType: "note" | "checklist" = "note") => {
    setDraft((d) => ({
      ...d,
      type: noteType,
      composerOpen: true,
      items: noteType === "checklist" ? [{ id: uid(), text: "", checked: false }] : d.items,
      content: noteType === "note" ? d.content : "",
    }));
  };

  const toggleItemChecked = (itemId: string) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
    }));
  };

  const updateItemText = (itemId: string, text: string) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((i) => (i.id === itemId ? { ...i, text } : i)),
    }));
  };

  const deleteItem = (itemId: string) => {
    setDraft((d) => ({ ...d, items: d.items.filter((i) => i.id !== itemId) }));
  };

  const addItem = (text = "", afterId?: string) => {
    const newItem: ChecklistItem = { id: uid(), text, checked: false };

    setDraft((d) => {
      const currentItems = d.items;
      if (afterId) {
        const index = currentItems.findIndex((i) => i.id === afterId);
        const newItems = [...currentItems];
        newItems.splice(index + 1, 0, newItem);
        return { ...d, items: newItems };
      }
      return { ...d, items: [...currentItems, newItem] };
    });

    requestAnimationFrame(() => {
      modalRef.current
        ?.querySelector<HTMLInputElement>(`[data-item-id="${newItem.id}"]`)
        ?.focus();
    });
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, itemId: string, text: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem("", itemId);
      return;
    }

    if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      const currentItems = items;
      if (currentItems.length <= 1) return;

      const currentIndex = currentItems.findIndex((i) => i.id === itemId);
      const focusTargetId = currentIndex > 0 ? currentItems[currentIndex - 1].id : currentItems[1]?.id;

      deleteItem(itemId);

      if (focusTargetId) {
        requestAnimationFrame(() => {
          modalRef.current
            ?.querySelector<HTMLInputElement>(`[data-item-id="${focusTargetId}"]`)
            ?.focus();
        });
      }
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSaveNote();
    }
  };

  const handleModalDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "BUTTON" || target.closest("button")) {
      return;
    }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setIsDraggingModal(true);
    hasDraggedModalRef.current = false;
    modalDragStartRef.current = {
      x: clientX,
      y: clientY,
      modalX: modalPosition.x,
      modalY: modalPosition.y,
    };
  };

  const pinned = useMemo(() => notes.filter((n) => n.pinned), [notes]);
  const others = useMemo(() => notes.filter((n) => !n.pinned), [notes]);

  const uncheckedItems = useMemo(() => items.filter((i) => !i.checked), [items]);
  const checkedItems = useMemo(() => items.filter((i) => i.checked), [items]);

  return (
    <>
      <div className={`wn-root ${isFull ? "wn-full" : "wn-compact"}`}>
        {!composerOpen && (
          <div className="wn-composer-bar">
            <button
              className="wn-composer-placeholder-btn"
              onClick={() => openComposer("note")}
              aria-label="Take a note"
            >
              Take a note…
            </button>
            <div className="wn-composer-icons">
              <button
                className="wn-composer-icon-btn"
                onClick={() => openComposer("checklist")}
                aria-label="New checklist"
                title="Checklist"
              >
                <ChecklistIcon />
              </button>
            </div>
          </div>
        )}

        <div className="wn-body">
          <div className="wn-grid-scroll">
            {notes.length === 0 && (
              <div className="wn-empty">
                <SparkleIcon />
                <span>No notes yet</span>
                <span className="wn-empty-sub">Click above to create one</span>
              </div>
            )}

            {pinned.length > 0 && (
              <>
                <div className="wn-section-label">Pinned</div>
                <div className="wn-grid">
                  {pinned.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={editNote}
                      onDelete={handleDeleteNote}
                      onTogglePin={togglePin}
                      openMenuId={openMenuId}
                      onMenuToggle={setOpenMenuId}
                    />
                  ))}
                </div>
              </>
            )}

            {others.length > 0 && (
              <>
                {pinned.length > 0 && <div className="wn-section-label">Others</div>}
                <div className="wn-grid">
                  {others.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={editNote}
                      onDelete={handleDeleteNote}
                      onTogglePin={togglePin}
                      openMenuId={openMenuId}
                      onMenuToggle={setOpenMenuId}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {toast && (
          <div className="wn-toast" role="status" aria-live="polite">
            <span className="wn-toast-text">{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
              <button className="wn-toast-undo" onClick={toast.onAction}>
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {composerOpen && (
        <div
          className="wn-editor-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleSaveNote();
          }}
        >
          <div
            ref={modalRef}
            className="wn-editor-modal"
            style={modalTransformStyle}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={activeNote ? "Edit note" : "New note"}
          >
            <div
              className="wn-editor-header"
              onMouseDown={handleModalDragStart}
              onTouchStart={handleModalDragStart}
            >
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Title"
                className="wn-editor-title-input"
                maxLength={MAX_NOTE_TITLE_LENGTH}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    handleSaveNote();
                  }
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSaveNote();
                }}
              />
              <button
                className="wn-editor-pin-btn"
                onClick={togglePinAndSave}
                onMouseDown={(e) => e.stopPropagation()}
                title={activeNoteData?.pinned ? "Unpin note" : "Pin note"}
                aria-label={activeNoteData?.pinned ? "Unpin note" : "Pin note"}
                aria-pressed={Boolean(activeNoteData?.pinned)}
              >
                <PinIcon filled={activeNoteData?.pinned} />
              </button>
            </div>

            <div className="wn-editor-body">
              {type === "note" ? (
                <textarea
                  value={content}
                  onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                  placeholder="Take a note…"
                  className="wn-editor-content-input"
                  maxLength={MAX_NOTE_CONTENT_LENGTH}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      handleSaveNote();
                    }
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSaveNote();
                  }}
                />
              ) : (
                <div className="wn-checklist">
                  {uncheckedItems.map((item) => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                      onToggle={toggleItemChecked}
                      onUpdate={updateItemText}
                      onDelete={deleteItem}
                      onKeyDown={handleItemKeyDown}
                    />
                  ))}

                  <div className="wn-checklist-add" onClick={() => addItem()}>
                    <PlusIcon />
                    <span>List item</span>
                  </div>

                  {checkedItems.length > 0 && (
                    <>
                      <button
                        className="wn-checklist-toggle"
                        onClick={() => setDraft((d) => ({ ...d, showCompleted: !d.showCompleted }))}
                        aria-expanded={showCompleted}
                      >
                        <ChevronIcon open={showCompleted} />
                        {checkedItems.length} completed item{checkedItems.length !== 1 ? "s" : ""}
                      </button>
                      {showCompleted &&
                        checkedItems.map((item) => (
                          <ChecklistRow
                            key={item.id}
                            item={item}
                            onToggle={toggleItemChecked}
                            onUpdate={updateItemText}
                            onDelete={deleteItem}
                            onKeyDown={handleItemKeyDown}
                          />
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="wn-editor-toolbar">
              <div className="wn-editor-toolbar-icons">
                <button
                  className="wn-editor-toolbar-btn"
                  onClick={toggleNoteType}
                  aria-label={type === "checklist" ? "Convert to note" : "Convert to checklist"}
                  title={type === "checklist" ? "Note" : "Checklist"}
                >
                  {type === "checklist" ? <NoteIcon /> : <ChecklistIcon />}
                </button>
                {activeNote && (
                  <button
                    className="wn-editor-toolbar-btn wn-editor-delete"
                    onClick={deleteCurrentNote}
                    aria-label="Delete note"
                    title="Delete"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
              <button className="wn-editor-close" onClick={handleSaveNote}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .wn-root {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: var(--font-sans);
          overflow: hidden;
        }

        .wn-composer-bar {
          width: calc(100% - 28px);
          max-width: 420px;
          margin: 16px auto 14px;
          padding: 10px 16px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: background 0.15s ease, border-color 0.15s ease;
          flex-shrink: 0;
        }
        .wn-composer-bar:hover {
          background: var(--bg-card);
          border-color: var(--border-faint);
        }
        .wn-composer-placeholder-btn {
          flex: 1;
          background: none;
          border: none;
          font-size: 14px;
          color: var(--text-tertiary);
          text-align: left;
          cursor: text;
          padding: 0;
          font-family: var(--font-sans);
          transition: color 0.15s;
        }
        .wn-composer-placeholder-btn:hover { color: var(--text-secondary); }

        .wn-composer-icons { display: flex; align-items: center; gap: 2px; }
        .wn-composer-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: none;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .wn-composer-icon-btn:hover { background: rgba(128, 128, 128, 0.14); color: var(--text); }
        .wn-composer-icon-btn:active { transform: scale(0.92); }

        .wn-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
          min-height: 0;
        }
        .wn-body::-webkit-scrollbar { width: 5px; }
        .wn-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        .wn-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-align: center;
          padding: ${isFull ? "72px 16px" : "40px 16px"};
          color: var(--text-tertiary);
        }
        .wn-empty svg { opacity: 0.5; margin-bottom: 4px; }
        .wn-empty span:first-of-type { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .wn-empty-sub { font-size: 11.5px; color: var(--text-disabled); }

        .wn-section-label {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 6px ${isFull ? 22 : 14}px 10px;
        }

        .wn-grid-scroll {
          flex: 1;
          padding: 0 ${isFull ? 22 : 14}px 60px;
          container-type: inline-size;
        }

        .wn-grid { column-count: 1; column-gap: 10px; }
        @container (min-width: 220px) { .wn-grid { column-count: 2; } }
        @container (min-width: 600px) { .wn-grid { column-count: 3; } }
        @container (min-width: 860px) { .wn-grid { column-count: 4; } }

        .wn-toast {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          padding: 11px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
          animation: wn-toast-in 0.2s ease;
          z-index: 100;
        }
        .wn-toast-text { font-size: 13px; color: var(--text); }
        .wn-toast-undo {
          background: none;
          border: none;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--brand);
          cursor: pointer;
          padding: 6px 10px;
          min-height: 32px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          transition: background 0.15s ease;
        }
        .wn-toast-undo:hover { background: var(--bg-surface); }
        .wn-toast-undo:active { transform: scale(0.96); }

        @keyframes wn-toast-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .wn-editor-overlay {
          position: fixed;
          inset: 0;
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          animation: wn-fade-in 0.15s ease;
        }
        .wn-editor-modal {
          width: 100%;
          max-width: 600px;
          max-height: min(680px, calc(100dvh - 40px));
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          animation: wn-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .wn-editor-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 18px 18px 4px;
          cursor: grab;
          flex-shrink: 0;
        }
        .wn-editor-header:active { cursor: grabbing; }
        .wn-editor-title-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          box-shadow: none;
          appearance: none;
          font-size: 17px;
          font-weight: 650;
          letter-spacing: -0.2px;
          font-family: var(--font-sans);
          color: var(--text);
          padding: 6px 0;
          cursor: text;
        }
        .wn-editor-title-input::placeholder { color: var(--text-disabled); font-weight: 550; }
        .wn-editor-title-input:focus,
        .wn-editor-title-input:focus-visible {
          outline: none;
          box-shadow: none;
          border: none;
        }

        .wn-editor-pin-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: none;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          flex-shrink: 0;
        }
        .wn-editor-pin-btn:hover { background: rgba(128, 128, 128, 0.14); color: var(--text); }
        .wn-editor-pin-btn:active { transform: scale(0.9); }

        .wn-editor-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px 18px 18px;
          min-height: 120px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .wn-editor-body::-webkit-scrollbar { width: 6px; }
        .wn-editor-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .wn-editor-content-input {
          width: 100%;
          min-height: 120px;
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: var(--font-sans);
          color: var(--text);
          resize: none;
          line-height: 1.65;
        }
        .wn-editor-content-input::placeholder { color: var(--text-disabled); }

        .wn-checklist { display: flex; flex-direction: column; gap: 2px; }
        .wn-checklist-add {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          min-height: 40px;
          color: var(--text-tertiary);
          font-size: 14px;
          cursor: pointer;
          border-radius: 10px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .wn-checklist-add:hover { background: var(--bg-surface); color: var(--text); }

        .wn-checklist-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          min-height: 40px;
          margin-top: 8px;
          border: none;
          background: none;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 10px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .wn-checklist-toggle:hover { background: var(--bg-surface); color: var(--text); }

        .wn-editor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px 14px;
          flex-shrink: 0;
        }
        .wn-editor-toolbar-icons { display: flex; align-items: center; gap: 4px; }
        .wn-editor-toolbar-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: none;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .wn-editor-toolbar-btn:hover { background: rgba(128, 128, 128, 0.14); color: var(--text); }
        .wn-editor-toolbar-btn:active { transform: scale(0.92); }
        .wn-editor-delete:hover { background: rgba(224, 82, 82, 0.15); color: #E05252; }
        .wn-editor-close {
          background: var(--brand);
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          padding: 9px 18px;
          min-height: 38px;
          border-radius: 10px;
          transition: background 0.15s ease;
          white-space: nowrap;
        }
        .wn-editor-close:hover { background: var(--brand-hover, var(--brand)); }
        .wn-editor-close:active { transform: scale(0.97); }

        @keyframes wn-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wn-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .wn-composer-placeholder-btn:focus-visible,
        .wn-composer-icon-btn:focus-visible,
        .wn-editor-pin-btn:focus-visible,
        .wn-editor-toolbar-btn:focus-visible,
        .wn-editor-close:focus-visible,
        .wn-checklist-toggle:focus-visible,
        .wn-toast-undo:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .wn-composer-bar { max-width: 300px; margin: 12px auto 10px; padding: 9px 15px; }
          .wn-grid-scroll { padding: 0 12px 60px; }
          .wn-section-label { padding: 6px 12px 8px; }
          .wn-editor-overlay { padding: 0; }
          .wn-editor-modal {
            max-width: 100%;
            max-height: 100dvh;
            height: 100dvh;
            border-radius: 0;
          }
        }

        @media (max-width: 480px) {
          .wn-grid-scroll { padding: 0 10px 60px; }
          .wn-grid { column-gap: 8px; }
        }

        @media (max-width: 380px) {
          .wn-editor-header { padding: 16px 16px 4px; padding-top: max(16px, env(safe-area-inset-top)); }
          .wn-editor-title-input { font-size: 16px; }
          .wn-editor-body { padding: 8px 14px 14px; }
          .wn-editor-toolbar { padding: 10px 14px 14px; padding-bottom: max(10px, env(safe-area-inset-bottom)); }
        }
      `}</style>
    </>
  );
}

function ChecklistRow({
  item,
  onToggle,
  onUpdate,
  onDelete,
  onKeyDown,
}: {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, itemId: string, text: string) => void;
}) {
  return (
    <>
      <div className="wn-checklist-row">
        <button
          className={`wn-checklist-check ${item.checked ? "checked" : ""}`}
          onClick={() => onToggle(item.id)}
          role="checkbox"
          aria-checked={item.checked}
          aria-label={item.checked ? "Mark incomplete" : "Mark complete"}
        >
          {item.checked && <CheckIcon />}
        </button>
        <input
          type="text"
          value={item.text}
          onChange={(e) => onUpdate(item.id, e.target.value)}
          onKeyDown={(e) => onKeyDown(e, item.id, item.text)}
          className={`wn-checklist-input ${item.checked ? "checked" : ""}`}
          placeholder="List item"
          maxLength={MAX_CHECKLIST_ITEM_LENGTH}
          data-item-id={item.id}
        />
        <button className="wn-checklist-delete" onClick={() => onDelete(item.id)} aria-label="Delete item">
          <XIcon />
        </button>
      </div>

      <style>{`
        .wn-checklist-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 9px;
          min-height: 40px;
          border-radius: 10px;
          transition: background 0.15s ease;
        }
        .wn-checklist-row:hover { background: var(--bg-surface); }
        .wn-checklist-row:hover .wn-checklist-delete { opacity: 1; }

        .wn-checklist-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid var(--border-faint);
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.15s ease;
          padding: 0;
        }
        .wn-checklist-check:hover:not(.checked) { border-color: var(--text-tertiary); }
        .wn-checklist-check.checked { background: var(--brand); border-color: var(--brand); }
        .wn-checklist-check:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

        .wn-checklist-input {
          flex: 1;
          background: none;
          border: none;
          font-size: 14px;
          font-family: var(--font-sans);
          color: var(--text);
          outline: none;
          padding: 4px 0;
        }
        .wn-checklist-input::placeholder { color: var(--text-disabled); }
        .wn-checklist-input.checked { text-decoration: line-through; color: var(--text-tertiary); }

        .wn-checklist-delete {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: none;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
          padding: 0;
        }
        .wn-checklist-delete:hover { background: rgba(224, 82, 82, 0.15); color: #E05252; }
        .wn-checklist-delete:focus-visible { opacity: 1; outline: 2px solid var(--brand); outline-offset: 2px; }

        @media (hover: none) { .wn-checklist-delete { opacity: 1; } }
      `}</style>
    </>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  openMenuId,
  onMenuToggle,
}: {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  openMenuId: string | null;
  onMenuToggle: (id: string | null) => void;
}) {
  const menuOpen = openMenuId === note.id;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onMenuToggle(null);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMenuToggle(null);
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [menuOpen, onMenuToggle]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMenuToggle(null);
    onDelete(note.id);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMenuToggle(null);
    onTogglePin(note.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEdit(note);
    }
  };

  const isChecklist = note.type === "checklist";
  const items = note.items || [];
  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);
  const visibleItems = uncheckedItems.slice(0, 3);
  const remainingUnchecked = uncheckedItems.length - visibleItems.length;

  const getAriaLabel = () => {
    if (note.title) return `Edit note: ${note.title}`;
    if (isChecklist && items.length > 0) return `Edit note: ${items[0].text}`;
    if (note.content) return `Edit note: ${note.content.substring(0, 50)}`;
    return "Edit note: Untitled";
  };

  return (
    <>
      <div
        className="wnc-card"
        onClick={() => onEdit(note)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={getAriaLabel()}
      >
        <div className="wnc-header">
          <div className="wnc-title-row">
            {note.pinned && (
              <span className="wnc-pin-dot" aria-label="Pinned">
                <PinIcon filled />
              </span>
            )}
            {note.title && <div className="wnc-title">{note.title}</div>}
          </div>

          <div className="wnc-menu-wrap" ref={menuRef}>
            <button
              className="wnc-more-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(menuOpen ? null : note.id);
              }}
              onKeyDown={(e) => e.stopPropagation()}
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <MoreIcon />
            </button>

            {menuOpen && (
              <div className="wnc-menu" role="menu">
                <button className="wnc-menu-item" role="menuitem" onClick={handleTogglePin} onKeyDown={(e) => e.stopPropagation()}>
                  <PinIcon filled={note.pinned} />
                  {note.pinned ? "Unpin note" : "Pin note"}
                </button>
                <button className="wnc-menu-item wnc-menu-item-danger" role="menuitem" onClick={handleDelete} onKeyDown={(e) => e.stopPropagation()}>
                  <TrashIcon />
                  Delete note
                </button>
              </div>
            )}
          </div>
        </div>

        {isChecklist ? (
          <div className="wnc-checklist-preview">
            {visibleItems.map((item) => (
              <div key={item.id} className="wnc-checklist-item">
                <span className="wnc-checklist-box" />
                <span className="wnc-checklist-text">{item.text}</span>
              </div>
            ))}
            {(remainingUnchecked > 0 || checkedItems.length > 0) && (
              <div className="wnc-checklist-more">
                {remainingUnchecked > 0 && `+${remainingUnchecked} more`}
                {remainingUnchecked > 0 && checkedItems.length > 0 && ", "}
                {checkedItems.length > 0 &&
                  `+${checkedItems.length} ticked item${checkedItems.length !== 1 ? "s" : ""}`}
              </div>
            )}
          </div>
        ) : (
          note.content && <div className="wnc-content">{note.content}</div>
        )}

        <div className="wnc-footer">
          <span className="wnc-time">{timeAgo(note.updatedAt)}</span>
        </div>
      </div>

      <style>{`
        .wnc-card {
          display: flex;
          flex-direction: column;
          break-inside: avoid;
          margin-bottom: 12px;
          padding: 12px 13px;
          border: 0.5px solid var(--border);
          border-radius: 14px;
          cursor: pointer;
          background: var(--bg-card);
          transition: box-shadow 0.2s ease, transform 0.2s ease, background 0.2s ease;
        }
        .wnc-card:hover {
          box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
          background: var(--bg-surface);
        }
        .wnc-card:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .wnc-card:active { transform: translateY(0); }
        .wnc-card:hover .wnc-more-btn { opacity: 1; }

        .wnc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: ${note.content || (note.items && note.items.length > 0) ? "8px" : "0"};
        }
        .wnc-title-row { display: flex; align-items: flex-start; gap: 5px; flex: 1; min-width: 0; }
        .wnc-pin-dot { color: var(--brand); flex-shrink: 0; margin-top: 2px; opacity: 0.9; }
        .wnc-title {
          font-size: 13px;
          font-weight: 650;
          color: var(--text);
          line-height: 1.4;
          letter-spacing: -0.1px;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .wnc-menu-wrap { position: relative; flex-shrink: 0; }
        .wnc-more-btn {
          border: none;
          background: none;
          color: var(--text-tertiary);
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease, color 0.15s ease;
          cursor: pointer;
          margin: -2px -2px 0 0;
          opacity: 0;
        }
        .wnc-more-btn:hover { background: rgba(128, 128, 128, 0.14); color: var(--text); }
        .wnc-more-btn:active { transform: scale(0.92); }
        .wnc-more-btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; opacity: 1; }

        .wnc-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 160px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.45);
          padding: 5px;
          z-index: 20;
        }
        .wnc-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          min-height: 40px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 12.5px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: background 0.14s ease, color 0.14s ease;
        }
        .wnc-menu-item:hover { background: var(--bg-surface); color: var(--text); }
        .wnc-menu-item-danger:hover { background: rgba(224, 82, 82, 0.14); color: #E05252; }

        .wnc-content {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 8;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .wnc-checklist-preview { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .wnc-checklist-item { display: flex; align-items: flex-start; gap: 7px; }
        .wnc-checklist-box {
          width: 13px;
          height: 13px;
          min-width: 13px;
          border: 1.5px solid var(--border-faint);
          border-radius: 4px;
          margin-top: 2px;
        }
        .wnc-checklist-text {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        .wnc-checklist-more { font-size: 10.5px; color: var(--text-tertiary); margin-left: 20px; margin-top: 2px; }

        .wnc-footer { margin-top: 9px; padding-top: 8px; border-top: 0.5px solid var(--border); }
        .wnc-time { font-size: 10.5px; color: var(--text-tertiary); }

        @media (hover: none) { .wnc-more-btn { opacity: 1; } }

        @media (max-width: 480px) {
          .wnc-card { padding: 10px 11px; }
          .wnc-title { font-size: 12.5px; }
          .wnc-content, .wnc-checklist-text { font-size: 11.5px; }
        }
      `}</style>
    </>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9a2 2 0 0 1-1.11-1.79V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
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

function SparkleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
    </svg>
  );
}