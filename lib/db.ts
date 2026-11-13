import "server-only";
import { createClient } from "@supabase/supabase-js";
export function db() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw Error("Database is not configured");
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export function publicError(error: unknown) {
  console.error(error instanceof Error ? error.message : "Request failed");
  return Response.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
