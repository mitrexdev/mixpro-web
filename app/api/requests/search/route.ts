import { searchRequestTitles } from "@/lib/request-search";
import { settings } from "@/lib/catalog";
export async function GET(request: Request) {
  try {
    if ((await settings()).maintenance)
      return Response.json(
        { error: "Requests are temporarily unavailable." },
        { status: 503 },
      );
    const q = (new URL(request.url).searchParams.get("q") || "").trim();
    if (q.length < 2 || q.length > 120)
      return Response.json(
        { error: "Enter 2–120 characters to search." },
        { status: 400 },
      );
    return Response.json({ results: await searchRequestTitles(q) });
  } catch {
    return Response.json(
      {
        error:
          "TVmaze search is unavailable. Retry or enter your title manually.",
      },
      { status: 502 },
    );
  }
}
