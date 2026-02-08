"use client"

import React, { useState, useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/store/zen-store"
import CustomBentoNode from "@/components/CustomBentoNode"
import { WidgetPicker } from "@/components/WidgetPicker"
import type { WidgetType } from "@/types/zen"

const nodeTypes = {
  customBentoNode: CustomBentoNode,
}

const FlowContentInner = () => {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { nodes, onNodesChange, addNode, exportBoard, theme, toggleTheme, rearrangeNodes } =
    useStore()
  const { screenToFlowPosition, fitView } = useReactFlow()
  const [pickerPos, setPickerPos] = useState<{
    x: number
    y: number
  } | null>(null)

  const isDark = theme === "dark"

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (event.detail === 2) {
      setPickerPos({ x: event.clientX, y: event.clientY })
    } else {
      setPickerPos(null)
    }
  }, [])

  const onPaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault()
    setPickerPos({ x: event.clientX, y: event.clientY })
  }, [])

  const handleSpawn = (type: WidgetType) => {
    if (pickerPos) {
      const flowPos = screenToFlowPosition({
        x: pickerPos.x,
        y: pickerPos.y,
      })
      addNode(type, flowPos)
    }
  }

  const handleMagicLayout = () => {
    rearrangeNodes()
    setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 })
    }, 100)
  }

  const switchLanguage = () => {
    const newLocale = locale === "en" ? "zh" : "en"
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div
      className={`w-full h-screen transition-colors duration-500 ${
        isDark ? "bg-[#0f172a]" : "bg-[#f8f9fa]"
      }`}
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        zoomOnDoubleClick={false}
        fitView
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isDark ? "#334155" : "#94a3b8"}
        />

        <MiniMap
          position="bottom-left"
          style={{
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(241, 245, 249, 0.8)",
            borderRadius: "16px",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(10px)",
            margin: "16px",
            width: 150,
            height: 100,
          }}
          maskColor={isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(241, 245, 249, 0.2)"}
          nodeColor={isDark ? "#818cf8" : "#a5b4fc"}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />

        <Panel position="top-left" className="m-4 flex items-center gap-3">
          <div
            className={`
            backdrop-blur-md border p-2 rounded-2xl flex items-center gap-3 shadow-sm transition-colors
            ${
              isDark
                ? "bg-slate-800/60 border-slate-700 text-slate-100"
                : "bg-white/70 border-white/40 text-slate-700"
            }
          `}
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
              <i className="fas fa-leaf text-xs"></i>
            </div>
            <div className="flex items-center pr-2">
              <span className="font-black tracking-tight text-sm">
                {locale === "en" ? "InchDesk" : "方寸桌面"}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={nodes.length}
              initial={{ scale: 0.8, opacity: 0, x: -10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              className={`
                px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm flex items-center gap-2 transition-colors
                ${
                  isDark
                    ? "bg-indigo-900/20 border-indigo-500/20 text-indigo-300"
                    : "bg-indigo-50 border-indigo-100 text-indigo-600"
                }
              `}
            >
              <i className="fas fa-layer-group text-[10px]"></i>
              <span className="text-xs font-black tabular-nums">{nodes.length}</span>
            </motion.div>
          </AnimatePresence>
        </Panel>

        <Panel position="top-right" className="m-4 flex flex-col items-end gap-3">
          <div className="flex gap-2">
            <button
              onClick={switchLanguage}
              className={`
                h-10 px-3 rounded-2xl flex items-center justify-center border backdrop-blur-md shadow-sm transition-all active:scale-95 font-bold text-xs
                ${
                  isDark
                    ? "bg-slate-800/60 border-slate-700 text-slate-300"
                    : "bg-white/70 border-white text-slate-600"
                }
              `}
            >
              {locale === "en" ? "EN" : "中文"}
            </button>
            <button
              onClick={toggleTheme}
              className={`
                w-10 h-10 rounded-2xl flex items-center justify-center border backdrop-blur-md shadow-sm transition-all active:scale-95
                ${
                  isDark
                    ? "bg-slate-800/60 border-slate-700 text-amber-400"
                    : "bg-white/70 border-white text-indigo-500"
                }
              `}
            >
              <i className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}></i>
            </button>
          </div>
          <div
            className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border transition-colors
            ${
              isDark
                ? "bg-slate-800/40 border-slate-700 text-slate-500"
                : "bg-white/40 border-white/40 text-slate-400"
            }`}
          >
            {t("app.doubleClick")}
          </div>
        </Panel>

        {/* Tidy Action above controls */}
        <Panel position="bottom-right" className="mb-32 mr-4">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMagicLayout}
            className={`
                w-11 h-11 rounded-2xl flex items-center justify-center border backdrop-blur-xl shadow-xl transition-all
                ${
                  isDark
                    ? "bg-indigo-600/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/60"
                    : "bg-white/80 border-indigo-100 text-indigo-600 hover:border-indigo-200"
                }
              `}
            title="Magic Tidy"
          >
            <i className="fas fa-wand-magic-sparkles"></i>
          </motion.button>
        </Panel>

        <Controls
          position="bottom-right"
          showInteractive={false}
          className={`!m-4 !border-0 !rounded-xl !shadow-sm overflow-hidden !flex !flex-col transition-colors
            ${isDark ? "!bg-slate-800/80" : "!bg-white/70"}`}
        />
      </ReactFlow>

      <WidgetPicker
        position={pickerPos}
        onSelect={handleSpawn}
        onClose={() => setPickerPos(null)}
      />
    </div>
  )
}

export default function FlowContent() {
  return (
    <ReactFlowProvider>
      <FlowContentInner />
    </ReactFlowProvider>
  )
}
