import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { db, publicError } from "@/lib/db";
import { episodeDetail, settings } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Context = { params: Promise<{ id: string }> };
async function visitor() {
  const jar = await cookies();
  let id = jar.get("mixpro_community")?.value;
  if (!id || !uuid.test(id)) {
    id = randomUUID();
    jar.set("mixpro_community", id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 86400,
    });
  }
  return id;
}
async function available(id: string) {
  return (
    uuid.test(id) &&
    !(await settings()).maintenance &&
    !!(await episodeDetail(id))
  );
}
export async function GET(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!(await available(id)))
      return Response.json({ error: "Episode unavailable" }, { status: 404 });
    const identity = await visitor();
    const database = db();
    const offset = Math.min(
      10000,
      Math.max(0, Number(new URL(request.url).searchParams.get("offset")) || 0),
    );
    if (!Number.isSafeInteger(offset))
      return Response.json({ error: "Invalid page" }, { status: 400 });
    const [likes, dislikes, mine, comments] = await Promise.all([
      database
        .from("episode_reactions")
        .select("episode_id", { count: "exact", head: true })
        .eq("episode_id", id)
        .eq("reaction", "like"),
      database
        .from("episode_reactions")
        .select("episode_id", { count: "exact", head: true })
        .eq("episode_id", id)
        .eq("reaction", "dislike"),
      database
        .from("episode_reactions")
        .select("reaction")
        .eq("episode_id", id)
        .eq("visitor_id", identity)
        .maybeSingle(),
      database
        .from("episode_comments")
        .select("id,display_name,body,created_at,visitor_id", {
          count: "exact",
        })
        .eq("episode_id", id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + 19),
    ]);
    for (const result of [likes, dislikes, mine, comments])
      if (result.error) throw result.error;
    return Response.json(
      {
        likes: likes.count || 0,
        dislikes: dislikes.count || 0,
        reaction: mine.data?.reaction || null,
        total: comments.count || 0,
        comments: (comments.data || []).map(({ visitor_id, ...comment }) => ({
          ...comment,
          own: visitor_id === identity,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return publicError(error);
  }
}
export async function POST(request: Request, { params }: Context) {
  try {
    if (request.headers.get("origin") !== siteUrl())
      return Response.json({ error: "Invalid origin" }, { status: 403 });
    const { id } = await params;
    if (!(await available(id)))
      return Response.json({ error: "Episode unavailable" }, { status: 404 });
    const input = await request.json();
    if (!input || typeof input !== "object")
      return Response.json({ error: "Invalid action" }, { status: 400 });
    const identity = await visitor();
    const database = db();
    if (input.action === "react") {
      if (!["like", "dislike", null].includes(input.reaction))
        return Response.json(
          { error: "Choose like or dislike" },
          { status: 400 },
        );
      const result =
        input.reaction === null
          ? await database
              .from("episode_reactions")
              .delete()
              .eq("episode_id", id)
              .eq("visitor_id", identity)
          : await database
              .from("episode_reactions")
              .upsert(
                {
                  episode_id: id,
                  visitor_id: identity,
                  reaction: input.reaction,
                },
                { onConflict: "episode_id,visitor_id" },
              );
      if (result.error) throw result.error;
      return Response.json({ ok: true });
    }
    if (input.action === "comment") {
      if (
        typeof input.name !== "string" ||
        input.name.trim().length < 1 ||
        input.name.trim().length > 60 ||
        typeof input.body !== "string" ||
        input.body.trim().length < 1 ||
        input.body.trim().length > 2000
      )
        return Response.json(
          {
            error:
              "Enter your name (up to 60 characters) and a comment (up to 2,000 characters).",
          },
          { status: 400 },
        );
      const result = await database.rpc("post_episode_comment", {
        p_episode_id: id,
        p_visitor_id: identity,
        p_name: input.name.trim(),
        p_body: input.body.trim(),
      });
      if (result.error) {
        if (result.error.message?.includes("comment_rate_limit"))
          return Response.json(
            { error: "Please wait 15 seconds between comments." },
            { status: 429 },
          );
        throw result.error;
      }
      return Response.json({ ok: true });
    }
    if (input.action === "delete_comment") {
      if (!uuid.test(input.commentId))
        return Response.json({ error: "Invalid comment" }, { status: 400 });
      const result = await database
        .from("episode_comments")
        .delete()
        .eq("id", input.commentId)
        .eq("episode_id", id)
        .eq("visitor_id", identity)
        .select("id")
        .maybeSingle();
      if (result.error) throw result.error;
      if (!result.data)
        return Response.json({ error: "Comment not found" }, { status: 404 });
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return publicError(error);
  }
}
