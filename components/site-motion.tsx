"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
const selector =
  ".streaming-shelf,.discovery-bar,.collection-end,.continue-section,.explore-grid,.title-episodes,.about-sections,.about-contact,.community-comments,.watch-footer-main";
export default function SiteMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!("IntersectionObserver" in window)) return;
    let intersection: IntersectionObserver | undefined;
    let mutation: MutationObserver | undefined;
    let frame = 0;
    const marked = new Set<HTMLElement>();
    const seen = new WeakSet<HTMLElement>();
    const clear = () => {
      intersection?.disconnect();
      mutation?.disconnect();
      cancelAnimationFrame(frame);
      marked.forEach((element) =>
        element.removeAttribute("data-motion-pending"),
      );
      marked.clear();
    };
    const setup = () => {
      clear();
      if (motion.matches) return;
      intersection = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const element = entry.target as HTMLElement;
            element.removeAttribute("data-motion-pending");
            element.setAttribute("data-motion-visible", "");
            marked.delete(element);
            intersection?.unobserve(element);
          }
        },
        { threshold: 0.05, rootMargin: "0px 0px -24px 0px" },
      );
      const scan = () => {
        document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight + 24) return;
          element.setAttribute("data-motion-pending", "");
          marked.add(element);
          intersection?.observe(element);
        });
      };
      scan();
      mutation = new MutationObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(scan);
      });
      const main = document.getElementById("main-content");
      if (main) mutation.observe(main, { childList: true, subtree: true });
    };
    setup();
    motion.addEventListener("change", setup);
    return () => {
      clear();
      motion.removeEventListener("change", setup);
    };
  }, [pathname]);
  return null;
}
