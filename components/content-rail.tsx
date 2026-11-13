"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
export default function ContentRail({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description?: string;
  href: string;
  children: ReactNode;
}) {
  const railId = useId();
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => {
      const start = element.scrollLeft < 4;
      const end =
        element.scrollLeft + element.clientWidth >= element.scrollWidth - 4;
      setEdges((previous) =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end },
      );
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [children]);
  const scroll = (direction: number) => {
    const element = rail.current;
    if (element) {
      const card = element.firstElementChild;
      const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
      const step =
        (card?.getBoundingClientRect().width || element.clientWidth) + gap;
      const visible = Math.max(
        1,
        Math.floor((element.clientWidth + gap) / step),
      );
      element.scrollBy({
        left: direction * visible * step,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  };
  return (
    <section className="streaming-shelf container">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <div className="shelf-actions">
          <Link className="text-link" href={href}>
            View all <ArrowUpRight size={15} />
          </Link>
          {!(edges.start && edges.end) && (
            <div className="shelf-arrows">
              <button
                className="icon-button"
                aria-controls={railId}
                disabled={edges.start}
                onClick={() => scroll(-1)}
                aria-label={`Scroll ${title} left`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-controls={railId}
                disabled={edges.end}
                onClick={() => scroll(1)}
                aria-label={`Scroll ${title} right`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className="rail-viewport"
        data-at-start={edges.start}
        data-at-end={edges.end}
      >
        <div
          className="content-rail"
          ref={rail}
          id={railId}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              scroll(event.key === "ArrowRight" ? 1 : -1);
            }
            if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              event.currentTarget.scrollTo({
                left:
                  event.key === "Home" ? 0 : event.currentTarget.scrollWidth,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              });
            }
          }}
          tabIndex={0}
          role="region"
          aria-label={title}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
