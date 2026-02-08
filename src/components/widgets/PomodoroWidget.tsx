"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useStore } from "@/store/zen-store"

interface PomodoroWidgetProps {
  content: {
    seconds: number
    mode: "work" | "short" | "long"
    sessions: number
  }
  onUpdate: (content: {
    seconds: number
    mode: "work" | "short" | "long"
    sessions: number
  }) => void
}

const MODES = {
  work: {
    labelKey: "pomodoro.work",
    time: 1500,
    color: "text-rose-500",
    bg: "bg-rose-500",
  },
  short: {
    labelKey: "pomodoro.shortBreak",
    time: 300,
    color: "text-emerald-500",
    bg: "bg-emerald-500",
  },
  long: {
    labelKey: "pomodoro.longBreak",
    time: 900,
    color: "text-sky-500",
    bg: "bg-sky-500",
  },
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ content, onUpdate }) => {
  const t = useTranslations()
  const isDark = useStore((s) => s.theme === "dark")
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef<number | null>(null)

  const currentMode = MODES[content.mode]

  useEffect(() => {
    if (isActive && content.seconds > 0) {
      timerRef.current = window.setInterval(() => {
        onUpdate({ ...content, seconds: content.seconds - 1 })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (content.seconds === 0 && isActive) {
        setIsActive(false)
        const nextSessions = content.mode === "work" ? content.sessions + 1 : content.sessions
        onUpdate({ ...content, sessions: nextSessions })
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, content.seconds, content.mode, content.sessions])

  const toggle = () => setIsActive(!isActive)

  const reset = () => {
    setIsActive(false)
    onUpdate({ ...content, seconds: currentMode.time })
  }

  const switchMode = (mode: "work" | "short" | "long") => {
    setIsActive(false)
    onUpdate({ ...content, mode, seconds: MODES[mode].time })
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (content.seconds / currentMode.time) * 100

  const radius = 48
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center justify-between p-5 w-full h-full text-center overflow-visible">
      <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full w-full shrink-0">
        {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 text-[9px] uppercase font-bold py-1.5 rounded-full transition-all
              ${
                content.mode === m
                  ? isDark
                    ? "bg-slate-700 text-white shadow-lg"
                    : "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-500"
              }`}
          >
            {t(MODES[m].labelKey)}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center my-4 shrink-0 overflow-visible">
        <svg viewBox="0 0 120 120" className="w-32 h-32 transform -rotate-90 overflow-visible">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className={isDark ? "text-slate-800" : "text-slate-100"}
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset: circumference - (circumference * progress) / 100,
            }}
            transition={{ duration: 1, ease: "linear" }}
            strokeLinecap="round"
            className={currentMode.color}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            key={content.seconds}
            className={`text-3xl font-black tabular-nums tracking-tighter leading-none ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            {formatTime(content.seconds)}
          </motion.span>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-40 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {t("pomodoro.sessions", { count: content.sessions })}
          </span>
        </div>
      </div>

      <div className="flex gap-4 w-full mt-2 shrink-0">
        <button
          onClick={toggle}
          className={`flex-1 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-lg
            ${
              isActive
                ? isDark
                  ? "bg-slate-700 text-white shadow-black/20"
                  : "bg-slate-200 text-slate-600 shadow-slate-200"
                : isDark
                ? `${currentMode.bg} text-white shadow-black/40`
                : `${currentMode.bg} text-white shadow-indigo-200`
            }`}
        >
          {isActive ? t("pomodoro.pause") : t("pomodoro.start")}
        </button>
        <button
          onClick={reset}
          className={`px-5 py-3 rounded-2xl transition-all active:scale-95
            ${
              isDark
                ? "bg-slate-800 text-slate-400 hover:text-white"
                : "bg-slate-100 text-slate-400 hover:text-slate-600"
            }`}
        >
          <i className="fas fa-undo-alt text-xs"></i>
        </button>
      </div>
    </div>
  )
}
