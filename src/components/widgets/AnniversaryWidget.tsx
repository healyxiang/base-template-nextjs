"use client"

import React, { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { useStore } from "@/store/zen-store"

interface AnniversaryWidgetProps {
  content: { date: string; label: string }
  onUpdate: (content: { date: string; label: string }) => void
}

export const AnniversaryWidget: React.FC<AnniversaryWidgetProps> = ({ content, onUpdate }) => {
  const t = useTranslations()
  const locale = useLocale()
  const isDark = useStore((s) => s.theme === "dark")
  const [isEditing, setIsEditing] = useState(false)

  const [localLabel, setLocalLabel] = useState(content.label)
  const [localDate, setLocalDate] = useState(content.date)

  useEffect(() => {
    if (isEditing) {
      setLocalLabel(content.label)
      setLocalDate(content.date)
    }
  }, [isEditing, content])

  const stats = useMemo(() => {
    const target = new Date(content.date)
    const now = new Date()
    target.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)

    const diffTime = now.getTime() - target.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    return {
      days: Math.abs(diffDays),
      isFuture: diffDays < 0,
      isToday: diffDays === 0,
    }
  }, [content.date])

  const handleDone = () => {
    onUpdate({ label: localLabel, date: localDate })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const clearLabel = () => setLocalLabel("")

  return (
    <div className="flex flex-col items-center justify-center p-5 w-full h-full text-center relative group">
      {isEditing ? (
        <div className="flex flex-col gap-3 w-full animate-in fade-in zoom-in duration-200">
          <div className="relative w-full group/input">
            <input
              type="text"
              value={localLabel}
              onChange={(e) => setLocalLabel(e.target.value)}
              placeholder={t("anniversary.eventName")}
              className={`w-full bg-transparent border-b text-center outline-none py-1 pr-6 text-sm font-medium transition-colors
                ${
                  isDark
                    ? "border-slate-700 text-white focus:border-indigo-500"
                    : "border-slate-200 text-slate-800 focus:border-indigo-400"
                }`}
            />
            {localLabel && (
              <button
                onClick={clearLabel}
                className={`absolute right-0 top-1.5 opacity-40 hover:opacity-100 transition-opacity
                  ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                <i className="fas fa-circle-xmark text-xs"></i>
              </button>
            )}
          </div>

          <div className="relative w-full">
            <input
              type="date"
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
              className={`w-full bg-transparent border-b text-center outline-none py-1 text-sm transition-colors
                ${
                  isDark
                    ? "border-slate-700 text-slate-300 focus:border-indigo-500"
                    : "border-slate-200 text-slate-600 focus:border-indigo-400"
                }`}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCancel}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors
                ${
                  isDark
                    ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
            >
              {t("anniversary.cancel")}
            </button>
            <button
              onClick={handleDone}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95
                ${
                  isDark
                    ? "bg-indigo-600 text-white shadow-indigo-900/40"
                    : "bg-slate-900 text-white shadow-slate-200"
                }`}
            >
              {t("anniversary.done")}
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer flex flex-col items-center"
        >
          <div
            className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-1 opacity-60
            ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {content.label}
          </div>

          <div className="relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-5xl font-black tabular-nums tracking-tighter
                ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
            >
              {stats.days}
            </motion.div>

            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-2 -right-4"
            >
              <i
                className={`fas ${
                  stats.isFuture ? "fa-calendar-day" : "fa-heart"
                } text-[10px] opacity-40
                ${isDark ? "text-indigo-300" : "text-indigo-500"}`}
              />
            </motion.div>
          </div>

          <div
            className={`mt-1 text-[11px] font-bold uppercase tracking-widest
            ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            {stats.isToday
              ? t("anniversary.today")
              : stats.isFuture
              ? t("anniversary.daysLeft")
              : t("anniversary.daysSince")}
          </div>

          <div
            className={`mt-4 text-[9px] font-medium opacity-30
            ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {new Date(content.date).toLocaleDateString(locale, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      )}

      {!isEditing && (
        <div
          className={`absolute bottom-2 opacity-0 group-hover:opacity-40 transition-opacity text-[8px] uppercase font-bold
          ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {t("anniversary.clickEdit")}
        </div>
      )}
    </div>
  )
}
