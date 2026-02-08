"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { useStore } from "@/store/zen-store"
import type { WorldCity } from "@/types/zen"

const CITY_OPTIONS: WorldCity[] = [
  { id: "beijing", name: "Beijing", nameZh: "北京", timezone: "Asia/Shanghai" },
  {
    id: "newyork",
    name: "New York",
    nameZh: "纽约",
    timezone: "America/New_York",
  },
  { id: "london", name: "London", nameZh: "伦敦", timezone: "Europe/London" },
  { id: "tokyo", name: "Tokyo", nameZh: "东京", timezone: "Asia/Tokyo" },
  { id: "paris", name: "Paris", nameZh: "巴黎", timezone: "Europe/Paris" },
  { id: "dubai", name: "Dubai", nameZh: "迪拜", timezone: "Asia/Dubai" },
  {
    id: "singapore",
    name: "Singapore",
    nameZh: "新加坡",
    timezone: "Asia/Singapore",
  },
  {
    id: "sydney",
    name: "Sydney",
    nameZh: "悉尼",
    timezone: "Australia/Sydney",
  },
  { id: "berlin", name: "Berlin", nameZh: "柏林", timezone: "Europe/Berlin" },
  { id: "mumbai", name: "Mumbai", nameZh: "孟买", timezone: "Asia/Kolkata" },
  { id: "seoul", name: "Seoul", nameZh: "首尔", timezone: "Asia/Seoul" },
  {
    id: "moscow",
    name: "Moscow",
    nameZh: "莫斯科",
    timezone: "Europe/Moscow",
  },
  {
    id: "saopaulo",
    name: "Sao Paulo",
    nameZh: "圣保罗",
    timezone: "America/Sao_Paulo",
  },
  { id: "cairo", name: "Cairo", nameZh: "开罗", timezone: "Africa/Cairo" },
  {
    id: "la",
    name: "Los Angeles",
    nameZh: "洛杉矶",
    timezone: "America/Los_Angeles",
  },
  {
    id: "hongkong",
    name: "Hong Kong",
    nameZh: "香港",
    timezone: "Asia/Hong_Kong",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    nameZh: "曼谷",
    timezone: "Asia/Bangkok",
  },
  {
    id: "toronto",
    name: "Toronto",
    nameZh: "多伦多",
    timezone: "America/Toronto",
  },
  {
    id: "mexicocity",
    name: "Mexico City",
    nameZh: "墨西哥城",
    timezone: "America/Mexico_City",
  },
  {
    id: "capetown",
    name: "Cape Town",
    nameZh: "开普敦",
    timezone: "Africa/Johannesburg",
  },
]

export const WorldClockWidget: React.FC<{
  content: WorldCity[]
  onUpdate: (val: WorldCity[]) => void
}> = ({ content = [], onUpdate }) => {
  const t = useTranslations()
  const locale = useLocale()
  const isDark = useStore((s) => s.theme === "dark")
  const [now, setNow] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (timezone: string) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now)
  }

  const addCity = (city: WorldCity) => {
    if (!content.some((c) => c.id === city.id)) {
      onUpdate([...content, city])
    }
    setShowPicker(false)
  }

  const removeCity = (cityId: string) => {
    onUpdate(content.filter((c) => c.id !== cityId))
  }

  return (
    <div className="flex flex-col w-full h-full p-4 overflow-hidden relative">
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-1">
        <div className="grid grid-cols-2 gap-3 pb-4">
          <AnimatePresence mode="popLayout">
            {content.map((city) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all group/city min-h-[80px]
                  ${
                    isDark
                      ? "bg-slate-800/40 hover:bg-slate-800/60"
                      : "bg-white shadow-sm border border-slate-50 hover:border-slate-100"
                  }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCity(city.id)
                  }}
                  className={`absolute top-2 right-2 opacity-0 group-hover/city:opacity-100 transition-opacity p-1.5 z-20
                    ${
                      isDark
                        ? "text-slate-600 hover:text-red-400"
                        : "text-slate-300 hover:text-red-400"
                    }`}
                >
                  <i className="fas fa-xmark text-[10px]"></i>
                </button>

                <span
                  className={`text-lg font-black tabular-nums tracking-tighter leading-none ${
                    isDark ? "text-amber-400" : "text-amber-600"
                  }`}
                >
                  {formatTime(city.timezone)}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest mt-2 truncate w-full text-center
                  ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {locale === "zh" ? city.nameZh : city.name}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={() => setShowPicker(!showPicker)}
            className={`p-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all active:scale-95 min-h-[80px]
              ${
                isDark
                  ? "border-slate-800 text-slate-700 hover:border-slate-700 hover:text-slate-600"
                  : "border-slate-100 text-slate-200 hover:border-slate-200 hover:text-slate-300"
              }`}
          >
            <i className="fas fa-plus text-xs mb-1.5"></i>
            <span className="text-[8px] font-bold uppercase tracking-widest">
              {t("worldClock.addCity")}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute bottom-4 left-4 right-4 max-h-[180px] overflow-y-auto rounded-3xl p-3 z-50 shadow-2xl backdrop-blur-2xl border
              ${isDark ? "bg-slate-900/95 border-slate-700" : "bg-white/95 border-slate-100"}`}
          >
            <div className="grid grid-cols-2 gap-1.5">
              {CITY_OPTIONS.map((city) => (
                <button
                  key={city.id}
                  onClick={() => addCity(city)}
                  disabled={content.some((c) => c.id === city.id)}
                  className={`text-[9px] font-bold uppercase tracking-widest px-3 py-2.5 rounded-xl text-left transition-colors
                    ${
                      content.some((c) => c.id === city.id)
                        ? "opacity-20 cursor-not-allowed"
                        : isDark
                        ? "hover:bg-indigo-500/20 text-slate-400 hover:text-slate-100"
                        : "hover:bg-indigo-50 text-slate-600 hover:text-indigo-600"
                    }`}
                >
                  {locale === "zh" ? city.nameZh : city.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
