export const WATCH_PROGRESS_KEY = "mixpro.watch-progress.v1";
export const WATCH_PROGRESS_EVENT = "mixpro:watch-progress";
export type WatchProgress = {
  id: string;
  position: number;
  duration: number;
  updatedAt: number;
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function normalizeProgress(
  value: unknown,
  now = Date.now(),
): WatchProgress[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .filter(
      (item): item is WatchProgress =>
        !!item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        uuid.test(item.id) &&
        Number.isFinite(item.position) &&
        item.position >= 5 &&
        Number.isFinite(item.duration) &&
        item.duration > 0 &&
        item.position < item.duration &&
        Number.isFinite(item.updatedAt) &&
        item.updatedAt <= now + 60000 &&
        item.updatedAt > now - 90 * 86400000 &&
        !isFinished(item.position, item.duration),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 24)
    .map(({ id, position, duration, updatedAt }) => ({
      id,
      position,
      duration,
      updatedAt,
    }));
}
export function isFinished(position: number, duration: number) {
  return (
    duration > 0 &&
    (position / duration >= 0.98 ||
      (duration > 30 && duration - position <= 10))
  );
}
export function readProgress(): WatchProgress[] {
  try {
    return normalizeProgress(
      JSON.parse(localStorage.getItem(WATCH_PROGRESS_KEY) || "[]"),
    );
  } catch {
    return [];
  }
}
function write(items: WatchProgress[]) {
  try {
    localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(WATCH_PROGRESS_EVENT));
  } catch {
    /* Playback stays available if storage is blocked. */
  }
}
export function removeProgress(id: string) {
  write(readProgress().filter((item) => item.id !== id));
}
export function saveProgress(id: string, position: number, duration: number) {
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0)
    return;
  if (isFinished(position, duration)) {
    removeProgress(id);
    return;
  }
  if (position < 5) return;
  write(
    normalizeProgress([
      { id, position, duration, updatedAt: Date.now() },
      ...readProgress().filter((item) => item.id !== id),
    ]),
  );
}
export function resumePosition(position: number, duration: number) {
  return Number.isFinite(duration) &&
    duration > 0 &&
    !isFinished(position, duration)
    ? Math.max(0, Math.min(position, duration - 1))
    : 0;
}
