export function siteUrl() {
  return new URL(process.env.SITE_URL || "http://localhost:3001").origin;
}
export function safeWatchPath(value: string | null) {
  return value && /^\/(watch|series)\/[0-9a-f-]{36}$/i.test(value)
    ? value
    : "/browse";
}
