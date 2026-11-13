import { artwork as responsiveArtwork } from "@/lib/artwork";
import Link from "next/link";
import { ArrowUpRight, Film, Star } from "lucide-react";
import type { Series } from "@/lib/catalog";
export default function ExploreCard({ series }: { series: Series }) {
  const genres = series.genre
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);
  return (
    <Link className="explore-card" href={`/series/${series.id}`}>
      <div className="explore-card-art">
        {series.poster_url ? (
          <img
            {...responsiveArtwork(
              series.poster_url,
              "poster",
              "(max-width: 480px) 45vw, (max-width: 760px) 30vw, (max-width:1280px) 23vw, 282px",
            )}
            alt=""
            loading="lazy"
          />
        ) : (
          <div className="explore-poster-empty">
            <Film size={46} strokeWidth={0.8} />
            <span>{series.title}</span>
          </div>
        )}
        <div className="explore-card-top">
          {series.rating != null && (
            <span className="explore-score">
              <Star size={11} fill="currentColor" />
              {series.rating.toFixed(1)}
              <span>/ 10</span>
            </span>
          )}
          {series.content_rating && (
            <span className="explore-certificate">{series.content_rating}</span>
          )}
        </div>
        <div className="explore-card-reveal">
          {series.description && <p>{series.description}</p>}
          <span className="explore-card-action">
            Explore series{" "}
            <span>
              <ArrowUpRight size={18} />
            </span>
          </span>
        </div>
      </div>
      <div className="explore-card-caption">
        <div className="explore-card-title">
          <h3>{series.title}</h3>
          {series.release_year && <span>{series.release_year}</span>}
        </div>
        <p>
          {[genres.slice(0, 2).join(" / "), series.language]
            .filter(Boolean)
            .join(" · ") || "Series"}
        </p>
        {series.description && (
          <p className="explore-touch-description">{series.description}</p>
        )}
      </div>
    </Link>
  );
}
