"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { useStore } from "@/store/zen-store"

interface CountdownWidgetProps {
  initialSeconds: number
  onUpdate: (val: number) => void
}

const PRESETS = [5, 10, 20, 30]

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  initialSeconds = 300,
  onUpdate,
}) => {
  const t = useTranslations()
  const locale = useLocale()
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [editValue, setEditValue] = useState(Math.floor(initialSeconds / 60))
  const isDark = useStore((s) => s.theme === "dark")
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const next = s - 1
          if (next <= 0) {
            setIsActive(false)
            return 0
          }
          return next
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, seconds])

  useEffect(() => {
    onUpdate(seconds)
  }, [seconds])

  const toggle = () => setIsActive(!isActive)

  const reset = () => {
    setIsActive(false)
    setSeconds(initialSeconds)
  }

  const handleSelectPreset = (mins: number) => {
    const s = mins * 60
    setSeconds(s)
    onUpdate(s)
    setShowPresets(false)
    setIsActive(false)
  }

  const handleSetCustom = () => {
    const s = editValue * 60
    setSeconds(s)
    onUpdate(s)
    setIsEditing(false)
    setShowPresets(false)
    setIsActive(false)
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center gap-6 p-5 w-full h-full justify-center relative overflow-visible group/cd">
      <div
        className={`absolute -top-1 right-2 z-[60] transition-all duration-300 ${
          showPresets ? "opacity-100" : "opacity-0 group-hover/cd:opacity-100"
        }`}
      >
        <button
          onClick={() => setShowPresets(!showPresets)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
            ${
              isDark
                ? "bg-slate-800 text-violet-400 hover:bg-slate-700"
                : "bg-violet-50 text-violet-600 hover:bg-violet-100 shadow-sm"
            }`}
        >
          <i
            className={`fas fa-ellipsis-h text-[10px] transition-transform ${
              showPresets ? "rotate-90" : ""
            }`}
          ></i>
        </button>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              className={`absolute top-full right-0 mt-1 z-50 p-1.5 rounded-2xl shadow-2xl border backdrop-blur-2xl w-36
                ${isDark ? "bg-slate-900/95 border-slate-700" : "bg-white/95 border-slate-100"}`}
            >
              {isEditing ? (
                <div className="flex flex-col gap-2 p-1">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                    className={`w-full text-center text-base font-bold bg-transparent border-b outline-none py-1
                      ${
                        isDark
                          ? "border-violet-500 text-violet-400"
                          : "border-violet-300 text-violet-600"
                      }`}
                    autoFocus
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={handleSetCustom}
                      className="flex-1 py-1 rounded-lg bg-violet-500 text-white text-[8px] font-bold uppercase"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`flex-1 py-1 rounded-lg text-[8px] font-bold uppercase
                        ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSelectPreset(m)}
                      className={`py-1.5 rounded-xl text-[9px] font-bold transition-colors
                        ${
                          isDark
                            ? "hover:bg-violet-500/20 text-slate-300"
                            : "hover:bg-violet-50 text-slate-600"
                        }`}
                    >
                      {m}m
                    </button>
                  ))}
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`col-span-2 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-colors
                      ${isDark ? "bg-slate-800 text-violet-400" : "bg-violet-50 text-violet-600"}`}
                  >
                    {locale === "zh" ? "自定义" : "Custom"}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center">
        <motion.div
          animate={isActive ? { scale: [1, 1.01, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`text-4xl font-light tracking-tighter tabular-nums transition-colors leading-none
            ${seconds === 0 ? "text-rose-500" : isDark ? "text-violet-400" : "text-violet-600"}`}
        >
          {formatTime(seconds)}
        </motion.div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggle}
          disabled={seconds === 0}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg disabled:opacity-30
            ${
              isActive
                ? isDark
                  ? "bg-slate-700 text-white shadow-black/20"
                  : "bg-slate-100 text-slate-500 shadow-slate-200/50"
                : "bg-violet-500 text-white hover:bg-violet-600 shadow-violet-500/30"
            }`}
        >
          <i
            className={`fas ${isActive ? "fa-pause" : "fa-play"} text-xs ${!isActive && "ml-0.5"}`}
          ></i>
        </button>
        <button
          onClick={reset}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90
            ${
              isDark
                ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                : "bg-violet-50 text-violet-400 hover:bg-violet-100 shadow-sm"
            }`}
        >
          <i className="fas fa-undo text-[10px]"></i>
        </button>
      </div>

      <AnimatePresence>
        {seconds === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 text-[9px] font-black uppercase tracking-widest text-rose-500 animate-pulse"
          >
            {t("countdown.timeUp")}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
