/** ImageKit-only transforms; remote-provider, signed and local preview URLs stay intact. */
export type ArtworkKind = "banner" | "poster" | "thumbnail";
const dimensions = {
  banner: [1920, 1080],
  poster: [600, 900],
  thumbnail: [640, 360],
} as const;
export function artworkUrl(source: string, kind: ArtworkKind, width: number) {
  try {
    const url = new URL(source);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "ik.imagekit.io" ||
      url.searchParams.has("ik-s")
    )
      return source;
    const [baseWidth, baseHeight] = dimensions[kind];
    const height = Math.round((width * baseHeight) / baseWidth);
    const resize =
      kind === "banner"
        ? "cm-pad_resize,bg-192321"
        : "c-maintain_ratio,fo-auto";
    url.searchParams.set("tr", `w-${width},h-${height},${resize},q-85,f-auto`);
    return url.toString();
  } catch {
    return source;
  }
}
export function artwork(source: string, kind: ArtworkKind, sizes: string) {
  const [width, height] = dimensions[kind];
  const widths =
    kind === "banner"
      ? [480, 768, 1200, 1600, 1920]
      : kind === "poster"
        ? [160, 320, 480, 600, 900]
        : [160, 320, 640, 960];
  const src = artworkUrl(source, kind, width);
  return {
    src,
    width,
    height,
    sizes,
    srcSet:
      src === source
        ? undefined
        : widths.map((w) => `${artworkUrl(source, kind, w)} ${w}w`).join(", "),
  };
}
