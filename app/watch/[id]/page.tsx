import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock3,
  Film,
} from "lucide-react";
import { episodeDetail, settings, catalog } from "@/lib/catalog";
import EpisodeCommunity from "@/components/episode-community";
import WatchPlayer from "@/components/watch-player";
import WatchQueue from "@/components/watch-queue";
import ContentRail from "@/components/content-rail";
import SeriesCard from "@/components/series-card";
import { recommendSeries } from "@/lib/recommendations";
import PageState from "@/components/page-state";
export const dynamic = "force-dynamic";
export default async function Watch({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, site, collection] = await Promise.all([
    episodeDetail(id),
    settings(),
    catalog(),
  ]);
  if (!data) notFound();
  if (site.maintenance)
    return (
      <PageState
        title="A short intermission."
        description="We’re updating the collection. Please check back soon."
      />
    );
  const season = data.seasons.find(
    (season) => season.id === data.episode.season_id,
  )!;
  const ordered = data.seasons.flatMap((season) =>
    data.episodes.filter((episode) => episode.season_id === season.id),
  );
  const index = ordered.findIndex((episode) => episode.id === id);
  const recommendations = recommendSeries(data.series, collection);
  const previous = ordered[index - 1];
  const next = ordered[index + 1];
  return (
    <main className="watch-page-refined">
      <div className="screening-page container">
        <nav className="viewing-breadcrumb" aria-label="Series navigation">
          <Link href={`/series/${data.series.id}`}>
            <ArrowLeft size={15} />
            <span>{data.series.title}</span>
          </Link>
          <ChevronRight size={12} />
          <span>Season {season.number}</span>
        </nav>
        <div className="watch-restored-layout">
          <div className="watch-restored-main">
            <section
              className="viewing-stage"
              aria-label={`Watch ${data.episode.title}`}
            >
              <WatchPlayer key={id} episodeId={id} title={data.episode.title} />
            </section>
            <div className="viewing-navigation">
              <span>
                <Film size={14} />
                Season {season.number}
                <span className="viewing-dot" />
                Episode {String(data.episode.number).padStart(2, "0")}
                {data.episode.runtime_minutes && (
                  <span className="viewing-runtime">
                    <Clock3 size={12} />
                    {data.episode.runtime_minutes} min
                  </span>
                )}
              </span>
              <nav aria-label="Episode navigation">
                {previous && (
                  <Link
                    href={`/watch/${previous.id}`}
                    className="viewing-previous"
                  >
                    <ArrowLeft size={14} />
                    <span>Previous</span>
                  </Link>
                )}
                {next ? (
                  <Link href={`/watch/${next.id}`} className="viewing-next">
                    Next episode
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <span className="viewing-last">Last available episode</span>
                )}
              </nav>
            </div>
            <div className="viewing-story">
              <section className="viewing-introduction">
                <Link
                  className="viewing-series-label"
                  href={`/series/${data.series.id}`}
                >
                  {data.series.title}
                  <ArrowRight size={13} />
                </Link>
                <h1>{data.episode.title}</h1>
                <p>
                  {data.episode.description ||
                    "Settle in and enjoy the next chapter."}
                </p>
                <div className="viewing-tags">
                  {[
                    ...new Set(
                      data.series.genre
                        .split(",")
                        .map((genre) => genre.trim())
                        .filter(Boolean),
                    ),
                  ]
                    .slice(0, 3)
                    .map((genre) => (
                      <Link
                        key={genre}
                        href={`/browse?genre=${encodeURIComponent(genre)}`}
                      >
                        {genre}
                      </Link>
                    ))}
                  {data.series.content_rating && (
                    <span>{data.series.content_rating}</span>
                  )}
                </div>
              </section>
              <EpisodeCommunity
                key={`community-${id}`}
                episodeId={id}
                title={data.episode.title}
              />
            </div>
          </div>
          <WatchQueue
            key={`queue-${id}`}
            seasons={data.seasons}
            episodes={data.episodes}
            episodeId={id}
            seriesId={data.series.id}
          />
        </div>
      </div>
      {recommendations.length > 0 && (
        <div className="watch-recommendations">
          <ContentRail
            title="More to explore"
            description="More series from the collection, starting with similar genres."
            href="/browse"
          >
            {recommendations.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </ContentRail>
        </div>
      )}
    </main>
  );
}
