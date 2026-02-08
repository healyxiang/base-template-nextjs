"use client"

import React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import type { WidgetType } from "@/types/zen"
import { useStore } from "@/store/zen-store"

interface WidgetPickerProps {
  position: { x: number; y: number } | null
  onSelect: (type: WidgetType) => void
  onClose: () => void
}

const WIDGETS: {
  type: WidgetType
  icon: string
  key: string
  color: string
  darkColor: string
}[] = [
  {
    type: "todo",
    icon: "list-check",
    key: "todo",
    color: "bg-indigo-100 text-indigo-600",
    darkColor: "bg-indigo-900/40 text-indigo-400",
  },
  {
    type: "worldClock",
    icon: "globe",
    key: "worldClock",
    color: "bg-amber-100 text-amber-600",
    darkColor: "bg-amber-900/40 text-amber-400",
  },
  {
    type: "foodPicker",
    icon: "utensils",
    key: "foodPicker",
    color: "bg-orange-100 text-orange-600",
    darkColor: "bg-orange-900/40 text-orange-400",
  },
  {
    type: "qrCode",
    icon: "qrcode",
    key: "qrCode",
    color: "bg-slate-100 text-slate-600",
    darkColor: "bg-slate-800 text-slate-300",
  },
  {
    type: "focusMusic",
    icon: "headphones",
    key: "focusMusic",
    color: "bg-indigo-100 text-indigo-600",
    darkColor: "bg-indigo-900/40 text-indigo-400",
  },
  {
    type: "pomodoro",
    icon: "stopwatch-20",
    key: "pomodoro",
    color: "bg-rose-100 text-rose-600",
    darkColor: "bg-rose-900/40 text-rose-400",
  },
  {
    type: "bookmark",
    icon: "bookmark",
    key: "bookmark",
    color: "bg-emerald-100 text-emerald-600",
    darkColor: "bg-emerald-900/40 text-emerald-400",
  },
  {
    type: "anniversary",
    icon: "heart",
    key: "anniversary",
    color: "bg-indigo-100 text-indigo-600",
    darkColor: "bg-indigo-900/40 text-indigo-400",
  },
  {
    type: "timer",
    icon: "clock",
    key: "timer",
    color: "bg-amber-100 text-amber-600",
    darkColor: "bg-amber-900/40 text-amber-400",
  },
  {
    type: "companion",
    icon: "sparkles",
    key: "companion",
    color: "bg-pink-100 text-pink-600",
    darkColor: "bg-pink-900/40 text-pink-400",
  },
  {
    type: "breath",
    icon: "wind",
    key: "breath",
    color: "bg-teal-100 text-teal-600",
    darkColor: "bg-teal-900/40 text-teal-400",
  },
  {
    type: "mood",
    icon: "face-smile",
    key: "mood",
    color: "bg-cyan-100 text-cyan-600",
    darkColor: "bg-cyan-900/40 text-cyan-400",
  },
  {
    type: "yearCounter",
    icon: "hourglass-half",
    key: "yearCounter",
    color: "bg-orange-100 text-orange-600",
    darkColor: "bg-orange-900/40 text-orange-400",
  },
  {
    type: "countdown",
    icon: "stopwatch",
    key: "countdown",
    color: "bg-violet-100 text-violet-600",
    darkColor: "bg-violet-900/40 text-violet-400",
  },
  {
    type: "water",
    icon: "droplet",
    key: "water",
    color: "bg-blue-100 text-blue-600",
    darkColor: "bg-blue-900/40 text-blue-400",
  },
  {
    type: "note",
    icon: "note-sticky",
    key: "note",
    color: "bg-emerald-100 text-emerald-600",
    darkColor: "bg-emerald-900/40 text-emerald-400",
  },
]

export const WidgetPicker: React.FC<WidgetPickerProps> = ({ position, onSelect, onClose }) => {
  const t = useTranslations()
  const isDark = useStore((s) => s.theme === "dark")
  if (!position) return null

  return (
    <div className="fixed inset-0 z-[999]" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`absolute backdrop-blur-2xl border rounded-[32px] p-4 shadow-2xl flex flex-col gap-3 w-[440px] transition-colors
          ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-white"}`}
        style={{ left: position.x, top: position.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-2 pb-2 border-b flex flex-col gap-0.5
          ${isDark ? "border-slate-800/50" : "border-slate-100"}`}
        >
          <div
            className={`text-[10px] font-bold uppercase tracking-widest
            ${isDark ? "text-indigo-400" : "text-indigo-500"}`}
          >
            {t("app.addWidget")}
          </div>
          <div
            className={`text-[9px] font-medium opacity-50
            ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {t("app.widgetCount", { count: WIDGETS.length })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 overflow-hidden">
          {WIDGETS.map((w, index) => (
            <button
              key={w.type}
              onClick={() => {
                onSelect(w.type)
                onClose()
              }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl transition-all group active:scale-95
                ${
                  isDark
                    ? "hover:bg-slate-800/50"
                    : "hover:bg-slate-50 border border-transparent hover:border-slate-100"
                }`}
            >
              <div
                className={`text-[10px] font-black tabular-nums opacity-20 group-hover:opacity-40 transition-opacity w-4
                ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                {(index + 1).toString().padStart(2, "0")}
              </div>

              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  isDark ? w.darkColor : w.color
                }`}
              >
                <i className={`fas fa-${w.icon} text-xs`}></i>
              </div>

              <span
                className={`text-xs font-semibold transition-colors text-left truncate flex-1 ${
                  isDark ? "text-slate-300 group-hover:text-white" : "text-slate-700"
                }`}
              >
                {t(`widgets.${w.key}`)}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
