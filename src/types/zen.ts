import type { Node } from "@xyflow/react"

export type WidgetType =
  | "todo"
  | "timer"
  | "water"
  | "note"
  | "picker"
  | "countdown"
  | "yearCounter"
  | "companion"
  | "breath"
  | "mood"
  | "anniversary"
  | "pomodoro"
  | "bookmark"
  | "foodPicker"
  | "focusMusic"
  | "qrCode"
  | "worldClock"

export interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export interface BookmarkItem {
  id: string
  url: string
  name: string
}

export interface WorldCity {
  id: string
  name: string
  timezone: string
  nameZh: string
}

export interface ZenNodeData {
  widgetType: WidgetType
  title: string
  theme: "glass" | "solid" | "accent"
  config?: any
  content?: any
  [key: string]: unknown
}

export type ZenNode = Node<ZenNodeData, "customBentoNode">
