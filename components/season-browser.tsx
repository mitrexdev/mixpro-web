"use client";
import { artwork as responsiveArtwork } from "@/lib/artwork";
import { useState } from "react";
import Link from "next/link";
import { Play, Film, Clock3, ArrowUpRight } from "lucide-react";
import type { Episode, Season } from "@/lib/catalog";
export default function SeasonBrowser({
  seasons,
  episodes,
}: {
  seasons: Season[];
  episodes: Episode[];
}) {
  const available = seasons.filter((season) =>
    episodes.some((episode) => episode.season_id === season.id),
  );
  const [selected, setSelected] = useState(available[0]?.id || "");
  const season =
    available.find((season) => season.id === selected) || available[0];
  const list = episodes.filter((episode) => episode.season_id === season?.id);
  return (
    <section id="episodes" className="title-episodes">
      <div className="title-episodes-heading">
        <div>
          <h2>Episodes</h2>
          <p>Choose a season. Find your next chapter.</p>
        </div>
        <span>
          {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}{" "}
          available
        </span>
      </div>
      {available.length > 0 && (
        <div
          className="title-season-tabs"
          role="group"
          aria-label="Choose season"
        >
          {available.map((item) => (
            <button
              key={item.id}
              aria-pressed={season?.id === item.id}
              onClick={() => setSelected(item.id)}
              className={season?.id === item.id ? "selected" : ""}
            >
              Season {item.number}
              <span>
                {
                  episodes.filter((episode) => episode.season_id === item.id)
                    .length
                }
              </span>
            </button>
          ))}
        </div>
      )}
      {season && (
        <div className="title-season-summary">
          <h3>{season.title || `Season ${season.number}`}</h3>
          {season.description && <p>{season.description}</p>}
        </div>
      )}
      {list.length ? (
        <div className="title-episode-list" key={season?.id}>
          {list.map((episode) => (
            <Link
              key={episode.id}
              href={`/watch/${episode.id}`}
              className="title-episode"
            >
              <div className="title-episode-thumbnail">
                {episode.thumbnail_url ? (
                  <img
                    {...responsiveArtwork(
                      episode.thumbnail_url,
                      "thumbnail",
                      "(max-width:600px) 120px, 220px",
                    )}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <Film size={28} strokeWidth={1} />
                )}
                <span className="title-episode-play">
                  <Play size={17} fill="currentColor" />
                </span>
              </div>
              <div className="title-episode-copy">
                <div className="title-episode-meta">
                  <span>Episode {String(episode.number).padStart(2, "0")}</span>
                  {!!episode.runtime_minutes && (
                    <span>
                      <Clock3 size={11} />
                      {episode.runtime_minutes} min
                    </span>
                  )}
                </div>
                <h3>{episode.title}</h3>
                <p>{episode.description || "A new chapter in the story."}</p>
              </div>
              <span className="title-episode-watch">
                Watch
                <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="title-episodes-empty">
          <Film size={34} strokeWidth={1} />
          <h3>A new story is on its way.</h3>
          <p>Episodes will appear here when they’re available.</p>
        </div>
      )}
    </section>
  );
}
