"use client";
import { Search } from "lucide-react";
export default function SearchTrigger({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      className={
        compact ? "icon-button search-link" : "collection-search-trigger"
      }
      aria-label="Search series"
      aria-haspopup="dialog"
      onClick={() => window.dispatchEvent(new Event("mixpro:search"))}
    >
      <Search size={18} />
      {!compact && (
        <>
          <span>Search series</span>
          <kbd>Ctrl K</kbd>
        </>
      )}
    </button>
  );
}
