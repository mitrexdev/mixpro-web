import { artwork as responsiveArtwork } from "@/lib/artwork";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Play,
  ArrowUpRight,
  Star,
  Film,
  ArrowLeft,
  Layers,
  Clapperboard,
} from "lucide-react";
import { seriesDetail, settings } from "@/lib/catalog";
import SeasonBrowser from "@/components/season-browser";
import PageState from "@/components/page-state";
export const dynamic = "force-dynamic";
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, site] = await Promise.all([seriesDetail(id), settings()]);
  if (!detail) notFound();
  if (site.maintenance)
    return (
      <PageState
        title="A short intermission."
        description="We’re updating the collection. Please check back soon."
      />
    );
  const { series, seasons, episodes } = detail;
  const available = seasons.filter((season) =>
    episodes.some((episode) => episode.season_id === season.id),
  );
  const first = available.flatMap((season) =>
    episodes.filter((episode) => episode.season_id === season.id),
  )[0];
  const genres = [
    ...new Set(
      series.genre
        .split(",")
        .map((genre) => genre.trim())
        .filter(Boolean),
    ),
  ];
  const credits = [
    ["Creator", series.director],
    ["Cast", series.cast_members],
    ["Network", series.network],
    ["Country", series.country],
  ].filter(([, value]) => value);
  return (
    <main className="title-page container">
      <nav className="title-breadcrumb" aria-label="Breadcrumb">
        <Link href="/browse">
          <ArrowLeft size={15} />
          Explore series
        </Link>
        <span>/</span>
        <span>{series.title}</span>
      </nav>
      <section className="title-introduction" aria-labelledby="series-title">
        <div className="title-poster-column">
          <div className="title-poster">
            {series.poster_url ? (
              <img
                {...responsiveArtwork(
                  series.poster_url,
                  "poster",
                  "(max-width:600px) 160px, (max-width:900px) 220px, 280px",
                )}
                alt={`${series.title} poster`}
                fetchPriority="high"
              />
            ) : (
              <div>
                <Film size={54} strokeWidth={0.8} />
                <span>{series.title}</span>
              </div>
            )}
          </div>
          {series.rating != null && (
            <div className="title-rating">
              <Star size={15} />
              <strong>{series.rating.toFixed(1)}</strong>
              <span>/ 10 rating</span>
            </div>
          )}
        </div>
        <div className="title-copy">
          <nav className="title-genres" aria-label="Series genres">
            {genres.map((genre) => (
              <Link
                key={genre}
                href={`/browse?genre=${encodeURIComponent(genre)}`}
              >
                {genre}
              </Link>
            ))}
          </nav>
          <h1 id="series-title">{series.title}</h1>
          {series.tagline && <p className="title-tagline">{series.tagline}</p>}
          <div className="title-facts">
            {series.release_year && <span>{series.release_year}</span>}
            {series.language && <span>{series.language}</span>}
            {series.content_rating && (
              <span className="title-certificate">{series.content_rating}</span>
            )}
            <span>
              <Layers size={13} />
              {available.length} {available.length === 1 ? "season" : "seasons"}
            </span>
            <span>
              <Clapperboard size={13} />
              {episodes.length} {episodes.length === 1 ? "episode" : "episodes"}
            </span>
          </div>
          <p className="title-synopsis">
            {series.description || "Discover the story, one episode at a time."}
          </p>
          <div className="title-actions">
            {first ? (
              <Link className="button" href={`/watch/${first.id}`}>
                <Play size={15} fill="currentColor" />
                Start watching
              </Link>
            ) : (
              <span className="title-coming-soon">Episodes coming soon</span>
            )}
            {series.trailer_url && (
              <a
                className="button button-outline"
                href={series.trailer_url}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={14} />
                Watch trailer
                <ArrowUpRight size={13} />
              </a>
            )}
            <a className="title-episodes-link" href="#episodes">
              View episodes<span>↓</span>
            </a>
          </div>
          {first && (
            <p className="title-first-episode">
              Starts with Season {available[0].number}, Episode {first.number}
            </p>
          )}
          {credits.length > 0 && (
            <dl className="title-credits">
              {credits.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>
      <SeasonBrowser seasons={seasons} episodes={episodes} />
      {series.source_url && (
        <p className="title-source">
          Series information from{" "}
          <a href={series.source_url} target="_blank" rel="noreferrer">
            TVmaze
            <ArrowUpRight size={12} />
          </a>
        </p>
      )}
    </main>
  );
}
