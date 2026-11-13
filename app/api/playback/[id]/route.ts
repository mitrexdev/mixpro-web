import { signedPlaybackId } from "@/lib/playback-policy";
import Mux from "@mux/mux-node";
import { playable, settings } from "@/lib/catalog";
import { publicError } from "@/lib/db";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if ((await settings()).maintenance)
      return Response.json(
        { error: "Playback is temporarily unavailable." },
        { status: 503 },
      );
    const { id } = await params;
    const result = await playable(id);
    if (!result)
      return Response.json(
        { error: "This episode is not available yet." },
        { status: 404 },
      );
    const mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
      jwtSigningKey: process.env.MUX_SIGNING_KEY_ID,
      jwtPrivateKey: process.env.MUX_SIGNING_PRIVATE_KEY,
    });
    const asset = await mux.video.assets.retrieve(result.video.asset_id);
    if (asset.status !== "ready")
      return Response.json(
        { error: "This episode is still processing." },
        { status: 409 },
      );
    const publicId = asset.playback_ids?.find((id) => id.policy === "public");
    if (publicId)
      return Response.json(
        { playbackId: publicId.id },
        { headers: { "Cache-Control": "no-store" } },
      );
    if (!process.env.MUX_SIGNING_KEY_ID || !process.env.MUX_SIGNING_PRIVATE_KEY)
      return Response.json(
        {
          error: "Secure playback is being configured. Please try again later.",
        },
        { status: 503 },
      );
    const playbackId = signedPlaybackId(asset);
    if (!playbackId)
      return Response.json(
        { error: "This video is being prepared for secure playback." },
        { status: 503 },
      );
    const [video, thumbnail, storyboard] = await Promise.all(
      ["video", "thumbnail", "storyboard"].map((type) =>
        mux.jwt.signPlaybackId(playbackId, {
          type: type as "video" | "thumbnail" | "storyboard",
          expiration: "1h",
        }),
      ),
    );
    return Response.json(
      {
        playbackId,
        tokens: { playback: video, thumbnail, storyboard },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return publicError(e);
  }
}
