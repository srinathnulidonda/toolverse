// lib/useNotes.ts
"use client";

import { useCallback, useMemo } from "react";
import useLocalStorage from "@/lib/useLocalStorage";
import {
  Note,
  ChecklistItem,
  NOTES_STORAGE_KEY,
  MAX_STORED_NOTES,
  cleanNotes,
  uid,
} from "@/components/widgets/widgetTypes";

export interface SaveNoteInput {
  id?: string | null;
  title: string;
  content: string;
  type: "note" | "checklist";
  items: ChecklistItem[];
  pinned?: boolean;
}

export interface UseNotesResult {
  notes: Note[];
  saveNote: (input: SaveNoteInput) => string | null;
  deleteNote: (id: string) => Note | null;
  restoreNote: (note: Note) => void;
  togglePin: (id: string) => void;
}

export function useNotes(): UseNotesResult {
  const [rawNotes, setRawNotes] = useLocalStorage<Note[]>(NOTES_STORAGE_KEY, []);

  const notes = useMemo(() => cleanNotes(rawNotes), [rawNotes]);

  const saveNote = useCallback(
    (input: SaveNoteInput): string | null => {
      const isChecklist = input.type === "checklist";
      const hasContent =
        input.title.trim() ||
        (isChecklist ? input.items.some((i) => i.text.trim()) : input.content.trim());

      if (!hasContent) return null;

      const resultId = input.id ?? uid();

      setRawNotes((prev) => {
        const cleaned = cleanNotes(prev);

        if (input.id) {
          const exists = cleaned.some((n) => n.id === input.id);
          if (!exists) return cleaned;
          return cleaned.map((n) =>
            n.id === input.id
              ? {
                  ...n,
                  title: input.title.trim(),
                  content: isChecklist ? "" : input.content.trim(),
                  type: input.type,
                  items: isChecklist ? input.items.filter((i) => i.text.trim()) : [],
                  updatedAt: Date.now(),
                }
              : n
          );
        }

        const newNote: Note = {
          id: resultId,
          title: input.title.trim(),
          content: isChecklist ? "" : input.content.trim(),
          type: input.type,
          items: isChecklist ? input.items.filter((i) => i.text.trim()) : [],
          pinned: input.pinned ?? false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        return [newNote, ...cleaned].slice(0, MAX_STORED_NOTES);
      });

      return resultId;
    },
    [setRawNotes]
  );

  const deleteNote = useCallback(
    (id: string) => {
      const removed = notes.find((n) => n.id === id) ?? null;
      setRawNotes((prev) => cleanNotes(prev).filter((n) => n.id !== id));
      return removed;
    },
    [notes, setRawNotes]
  );

  const restoreNote = useCallback(
    (note: Note) => {
      setRawNotes((prev) => {
        const cleaned = cleanNotes(prev);
        if (cleaned.some((n) => n.id === note.id)) return cleaned;
        return [note, ...cleaned].slice(0, MAX_STORED_NOTES);
      });
    },
    [setRawNotes]
  );

  const togglePin = useCallback(
    (id: string) => {
      setRawNotes((prev) =>
        cleanNotes(prev).map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
      );
    },
    [setRawNotes]
  );

  return { notes, saveNote, deleteNote, restoreNote, togglePin };
}