"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useStore } from "@/store/zen-store"

export const YearCounterWidget: React.FC = () => {
  const t = useTranslations()
  const isDark = useStore((s) => s.theme === "dark")

  const stats = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const start = new Date(year, 0, 1)
    const end = new Date(year + 1, 0, 1)

    const totalMs = end.getTime() - start.getTime()
    const passedMs = now.getTime() - start.getTime()

    const percentage = (passedMs / totalMs) * 100
    const daysPassed = Math.floor(passedMs / (1000 * 60 * 60 * 24))
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24))

    return {
      year,
      daysPassed,
      totalDays,
      percentage: percentage.toFixed(2),
      remaining: totalDays - daysPassed,
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full text-center">
      <div
        className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-2 transition-colors
        ${isDark ? "text-orange-500/80" : "text-orange-400"}`}
      >
        {stats.year} {t("year.timeline")}
      </div>

      <div className="relative w-full max-w-[140px] aspect-square flex items-center justify-center mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className={isDark ? "text-slate-800" : "text-orange-50"}
          />
          <motion.circle
            cx="70"
            cy="70"
            r="60"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={377}
            initial={{ strokeDashoffset: 377 }}
            animate={{
              strokeDashoffset: 377 - (377 * parseFloat(stats.percentage)) / 100,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className={isDark ? "text-orange-500" : "text-orange-500"}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-2xl font-bold tabular-nums tracking-tighter
            ${isDark ? "text-white" : "text-slate-800"}`}
          >
            {stats.percentage}%
          </span>
          <span
            className={`text-[9px] uppercase font-medium opacity-60
            ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {t("year.completed")}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
          {t("year.day", { count: stats.daysPassed })}{" "}
          <span className="font-normal opacity-50">/ {stats.totalDays}</span>
        </div>
        <div className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {t("year.remaining", {
            count: stats.remaining,
            year: stats.year + 1,
          })}
        </div>
      </div>
    </div>
  )
}
