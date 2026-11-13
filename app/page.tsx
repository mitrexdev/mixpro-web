import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";
import { catalog, settings, homepagePosters } from "@/lib/catalog";
import SeriesCard from "@/components/series-card";
import FeaturedHero from "@/components/featured-hero";
import ContinueWatching from "@/components/continue-watching";
import ContentRail from "@/components/content-rail";
import { homepageFeatured } from "@/lib/homepage-featured";
import PageState from "@/components/page-state";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [series, site, posters] = await Promise.all([
    catalog(),
    settings(),
    homepagePosters(),
  ]);
  const featured = homepageFeatured(series, posters);
  if (site.maintenance)
    return (
      <PageState
        title="A short intermission."
        description="We’re updating the collection. Please check back soon."
      />
    );
  const genres = [
    ...new Set(
      series.flatMap((s) =>
        s.genre
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
      ),
    ),
  ].slice(0, 8);
  const rated = series
    .filter((s) => s.rating != null)
    .sort((a, b) => b.rating! - a.rating!);
  const collections = genres
    .map((genre) => ({
      genre,
      items: series.filter((s) =>
        s.genre
          .split(",")
          .map((g) => g.trim())
          .includes(genre),
      ),
    }))
    .filter(
      (group) => group.items.length >= 3 && group.items.length < series.length,
    )
    .slice(0, 2);
  return (
    <main className="streaming-home">
      <FeaturedHero
        series={featured.map(
          ({
            id,
            slideId,
            title,
            tagline,
            description,
            backdrop_url,
            poster_url,
            rating,
            release_year,
            genre,
            language,
          }) => ({
            id,
            slideId,
            title,
            tagline,
            description,
            backdrop_url,
            poster_url,
            rating,
            release_year,
            genre,
            language,
          }),
        )}
      />
      <div className="discovery-bar container">
        <span>Browse by genre</span>
        <nav className="genre-pills" aria-label="Browse genres">
          <Link href="/browse" className="selected">
            All series
          </Link>
          {genres.map((g) => (
            <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`}>
              {g}
            </Link>
          ))}
        </nav>
      </div>
      <ContinueWatching />
      {series.length ? (
        <>
          <ContentRail title="Recently added" href="/browse?sort=newest">
            {series.slice(0, 15).map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </ContentRail>
          {rated.length >= 3 && (
            <ContentRail title="Top rated" href="/browse?sort=rating">
              {rated.slice(0, 12).map((s) => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </ContentRail>
          )}
          {collections.map(({ genre, items }) => (
            <ContentRail
              key={genre}
              title={`${genre.charAt(0).toUpperCase()}${genre.slice(1)} series`}
              href={`/browse?genre=${encodeURIComponent(genre)}`}
            >
              {items.slice(0, 12).map((s) => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </ContentRail>
          ))}
        </>
      ) : (
        <div className="container">
          <div className="empty-state">
            <Film size={32} />
            <h3>The collection is taking shape.</h3>
            <p>
              Published series from the studio will appear here. Check back for
              the first release.
            </p>
          </div>
        </div>
      )}
      <section className="collection-end container">
        <div>
          <h2>Find your next series.</h2>
        </div>
        <Link href="/browse" className="button">
          Explore the collection <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
