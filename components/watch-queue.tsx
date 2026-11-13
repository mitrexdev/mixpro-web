"use client";
import Link from "next/link";
import { useState } from "react";
import { Film, Play, ArrowUpRight } from "lucide-react";
import { artwork } from "@/lib/artwork";
import type { Episode, Season } from "@/lib/catalog";
export default function WatchQueue({
  seasons,
  episodes,
  episodeId,
  seriesId,
}: {
  seasons: Season[];
  episodes: Episode[];
  episodeId: string;
  seriesId: string;
}) {
  const available = seasons.filter((season) =>
    episodes.some((episode) => episode.season_id === season.id),
  );
  const current = episodes.find((episode) => episode.id === episodeId);
  const [selected, setSelected] = useState(
    current?.season_id || available[0]?.id || "",
  );
  const season =
    available.find((season) => season.id === selected) || available[0];
  const list = episodes.filter((episode) => episode.season_id === season?.id);
  return (
    <aside className="watch-queue" aria-label="Choose an episode">
      <div className="watch-queue-heading">
        <h2>Keep the story going</h2>
        <Link
          href={`/series/${seriesId}#episodes`}
          aria-label="View series and all episodes"
        >
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="watch-queue-filter">
        <label htmlFor="watch-season" className="sr-only">
          Choose season
        </label>
        <select
          id="watch-season"
          value={season?.id || ""}
          onChange={(event) => setSelected(event.target.value)}
        >
          {available.map((item) => (
            <option key={item.id} value={item.id}>
              Season {item.number}
            </option>
          ))}
        </select>
        <span>
          {list.length} {list.length === 1 ? "episode" : "episodes"}
        </span>
      </div>
      <div className="watch-queue-items">
        {list.map((episode) => (
          <Link
            href={`/watch/${episode.id}`}
            key={episode.id}
            className={`watch-queue-item ${episode.id === episodeId ? "selected" : ""}`}
            aria-current={episode.id === episodeId ? "page" : undefined}
          >
            <div className="watch-queue-thumbnail">
              {episode.thumbnail_url ? (
                <img
                  {...artwork(episode.thumbnail_url, "thumbnail", "110px")}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <Film size={23} strokeWidth={1} />
              )}
              {episode.id === episodeId && (
                <span>
                  <Play size={13} fill="currentColor" />
                </span>
              )}
            </div>
            <div className="watch-queue-copy">
              <span>Episode {String(episode.number).padStart(2, "0")}</span>
              <h3>{episode.title}</h3>
              <small>
                {episode.id === episodeId
                  ? "Now watching"
                  : episode.runtime_minutes
                    ? `${episode.runtime_minutes} min`
                    : "Watch episode"}
              </small>
            </div>
          </Link>
        ))}
      </div>
      <Link href={`/series/${seriesId}`} className="watch-queue-series">
        Back to series details
        <ArrowUpRight size={13} />
      </Link>
    </aside>
  );
}
