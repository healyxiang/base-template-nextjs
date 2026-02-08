"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ZenNode, WidgetType, ZenNodeData } from "@/types/zen"
import { applyNodeChanges } from "@xyflow/react"
import type { NodeChange, OnNodesChange } from "@xyflow/react"

interface ZenState {
  nodes: ZenNode[]
  theme: "light" | "dark"
  onNodesChange: OnNodesChange<ZenNode>
  addNode: (type: WidgetType, position: { x: number; y: number }) => void
  removeNode: (id: string) => void
  updateNodeData: (id: string, data: Partial<ZenNodeData>) => void
  rearrangeNodes: () => void
  toggleTheme: () => void
  exportBoard: () => void
}

export const useStore = create<ZenState>()(
  persist(
    (set, get) => ({
      nodes: [],
      theme: "light",
      onNodesChange: (changes: NodeChange<ZenNode>[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        })
      },
      addNode: (type: WidgetType, position: { x: number; y: number }) => {
        const id = `${type}-${Date.now()}`
        let initialContent: any = {}
        let initialWidth = 300
        let initialHeight = 280

        switch (type) {
          case "todo":
            initialContent = []
            break
          case "water":
            initialContent = 0
            break
          case "note":
            initialContent = ""
            break
          case "countdown":
            initialContent = 300
            initialWidth = 320
            initialHeight = 320
            break
          case "companion":
            initialContent = 0
            break
          case "mood":
            initialContent = []
            break
          case "breath":
            initialContent = false
            break
          case "anniversary":
            initialContent = {
              date: new Date().toISOString().split("T")[0],
              label: "Special Day",
            }
            break
          case "pomodoro":
            initialContent = { seconds: 1500, mode: "work", sessions: 0 }
            break
          case "bookmark":
            initialContent = []
            break
          case "foodPicker":
            initialContent = null
            initialWidth = 520
            initialHeight = 200
            break
          case "focusMusic":
            initialContent = { trackIndex: 0, volume: 0.5 }
            break
          case "qrCode":
            initialContent = "https://"
            break
          case "worldClock":
            initialContent = [
              {
                id: "beijing",
                name: "Beijing",
                nameZh: "北京",
                timezone: "Asia/Shanghai",
              },
              {
                id: "newyork",
                name: "New York",
                nameZh: "纽约",
                timezone: "America/New_York",
              },
              {
                id: "london",
                name: "London",
                nameZh: "伦敦",
                timezone: "Europe/London",
              },
            ]
            initialWidth = 320
            initialHeight = 340
            break
          default:
            initialContent = {}
        }

        const newNode: ZenNode = {
          id,
          type: "customBentoNode",
          position,
          data: {
            widgetType: type,
            title: type,
            theme: "glass",
            content: initialContent,
          },
          width: initialWidth,
          height: initialHeight,
        }
        set({ nodes: [...get().nodes, newNode] })
      },
      removeNode: (id: string) => {
        set({ nodes: get().nodes.filter((node) => node.id !== id) })
      },
      updateNodeData: (id: string, newData: Partial<ZenNodeData>) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
          ),
        })
      },
      rearrangeNodes: () => {
        const { nodes } = get()
        if (nodes.length === 0) return

        const GAP = 20
        const COLUMNS = Math.ceil(Math.sqrt(nodes.length))
        const defaultWidth = 300
        const defaultHeight = 280

        const targetPositions = nodes.map((node, index) => {
          const col = index % COLUMNS
          const row = Math.floor(index / COLUMNS)
          const w = node.width || defaultWidth
          const h = node.height || defaultHeight
          return {
            id: node.id,
            x: col * (defaultWidth + GAP),
            y: row * (defaultHeight + GAP),
            w,
            h,
          }
        })

        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity
        targetPositions.forEach((p) => {
          if (p.x < minX) minX = p.x
          if (p.x + p.w > maxX) maxX = p.x + p.w
          if (p.y < minY) minY = p.y
          if (p.y + p.h > maxY) maxY = p.y + p.h
        })

        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2
        const centeredTargets = targetPositions.map((p) => ({
          id: p.id,
          x: p.x - centerX,
          y: p.y - centerY,
        }))
        const startPositions = nodes.map((n) => ({
          id: n.id,
          x: n.position.x,
          y: n.position.y,
        }))

        const duration = 800
        const startTime = performance.now()
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)
          const ease =
            progress < 0.5
              ? 8 * progress * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 4) / 2
          const updatedNodes = nodes.map((node) => {
            const start = startPositions.find((s) => s.id === node.id)!
            const target = centeredTargets.find((t) => t.id === node.id)!
            return {
              ...node,
              position: {
                x: start.x + (target.x - start.x) * ease,
                y: start.y + (target.y - start.y) * ease,
              },
            }
          })
          set({ nodes: updatedNodes })
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      },
      toggleTheme: () => {
        set({ theme: get().theme === "light" ? "dark" : "light" })
      },
      exportBoard: () => {
        const data = JSON.stringify(get().nodes)
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `InchDesk-export-${new Date().toISOString()}.json`
        link.click()
      },
    }),
    {
      name: "zenboard-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        theme: state.theme,
      }),
    }
  )
)
