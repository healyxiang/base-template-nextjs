"use client"

import React, { useState, useEffect } from "react"
import { useLocale } from "next-intl"
import { useStore } from "@/store/zen-store"

export const ClockWidget: React.FC = () => {
  const locale = useLocale()
  const [time, setTime] = useState(new Date())
  const isDark = useStore((s) => s.theme === "dark")

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatLunarDate = (date: Date) => {
    try {
      const lunarLocale = locale === "zh" ? "zh-u-ca-chinese" : "en-u-ca-chinese"
      const options: Intl.DateTimeFormatOptions =
        locale === "zh" ? { month: "long", day: "numeric" } : { month: "narrow", day: "numeric" }

      const lunarString = new Intl.DateTimeFormat(lunarLocale, options).format(date)

      if (locale === "zh") {
        return `农历 ${lunarString}`
      } else {
        return `Lunar ${lunarString}`
      }
    } catch (e) {
      return ""
    }
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 w-full h-full transition-colors
      ${isDark ? "text-amber-100/90" : "text-amber-900/80"}`}
    >
      <div
        className={`text-5xl font-light tracking-widest tabular-nums leading-none ${
          isDark ? "text-amber-400" : "text-amber-600"
        }`}
      >
        {formatTime(time)}
      </div>

      <div className="flex flex-col items-center mt-4 gap-1">
        <div
          className={`text-[10px] uppercase tracking-[0.2em] font-bold
          ${isDark ? "text-amber-700/80" : "text-amber-400"}`}
        >
          {formatDate(time)}
        </div>

        <div
          className={`text-[11px] font-medium opacity-60 italic
          ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {formatLunarDate(time)}
        </div>
      </div>
    </div>
  )
}
