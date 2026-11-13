import type { Series } from "./catalog";
export function recommendSeries(
  current: Series,
  collection: Series[],
  limit = 8,
) {
  const genres = new Set(
    current.genre
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  const score = (series: Series) =>
    series.genre
      .split(",")
      .filter((value) => genres.has(value.trim().toLowerCase())).length *
      10 +
    (current.language && series.language === current.language ? 1 : 0);
  return collection
    .filter((series) => series.id !== current.id)
    .map((series, index) => ({ series, index, score: score(series) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.series);
}
