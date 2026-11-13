import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { siteUrl } from "@/lib/site";
import { settings } from "@/lib/catalog";
import { db, publicError } from "@/lib/db";
import { requestTitle } from "@/lib/request-search";
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== siteUrl())
      return Response.json({ error: "Invalid origin" }, { status: 403 });
    if ((await settings()).maintenance)
      return Response.json(
        { error: "Requests are temporarily unavailable." },
        { status: 503 },
      );
    const input = await request.json();
    if (
      typeof input?.name !== "string" ||
      !input.name.trim() ||
      input.name.trim().length > 60
    )
      return Response.json(
        { error: "Enter your name (up to 60 characters)." },
        { status: 400 },
      );
    let title = "",
      poster = "",
      source = "",
      key = "",
      tvmazeId: number | null = null;
    if (input.tvmazeId !== undefined && input.tvmazeId !== null) {
      if (!Number.isSafeInteger(input.tvmazeId) || input.tvmazeId < 1)
        return Response.json(
          { error: "Choose a valid search result." },
          { status: 400 },
        );
      try {
        const show = await requestTitle(input.tvmazeId);
        title = show.title;
        poster = show.poster;
        source = show.url;
        tvmazeId = show.id;
        key = `tvmaze:${show.id}`;
      } catch {
        return Response.json(
          {
            error:
              "Couldn’t verify this title with TVmaze. Retry or use manual entry.",
          },
          { status: 502 },
        );
      }
    } else {
      if (
        typeof input.title !== "string" ||
        !input.title.trim() ||
        input.title.trim().length > 200
      )
        return Response.json(
          { error: "Search and select a title, or enter one manually." },
          { status: 400 },
        );
      title = input.title.trim();
      key = `manual:${title.toLowerCase().replace(/\s+/g, " ")}`;
    }
    const jar = await cookies();
    let visitor = jar.get("mixpro_requests")?.value;
    if (
      !visitor ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        visitor,
      )
    ) {
      visitor = randomUUID();
      jar.set("mixpro_requests", visitor, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 365 * 86400,
      });
    }
    const result = await db().rpc("submit_content_request", {
      p_visitor_id: visitor,
      p_name: input.name.trim(),
      p_title: title,
      p_tvmaze_id: tvmazeId,
      p_poster: poster,
      p_source: source,
      p_key: key,
    });
    if (result.error) {
      if (result.error.message?.includes("request_duplicate"))
        return Response.json(
          { error: "You already have a pending request for this title." },
          { status: 409 },
        );
      if (result.error.message?.includes("request_rate_limit"))
        return Response.json(
          { error: "Please wait a minute before sending another request." },
          { status: 429 },
        );
      throw result.error;
    }
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return publicError(error);
  }
}
