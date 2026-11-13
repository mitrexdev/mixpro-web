import "server-only";
export type RequestTitle = {
  id: number;
  title: string;
  poster: string;
  year: string;
  language: string;
  url: string;
};
type Show = {
  id: number;
  name: string;
  image?: { medium?: string } | null;
  premiered?: string | null;
  language?: string | null;
  url: string;
};
async function fetchMaze(path: string) {
  const response = await fetch(`https://api.tvmaze.com/${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
    next: { revalidate: 3600 },
  });
  if (!response.ok)
    throw Error(
      "TVmaze search is unavailable. Please retry or enter a title manually.",
    );
  return response.json();
}
const map = (show: Show): RequestTitle => ({
  id: show.id,
  title: show.name.slice(0, 200),
  poster: show.image?.medium || "",
  year: show.premiered?.slice(0, 4) || "",
  language: show.language || "",
  url: show.url,
});
export async function searchRequestTitles(
  query: string,
): Promise<RequestTitle[]> {
  return (
    (await fetchMaze(`search/shows?q=${encodeURIComponent(query)}`)) as {
      show: Show;
    }[]
  )
    .slice(0, 12)
    .map((item) => map(item.show));
}
export async function requestTitle(id: number): Promise<RequestTitle> {
  return map(await fetchMaze(`shows/${id}`));
}
