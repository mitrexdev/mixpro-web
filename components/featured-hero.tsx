"use client";
import { artwork as responsiveArtwork } from "@/lib/artwork";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Film,
  Play,
  Pause,
  Star,
} from "lucide-react";
import type { Series } from "@/lib/catalog";
export default function FeaturedHero({
  series,
}: {
  series: (Pick<
    Series,
    | "id"
    | "title"
    | "tagline"
    | "description"
    | "backdrop_url"
    | "poster_url"
    | "rating"
    | "release_year"
    | "genre"
    | "language"
  > & { slideId?: string })[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion();
    updateVisibility();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);
  const rotating =
    series.length > 1 &&
    !paused &&
    !hovered &&
    !focused &&
    !reducedMotion &&
    !hidden;
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % series.length),
      5000,
    );
    return () => window.clearTimeout(timer);
  }, [rotating, index, series.length]);
  const activeIndex = series.length ? index % series.length : 0;
  const active = series[activeIndex];
  const change = (direction: number) =>
    setIndex(
      (current) => (current + direction + series.length) % series.length,
    );
  return (
    <section
      className="featured-stage container"
      aria-label="Featured series"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false);
      }}
    >
      <div
        className="featured-art"
        key={active?.slideId || active?.id || "empty"}
      >
        {active && (active.backdrop_url || active.poster_url) ? (
          <img
            {...responsiveArtwork(
              active.backdrop_url || active.poster_url,
              "banner",
              "(max-width: 760px) calc(100vw - 36px), (max-width: 1280px) calc(100vw - 80px), 1200px",
            )}
            alt=""
            fetchPriority="high"
          />
        ) : (
          <Film className="featured-empty-icon" size={140} strokeWidth={0.5} />
        )}
      </div>
      <div className="featured-shade" />
      <div
        className="featured-content"
        key={`copy-${active?.slideId || active?.id}`}
      >
        <span className="featured-eyebrow">
          <span /> The spotlight
        </span>
        <h1 aria-live={rotating ? "off" : "polite"} aria-atomic="true">
          {active?.title || "Make time for a good story."}
        </h1>
        {active && (
          <div className="featured-meta">
            {active.rating != null && (
              <span>
                <Star size={13} fill="currentColor" />{" "}
                {active.rating.toFixed(1)}
              </span>
            )}
            {[active.release_year, active.genre.split(",")[0], active.language]
              .filter(Boolean)
              .map((item, i) => (
                <span key={`${i}-${item}`}>{item}</span>
              ))}
          </div>
        )}
        <p>
          {active?.tagline ||
            active?.description ||
            "Discover series, explore new worlds and find your next favorite. All in one place."}
        </p>
        <div className="featured-actions">
          <Link
            href={active ? `/series/${active.id}` : "/browse"}
            className="button button-light"
          >
            <Play size={16} fill="currentColor" />
            {active ? "Explore series" : "Browse collection"}
          </Link>
          {active && (
            <Link href="/browse" className="featured-browse">
              Browse all <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
      <div className="featured-bottom">
        <span className="featured-caption">Good stories. Your own pace.</span>
        {series.length > 1 && (
          <div className="featured-controls">
            {!reducedMotion && (
              <button
                className="stage-arrow"
                aria-label={
                  paused ? "Resume automatic slides" : "Pause automatic slides"
                }
                aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            )}
            <button
              className="stage-arrow"
              onClick={() => change(-1)}
              aria-label="Previous featured series"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="featured-dots">
              {series.map((item, i) => (
                <button
                  key={item.slideId || item.id}
                  className={i === activeIndex ? "active" : ""}
                  aria-label={`Show ${item.title}`}
                  aria-pressed={i === activeIndex}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <span className="featured-count">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(series.length).padStart(2, "0")}
            </span>
            <button
              className="stage-arrow"
              onClick={() => change(1)}
              aria-label="Next featured series"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
