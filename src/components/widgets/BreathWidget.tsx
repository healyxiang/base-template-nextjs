"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { useStore } from "@/store/zen-store"

const PHASE_DURATION = 4

export const BreathWidget: React.FC = () => {
  const t = useTranslations()
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle")
  const [timeLeft, setTimeLeft] = useState(0)
  const isDark = useStore((s) => s.theme === "dark")

  useEffect(() => {
    if (phase === "idle") {
      setTimeLeft(0)
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === "inhale") {
            setPhase("hold")
          } else if (phase === "hold") {
            setPhase("exhale")
          } else if (phase === "exhale") {
            setPhase("inhale")
          }
          return PHASE_DURATION
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase])

  const toggle = () => {
    if (phase === "idle") {
      setPhase("inhale")
      setTimeLeft(PHASE_DURATION)
    } else {
      setPhase("idle")
      setTimeLeft(0)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full relative">
      <div className="relative flex items-center justify-center w-32 h-32 mb-1">
        <motion.div
          animate={
            phase === "idle"
              ? { scale: 1 }
              : phase === "inhale"
              ? { scale: 1.55 }
              : phase === "hold"
              ? { scale: 1.55 }
              : { scale: 1 }
          }
          transition={{ duration: PHASE_DURATION, ease: "easeInOut" }}
          className={`absolute w-20 h-20 rounded-full blur-2xl opacity-30
            ${isDark ? "bg-teal-400" : "bg-teal-500"}`}
        />
        <motion.div
          animate={
            phase === "idle"
              ? { scale: 1 }
              : phase === "inhale"
              ? { scale: 1.55 }
              : phase === "hold"
              ? { scale: 1.55 }
              : { scale: 1 }
          }
          transition={{ duration: PHASE_DURATION, ease: "easeInOut" }}
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center z-10 transition-colors
            ${isDark ? "border-teal-500/50 bg-teal-900/20" : "border-teal-200 bg-teal-50"}`}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className={`text-sm font-black tracking-widest ${
                isDark ? "text-teal-200" : "text-teal-600"
              }`}
            >
              {phase === "idle" ? t("breath.start") : t(`breath.${phase}`)}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex flex-col items-center justify-center h-6 mb-3">
        <AnimatePresence mode="wait">
          {phase !== "idle" && (
            <motion.div
              key={`${phase}-${timeLeft}`}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <span
                className={`text-base font-black tabular-nums leading-none ${
                  isDark ? "text-teal-100" : "text-teal-700"
                }`}
              >
                {timeLeft}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={toggle}
        className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg
          ${
            phase === "idle"
              ? isDark
                ? "bg-teal-600 text-white shadow-teal-900/40"
                : "bg-teal-500 text-white shadow-teal-100"
              : isDark
              ? "bg-slate-800 text-slate-400"
              : "bg-slate-100 text-slate-500"
          }`}
      >
        {phase === "idle" ? t("breath.begin") : t("breath.end")}
      </button>

      <p
        className={`mt-3 text-[9px] opacity-40 font-bold uppercase tracking-widest ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        4-4-4 Technique
      </p>
    </div>
  )
}
