import { catalog, settings } from "@/lib/catalog";
import { publicError } from "@/lib/db";
export async function GET(request: Request) {
  try {
    const q = (new URL(request.url).searchParams.get("q") || "")
      .trim()
      .slice(0, 120)
      .toLowerCase();
    const site = await settings();
    if (site.maintenance)
      return Response.json(
        { error: "The collection is being updated. Please try again soon." },
        { status: 503 },
      );
    const all = await catalog();
    const matches = q
      ? all.filter((s) =>
          `${s.title} ${s.genre} ${s.description} ${s.cast_members}`
            .toLowerCase()
            .includes(q),
        )
      : all;
    return Response.json(
      {
        results: matches
          .slice(0, 8)
          .map(({ id, title, poster_url, release_year, genre }) => ({
            id,
            title,
            poster_url,
            release_year,
            genre,
          })),
        total: matches.length,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return publicError(error);
  }
}
