// app/error.tsx
"use client";
import { logger } from "@/lib/logger";

import { useEffect } from "react";

export const metadata = {
  title: "Something went wrong – Toolverse",
  description: "We encountered an unexpected error. Please try again.",
};

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error("ErrorBoundary caught:", error);
  }, [error]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Something went wrong.</h2>
      <p>{error.message}</p>
      <button onClick={reset} style={{ marginTop: "1.5rem", padding: "0.5rem 1rem" }}>
        Try again
      </button>
    </div>
  );
}
