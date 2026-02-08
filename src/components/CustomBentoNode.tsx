"use client"

import React, { memo } from "react"
import { Handle, Position, NodeResizer } from "@xyflow/react"
import type { NodeProps } from "@xyflow/react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useStore } from "@/store/zen-store"
import type { ZenNode, ZenNodeData, WidgetType } from "@/types/zen"
import { TodoWidget } from "@/components/widgets/TodoWidget"
import { WaterWidget } from "@/components/widgets/WaterWidget"
import { ClockWidget } from "@/components/widgets/ClockWidget"
import { PickerWidget } from "@/components/widgets/PickerWidget"
import { CountdownWidget } from "@/components/widgets/CountdownWidget"
import { YearCounterWidget } from "@/components/widgets/YearCounterWidget"
import { CompanionWidget } from "@/components/widgets/CompanionWidget"
import { BreathWidget } from "@/components/widgets/BreathWidget"
import { MoodWidget } from "@/components/widgets/MoodWidget"
import { AnniversaryWidget } from "@/components/widgets/AnniversaryWidget"
import { PomodoroWidget } from "@/components/widgets/PomodoroWidget"
import { BookmarkWidget } from "@/components/widgets/BookmarkWidget"
import { FoodPickerWidget } from "@/components/widgets/FoodPickerWidget"
import { FocusMusicWidget } from "@/components/widgets/FocusMusicWidget"
import { QRCodeWidget } from "@/components/widgets/QRCodeWidget"
import { WorldClockWidget } from "@/components/widgets/WorldClockWidget"

const THEME_COLORS: Record<
  WidgetType,
  { border: string; darkBorder: string; accent: string; shadow: string }
> = {
  todo: {
    border: "border-indigo-200/50",
    darkBorder: "border-indigo-500/20",
    accent: "text-indigo-500",
    shadow: "shadow-indigo-500/10",
  },
  timer: {
    border: "border-amber-200/50",
    darkBorder: "border-amber-500/20",
    accent: "text-amber-500",
    shadow: "shadow-amber-500/10",
  },
  water: {
    border: "border-sky-200/50",
    darkBorder: "border-sky-500/20",
    accent: "text-sky-500",
    shadow: "shadow-sky-500/10",
  },
  note: {
    border: "border-emerald-200/50",
    darkBorder: "border-emerald-500/20",
    accent: "text-emerald-500",
    shadow: "shadow-emerald-500/10",
  },
  picker: {
    border: "border-rose-200/50",
    darkBorder: "border-rose-500/20",
    accent: "text-rose-500",
    shadow: "shadow-rose-500/10",
  },
  countdown: {
    border: "border-violet-200/50",
    darkBorder: "border-violet-500/20",
    accent: "text-violet-400",
    shadow: "shadow-violet-500/10",
  },
  yearCounter: {
    border: "border-orange-200/50",
    darkBorder: "border-orange-500/20",
    accent: "text-orange-500",
    shadow: "shadow-orange-500/10",
  },
  companion: {
    border: "border-pink-200/50",
    darkBorder: "border-pink-500/20",
    accent: "text-pink-500",
    shadow: "shadow-pink-500/10",
  },
  breath: {
    border: "border-teal-200/50",
    darkBorder: "border-teal-500/20",
    accent: "text-teal-500",
    shadow: "shadow-teal-500/10",
  },
  mood: {
    border: "border-cyan-200/50",
    darkBorder: "border-cyan-500/20",
    accent: "text-cyan-500",
    shadow: "shadow-cyan-500/10",
  },
  anniversary: {
    border: "border-indigo-200/50",
    darkBorder: "border-indigo-500/20",
    accent: "text-indigo-500",
    shadow: "shadow-indigo-500/10",
  },
  pomodoro: {
    border: "border-rose-200/50",
    darkBorder: "border-rose-500/20",
    accent: "text-rose-500",
    shadow: "shadow-rose-500/10",
  },
  bookmark: {
    border: "border-emerald-200/50",
    darkBorder: "border-emerald-500/20",
    accent: "text-emerald-500",
    shadow: "shadow-emerald-500/10",
  },
  foodPicker: {
    border: "border-orange-200/50",
    darkBorder: "border-orange-500/20",
    accent: "text-orange-500",
    shadow: "shadow-orange-500/10",
  },
  focusMusic: {
    border: "border-indigo-200/50",
    darkBorder: "border-indigo-500/20",
    accent: "text-indigo-500",
    shadow: "shadow-indigo-500/10",
  },
  qrCode: {
    border: "border-violet-200/50",
    darkBorder: "border-violet-500/20",
    accent: "text-violet-400",
    shadow: "shadow-violet-500/10",
  },
  worldClock: {
    border: "border-amber-200/50",
    darkBorder: "border-amber-500/20",
    accent: "text-amber-500",
    shadow: "shadow-amber-500/10",
  },
}

const CustomBentoNode = ({ id, data, selected }: NodeProps<ZenNode>) => {
  const t = useTranslations()
  const removeNode = useStore((s) => s.removeNode)
  const updateNodeData = useStore((s) => s.updateNodeData)
  const theme = useStore((s) => s.theme)
  const isDark = theme === "dark"

  const colorConfig = THEME_COLORS[data.widgetType] || THEME_COLORS.note

  const renderWidget = () => {
    switch (data.widgetType) {
      case "todo":
        return (
          <TodoWidget
            id={id}
            content={data.content}
            onUpdate={(items) => updateNodeData(id, { content: items })}
          />
        )
      case "water":
        return (
          <WaterWidget
            level={data.content}
            onUpdate={(lvl) => updateNodeData(id, { content: lvl })}
          />
        )
      case "timer":
        return <ClockWidget />
      case "picker":
        return <PickerWidget />
      case "countdown":
        return (
          <CountdownWidget
            initialSeconds={data.content}
            onUpdate={(val) => updateNodeData(id, { content: val })}
          />
        )
      case "yearCounter":
        return <YearCounterWidget />
      case "companion":
        return (
          <CompanionWidget
            currentIndex={data.content || 0}
            onUpdate={(idx) => updateNodeData(id, { content: idx })}
          />
        )
      case "breath":
        return <BreathWidget />
      case "mood":
        return (
          <MoodWidget
            history={Array.isArray(data.content) ? data.content : []}
            onUpdate={(hist) => updateNodeData(id, { content: hist })}
          />
        )
      case "anniversary":
        return (
          <AnniversaryWidget
            content={data.content}
            onUpdate={(val) => updateNodeData(id, { content: val })}
          />
        )
      case "pomodoro":
        return (
          <PomodoroWidget
            content={data.content}
            onUpdate={(val) => updateNodeData(id, { content: val })}
          />
        )
      case "bookmark":
        return (
          <BookmarkWidget
            content={data.content}
            onUpdate={(val) => updateNodeData(id, { content: val })}
          />
        )
      case "foodPicker":
        return <FoodPickerWidget />
      case "focusMusic":
        return (
          <FocusMusicWidget
            content={data.content}
            onUpdate={(val) => updateNodeData(id, { content: val })}
          />
        )
      case "qrCode":
        return (
          <QRCodeWidget
            content={data.content}
            onUpdate={(val) => updateNodeData(id, { content: val })}
          />
        )
      case "worldClock":
        return (
          <WorldClockWidget
            content={data.content}
            onUpdate={(val) => updateNodeData(id, { content: val })}
          />
        )
      case "note":
        return (
          <textarea
            value={data.content || ""}
            onChange={(e) => updateNodeData(id, { content: e.target.value })}
            placeholder="Write a note..."
            className={`w-full h-full min-h-[100px] bg-transparent outline-none resize-none p-4 text-sm scrollbar-hide
              ${
                isDark
                  ? "text-slate-200 placeholder:text-slate-600"
                  : "text-slate-700 placeholder:text-slate-400"
              }
              focus:ring-1 focus:ring-emerald-500/20 rounded-b-[24px]`}
          />
        )
      default:
        return <div className="p-4 text-center text-slate-400">{t("widgets.unknown")}</div>
    }
  }

  return (
    <div className="w-full h-full group">
      <NodeResizer
        color={isDark ? "#818cf8" : "#6366f1"}
        isVisible={selected}
        minWidth={180}
        minHeight={150}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: isDark ? "#818cf8" : "#6366f1",
          border: "2px solid white",
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: selected ? 1.01 : 1,
          opacity: 1,
          boxShadow: selected
            ? isDark
              ? `0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(99, 102, 241, 0.1)`
              : `0 20px 40px rgba(0,0,0,0.12)`
            : isDark
            ? "0 8px 30px rgba(0,0,0,0.2)"
            : "0 8px 30px rgba(0,0,0,0.04)",
        }}
        className={`
          relative w-full h-full flex flex-col rounded-[24px] border transition-all duration-300 backdrop-blur-xl
          ${
            isDark
              ? `bg-slate-900/60 ${colorConfig.darkBorder}`
              : `bg-white/70 ${colorConfig.border}`
          }
          ${selected ? (isDark ? "border-slate-500" : "border-indigo-300") : ""}
        `}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-1 shrink-0">
          <span
            className={`text-[10px] uppercase tracking-widest font-bold select-none transition-colors
            ${isDark ? "text-slate-500" : "text-slate-400"} ${colorConfig.accent}`}
          >
            {t(`widgets.${data.widgetType}`)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeNode(id)
            }}
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1
              ${
                isDark ? "text-slate-600 hover:text-red-400" : "text-slate-300 hover:text-red-400"
              }`}
          >
            <i className="fas fa-trash-alt text-[10px]"></i>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col justify-center items-center">
          {renderWidget()}
        </div>

        <Handle type="target" position={Position.Top} className="opacity-0 pointer-events-none" />
        <Handle
          type="source"
          position={Position.Bottom}
          className="opacity-0 pointer-events-none"
        />
      </motion.div>
    </div>
  )
}

export default memo(CustomBentoNode)
