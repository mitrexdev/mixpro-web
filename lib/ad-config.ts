export type AdConfig = {
  enabled: boolean;
  domain: string;
  script_url: string;
  attributes: Record<string, string>;
  pages: string[];
};
export function validateAds(value: unknown): AdConfig {
  if (!value || typeof value !== "object")
    throw Error("Invalid advertising settings.");
  const input = value as AdConfig;
  if (
    typeof input.enabled !== "boolean" ||
    typeof input.domain !== "string" ||
    typeof input.script_url !== "string" ||
    !Array.isArray(input.pages) ||
    input.pages.some((page) => !["home", "explore", "series"].includes(page)) ||
    !input.attributes ||
    typeof input.attributes !== "object" ||
    Array.isArray(input.attributes)
  )
    throw Error("Invalid advertising settings.");
  const domain = input.domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (
    domain &&
    (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain) ||
      domain.length > 253)
  )
    throw Error("Enter your real public domain, without a path or port.");
  if (input.script_url) {
    let url: URL;
    try {
      url = new URL(input.script_url);
    } catch {
      throw Error("Enter the exact HTTPS script URL from Monetag.");
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      input.script_url.length > 4000
    )
      throw Error("Use an HTTPS script URL without embedded credentials.");
  }
  const entries = Object.entries(input.attributes);
  if (
    entries.length > 20 ||
    entries.some(
      ([key, value]) =>
        !/^data-[a-z][a-z0-9-]*$/.test(key) ||
        typeof value !== "string" ||
        value.length > 1000,
    )
  )
    throw Error("Only valid data-* script attributes are supported.");
  if (input.enabled && (!domain || !input.script_url || !input.pages.length))
    throw Error(
      "Add a public domain, the real Monetag script and at least one page before enabling ads.",
    );
  return {
    enabled: input.enabled,
    domain,
    script_url: input.script_url,
    attributes: Object.fromEntries(entries),
    pages: [...new Set(input.pages)],
  };
}
