"use client"

import React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useStore } from "@/store/zen-store"

interface WaterWidgetProps {
  level: number
  onUpdate: (newLevel: number) => void
}

export const WaterWidget: React.FC<WaterWidgetProps> = ({ level = 0, onUpdate }) => {
  const t = useTranslations()
  const goal = 8
  const percentage = Math.min((level / goal) * 100, 100)
  const isDark = useStore((s) => s.theme === "dark")

  return (
    <div className="flex flex-col items-center gap-4 p-5 w-full h-full justify-center">
      <div
        className={`relative w-20 h-20 rounded-full border-4 overflow-hidden transition-colors
        ${isDark ? "border-sky-900/50 bg-slate-900/40" : "border-sky-100 bg-sky-50/30"}`}
      >
        <motion.div
          className={`absolute bottom-0 left-0 right-0 ${
            isDark ? "bg-sky-600/60" : "bg-sky-400/60"
          }`}
          animate={{ height: `${percentage}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 60 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-300/40 -translate-y-0.5" />
        </motion.div>
        <div
          className={`absolute inset-0 flex items-center justify-center font-bold transition-colors text-sm
          ${isDark ? "text-white" : "text-sky-900"}`}
        >
          {level}/{goal}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onUpdate(level + 1)}
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all active:scale-90 shadow-md"
        >
          <i className="fas fa-plus"></i>
        </button>
        <button
          onClick={() => onUpdate(0)}
          className={`rounded-full w-9 h-9 flex items-center justify-center transition-all active:scale-90
            ${
              isDark
                ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                : "bg-sky-100 text-sky-600 hover:bg-sky-200"
            }`}
        >
          <i className="fas fa-redo-alt text-xs"></i>
        </button>
      </div>
      <p
        className={`text-[10px] font-medium transition-colors ${
          isDark ? "text-slate-500" : "text-sky-400"
        }`}
      >
        {t("water.goal", { count: goal })}
      </p>
    </div>
  )
}
