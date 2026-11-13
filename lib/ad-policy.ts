import type { AdConfig } from "./ad-config";
export function allowsAds(
  config: AdConfig,
  hostname: string,
  pathname: string,
) {
  if (
    !config.enabled ||
    !config.domain ||
    !config.script_url ||
    hostname.toLowerCase().replace(/^www\./, "") !==
      config.domain.replace(/^www\./, "")
  )
    return false;
  const page =
    pathname === "/"
      ? "home"
      : pathname === "/browse"
        ? "explore"
        : /^\/series\/[0-9a-f-]{36}$/i.test(pathname)
          ? "series"
          : null;
  return !!page && config.pages.includes(page);
}
