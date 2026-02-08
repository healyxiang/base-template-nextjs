"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { QRCodeCanvas } from "qrcode.react"
import { useStore } from "@/store/zen-store"

export const QRCodeWidget: React.FC<{
  content: string
  onUpdate: (val: string) => void
}> = ({ content = "", onUpdate }) => {
  const t = useTranslations()
  const isDark = useStore((s) => s.theme === "dark")

  const qrColor = isDark ? "#c4b5fd" : "#8b5cf6"

  const clearContent = () => onUpdate("")

  return (
    <div className="flex flex-col items-center justify-center p-5 w-full h-full text-center gap-4">
      <div
        className={`p-4 rounded-[28px] shadow-2xl transition-all relative overflow-hidden group
        ${isDark ? "bg-slate-900/40 ring-1 ring-white/5" : "bg-white ring-1 ring-slate-100"}`}
      >
        <div
          className={`absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 rounded-tl-sm opacity-30 ${
            isDark ? "border-violet-300" : "border-violet-500"
          }`}
        />
        <div
          className={`absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 rounded-br-sm opacity-30 ${
            isDark ? "border-violet-300" : "border-violet-500"
          }`}
        />

        <div className={`p-1 rounded-2xl ${isDark ? "bg-white" : "bg-transparent"}`}>
          {content.trim() ? (
            <QRCodeCanvas
              value={content}
              size={120}
              level="H"
              includeMargin={false}
              fgColor={qrColor}
              bgColor={isDark ? "#ffffff" : "transparent"}
            />
          ) : (
            <div className="w-[120px] h-[120px] flex items-center justify-center bg-violet-50/50 rounded-2xl">
              <i className="fas fa-qrcode text-4xl text-violet-200"></i>
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-1">
        <div className="relative w-full group/input">
          <input
            type="text"
            value={content}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder={t("qr.placeholder")}
            className={`w-full border rounded-xl px-3 py-2 pr-8 outline-none text-xs transition-all text-center
              ${
                isDark
                  ? "bg-slate-800/60 border-white/5 text-slate-100 placeholder:text-slate-600 focus:bg-slate-800/80 focus:border-violet-500/30"
                  : "bg-white border-slate-100 text-slate-700 placeholder:text-slate-400 focus:border-violet-200"
              }`}
          />
          {content && (
            <button
              onClick={clearContent}
              className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity
                ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <i className="fas fa-circle-xmark text-xs"></i>
            </button>
          )}
        </div>
        <span
          className={`text-[9px] font-bold uppercase tracking-widest opacity-40
          ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {t("qr.tip")}
        </span>
      </div>
    </div>
  )
}
