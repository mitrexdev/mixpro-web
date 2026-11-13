"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { allowsAds } from "@/lib/ad-policy";
import type { AdConfig } from "@/lib/ad-config";
export default function MonetagAds({ config }: { config: AdConfig | null }) {
  const pathname = usePathname();
  const loaded = useRef(false);
  useEffect(() => {
    if (!config || !allowsAds(config, window.location.hostname, pathname)) {
      if (loaded.current) window.location.reload();
      return;
    }
    if (loaded.current) return;
    const tags = [
      { id: "mixpro-monetag", src: config.script_url, attributes: config.attributes },
      ...(config.additional_scripts ?? []),
    ];
    for (const tag of tags) {
      if (document.getElementById(tag.id)) continue;
      const script = document.createElement("script");
      script.id = tag.id;
      script.src = tag.src;
      script.async = true;
      Object.entries(tag.attributes).forEach(([key, value]) =>
        script.setAttribute(key, value),
      );
      script.addEventListener("error", () => {
        console.warn("Advertising script did not load; the website remains available.");
      }, { once: true });
      document.head.appendChild(script);
    }
    loaded.current = true;
  }, [config, pathname]);
  useEffect(() => {
    if (!config) return;
    const click = (event: MouseEvent) => {
      if (
        !loaded.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !(target instanceof HTMLAnchorElement) ||
        target.target === "_blank" ||
        target.hasAttribute("download")
      )
        return;
      const url = new URL(target.href, location.href);
      if (
        url.origin === location.origin &&
        !allowsAds(config, url.hostname, url.pathname)
      ) {
        event.preventDefault();
        event.stopPropagation();
        location.assign(url.href);
      }
    };
    const history = () => {
      if (
        loaded.current &&
        !allowsAds(config, location.hostname, location.pathname)
      )
        location.reload();
    };
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", history);
    return () => {
      document.removeEventListener("click", click, true);
      window.removeEventListener("popstate", history);
    };
  }, [config]);
  return null;
}
