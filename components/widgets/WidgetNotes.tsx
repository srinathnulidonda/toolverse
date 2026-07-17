// components/widgets/WidgetNotes.tsx
"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Note, ChecklistItem, WidgetVariant, timeAgo, uid } from "./widgetTypes";

interface NotesDraft {
  activeNote: string | null;
  title: string;
  content: string;
  type?: "note" | "checklist";
  items?: ChecklistItem[];
  composerOpen: boolean;
  showCompleted?: boolean;
}

interface WidgetNotesProps {
  variant?: WidgetVariant;
  notes: Note[];
  setNotes: (notes: Note[] | ((prev: Note[]) => Note[])) => void;
  draft: NotesDraft;
  setDraft: (draft: NotesDraft | ((prev: NotesDraft) => NotesDraft)) => void;
  onExpand?: () => void;
}

interface DeletedNote {
  note: Note;
  timestamp: number;
}

const MODAL_DRAG_THRESHOLD = 4;

export default function WidgetNotes({
  variant = "compact",
  notes,
  setNotes,
  draft,
  setDraft,
  onExpand,
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

  const [deletedNote, setDeletedNote] = useState<DeletedNote | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const deleteTimerRef = useRef<NodeJS.Timeout>();
  const toastTimerRef = useRef<NodeJS.Timeout>();
  const modalDragStartRef = useRef({ x: 0, y: 0, modalX: 0, modalY: 0 });
  const hasDraggedModalRef = useRef(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Compute active note data once
  const activeNoteData = useMemo(
    () => (activeNote ? notes.find((n) => n.id === activeNote) : null),
    [activeNote, notes]
  );

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Focus trap and initial focus for editor modal
  useEffect(() => {
    if (!composerOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Reset modal position when opening
    setModalPosition({ x: 0, y: 0 });

    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);

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
      document.removeEventListener("keydown", trapFocus);
      previouslyFocused?.focus();
    };
  }, [composerOpen]);

  // Modal dragging with threshold
  useEffect(() => {
    if (!isDraggingModal) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - modalDragStartRef.current.x;
      const dy = e.clientY - modalDragStartRef.current.y;

      // Check threshold before starting actual drag
      if (!hasDraggedModalRef.current) {
        if (Math.abs(dx) < MODAL_DRAG_THRESHOLD && Math.abs(dy) < MODAL_DRAG_THRESHOLD) {
          return; // Below threshold, don't drag yet
        }
        hasDraggedModalRef.current = true;
      }

      const newX = modalDragStartRef.current.modalX + dx;
      const newY = modalDragStartRef.current.modalY + dy;

      // Proper clamping with measured bounds
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

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dx = touch.clientX - modalDragStartRef.current.x;
      const dy = touch.clientY - modalDragStartRef.current.y;

      if (!hasDraggedModalRef.current) {
        if (Math.abs(dx) < MODAL_DRAG_THRESHOLD && Math.abs(dy) < MODAL_DRAG_THRESHOLD) {
          return;
        }
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

    const handleMouseUp = () => setIsDraggingModal(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDraggingModal]);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const resetEditor = () => {
    setDraft((d) => ({
      ...d,
      activeNote: null,
      title: "",
      content: "",
      type: "note",
      items: [],
      composerOpen: false,
      showCompleted: true,
    }));
  };

  const saveNote = () => {
    const isChecklist = type === "checklist";
    const hasContent =
      title.trim() || (isChecklist ? items.some((i) => i.text.trim()) : content.trim());

    if (!hasContent) {
      resetEditor();
      return;
    }

    if (activeNote) {
      if (!activeNoteData) {
        showToast("This note was deleted elsewhere. Changes cannot be saved.");
        resetEditor();
        return;
      }

      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === activeNote
            ? {
                ...n,
                title: title.trim(),
                content: isChecklist ? "" : content.trim(),
                type: type,
                items: isChecklist ? items.filter((i) => i.text.trim()) : [],
                updatedAt: Date.now(),
              }
            : n
        )
      );
    } else {
      const newNote: Note = {
        id: uid(),
        title: title.trim(),
        content: isChecklist ? "" : content.trim(),
        type: type,
        items: isChecklist ? items.filter((i) => i.text.trim()) : [],
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
    }

    resetEditor();
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    if (!noteToDelete) return;

    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }

    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== id));

    if (activeNote === id) resetEditor();

    setDeletedNote({ note: noteToDelete, timestamp: Date.now() });

    deleteTimerRef.current = setTimeout(() => {
      setDeletedNote(null);
    }, 5000);
  };

  const deleteCurrentNote = () => {
    if (!activeNote) return;
    // Unified: instant delete + undo (no confirm dialog)
    deleteNote(activeNote);
  };

  const undoDelete = () => {
    if (!deletedNote) return;

    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }

    setNotes((prevNotes) => [deletedNote.note, ...prevNotes]);
    setDeletedNote(null);
  };

  const togglePin = (id: string) => {
    setNotes((prevNotes) => prevNotes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const togglePinAndSave = () => {
    if (!activeNote) {
      // For new notes: save first, then pin
      const isChecklist = type === "checklist";
      const hasContent =
        title.trim() || (isChecklist ? items.some((i) => i.text.trim()) : content.trim());

      if (!hasContent) return;

      const newNote: Note = {
        id: uid(),
        title: title.trim(),
        content: isChecklist ? "" : content.trim(),
        type: type,
        items: isChecklist ? items.filter((i) => i.text.trim()) : [],
        pinned: true, // Pin immediately
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      resetEditor();
    } else {
      // For existing notes: just toggle pin
      togglePin(activeNote);
    }
  };

  const toggleNoteType = () => {
    const newType = type === "checklist" ? "note" : "checklist";

    // Check if there's content that would be lost
    const hasNoteContent = content.trim().length > 0;
    const hasChecklistItems = items.some((i) => i.text.trim().length > 0);

    let shouldProceed = true;

    if (newType === "note" && hasChecklistItems) {
      // Converting from checklist to note - offer to preserve content
      const itemTexts = items.filter((i) => i.text.trim()).map((i) => i.text.trim());
      if (itemTexts.length > 0) {
        shouldProceed = window.confirm(
          `Converting to a note will combine your list items into paragraph text. Continue?`
        );
        if (shouldProceed) {
          // Preserve checklist items as paragraph text
          const combinedContent = itemTexts.join("\n");
          setDraft((d) => ({
            ...d,
            type: newType,
            content: combinedContent,
            items: [],
          }));
          return;
        }
      }
    } else if (newType === "checklist" && hasNoteContent) {
      // Converting from note to checklist - offer to preserve content
      shouldProceed = window.confirm(
        `Converting to a checklist will turn your text into the first list item. Continue?`
      );
      if (shouldProceed) {
        // Preserve note content as first checklist item
        const firstItem: ChecklistItem = {
          id: uid(),
          text: content.trim(),
          checked: false,
        };
        setDraft((d) => ({
          ...d,
          type: newType,
          content: "",
          items: [firstItem],
        }));
        return;
      }
    }

    if (shouldProceed) {
      setDraft((d) => ({
        ...d,
        type: newType,
        items: newType === "checklist" ? [] : d.items,
        content: newType === "note" ? d.content : "",
      }));
    }
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
      items: noteType === "checklist" ? [] : d.items,
      content: noteType === "note" ? d.content : "",
    }));
  };

  const toggleItemChecked = (itemId: string) => {
    setDraft((d) => ({
      ...d,
      items: (d.items || []).map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
    }));
  };

  const updateItemText = (itemId: string, text: string) => {
    setDraft((d) => ({
      ...d,
      items: (d.items || []).map((i) => (i.id === itemId ? { ...i, text } : i)),
    }));
  };

  const deleteItem = (itemId: string) => {
    setDraft((d) => ({
      ...d,
      items: (d.items || []).filter((i) => i.id !== itemId),
    }));
  };

  const addItem = (text: string = "", afterId?: string) => {
    const newItem: ChecklistItem = {
      id: uid(),
      text,
      checked: false,
    };

    setDraft((d) => {
      const currentItems = d.items || [];
      if (afterId) {
        const index = currentItems.findIndex((i) => i.id === afterId);
        const newItems = [...currentItems];
        newItems.splice(index + 1, 0, newItem);
        return { ...d, items: newItems };
      }
      return { ...d, items: [...currentItems, newItem] };
    });

    setTimeout(() => {
      (document.querySelector(`[data-item-id="${newItem.id}"]`) as HTMLInputElement)?.focus();
    }, 0);
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, itemId: string, text: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem("", itemId);
    } else if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      const currentItems = items || [];
      const currentIndex = currentItems.findIndex((i) => i.id === itemId);

      if (currentItems.length > 1) {
        deleteItem(itemId);

        // Focus previous item or next if first
        setTimeout(() => {
          const targetIndex = currentIndex > 0 ? currentIndex - 1 : 0;
          if (targetIndex < currentItems.length - 1) {
            // -1 because we just deleted one
            const targetItem = currentItems[targetIndex];
            if (targetItem && targetItem.id !== itemId) {
              (
                document.querySelector(`[data-item-id="${targetItem.id}"]`) as HTMLInputElement
              )?.focus();
            }
          }
        }, 0);
      }
      // If it's the last item, don't delete it - let user escape with Escape instead
    } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      saveNote();
    }
  };

  const handleModalDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Ignore if clicking on input or button
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "BUTTON" || target.closest("button")) {
      return;
    }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setIsDraggingModal(true);
    hasDraggedModalRef.current = false; // Reset
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
        {/* Composer bar */}
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

        {/* Note grid */}
        <div className="wn-body">
          <div className="wn-grid-scroll">
            {notes.length === 0 && (
              <div className="wn-empty">No notes yet — click above to create one</div>
            )}

            {pinned.length > 0 && (
              <>
                <div className="wn-section-label">PINNED</div>
                <div className="wn-grid">
                  {pinned.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={editNote}
                      onDelete={deleteNote}
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
                {pinned.length > 0 && <div className="wn-section-label">OTHERS</div>}
                <div className="wn-grid">
                  {others.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={editNote}
                      onDelete={deleteNote}
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

        {/* Delete undo toast */}
        {deletedNote && (
          <div className="wn-toast">
            <span className="wn-toast-text">Note deleted</span>
            <button className="wn-toast-undo" onClick={undoDelete}>
              Undo
            </button>
          </div>
        )}

        {/* Custom toast for messages */}
        {toastMessage && (
          <div className="wn-toast">
            <span className="wn-toast-text">{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Editor modal */}
      {composerOpen && (
        <div
          className="wn-editor-overlay"
          onClick={(e) => {
            // Restore overlay click-to-close
            if (e.target === e.currentTarget) {
              saveNote();
            }
          }}
        >
          <div
            ref={modalRef}
            className="wn-editor-modal"
            style={{
              transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
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
                maxLength={100}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking input
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    saveNote();
                  }
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    saveNote();
                  }
                }}
              />
              <button
                className="wn-editor-pin-btn"
                onClick={togglePinAndSave}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking pin
                title={
                  activeNote ? (activeNoteData?.pinned ? "Unpin note" : "Pin note") : "Pin note"
                }
                aria-label={
                  activeNote ? (activeNoteData?.pinned ? "Unpin note" : "Pin note") : "Pin note"
                }
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
                  maxLength={5000}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      saveNote();
                    }
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      saveNote();
                    }
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
              <button className="wn-editor-close" onClick={saveNote}>
                Close
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
          padding: 9px 16px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .wn-composer-bar:hover {
          background: var(--bg-card);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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
        .wn-composer-placeholder-btn:hover {
          color: var(--text-secondary);
        }
        .wn-composer-placeholder-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
          border-radius: 4px;
        }
        .wn-composer-icons {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .wn-composer-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: none;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .wn-composer-icon-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }

        .wn-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
          min-height: 0;
        }
        .wn-body::-webkit-scrollbar {
          width: 4px;
        }
        .wn-body::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 2px;
        }

        .wn-empty {
          text-align: center;
          padding: ${isFull ? "56px 16px" : "32px 16px"};
          font-size: 12.5px;
          color: var(--text-disabled);
        }

        .wn-section-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding: 4px ${isFull ? 22 : 14}px 10px;
        }

        .wn-grid-scroll {
          flex: 1;
          padding: 0 ${isFull ? 22 : 14}px 60px;
          container-type: inline-size;
        }
        
        .wn-grid {
          column-count: 1;
          column-gap: 8px;
        }
        
        @container (min-width: 220px) {
          .wn-grid {
            column-count: 2;
          }
        }
        
        @container (min-width: 600px) {
          .wn-grid {
            column-count: 3;
          }
        }
        
        @container (min-width: 860px) {
          .wn-grid {
            column-count: 4;
          }
        }

        .wn-toast {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          animation: wn-toast-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 100;
        }
        .wn-toast-text {
          font-size: 13px;
          color: var(--text);
        }
        .wn-toast-undo {
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--brand);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .wn-toast-undo:hover {
          opacity: 0.8;
          background: rgba(76, 175, 130, 0.1);
        }
        .wn-toast-undo:active {
          transform: scale(0.97);
        }

        @keyframes wn-toast-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          max-height: min(680px, calc(100vh - 40px));
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          animation: wn-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .wn-editor-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 16px 0;
          cursor: grab;
          flex-shrink: 0;
        }
        .wn-editor-header:active {
          cursor: grabbing;
        }
        .wn-editor-title-input {
          flex: 1;
          background: none;
          border: none;
          font-size: 16px;
          font-weight: 600;
          font-family: var(--font-sans);
          color: var(--text);
          padding: 8px 0;
          outline: none;
          cursor: text;
        }
        .wn-editor-title-input::placeholder {
          color: var(--text-disabled);
          font-weight: 500;
        }
        .wn-editor-pin-btn {
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
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .wn-editor-pin-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }

        .wn-editor-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px 16px 16px;
          min-height: 120px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .wn-editor-body::-webkit-scrollbar {
          width: 6px;
        }
        .wn-editor-body::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }
        .wn-editor-content-input {
          width: 100%;
          min-height: 120px;
          background: none;
          border: none;
          font-size: 14px;
          font-family: var(--font-sans);
          color: var(--text);
          outline: none;
          resize: none;
          line-height: 1.6;
        }
        .wn-editor-content-input::placeholder {
          color: var(--text-disabled);
        }

        .wn-checklist {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .wn-checklist-add {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 8px;
          color: var(--text-tertiary);
          font-size: 14px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .wn-checklist-add:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
        }

        .wn-checklist-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 8px;
          margin-top: 8px;
          border: none;
          background: none;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .wn-checklist-toggle:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
        }

        .wn-editor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          border-top: 0.5px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }
        .wn-editor-toolbar-icons {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .wn-editor-toolbar-btn {
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
          transition: all 0.15s;
        }
        .wn-editor-toolbar-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }
        .wn-editor-delete:hover {
          background: rgba(224, 82, 82, 0.12);
          color: #E05252;
        }
        .wn-editor-close {
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 6px 16px;
          border-radius: 6px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .wn-editor-close:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text);
        }

        @keyframes wn-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wn-slide-up {
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
          .wn-composer-bar {
            max-width: 300px;
            margin: 12px auto 10px;
            padding: 8px 14px;
          }
          .wn-grid-scroll {
            padding: 0 12px 60px;
          }
          .wn-section-label {
            padding: 4px 12px 8px;
          }
          .wn-editor-overlay {
            padding: 12px;
          }
          .wn-editor-modal {
            max-width: 100%;
            max-height: calc(100vh - 24px);
            border-radius: 10px;
          }
        }

        @media (max-width: 480px) {
          .wn-grid-scroll {
            padding: 0 10px 60px;
          }
          .wn-grid {
            column-gap: 8px;
          }
          .wnc-card {
            padding: 8px 10px;
          }
          .wnc-title {
            font-size: 12.5px;
          }
          .wnc-content,
          .wnc-checklist-text {
            font-size: 11.5px;
          }
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        className="wn-checklist-row"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          className={`wn-checklist-check ${item.checked ? "checked" : ""}`}
          onClick={() => onToggle(item.id)}
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
          data-item-id={item.id}
        />
        <button
          className={`wn-checklist-delete ${isHovered ? "visible" : ""}`}
          onClick={() => onDelete(item.id)}
          aria-label="Delete item"
        >
          ×
        </button>
      </div>

      <style>{`
        .wn-checklist-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .wn-checklist-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .wn-checklist-check {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.15s;
          padding: 0;
        }
        .wn-checklist-check:hover:not(.checked) {
          border-color: var(--text-tertiary);
        }
        .wn-checklist-check.checked {
          background: var(--text-tertiary);
          border-color: var(--text-tertiary);
        }

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
        .wn-checklist-input::placeholder {
          color: var(--text-disabled);
        }
        .wn-checklist-input.checked {
          text-decoration: line-through;
          color: var(--text-tertiary);
        }

        .wn-checklist-delete {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: none;
          color: var(--text-tertiary);
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          opacity: 0;
          transition: all 0.15s;
          padding: 0;
        }
        .wn-checklist-delete.visible {
          opacity: 1;
        }
        .wn-checklist-delete:hover {
          background: rgba(224, 82, 82, 0.15);
          color: #E05252;
        }

        @media (hover: none) {
          .wn-checklist-delete {
            opacity: 1;
          }
        }
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

  // Close menu on outside click - fixed scrim bug
  useEffect(() => {
    if (!menuOpen) return;

    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onMenuToggle(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
              aria-label="More options"
              aria-expanded={menuOpen}
            >
              <MoreIcon />
            </button>

            {menuOpen && (
              <div className="wnc-menu" role="menu">
                <button className="wnc-menu-item" role="menuitem" onClick={handleTogglePin}>
                  <PinIcon filled={note.pinned} />
                  {note.pinned ? "Unpin note" : "Pin note"}
                </button>
                <button
                  className="wnc-menu-item wnc-menu-item-danger"
                  role="menuitem"
                  onClick={handleDelete}
                >
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
      </div>

      <style>{`
        .wnc-card {
          display: flex;
          flex-direction: column;
          break-inside: avoid;
          margin-bottom: 12px;
          padding: 10px 12px;
          border: 0.5px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: var(--bg-card);
        }
        .wnc-card:hover,
        .wnc-card:focus-visible {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
          outline: none;
        }
        .wnc-card:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
        .wnc-card:active {
          transform: translateY(-1px);
        }
        .wnc-card:hover .wnc-more-btn { opacity: 1; }

        .wnc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: ${note.content || (note.items && note.items.length > 0) ? "8px" : "0"};
        }
        .wnc-title-row {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          flex: 1;
          min-width: 0;
        }
        .wnc-pin-dot {
          color: var(--text-tertiary);
          flex-shrink: 0;
          margin-top: 2px;
          opacity: 0.8;
        }
        .wnc-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.4;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .wnc-menu-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .wnc-more-btn {
          border: none;
          background: none;
          color: var(--text-tertiary);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          cursor: pointer;
          margin: -2px -2px 0 0;
          opacity: 0;
        }
        .wnc-more-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text);
        }
        .wnc-more-btn:active {
          transform: scale(0.95);
        }
        .wnc-more-btn:focus-visible {
          outline: 2px solid var(--brand);
          opacity: 1;
        }

        .wnc-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          min-width: 150px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          padding: 4px;
          z-index: 20;
        }
        .wnc-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 12.5px;
          font-family: var(--font-sans);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.12s;
          text-align: left;
        }
        .wnc-menu-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text);
        }
        .wnc-menu-item-danger:hover {
          background: rgba(224, 82, 82, 0.12);
          color: #E05252;
        }

        .wnc-content {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 8;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .wnc-checklist-preview {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }
        .wnc-checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 7px;
        }
        .wnc-checklist-box {
          width: 13px;
          height: 13px;
          min-width: 13px;
          border: 1.5px solid var(--border);
          border-radius: 3px;
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
        .wnc-checklist-more {
          font-size: 10.5px;
          color: var(--text-tertiary);
          margin-left: 20px;
          margin-top: 2px;
        }

        @media (hover: none) {
          .wnc-more-btn {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

// Icons
function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function PinIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0-4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

function ChecklistIcon() {
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
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function NoteIcon() {
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
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
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
