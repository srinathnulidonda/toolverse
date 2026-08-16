// components/shared/HistoryList.tsx
import { useState, useId, ReactNode } from "react";
import Button from "@/components/ui/Button";

export type HistoryItem = {
  id: string;
  timestamp: number;
};

export type HistoryListProps<T extends HistoryItem> = {
  history: T[];
  onUse: (item: T) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  /** Optional custom renderer for the item content (replaces the default JSON string) */
  renderItemContent?: (item: T) => ReactNode;
};

export default function HistoryList<T extends HistoryItem>({
  history,
  onUse,
  onDelete,
  onClear,
  renderItemContent,
}: HistoryListProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const id = useId();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="space-y-2">
      {history.length === 0 ? (
        <p className="text-muted-foreground">No history yet</p>
      ) : (
        <>
          <ul className="space-y-1">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-start px-2 py-1.5 bg-muted rounded"
              >
                <span className="break-all max-w-[200px]">
                  {/* Render a meaningful string – adjust as needed for each feature */}
                  {renderItemContent ? renderItemContent(item) : JSON.stringify(item)}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onUse(item)}
                    aria-label="Use this item"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    aria-label="Delete this item"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Button
            onClick={onClear}
            aria-label="Clear history"
          >
            Clear History
          </Button>
        </>
      )}
    </div>
  );
}