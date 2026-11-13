import { cookies } from "next/headers";
import { siteUrl } from "@/lib/site";
export async function POST(req: Request) {
  if (req.headers.get("origin") !== siteUrl())
    return new Response("Invalid origin", { status: 403 });
  const jar = await cookies();
  jar.delete("mixpro_viewer_access");
  jar.delete("mixpro_viewer_refresh");
  return Response.json({ ok: true });
}
