import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { siteUrl } from "@/lib/site";
import { db, publicError } from "@/lib/db";
import { playable, settings } from "@/lib/catalog";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(req: Request) {
  try {
    if (req.headers.get("origin") !== siteUrl())
      return new Response("Invalid origin", { status: 403 });
    if ((await settings()).maintenance)
      return new Response("Unavailable", { status: 503 });
    const body = await req.json();
    if (!uuid.test(body.episodeId) || !uuid.test(body.eventId))
      return new Response("Invalid event", { status: 400 });
    const episode = await playable(body.episodeId);
    if (!episode) return new Response("Not found", { status: 404 });
    const jar = await cookies();
    let visitor = jar.get("mixpro_visitor")?.value;
    if (!visitor || !uuid.test(visitor)) {
      visitor = randomUUID();
      jar.set("mixpro_visitor", visitor, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 86400,
      });
    }
    const result = await db()
      .from("playback_events")
      .insert({
        id: body.eventId,
        visitor_id: visitor,
        viewer_id: null,
        video_id: episode.video.id,
        episode_id: body.episodeId,
      });
    if (result.error && result.error.code !== "23505") throw result.error;
    return Response.json({ ok: true });
  } catch (e) {
    return publicError(e);
  }
}
export async function PATCH(req: Request) {
  try {
    if (req.headers.get("origin") !== siteUrl())
      return new Response("Invalid origin", { status: 403 });
    const visitor = (await cookies()).get("mixpro_visitor")?.value;
    if (!visitor || !uuid.test(visitor))
      return new Response("No playback session", { status: 403 });
    const body = await req.json();
    if (
      !uuid.test(body.eventId) ||
      !Number.isSafeInteger(body.seconds) ||
      body.seconds < 0 ||
      body.seconds > 21600
    )
      return new Response("Invalid event", { status: 400 });
    const database = db();
    const event = await database
      .from("playback_events")
      .select("created_at,watch_seconds")
      .eq("id", body.eventId)
      .eq("visitor_id", visitor)
      .maybeSingle();
    if (event.error) throw event.error;
    if (!event.data) return new Response("Not found", { status: 404 });
    const elapsed = Math.max(
      0,
      Math.floor((Date.now() - Date.parse(event.data.created_at)) / 1000) + 5,
    );
    const seconds = Math.min(body.seconds, elapsed);
    if (seconds > event.data.watch_seconds) {
      const result = await database
        .from("playback_events")
        .update({ watch_seconds: seconds })
        .eq("id", body.eventId)
        .eq("visitor_id", visitor)
        .lt("watch_seconds", seconds);
      if (result.error) throw result.error;
    }
    return Response.json({ ok: true });
  } catch (e) {
    return publicError(e);
  }
}
