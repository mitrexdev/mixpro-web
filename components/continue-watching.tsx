"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, X, Film } from "lucide-react";
import {
  readProgress,
  removeProgress,
  WATCH_PROGRESS_EVENT,
  WATCH_PROGRESS_KEY,
  type WatchProgress,
} from "@/lib/watch-progress";
import { artwork } from "@/lib/artwork";
type Episode = {
  id: string;
  title: string;
  number: number;
  thumbnail: string;
  seriesTitle: string;
  seasonNumber: number;
};
function time(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)}h ` : ""}${minutes % 60}m`;
}
export default function ContinueWatching() {
  const [progress, setProgress] = useState<WatchProgress[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const sync = () => setProgress(readProgress());
    const storage = (event: StorageEvent) => {
      if (event.key === WATCH_PROGRESS_KEY || event.key === null) sync();
    };
    sync();
    window.addEventListener(WATCH_PROGRESS_EVENT, sync);
    window.addEventListener("storage", storage);
    window.addEventListener("pageshow", sync);
    return () => {
      window.removeEventListener(WATCH_PROGRESS_EVENT, sync);
      window.removeEventListener("storage", storage);
      window.removeEventListener("pageshow", sync);
    };
  }, []);
  const ids = progress.map((item) => item.id).join(",");
  useEffect(() => {
    if (!ids) {
      setEpisodes([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    void fetch(`/api/continue-watching?ids=${encodeURIComponent(ids)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw Error();
        const body = await response.json();
        if (!controller.signal.aborted) setEpisodes(body.episodes);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [ids, retry]);
  const items = progress.flatMap((item) => {
    const episode = episodes.find((episode) => episode.id === item.id);
    return episode ? [{ ...episode, ...item }] : [];
  });
  if (!progress.length || (!loading && !error && !items.length)) return null;
  return (
    <section
      className="continue-section container"
      aria-label="Continue watching"
    >
      <div className="section-heading">
        <div>
          <h2>Continue watching</h2>
          <p>Continue watching on this device.</p>
        </div>
      </div>
      {error ? (
        <p className="continue-error">
          Couldn’t load your episodes.{" "}
          <button onClick={() => setRetry((value) => value + 1)}>
            Try again
          </button>
        </p>
      ) : loading ? (
        <div
          className="continue-grid"
          role="status"
          aria-label="Loading continue watching"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton continue-skeleton" />
          ))}
        </div>
      ) : (
        <div className="continue-grid">
          {items.map((item) => (
            <article className="continue-card" key={item.id}>
              <Link
                className="continue-link"
                href={`/watch/${item.id}`}
                aria-label={`Resume ${item.seriesTitle}, episode ${item.number}`}
              >
                <div className="continue-art">
                  {item.thumbnail ? (
                    <img
                      {...artwork(
                        item.thumbnail,
                        "thumbnail",
                        "(max-width:760px) 75vw, 380px",
                      )}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <Film size={28} />
                  )}
                  <span className="continue-play">
                    <Play size={18} fill="currentColor" />
                  </span>
                  <span className="continue-time">
                    {Math.max(
                      1,
                      Math.ceil((item.duration - item.position) / 60),
                    )}{" "}
                    min left
                  </span>
                  <div
                    className="continue-progress"
                    role="progressbar"
                    aria-label="Episode progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(
                      (item.position / item.duration) * 100,
                    )}
                  >
                    <span
                      style={{
                        width: `${Math.min(100, (item.position / item.duration) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="continue-info">
                  <span>{item.seriesTitle}</span>
                  <h3>{item.title}</h3>
                  <p>
                    Season {item.seasonNumber} · Episode {item.number}
                    <span>{time(item.position)} watched</span>
                  </p>
                </div>
              </Link>
              <button
                className="continue-remove"
                aria-label={`Remove ${item.title} from continue watching`}
                onClick={() => removeProgress(item.id)}
              >
                <X size={14} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
