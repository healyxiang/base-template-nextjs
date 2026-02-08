"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { useStore } from "@/store/zen-store"

const TRACKS = [
  {
    id: "rain",
    key: "rain",
    icon: "cloud-showers-heavy",
    color: "text-blue-400",
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_5b3068e82a.mp3",
  },
  {
    id: "forest",
    key: "forest",
    icon: "tree",
    color: "text-emerald-400",
    url: "https://cdn.pixabay.com/audio/2022/01/21/audio_73147814b7.mp3",
  },
  {
    id: "zen",
    key: "zen",
    icon: "om",
    color: "text-amber-400",
    url: "https://cdn.pixabay.com/audio/2023/06/15/audio_83d265a04e.mp3",
  },
  {
    id: "cafe",
    key: "cafe",
    icon: "coffee",
    color: "text-orange-400",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_b7228a0e8c.mp3",
  },
  {
    id: "piano",
    key: "piano",
    icon: "music",
    color: "text-indigo-400",
    url: "https://cdn.pixabay.com/audio/2024/02/06/audio_981977b212.mp3",
  },
  {
    id: "waves",
    key: "waves",
    icon: "water",
    color: "text-cyan-400",
    url: "https://cdn.pixabay.com/audio/2022/01/18/audio_650630fa27.mp3",
  },
]

export const FocusMusicWidget: React.FC<{
  content: any
  onUpdate: (val: any) => void
}> = ({ content, onUpdate }) => {
  const t = useTranslations()
  const isDark = useStore((s) => s.theme === "dark")
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const trackIndex = content.trackIndex || 0
  const currentTrack = TRACKS[trackIndex]

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.url)
      audioRef.current.loop = true
    } else {
      audioRef.current.src = currentTrack.url
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false))
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [trackIndex])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  const togglePlay = () => setIsPlaying(!isPlaying)

  const nextTrack = () => {
    onUpdate({
      ...content,
      trackIndex: (trackIndex + 1) % TRACKS.length,
    })
  }

  const prevTrack = () => {
    onUpdate({
      ...content,
      trackIndex: (trackIndex - 1 + TRACKS.length) % TRACKS.length,
    })
  }

  return (
    <div className="flex flex-col items-center justify-center p-5 w-full h-full text-center">
      <div
        className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-4 opacity-50 transition-colors
        ${isDark ? "text-indigo-400" : "text-indigo-500"}`}
      >
        Zen Focus Player
      </div>

      <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTrack.id}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-colors
              ${isDark ? "bg-slate-800" : "bg-white"}`}
          >
            <i className={`fas fa-${currentTrack.icon} text-3xl ${currentTrack.color}`} />
          </motion.div>
        </AnimatePresence>

        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [10, 30, 15, 40, 10] }}
                transition={{
                  duration: 0.6 + i * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`w-1 rounded-full opacity-30 ${currentTrack.color.replace(
                  "text",
                  "bg"
                )}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4
          className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}
        >
          {t(`music.${currentTrack.key}`)}
        </h4>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={prevTrack}
          className={`text-lg transition-colors ${
            isDark ? "text-slate-600 hover:text-white" : "text-slate-300 hover:text-slate-700"
          }`}
        >
          <i className="fas fa-step-backward" />
        </button>

        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl
            ${
              isDark
                ? "bg-indigo-600 text-white shadow-indigo-900/40"
                : "bg-indigo-500 text-white shadow-indigo-200"
            }`}
        >
          <i className={`fas fa-${isPlaying ? "pause" : "play"} text-sm ${!isPlaying && "ml-1"}`} />
        </button>

        <button
          onClick={nextTrack}
          className={`text-lg transition-colors ${
            isDark ? "text-slate-600 hover:text-white" : "text-slate-300 hover:text-slate-700"
          }`}
        >
          <i className="fas fa-step-forward" />
        </button>
      </div>
    </div>
  )
}
