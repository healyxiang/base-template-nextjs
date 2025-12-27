import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface ExampleState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, "increment"),
      decrement: () => set((state) => ({ count: state.count - 1 }), false, "decrement"),
    }),
    {
      name: "example-store", // 在 Redux DevTools 中显示的名称
    }
  )
)
