"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/store/zen-store"

const COMPANIONS = [
  {
    name: "Yuki",
    role: "The Scholar",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Yuki&backgroundColor=b6e3f4",
    message: "Focus on the present moment.",
    color: "text-blue-500",
  },
  {
    name: "Hana",
    role: "The Muse",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hana&backgroundColor=ffdfbf",
    message: "Creativity flows within you.",
    color: "text-rose-500",
  },
  {
    name: "Ren",
    role: "The Guardian",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ren&backgroundColor=c0aede",
    message: "I'll watch over your progress.",
    color: "text-indigo-500",
  },
  {
    name: "Sora",
    role: "The Wanderer",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sora&backgroundColor=d1d4f9",
    message: "Let's reach new heights today.",
    color: "text-sky-500",
  },
  {
    name: "Mika",
    role: "The Spirit",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mika&backgroundColor=ffd5dc",
    message: "Take a deep breath and relax.",
    color: "text-pink-500",
  },
]

interface CompanionWidgetProps {
  currentIndex: number
  onUpdate: (index: number) => void
}

export const CompanionWidget: React.FC<CompanionWidgetProps> = ({ currentIndex = 0, onUpdate }) => {
  const isDark = useStore((s) => s.theme === "dark")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const character = useMemo(() => COMPANIONS[currentIndex % COMPANIONS.length], [currentIndex])

  const handleRefresh = () => {
    setIsRefreshing(true)
    let nextIndex
    do {
      nextIndex = Math.floor(Math.random() * COMPANIONS.length)
    } while (nextIndex === currentIndex)

    setTimeout(() => {
      onUpdate(nextIndex)
      setIsRefreshing(false)
    }, 400)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full relative group">
      <AnimatePresence mode="wait">
        <motion.div
          key={character.name}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, -1, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 mb-3 relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.url}
              alt={character.name}
              className="w-full h-full object-contain rounded-full border-2 border-transparent shadow-xl"
              style={{
                filter: isDark ? "drop-shadow(0 0 8px rgba(255,255,255,0.1))" : "none",
              }}
            />

            <motion.div
              animate={{
                scale: [1, 0.8, 1],
                opacity: [0.2, 0.1, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute -bottom-1 left-1/4 right-1/4 h-1 blur-md rounded-full
                ${isDark ? "bg-white" : "bg-black"}`}
            />
          </motion.div>

          <div className="text-center">
            <h3
              className={`text-sm font-bold tracking-tight ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {character.name}
            </h3>
            <p
              className={`text-[9px] uppercase font-bold tracking-widest mb-2 opacity-60 ${character.color}`}
            >
              {character.role}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`px-3 py-1.5 rounded-xl text-[10px] max-w-[140px] leading-tight
                ${isDark ? "bg-slate-800/50 text-slate-400" : "bg-slate-100 text-slate-500"}`}
            >
              &quot;{character.message}&quot;
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={handleRefresh}
        className={`absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 opacity-0 group-hover:opacity-100
          ${
            isDark
              ? "bg-slate-800 text-slate-400 hover:text-white"
              : "bg-white text-slate-400 hover:text-indigo-500 shadow-sm"
          }`}
      >
        <motion.i
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={{ duration: 0.4 }}
          className="fas fa-sync-alt text-xs"
        />
      </button>
    </div>
  )
}
