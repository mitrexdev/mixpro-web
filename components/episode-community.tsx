"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  MessageCircle,
  Trash2,
  Check,
  Copy,
  X,
} from "lucide-react";
type Comment = {
  id: string;
  display_name: string;
  body: string;
  created_at: string;
  own: boolean;
};
type Community = {
  likes: number;
  dislikes: number;
  reaction: "like" | "dislike" | null;
  total: number;
  comments: Comment[];
};
export default function EpisodeCommunity({
  episodeId,
  title,
}: {
  episodeId: string;
  title: string;
}) {
  const [data, setData] = useState<Community | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<Comment | null>(null);
  const confirm = useRef<HTMLDialogElement>(null);
  const shareDialog = useRef<HTMLDialogElement>(null);
  const [shareUrl, setShareUrl] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const endpoint = `/api/episodes/${episodeId}/community`;
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const response = await fetch(endpoint, { cache: "no-store", signal });
      const next = await response.json();
      if (!response.ok) throw Error(next.error);
      setData(next);
    },
    [endpoint],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).catch((error) => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [load]);
  useEffect(() => {
    if (deleting) confirm.current?.showModal();
    else confirm.current?.close();
  }, [deleting]);
  async function mutate(payload: unknown) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const next = await response.json();
      if (!response.ok) throw Error(next.error);
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function react(reaction: "like" | "dislike") {
    if (!data) return;
    const next = data.reaction === reaction ? null : reaction;
    const previous = data.reaction;
    if (await mutate({ action: "react", reaction: next })) {
      setData((current) =>
        current
          ? {
              ...current,
              reaction: next,
              likes:
                current.likes -
                (previous === "like" ? 1 : 0) +
                (next === "like" ? 1 : 0),
              dislikes:
                current.dislikes -
                (previous === "dislike" ? 1 : 0) +
                (next === "dislike" ? 1 : 0),
            }
          : current,
      );
    }
  }
  async function share() {
    const url = new URL(`/watch/${episodeId}`, window.location.origin).href;
    setShareUrl(url);
    setCopied(false);
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Episode link copied.");
    } catch {
      shareDialog.current?.showModal();
    }
  }
  async function more() {
    if (!data) return;
    setLoadingMore(true);
    setError("");
    try {
      const response = await fetch(
        `${endpoint}?offset=${data.comments.length}`,
        { cache: "no-store" },
      );
      const next: Community & { error?: string } = await response.json();
      if (!response.ok) throw Error(next.error);
      setData((current) =>
        current
          ? {
              ...current,
              total: next.total,
              comments: [
                ...current.comments,
                ...next.comments.filter(
                  (comment) =>
                    !current.comments.some(
                      (existing) => existing.id === comment.id,
                    ),
                ),
              ],
            }
          : next,
      );
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }
  return (
    <section
      className="episode-community"
      aria-label="Episode reactions and comments"
    >
      <div className="episode-social-bar">
        <div className="reaction-group">
          <button
            disabled={!data || busy}
            aria-label="Like episode"
            aria-pressed={data?.reaction === "like"}
            onClick={() => void react("like")}
          >
            <ThumbsUp size={16} />
            <span>{data ? data.likes : "Like"}</span>
          </button>
          <span />
          <button
            disabled={!data || busy}
            aria-label="Dislike episode"
            aria-pressed={data?.reaction === "dislike"}
            onClick={() => void react("dislike")}
          >
            <ThumbsDown size={16} />
            <span>{data ? data.dislikes : "Dislike"}</span>
          </button>
        </div>
        <button
          className="social-button"
          onClick={() => {
            document.getElementById("episode-comments")?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            });
            textarea.current?.focus({ preventScroll: true });
          }}
        >
          <MessageCircle size={16} />
          <span>Comments{data ? ` (${data.total})` : ""}</span>
        </button>
        <button className="social-button" onClick={() => void share()}>
          <Share2 size={16} />
          Share
        </button>
      </div>
      {notice && (
        <p className="community-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="community-error" role="alert">
          {error}
          {!data && (
            <button
              onClick={() => {
                setError("");
                void load().catch((error) => setError(error.message));
              }}
            >
              Retry
            </button>
          )}
        </p>
      )}
      <div id="episode-comments" className="community-comments">
        <div className="community-heading">
          <h2>Comments</h2>
          <span>
            {data
              ? `${data.total} ${data.total === 1 ? "comment" : "comments"}`
              : "Loading comments…"}
          </span>
        </div>
        <form
          className="comment-compose"
          onSubmit={async (event) => {
            event.preventDefault();
            setNotice("");
            if (await mutate({ action: "comment", name, body })) {
              setBody("");
              setNotice("Comment posted.");
              void load().catch((error) => setError(error.message));
            }
          }}
        >
          <div className="comment-avatar" aria-hidden="true">
            {name.trim().slice(0, 1).toUpperCase() || "G"}
          </div>
          <fieldset disabled={busy || !data}>
            <label className="sr-only" htmlFor="comment-name">
              Your display name
            </label>
            <input
              id="comment-name"
              placeholder="Your name"
              required
              maxLength={60}
              autoComplete="nickname"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <label className="sr-only" htmlFor="comment-body">
              Your comment
            </label>
            <textarea
              id="comment-body"
              ref={textarea}
              placeholder="What did you think of this episode?"
              required
              maxLength={2000}
              rows={2}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
            <div className="comment-compose-footer">
              <span>Posting as a guest · {body.length}/2000</span>
              <button
                className="button"
                disabled={!name.trim() || !body.trim() || busy}
              >
                {busy ? "Saving…" : "Post comment"}
              </button>
            </div>
          </fieldset>
        </form>
        {!data ? (
          <div
            className="community-loading"
            aria-label="Loading comments"
            role="status"
          >
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        ) : data.comments.length ? (
          <div className="comment-list">
            {data.comments.map((comment) => (
              <article className="comment-item" key={comment.id}>
                <div className="comment-avatar" aria-hidden="true">
                  {comment.display_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="comment-copy">
                  <div className="comment-meta">
                    <h3>{comment.display_name}</h3>
                    {comment.own && <span>You</span>}
                    <time dateTime={comment.created_at}>
                      {new Date(comment.created_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </time>
                  </div>
                  <p>{comment.body}</p>
                </div>
                {comment.own && (
                  <button
                    className="comment-delete"
                    aria-label="Delete your comment"
                    disabled={busy}
                    onClick={() => setDeleting(comment)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="comments-empty">
            <MessageCircle size={24} strokeWidth={1} />
            <h3>Start the conversation.</h3>
            <p>Be the first to share a thought about this episode.</p>
          </div>
        )}
        {data && data.comments.length < data.total && (
          <button
            className="button button-outline comments-more"
            disabled={loadingMore}
            onClick={() => void more()}
          >
            {loadingMore ? "Loading…" : "Load more comments"}
          </button>
        )}
      </div>
      <dialog
        ref={confirm}
        className="community-dialog"
        aria-labelledby="delete-comment-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
          else setDeleting(null);
        }}
      >
        <h2 id="delete-comment-title">Delete your comment?</h2>
        <p>This comment will be permanently removed.</p>
        {error && (
          <p role="alert" className="community-error">
            {error}
          </p>
        )}
        <div>
          <button
            className="button button-outline"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Cancel
          </button>
          <button
            className="button"
            disabled={busy}
            onClick={async () => {
              if (!deleting) return;
              if (
                await mutate({
                  action: "delete_comment",
                  commentId: deleting.id,
                })
              ) {
                setData((current) =>
                  current
                    ? {
                        ...current,
                        total: Math.max(0, current.total - 1),
                        comments: current.comments.filter(
                          (comment) => comment.id !== deleting.id,
                        ),
                      }
                    : current,
                );
                setDeleting(null);
                setNotice("Comment deleted.");
              }
            }}
          >
            {busy ? "Deleting…" : "Delete comment"}
          </button>
        </div>
      </dialog>
      <dialog
        ref={shareDialog}
        className="community-dialog"
        aria-labelledby="share-episode-title"
      >
        <div className="share-heading">
          <h2 id="share-episode-title">Share this episode</h2>
          <button
            className="icon-button"
            aria-label="Close share"
            onClick={() => shareDialog.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <p>Copy this link and share it with someone.</p>
        <input
          readOnly
          value={shareUrl}
          aria-label="Episode link"
          onFocus={(event) => event.target.select()}
        />
        <button
          className="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
            } catch {
              setNotice("Select the link and copy it manually.");
            }
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </dialog>
    </section>
  );
}
