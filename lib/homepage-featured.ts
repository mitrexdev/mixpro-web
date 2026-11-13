import type { Series } from "./catalog";
export type HomepagePoster = {
  id: string;
  series_id: string;
  title: string;
  description: string;
  image_url: string;
  position: number;
  enabled: boolean;
};
export function homepageFeatured(series: Series[], posters: HomepagePoster[]) {
  if (!posters.length)
    return series.slice(0, 5).map((s) => ({ ...s, slideId: s.id }));
  const published = new Map(series.map((s) => [s.id, s]));
  return [...posters]
    .sort((a, b) => a.position - b.position)
    .filter((p) => p.enabled)
    .flatMap((p) => {
      const linked = published.get(p.series_id);
      return linked
        ? [
            {
              ...linked,
              slideId: p.id,
              title: p.title || linked.title,
              tagline: p.description || linked.tagline,
              backdrop_url: p.image_url,
            },
          ]
        : [];
    });
}
