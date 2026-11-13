import { db, publicError } from "@/lib/db";
import { settings } from "@/lib/catalog";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(request: Request) {
  try {
    if ((await settings()).maintenance)
      return Response.json(
        { episodes: [] },
        { headers: { "Cache-Control": "no-store" } },
      );
    const ids = [
      ...new Set(
        (new URL(request.url).searchParams.get("ids") || "")
          .split(",")
          .filter(Boolean),
      ),
    ];
    if (ids.length > 24 || ids.some((id) => !uuid.test(id)))
      return Response.json({ error: "Invalid episode list" }, { status: 400 });
    if (!ids.length) return Response.json({ episodes: [] });
    const result = await db()
      .from("episodes")
      .select(
        "id,title,number,thumbnail_url,season:seasons!inner(number,series:series!inner(id,title,poster_url,published)),video:videos!inner(status)",
      )
      .in("id", ids)
      .eq("published", true)
      .eq("season.series.published", true)
      .eq("video.status", "ready");
    if (result.error) throw result.error;
    const rows = result.data as unknown as {
      id: string;
      title: string;
      number: number;
      thumbnail_url: string;
      season: {
        number: number;
        series: {
          id: string;
          title: string;
          poster_url: string;
          published: boolean;
        };
      };
      video: { status: string };
    }[];
    return Response.json(
      {
        episodes: rows.map((row) => ({
          id: row.id,
          title: row.title,
          number: row.number,
          thumbnail: row.thumbnail_url || row.season.series.poster_url,
          seriesTitle: row.season.series.title,
          seasonNumber: row.season.number,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return publicError(error);
  }
}
