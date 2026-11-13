"use client";
import { useRef, useState } from "react";
import { Check, Film, Search, Send, X } from "lucide-react";
import type { RequestTitle } from "@/lib/request-search";
export default function RequestDialog() {
  const nameInput = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [selected, setSelected] = useState<RequestTitle | null>(null);
  const [results, setResults] = useState<RequestTitle[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function search() {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setSearching(true);
    setError("");
    setSelected(null);
    setResults([]);
    try {
      const response = await fetch(
        `/api/requests/search?q=${encodeURIComponent(query.trim())}`,
        { signal: controller.signal },
      );
      const body = await response.json();
      if (!response.ok) throw Error(body.error);
      setResults(body.results);
      setSearched(true);
    } catch (error) {
      if (!controller.signal.aborted) setError((error as Error).message);
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className="nav-request-button"
        aria-haspopup="dialog"
        onClick={() => {
          setError("");
          setSuccess(false);
          setSelected(null);
          setQuery("");
          setManualTitle("");
          setResults([]);
          setSearched(false);
          setSearching(false);
          setManual(false);
          dialog.current?.showModal();
          nameInput.current?.focus();
        }}
      >
        Request
      </button>
      <dialog
        ref={dialog}
        className="request-dialog"
        aria-labelledby="request-title"
        onCancel={(event) => {
          if (sending) event.preventDefault();
        }}
        onClose={() => abort.current?.abort()}
      >
        <div className="request-heading">
          <div>
            <span>The next addition</span>
            <h2 id="request-title">Request a title</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            disabled={sending}
            aria-label="Close request"
            onClick={() => dialog.current?.close()}
          >
            <X size={19} />
          </button>
        </div>
        {success ? (
          <div className="request-success" role="status">
            <Check size={30} />
            <h3>Request sent.</h3>
            <p>Your suggestion is now in the admin’s request inbox.</p>
            <button className="button" onClick={() => dialog.current?.close()}>
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="request-intro">
              Tell us what you’d like to watch next.
            </p>
            <label className="request-name">
              Your name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                maxLength={60}
                disabled={sending}
                autoComplete="name"
              />
            </label>
            <div className="request-mode">
              <button
                type="button"
                aria-pressed={!manual}
                onClick={() => {
                  setManual(false);
                  setError("");
                }}
              >
                Search TVmaze
              </button>
              <button
                type="button"
                aria-pressed={manual}
                onClick={() => {
                  abort.current?.abort();
                  setSearching(false);
                  setManual(true);
                  setError("");
                }}
              >
                Enter manually
              </button>
            </div>
            {manual ? (
              <label className="request-name">
                Movie or series title
                <input
                  placeholder="Enter the full title"
                  value={manualTitle}
                  maxLength={200}
                  onChange={(event) => setManualTitle(event.target.value)}
                  disabled={sending}
                />
              </label>
            ) : (
              <>
                <form
                  className="request-search"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void search();
                  }}
                >
                  <label className="sr-only" htmlFor="request-search">
                    Search TVmaze titles
                  </label>
                  <input
                    id="request-search"
                    placeholder="Search series or anime…"
                    value={query}
                    minLength={2}
                    maxLength={120}
                    required
                    disabled={sending}
                    onChange={(event) => {
                      abort.current?.abort();
                      setSearching(false);
                      setQuery(event.target.value);
                      setSelected(null);
                      setResults([]);
                      setSearched(false);
                    }}
                  />
                  <button
                    className="button"
                    disabled={searching || sending || query.trim().length < 2}
                  >
                    <Search size={15} />
                    {searching ? "Searching…" : "Search"}
                  </button>
                </form>
                <div className="request-results" aria-busy={searching}>
                  {searching ? (
                    <div className="request-search-loading" role="status">
                      Searching TVmaze…
                    </div>
                  ) : (
                    results.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={selected?.id === item.id ? "selected" : ""}
                        aria-pressed={selected?.id === item.id}
                        disabled={sending}
                        onClick={() => setSelected(item)}
                      >
                        <span className="request-result-art">
                          {item.poster ? (
                            <img src={item.poster} alt="" loading="lazy" />
                          ) : (
                            <Film size={19} />
                          )}
                        </span>
                        <span className="request-result-copy">
                          <strong>{item.title}</strong>
                          <span>
                            {[item.year, item.language]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        {selected?.id === item.id && <Check size={17} />}
                      </button>
                    ))
                  )}
                  {searched && !searching && !results.length && (
                    <p>
                      No match found. Try another title or enter it manually.
                    </p>
                  )}
                </div>
                <p className="request-attribution">
                  TV/anime search by{" "}
                  <a
                    href="https://www.tvmaze.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    TVmaze
                  </a>
                  . For a movie not listed, use manual entry.
                </p>
              </>
            )}
            {error && (
              <p className="request-error" role="alert">
                {error}
              </p>
            )}
            <div className="request-actions">
              <button
                className="button button-outline"
                disabled={sending}
                onClick={() => dialog.current?.close()}
              >
                Cancel
              </button>
              <button
                className="button"
                disabled={
                  sending ||
                  searching ||
                  !name.trim() ||
                  (!manual && !selected) ||
                  (manual && !manualTitle.trim())
                }
                onClick={async () => {
                  setSending(true);
                  setError("");
                  try {
                    const response = await fetch("/api/requests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name,
                        ...(manual
                          ? { title: manualTitle }
                          : { tvmazeId: selected?.id }),
                      }),
                    });
                    const body = await response.json();
                    if (!response.ok) throw Error(body.error);
                    setSuccess(true);
                  } catch (error) {
                    setError((error as Error).message);
                  } finally {
                    setSending(false);
                  }
                }}
              >
                <Send size={14} />
                {sending ? "Sending…" : "Send request"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
