"use client";
import { useEffect, useState } from "react";
import type MuxPlayerElement from "@mux/mux-player";
import { Languages } from "lucide-react";
export default function AudioLanguage({
  player,
}: {
  player: MuxPlayerElement | null;
}) {
  const [tracks, setTracks] = useState<
    { index: number; label: string; enabled: boolean }[]
  >([]);
  useEffect(() => {
    if (!player) return;
    let observed: typeof player.audioTracks | undefined;
    const events = ["addtrack", "removetrack", "change"];
    function sync() {
      if (!player) return;
      const list = player.audioTracks;
      if (list !== observed) {
        events.forEach((event) => observed?.removeEventListener(event, sync));
        observed = list;
        events.forEach((event) => observed?.addEventListener(event, sync));
      }
      setTracks(
        Array.from({ length: list?.length || 0 }, (_, index) => {
          const track = list[index];
          let language = track.language;
          try {
            language = language
              ? new Intl.DisplayNames(["en"], { type: "language" }).of(
                  language,
                ) || language
              : "";
          } catch {}
          return {
            index,
            label: track.label || language || `Audio ${index + 1}`,
            enabled: track.enabled,
          };
        }),
      );
    }
    sync();
    player.addEventListener("loadedmetadata", sync);
    player.addEventListener("loadstart", sync);
    player.addEventListener("canplay", sync);
    return () => {
      events.forEach((event) => observed?.removeEventListener(event, sync));
      player.removeEventListener("loadedmetadata", sync);
      player.removeEventListener("loadstart", sync);
      player.removeEventListener("canplay", sync);
    };
  }, [player]);
  if (tracks.length < 2) return null;
  return (
    <label className="audio-language-control">
      <Languages size={16} />
      <span>Audio language</span>
      <select
        aria-label="Audio language"
        value={tracks.find((track) => track.enabled)?.index ?? 0}
        onChange={(event) => {
          const list = player?.audioTracks;
          if (!list) return;
          const selected = Number(event.target.value);
          for (let index = 0; index < list.length; index++)
            list[index].enabled = index === selected;
          setTracks((current) =>
            current.map((track) => ({
              ...track,
              enabled: track.index === selected,
            })),
          );
        }}
      >
        {tracks.map((track) => (
          <option key={track.index} value={track.index}>
            {track.label}
          </option>
        ))}
      </select>
    </label>
  );
}
