"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { getPickSuggestion } from "@/lib/gemini-client"
import { useStore } from "@/store/zen-store"

export const PickerWidget: React.FC = () => {
  const t = useTranslations()
  const [result, setResult] = useState<string | null>(null)
  const [category, setCategory] = useState("Lunch Idea")
  const [isSpinning, setIsSpinning] = useState(false)
  const isDark = useStore((s) => s.theme === "dark")

  const handlePick = async () => {
    setIsSpinning(true)
    const suggestion = await getPickSuggestion(category)

    setTimeout(() => {
      setResult(suggestion)
      setIsSpinning(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-4 p-5 w-full h-full text-center justify-center">
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={`bg-transparent border-none text-center font-medium outline-none transition-colors
          ${isDark ? "text-rose-400 focus:text-rose-300" : "text-rose-600 focus:text-rose-800"}`}
        placeholder={t("picker.placeholder")}
      />

      <div className="h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isSpinning ? (
            <motion.div
              key="spinning"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: "linear",
              }}
              className="text-rose-400"
            >
              <i className="fas fa-dice text-4xl"></i>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-lg font-bold ${isDark ? "text-rose-400" : "text-rose-600"}`}
            >
              ✨ {result}
            </motion.div>
          ) : (
            <div className={`italic ${isDark ? "text-slate-700" : "text-slate-300"}`}>
              {t("picker.ready")}
            </div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={handlePick}
        disabled={isSpinning}
        className={`bg-rose-500 hover:bg-rose-600 text-white rounded-2xl py-2 font-medium transition-all active:scale-95 disabled:opacity-50 shadow-lg ${
          isDark ? "shadow-rose-900/20" : "shadow-rose-200"
        }`}
      >
        {t("picker.roll")}
      </button>
    </div>
  )
}
