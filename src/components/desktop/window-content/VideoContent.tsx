"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { VolumeX, RotateCcw } from "lucide-react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";

export const STREAM_TIME_UPDATE_EVENT = "lt:stream-timeupdate";

export function VideoContent({
  timestamp = "01:56",
  caption,
  posterUrl,
  videoUrl,
  allowUnmute = true,
  broadcastTimeUpdates = false,
  loop = true,
}: {
  timestamp?: string;
  caption?: string;
  posterUrl?: string;
  videoUrl?: string;
  allowUnmute?: boolean;
  broadcastTimeUpdates?: boolean;
  loop?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [ended, setEnded] = useState(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      if (video.duration) setProgress(video.currentTime / video.duration);
      if (broadcastTimeUpdates) {
        window.dispatchEvent(
          new CustomEvent(STREAM_TIME_UPDATE_EVENT, {
            detail: video.currentTime,
          })
        );
      }
    };
    const onEnded = () => setEnded(true);
    const onPlay = () => setEnded(false);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
    };
  }, [broadcastTimeUpdates]);

  function seekFromClientX(clientX: number) {
    const track = trackRef.current;
    const video = videoRef.current;
    if (!track || !video || !video.duration) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgress(ratio);
  }

  function handleUnmute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    void video.play();
  }

  function togglePlayPause() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  function handlePlayAgain() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setEnded(false);
    void video.play();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-lt-gray">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              autoPlay
              muted={muted}
              loop={loop}
              playsInline
              onClick={togglePlayPause}
              className={`h-full w-full cursor-pointer object-cover ${ended ? "blur-md" : ""}`}
            />

            {muted && allowUnmute && !ended && (
              <button
                type="button"
                onClick={handleUnmute}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
              >
                <span className={`${PRIMARY_BUTTON_CLASS} flex items-center gap-2`}>
                  <VolumeX className="h-4 w-4" strokeWidth={2.5} />
                  Unmute to begin stream
                </span>
              </button>
            )}

            <div
              ref={trackRef}
              onPointerDown={(e) => {
                draggingRef.current = true;
                seekFromClientX(e.clientX);
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (draggingRef.current) seekFromClientX(e.clientX);
              }}
              onPointerUp={() => {
                draggingRef.current = false;
              }}
              className="absolute inset-x-0 bottom-0 h-2 cursor-pointer touch-none bg-black/40"
            >
              <div
                className="h-full bg-lt-yellow"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {ended && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/50">
                <span className="text-sm font-bold uppercase tracking-wide text-white">
                  Stream Ended
                </span>
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className={`${PRIMARY_BUTTON_CLASS} flex items-center gap-2`}
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
                  Play again
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {posterUrl && (
              <Image src={posterUrl} alt="" fill className="object-cover" sizes="260px" />
            )}
            <svg
              viewBox="0 0 24 24"
              className="relative z-10 h-10 w-10 text-black/25"
              fill="currentColor"
            >
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          </>
        )}
      </div>
      {!videoUrl && (
        <div className="shrink-0 p-3">
          <div className="flex h-9 items-center rounded-full bg-lt-gray px-4">
            <span className="shrink-0 text-micro text-black/50">{timestamp}</span>
            <div className="relative ml-3 h-[2px] flex-1 rounded-full bg-black/20">
              <span className="absolute left-1/3 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lt-red" />
            </div>
          </div>
        </div>
      )}
      {caption && (
        <p className="shrink-0 px-3 pb-3 text-center text-micro text-black/60">
          {caption}
        </p>
      )}
    </div>
  );
}
