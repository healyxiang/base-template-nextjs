"use client"

import React, { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { useStore } from "@/store/zen-store"

const MOODS = [
  { emoji: "😊", key: "great", color: "bg-emerald-500" },
  { emoji: "😐", key: "fine", color: "bg-blue-500" },
  { emoji: "😔", key: "down", color: "bg-indigo-500" },
  { emoji: "😴", key: "tired", color: "bg-amber-500" },
  { emoji: "😤", key: "stressed", color: "bg-rose-500" },
]

interface MoodWidgetProps {
  history: string[]
  onUpdate: (history: string[]) => void
}

export const MoodWidget: React.FC<MoodWidgetProps> = ({ history = [], onUpdate }) => {
  const t = useTranslations()
  const isDark = useStore((s) => s.theme === "dark")

  const logMood = (emoji: string) => {
    const newHistory = Array.isArray(history) ? [...history] : []
    newHistory.push(emoji)
    onUpdate(newHistory)
  }

  const gridInfo = useMemo(() => {
    const safeHistory = Array.isArray(history) ? history : []
    const gridWidth = 7
    const neededCells = safeHistory.length + 1
    const rows = Math.max(4, Math.ceil(neededCells / gridWidth))
    const totalCells = rows * gridWidth

    return {
      totalCells,
      safeHistory,
    }
  }, [history])

  const cells = Array.from({ length: gridInfo.totalCells }).map((_, i) => {
    const moodEmoji = gridInfo.safeHistory[i]
    const moodObj = moodEmoji ? MOODS.find((m) => m.emoji === moodEmoji) : null
    return {
      index: i,
      mood: moodObj,
      filled: !!moodObj,
    }
  })

  return (
    <div className="flex flex-col items-center justify-between p-4 w-full h-full overflow-hidden">
      <div className="w-full shrink-0">
        <div
          className={`text-[9px] uppercase font-bold tracking-widest mb-3 opacity-50 text-center
          ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {t("mood.question")}
        </div>
        <div className="flex justify-between gap-1">
          {MOODS.map((m) => (
            <button
              key={m.emoji}
              title={t(`mood.${m.key}`)}
              onClick={() => logMood(m.emoji)}
              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-90 hover:bg-black/5
                ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
            >
              <span className="text-xl drop-shadow-sm">{m.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full mt-4 flex-1 overflow-y-auto scrollbar-hide pr-1">
        <div
          className={`text-[9px] uppercase font-bold tracking-widest mb-2 opacity-30 text-center
          ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {t("mood.recent")}
        </div>
        <div className="grid grid-cols-7 gap-1 px-1">
          {cells.map((cell) => (
            <motion.div
              key={cell.index}
              initial={cell.filled ? { scale: 0.8, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              className={`aspect-square rounded-[4px] transition-colors duration-300
                ${cell.mood ? cell.mood.color : isDark ? "bg-slate-800/60" : "bg-slate-100/80"}`}
            />
          ))}
        </div>
      </div>

      {Array.isArray(history) && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-12 right-6 pointer-events-none"
        >
          <i className="fas fa-sparkle text-[8px] text-emerald-400 animate-ping" />
        </motion.div>
      )}
    </div>
  )
}
