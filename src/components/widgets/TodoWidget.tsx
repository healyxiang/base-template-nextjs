"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { decomposeTask } from "@/lib/gemini-client"
import type { TodoItem } from "@/types/zen"
import { useStore } from "@/store/zen-store"

interface TodoWidgetProps {
  id: string
  content: TodoItem[]
  onUpdate: (items: TodoItem[]) => void
}

export const TodoWidget: React.FC<TodoWidgetProps> = ({ id, content = [], onUpdate }) => {
  const t = useTranslations()
  const [inputValue, setInputValue] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const isDark = useStore((s) => s.theme === "dark")

  const addItem = (text: string) => {
    if (!text.trim()) return
    const newItem: TodoItem = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
    }
    onUpdate([...content, newItem])
    setInputValue("")
  }

  const toggleItem = (itemId: string) => {
    onUpdate(content.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i)))
  }

  const removeItem = (itemId: string) => {
    onUpdate(content.filter((i) => i.id !== itemId))
  }

  // Keep this logic for future use as requested
  const handleAiDecompose = async () => {
    if (!inputValue.trim()) return
    setIsAiLoading(true)
    try {
      const subTasks = await decomposeTask(inputValue)
      const newItems = subTasks.map((text) => ({
        id: Math.random().toString(36).substr(2, 9),
        text,
        completed: false,
      }))
      onUpdate([...content, ...newItems])
      setInputValue("")
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 w-full h-full max-w-[320px]">
      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem(inputValue)}
          placeholder={t("todo.placeholder")}
          className={`flex-1 min-w-0 border rounded-xl px-3 py-1.5 outline-none text-xs transition-all
            ${
              isDark
                ? "bg-slate-800/40 border-white/5 text-slate-100 placeholder:text-slate-600 focus:bg-slate-800/60"
                : "bg-white/40 border-white/20 text-slate-700 placeholder:text-slate-400 focus:bg-white/60"
            }`}
        />
        {/*
          AI Breakdown Button temporarily hidden as per user request.
          Functionality handleAiDecompose is preserved in code.
        */}
        <button
          onClick={() => addItem(inputValue)}
          className={`rounded-xl p-2 transition-colors shrink-0 flex items-center justify-center
            ${
              isDark
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
        >
          <i className="fas fa-plus text-[10px]"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-hide">
        <AnimatePresence initial={false}>
          {content.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-2 p-2 rounded-xl group transition-colors
                ${isDark ? "bg-slate-800/40" : "bg-white/30"}`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className={`w-3.5 h-3.5 rounded accent-indigo-500 shrink-0
                  ${isDark ? "border-slate-700 bg-slate-800" : "border-white/50 bg-white"}`}
              />
              <span
                className={`text-xs flex-1 truncate transition-all
                ${
                  item.completed
                    ? isDark
                      ? "line-through opacity-30 text-slate-500"
                      : "line-through opacity-50 text-slate-400"
                    : isDark
                    ? "text-slate-200"
                    : "text-slate-700"
                }`}
              >
                {item.text}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className={`opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500
                  ${isDark ? "text-slate-600" : "text-slate-300"}`}
              >
                <i className="fas fa-times text-[10px]"></i>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {content.length === 0 && (
          <div
            className={`h-full flex items-center justify-center italic text-[10px]
            ${isDark ? "text-slate-600" : "text-slate-300"}`}
          >
            {t("todo.noTasks")}
          </div>
        )}
      </div>
    </div>
  )
}
