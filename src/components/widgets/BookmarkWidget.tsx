"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import type { BookmarkItem } from "@/types/zen"
import { useStore } from "@/store/zen-store"

interface BookmarkWidgetProps {
  content: BookmarkItem[]
  onUpdate: (items: BookmarkItem[]) => void
}

export const BookmarkWidget: React.FC<BookmarkWidgetProps> = ({ content = [], onUpdate }) => {
  const t = useTranslations()
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const isDark = useStore((s) => s.theme === "dark")

  const extractDomain = (urlStr: string) => {
    try {
      let formattedUrl = urlStr.trim()
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = "https://" + formattedUrl
      }
      const hostname = new URL(formattedUrl).hostname
      return hostname.replace(/^www\./, "")
    } catch (e) {
      return urlStr
    }
  }

  const addBookmark = () => {
    if (!url.trim()) return

    let finalUrl = url.trim()
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl
    }

    const finalName = name.trim() || extractDomain(url)
    const newItem: BookmarkItem = {
      id: Math.random().toString(36).substr(2, 9),
      url: finalUrl,
      name: finalName,
    }

    onUpdate([...content, newItem])
    setUrl("")
    setName("")
  }

  const removeBookmark = (id: string) => {
    onUpdate(content.filter((i) => i.id !== id))
  }

  return (
    <div className="flex flex-col gap-3 p-4 w-full h-full max-w-[320px]">
      <div className="flex flex-col gap-2 shrink-0">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("bookmark.namePlaceholder")}
          className={`w-full border rounded-xl px-3 py-1.5 outline-none text-xs transition-all
            ${
              isDark
                ? "bg-slate-800/40 border-white/5 text-slate-100 placeholder:text-slate-600 focus:bg-slate-800/60"
                : "bg-white/40 border-white/20 text-slate-700 placeholder:text-slate-400 focus:bg-white/60"
            }`}
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBookmark()}
            placeholder={t("bookmark.urlPlaceholder")}
            className={`flex-1 min-w-0 border rounded-xl px-3 py-1.5 outline-none text-xs transition-all
              ${
                isDark
                  ? "bg-slate-800/40 border-white/5 text-slate-100 placeholder:text-slate-600 focus:bg-slate-800/60"
                  : "bg-white/40 border-white/20 text-slate-700 placeholder:text-slate-400 focus:bg-white/60"
              }`}
          />
          <button
            onClick={addBookmark}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl p-2 transition-colors shrink-0"
            title={t("bookmark.add")}
          >
            <i className="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-hide">
        <AnimatePresence initial={false}>
          {content.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-2 p-2.5 rounded-xl group transition-all cursor-pointer
                ${
                  isDark
                    ? "bg-slate-800/40 hover:bg-slate-800/60"
                    : "bg-white/30 hover:bg-white/50 shadow-sm border border-black/5"
                }`}
              onClick={() => window.open(item.url, "_blank")}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0
                ${isDark ? "bg-slate-700 text-slate-400" : "bg-white/50 text-slate-500"}`}
              >
                <i className="fas fa-globe text-[10px]"></i>
              </div>
              <span
                className={`text-xs font-medium flex-1 truncate
                ${isDark ? "text-slate-200" : "text-slate-700"}`}
              >
                {item.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeBookmark(item.id)
                }}
                className={`opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 p-1
                  ${isDark ? "text-slate-600" : "text-slate-300"}`}
              >
                <i className="fas fa-times text-[10px]"></i>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {content.length === 0 && (
          <div
            className={`h-full flex flex-col items-center justify-center opacity-30 text-center p-4 gap-2
            ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            <i className="fas fa-bookmark text-xl mb-1"></i>
            <span className="text-[10px] italic">{t("bookmark.empty")}</span>
          </div>
        )}
      </div>
    </div>
  )
}
