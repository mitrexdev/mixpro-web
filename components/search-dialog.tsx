"use client";
import { artwork as responsiveArtwork } from "@/lib/artwork";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Film,
  Search,
  X,
  RefreshCw,
} from "lucide-react";
type Result = {
  id: string;
  title: string;
  poster_url: string;
  release_year: number | null;
  genre: string;
};
export default function SearchDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const resultLinks = useRef<(HTMLAnchorElement | null)[]>([]);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const router = useRouter();
  const close = useCallback(() => dialog.current?.close(), []);
  const show = useCallback(() => {
    if (dialog.current?.open) {
      dialog.current.close();
      return;
    }
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setQuery("");
    setResults([]);
    setError("");
    setLoading(true);
    setOpen(true);
    dialog.current?.showModal();
    input.current?.focus();
  }, []);
  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !event.altKey &&
        !event.repeat
      ) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", shortcut);
    window.addEventListener("mixpro:search", show);
    return () => {
      window.removeEventListener("keydown", shortcut);
      window.removeEventListener("mixpro:search", show);
    };
  }, [show]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setResults([]);
    const timer = setTimeout(
      async () => {
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(query.trim())}`,
            { signal: controller.signal, cache: "no-store" },
          );
          const body = await response.json();
          if (!response.ok)
            throw Error(
              body.error || "Search is unavailable. Please try again.",
            );
          if (!controller.signal.aborted) {
            setResults(body.results);
            setTotal(body.total);
            setLoading(false);
          }
        } catch (cause) {
          if (!controller.signal.aborted) {
            setError(
              cause instanceof Error ? cause.message : "Search is unavailable.",
            );
            setLoading(false);
          }
        }
      },
      query.trim() ? 220 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, retry]);
  function navigateResults(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (!results.length || loading) return;
    const index = resultLinks.current.findIndex(
      (link) => link === document.activeElement,
    );
    if (index < 0 && document.activeElement !== input.current) return;
    event.preventDefault();
    const next =
      event.key === "ArrowDown"
        ? (index + 1) % results.length
        : index <= 0
          ? results.length - 1
          : index - 1;
    resultLinks.current[next]?.focus();
  }
  return (
    <dialog
      ref={dialog}
      className="search-dialog"
      aria-labelledby="search-dialog-title"
      aria-describedby="search-dialog-description"
      onKeyDown={navigateResults}
      onClose={() => {
        setOpen(false);
        opener.current?.focus();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) {
          const box = dialog.current.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            close();
        }
      }}
    >
      <div className="search-dialog-heading">
        <div>
          <span>Find your next watch</span>
          <h2 id="search-dialog-title">Search the collection</h2>
        </div>
        <button
          type="button"
          className="search-close"
          onClick={close}
          aria-label="Close search"
        >
          <X size={19} />
        </button>
      </div>
      <p id="search-dialog-description" className="sr-only">
        Search series by title, genre or cast. Use arrow keys to navigate
        results and Escape to close.
      </p>
      <form
        className="dialog-search-field"
        onSubmit={(event) => {
          event.preventDefault();
          close();
          router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <Search size={21} />
        <input
          ref={input}
          type="search"
          aria-label="Search series"
          placeholder="Search titles, genres or cast…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLoading(true);
            setResults([]);
          }}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
          >
            <X size={15} />
          </button>
        )}
        <kbd>↵</kbd>
      </form>
      <div className="dialog-result-label">
        <span>{query.trim() ? "Search results" : "Recently added"}</span>
        <span aria-live="polite">
          {loading
            ? "Searching…"
            : error
              ? "Search unavailable"
              : `${total} series`}
        </span>
      </div>
      <div className="dialog-results" aria-busy={loading}>
        {loading ? (
          <div
            className="search-result-skeleton"
            role="status"
            aria-label="Searching collection"
          >
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <span className="skeleton" />
                <div>
                  <span className="skeleton" />
                  <span className="skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="search-dialog-empty">
            <Film size={28} strokeWidth={1} />
            <h3>Search couldn’t load.</h3>
            <p>{error}</p>
            <button
              className="text-link"
              onClick={() => setRetry((value) => value + 1)}
            >
              <RefreshCw size={13} />
              Try again
            </button>
          </div>
        ) : results.length ? (
          results.map((item, i) => (
            <Link
              key={item.id}
              ref={(element) => {
                resultLinks.current[i] = element;
              }}
              className="dialog-result"
              href={`/series/${item.id}`}
              onClick={close}
            >
              <div className="dialog-result-art">
                {item.poster_url ? (
                  <img
                    {...responsiveArtwork(item.poster_url, "poster", "40px")}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <Film size={20} />
                )}
              </div>
              <div className="dialog-result-copy">
                <h3>{item.title}</h3>
                <p>
                  {[
                    item.release_year,
                    item.genre.split(",").slice(0, 2).join(" / "),
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Series"}
                </p>
              </div>
              <ArrowUpRight size={17} />
            </Link>
          ))
        ) : (
          <div className="search-dialog-empty">
            <Search size={28} strokeWidth={1} />
            <h3>
              {query.trim()
                ? "No series found."
                : "The collection is on its way."}
            </h3>
            <p>
              {query.trim()
                ? "Try a different title, genre or cast member."
                : "Published series will appear here."}
            </p>
          </div>
        )}
      </div>
      <div className="search-dialog-footer">
        <span>
          <ArrowUp size={12} />
          <ArrowDown size={12} /> Navigate <kbd>esc</kbd> Close
        </span>
        <Link
          href={
            query.trim()
              ? `/browse?q=${encodeURIComponent(query.trim())}`
              : "/browse"
          }
          onClick={close}
        >
          View {query.trim() ? "all results" : "collection"}
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </dialog>
  );
}
