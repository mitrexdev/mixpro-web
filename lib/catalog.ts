import "server-only";
import { cache } from "react";
import { db } from "./db";
export type Series = {
  id: string;
  title: string;
  description: string;
  tagline: string;
  poster_url: string;
  backdrop_url: string;
  genre: string;
  language: string;
  country: string;
  release_year: number | null;
  content_rating: string;
  cast_members: string;
  director: string;
  rating: number | null;
  trailer_url: string;
  source_url: string;
  network: string;
};
export type Season = {
  id: string;
  series_id: string;
  title: string;
  number: number;
  description: string;
  poster_url: string;
  release_date: string | null;
};
export type Episode = {
  id: string;
  season_id: string;
  title: string;
  description: string;
  number: number;
  thumbnail_url: string;
  runtime_minutes: number | null;
  release_date: string | null;
};
const seriesFields =
  "id,title,description,tagline,poster_url,backdrop_url,genre,language,country,release_year,content_rating,cast_members,director,rating,trailer_url,source_url,network";
export const settings = cache(async () => {
  const { data, error } = await db()
    .from("site_settings")
    .select("site_name,description,support_email,maintenance")
    .eq("id", true)
    .single();
  if (error) throw error;
  return data as {
    site_name: string;
    description: string;
    support_email: string;
    maintenance: boolean;
  };
});
export const catalog = cache(async () => {
  const { data, error } = await db()
    .from("series")
    .select(seriesFields)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data as Series[];
});
export const seriesDetail = cache(async (id: string) => {
  const database = db();
  const result = await database
    .from("series")
    .select(seriesFields)
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return null;
  const seasons = await database
    .from("seasons")
    .select("id,series_id,title,number,description,poster_url,release_date")
    .eq("series_id", id)
    .order("number");
  if (seasons.error) throw seasons.error;
  const ids = seasons.data.map((s) => s.id);
  const episodes = ids.length
    ? await database
        .from("episodes")
        .select(
          "id,season_id,title,description,number,thumbnail_url,runtime_minutes,release_date",
        )
        .in("season_id", ids)
        .eq("published", true)
        .order("number")
    : { data: [], error: null };
  if (episodes.error) throw episodes.error;
  return {
    series: result.data as Series,
    seasons: seasons.data as Season[],
    episodes: episodes.data as Episode[],
  };
});
export async function episodeDetail(id: string) {
  const result = await db()
    .from("episodes")
    .select("id,season_id")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return null;
  const parent = await db()
    .from("seasons")
    .select("series_id")
    .eq("id", result.data.season_id)
    .single();
  if (parent.error) throw parent.error;
  const detail = await seriesDetail(parent.data.series_id);
  const episode = detail?.episodes.find((e) => e.id === id);
  return detail && episode ? { ...detail, episode } : null;
}
export async function playable(id: string) {
  const detail = await episodeDetail(id);
  if (!detail) return null;
  const result = await db()
    .from("episodes")
    .select("video_id")
    .eq("id", id)
    .eq("published", true)
    .single();
  if (result.error) throw result.error;
  if (!result.data.video_id) return null;
  const video = await db()
    .from("videos")
    .select("id,asset_id,status")
    .eq("id", result.data.video_id)
    .single();
  if (video.error) throw video.error;
  return video.data.status === "ready" && video.data.asset_id
    ? { video: video.data, detail }
    : null;
}

export const homepagePosters = cache(async () => {
  const result = await db()
    .from("homepage_posters")
    .select("id,series_id,title,description,image_url,position,enabled")
    .order("position")
    .order("created_at");
  if (result.error) throw result.error;
  return result.data as {
    id: string;
    series_id: string;
    title: string;
    description: string;
    image_url: string;
    position: number;
    enabled: boolean;
  }[];
});
