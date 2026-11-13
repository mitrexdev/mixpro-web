export function signedPlaybackId(asset: {
  status?: string;
  playback_ids?: { id: string; policy: string }[];
}): string | null {
  if (
    asset.status !== "ready" ||
    asset.playback_ids?.some((p) => p.policy === "public")
  )
    return null;
  return asset.playback_ids?.find((p) => p.policy === "signed")?.id || null;
}
