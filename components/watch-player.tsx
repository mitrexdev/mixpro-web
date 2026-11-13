"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  readProgress,
  saveProgress,
  removeProgress,
  resumePosition,
} from "@/lib/watch-progress";
import AudioLanguage from "./audio-language";
import type MuxPlayerElement from "@mux/mux-player";
import { RefreshCw } from "lucide-react";
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});
type Playback = {
  playbackId: string;
  tokens?: { playback: string; thumbnail: string; storyboard: string };
};
export default function WatchPlayer({
  episodeId,
  title,
}: {
  episodeId: string;
  title: string;
}) {
  const [player, setPlayer] = useState<MuxPlayerElement | null>(null);
  const [data, setData] = useState<Playback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const eventId = useRef("");
  const eventStarted = useRef(false);
  const playing = useRef(false);
  const seconds = useRef(0);
  const lastTick = useRef(0);
  useEffect(() => {
    if (!player) return;
    let restored = false;
    let hasPlayed = false;
    let lastSaved = 0;
    function restore() {
      if (
        restored ||
        !player ||
        !Number.isFinite(player.duration) ||
        player.duration <= 0
      )
        return;
      const saved = readProgress().find((item) => item.id === episodeId);
      if (saved) {
        const position = resumePosition(saved.position, player.duration);
        if (position > 0) player.currentTime = position;
      }
      restored = true;
    }
    function persist(force = false) {
      if (!player || !restored || !hasPlayed) return;
      const now = Date.now();
      if (!force && now - lastSaved < 5000) return;
      lastSaved = now;
      saveProgress(episodeId, player.currentTime, player.duration);
    }
    const play = () => {
      restore();
      hasPlayed = true;
    };
    const update = () => persist();
    const pause = () => persist(true);
    const ended = () => {
      hasPlayed = false;
      removeProgress(episodeId);
    };
    const hidden = () => {
      if (document.hidden) persist(true);
    };
    restore();
    player.addEventListener("loadedmetadata", restore);
    player.addEventListener("durationchange", restore);
    player.addEventListener("play", play);
    player.addEventListener("timeupdate", update);
    player.addEventListener("pause", pause);
    player.addEventListener("seeked", pause);
    player.addEventListener("ended", ended);
    window.addEventListener("pagehide", pause);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      persist(true);
      player.removeEventListener("loadedmetadata", restore);
      player.removeEventListener("durationchange", restore);
      player.removeEventListener("play", play);
      player.removeEventListener("timeupdate", update);
      player.removeEventListener("pause", pause);
      player.removeEventListener("seeked", pause);
      player.removeEventListener("ended", ended);
      window.removeEventListener("pagehide", pause);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [player, episodeId]);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetch(`/api/playback/${episodeId}`, {
        cache: "no-store",
      });
      const body = await result.json();
      if (!result.ok) throw Error(body.error);
      setData(body);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [episodeId]);
  useEffect(() => {
    eventId.current = crypto.randomUUID();
    void load();
  }, [load]);
  useEffect(() => {
    if (!data) return;
    const renewal = setInterval(() => {
      void load();
    }, 50 * 60000);
    return () => clearInterval(renewal);
  }, [data, load]);
  function tick() {
    const now = performance.now();
    if (playing.current && lastTick.current)
      seconds.current += Math.min((now - lastTick.current) / 1000, 20);
    lastTick.current = now;
  }
  const flush = useCallback(() => {
    if (eventStarted.current)
      void fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId.current,
          seconds: Math.floor(seconds.current),
        }),
        keepalive: true,
      }).catch(() => {});
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      tick();
      flush();
    }, 15000);
    const leave = () => {
      tick();
      flush();
    };
    window.addEventListener("pagehide", leave);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [flush]);
  async function start() {
    playing.current = true;
    lastTick.current = performance.now();
    if (eventStarted.current) return;
    eventStarted.current = true;
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventId.current, episodeId }),
      });
      if (!response.ok) eventStarted.current = false;
    } catch {
      eventStarted.current = false;
    }
  }
  if (loading && !data)
    return (
      <div
        className="player-placeholder skeleton"
        role="status"
        aria-label="Loading video"
      >
        <div className="player-loading-label">
          <span />
          Getting your episode ready
        </div>
      </div>
    );
  if (error && !data)
    return (
      <div className="player-gate">
        <h2>We couldn’t start this episode.</h2>
        <p>{error}</p>
        <button className="button button-light" onClick={load}>
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    );
  return (
    <div className="watch-player-shell">
      <div className="watch-video">
        {data && (
          <MuxPlayer
            ref={setPlayer}
            playbackId={data.playbackId}
            tokens={data.tokens}
            streamType="on-demand"
            metadata={{ video_title: title }}
            onPlay={() => void start()}
            onPause={() => {
              tick();
              playing.current = false;
              flush();
            }}
            onEnded={() => {
              tick();
              playing.current = false;
              flush();
            }}
          />
        )}
      </div>
      <AudioLanguage player={player} />
    </div>
  );
}
