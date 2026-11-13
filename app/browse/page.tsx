import { artwork as responsiveArtwork } from "@/lib/artwork";
import Link from "next/link";
import { Film, ArrowUpRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { catalog, settings } from "@/lib/catalog";
import { paginate, pageNumbers } from "@/lib/pagination";
import SearchTrigger from "@/components/search-trigger";
import ExploreCard from "@/components/explore-card";
import PageState from "@/components/page-state";
export const dynamic = "force-dynamic";
export const metadata = { title: "Explore" };
export default async function Browse({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const [all, site] = await Promise.all([catalog(), settings()]);
  if (site.maintenance)
    return (
      <PageState
        title="A short intermission."
        description="We’re updating the collection. Please check back soon."
      />
    );
  const q = (params.q || "").trim().slice(0, 120);
  const genre = params.genre || "";
  const genres = [
    ...new Set(
      all.flatMap((s) =>
        s.genre
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
      ),
    ),
  ].sort();
  let list = all.filter(
    (s) =>
      (!q ||
        `${s.title} ${s.description} ${s.cast_members}`
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (!genre ||
        s.genre
          .split(",")
          .map((g) => g.trim())
          .includes(genre)),
  );
  if (params.sort === "rating")
    list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const pagination = paginate(list, params.page);
  const pageLink = (page: number) =>
    `/browse?${new URLSearchParams({ ...(q ? { q } : {}), ...(genre ? { genre } : {}), ...(params.sort === "rating" ? { sort: "rating" } : {}), ...(page > 1 ? { page: String(page) } : {}) })}#collection`;
  const artwork = all.filter((s) => s.poster_url).slice(0, 3);
  const sort = params.sort === "rating" ? "rating" : "newest";
  const genreLink = (value: string) =>
    `/browse?${new URLSearchParams({ ...(value ? { genre: value } : {}), ...(q ? { q } : {}), ...(sort === "rating" ? { sort } : {}) })}`;
  return (
    <main className="container premium-explore">
      <nav className="page-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Explore</span>
      </nav>
      <section
        className={`explore-masthead ${artwork.length ? "" : "without-art"}`}
        aria-labelledby="explore-heading"
      >
        <div className="explore-masthead-copy">
          <span className="explore-overline">
            <span />
            The series collection
          </span>
          <h1 id="explore-heading">
            A good story.
            <br />A little escape.
          </h1>
          <p>
            Find your next series, follow a familiar favorite or take a chance
            on something new.
          </p>
          <a className="explore-jump" href="#collection">
            Discover the collection <ArrowUpRight size={15} />
          </a>
        </div>
        {artwork.length > 0 && (
          <div
            className={`explore-poster-stack stack-count-${artwork.length}`}
            aria-hidden="true"
          >
            {artwork.map((item) => (
              <div key={item.id}>
                <img
                  {...responsiveArtwork(item.poster_url, "poster", "148px")}
                  alt=""
                />
              </div>
            ))}
          </div>
        )}
      </section>
      <section
        id="collection"
        className="explore-collection"
        aria-labelledby="collection-heading"
      >
        <nav className="explore-genre-tabs" aria-label="Browse by genre">
          <Link
            className={!genre ? "selected" : ""}
            href={genreLink("")}
            aria-current={!genre ? "true" : undefined}
          >
            All series
          </Link>
          {genres.map((g) => (
            <Link
              key={g}
              className={genre === g ? "selected" : ""}
              href={genreLink(g)}
              aria-current={genre === g ? "true" : undefined}
            >
              {g}
            </Link>
          ))}
        </nav>
        <div className="explore-utility-bar">
          <SearchTrigger />
          <div
            className="explore-sort-links"
            role="group"
            aria-label="Sort series"
          >
            <Link
              className={sort === "newest" ? "selected" : ""}
              aria-current={sort === "newest" ? "true" : undefined}
              href={`/browse?${new URLSearchParams({ ...(q ? { q } : {}), ...(genre ? { genre } : {}), sort: "newest" })}`}
            >
              Recently added
            </Link>
            <Link
              className={sort === "rating" ? "selected" : ""}
              aria-current={sort === "rating" ? "true" : undefined}
              href={`/browse?${new URLSearchParams({ ...(q ? { q } : {}), ...(genre ? { genre } : {}), sort: "rating" })}`}
            >
              Top rated
            </Link>
          </div>
        </div>
        <div className="explore-results-heading">
          <div>
            <h2 id="collection-heading">
              {q
                ? `Results for “${q}”`
                : genre
                  ? `${genre} series`
                  : "The collection"}
            </h2>
            <p>
              {list.length > 8
                ? `${pagination.start}–${pagination.end} of ${pagination.total} series`
                : `${list.length} series`}
              {q && genre ? ` in ${genre}` : ""}
            </p>
          </div>
          {(q || genre) && (
            <Link className="explore-clear" href="/browse">
              <X size={13} />
              Clear filters
            </Link>
          )}
        </div>
        {list.length ? (
          <div className="explore-grid">
            {pagination.items.map((s) => (
              <ExploreCard key={s.id} series={s} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Film size={30} />
            <h3>
              {q || genre
                ? "No stories matched your search."
                : "New stories are on their way."}
            </h3>
            <p>
              {q || genre
                ? "Try another title or clear your filters."
                : "Published series will appear here when they’re ready."}
            </p>
            {(q || genre) && (
              <Link href="/browse" className="button button-outline">
                Clear filters
              </Link>
            )}
          </div>
        )}
        {pagination.pages > 1 && (
          <nav className="explore-pagination" aria-label="Explore pagination">
            <span className="pagination-summary">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="pagination-controls">
              {pagination.page > 1 ? (
                <Link
                  className="pagination-direction"
                  href={pageLink(pagination.page - 1)}
                  rel="prev"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                  <span>Previous</span>
                </Link>
              ) : (
                <span
                  className="pagination-direction disabled"
                  aria-disabled="true"
                >
                  <ChevronLeft size={15} />
                  <span>Previous</span>
                </span>
              )}
              <div className="pagination-numbers">
                {pageNumbers(pagination.page, pagination.pages).map(
                  (page, index) =>
                    page === "gap" ? (
                      <span
                        className="pagination-gap"
                        key={`gap-${index}`}
                        aria-hidden="true"
                      >
                        …
                      </span>
                    ) : (
                      <Link
                        key={page}
                        href={pageLink(page)}
                        aria-label={`Page ${page}`}
                        aria-current={
                          page === pagination.page ? "page" : undefined
                        }
                      >
                        {page}
                      </Link>
                    ),
                )}
              </div>
              {pagination.page < pagination.pages ? (
                <Link
                  className="pagination-direction"
                  href={pageLink(pagination.page + 1)}
                  rel="next"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={15} />
                </Link>
              ) : (
                <span
                  className="pagination-direction disabled"
                  aria-disabled="true"
                >
                  <span>Next</span>
                  <ChevronRight size={15} />
                </span>
              )}
            </div>
          </nav>
        )}
      </section>
    </main>
  );
}
