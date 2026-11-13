import { artwork as responsiveArtwork } from "@/lib/artwork";
import Link from "next/link";
import { Film, ArrowUpRight, Star } from "lucide-react";
import type { Series } from "@/lib/catalog";
export default function SeriesCard({ series }: { series: Series }) {
  return (
    <Link className="series-card" href={`/series/${series.id}`}>
      <div className="series-poster">
        {series.poster_url ? (
          <img
            loading="lazy"
            {...responsiveArtwork(
              series.poster_url,
              "poster",
              "(max-width: 430px) 42vw, (max-width: 760px) 30vw, 240px",
            )}
            alt={`${series.title} poster`}
          />
        ) : (
          <div className="poster-placeholder">
            <Film size={34} />
            <span>{series.title}</span>
          </div>
        )}
        <span className="poster-open">
          <ArrowUpRight size={18} />
        </span>
        {series.rating != null && (
          <span className="poster-rating">
            <Star size={11} fill="currentColor" />
            {series.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="series-card-info">
        <h3>{series.title}</h3>
        <p>
          {[series.release_year, series.genre.split(",")[0], series.language]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}
