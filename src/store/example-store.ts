import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

interface ExampleState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    immer<ExampleState>((set) => ({
      count: 0,
      increment: () =>
        set((state) => {
          // 使用 immer，可以直接修改 state，无需返回新对象
          state.count += 1
        }),
      decrement: () =>
        set((state) => {
          // 使用 immer，可以直接修改 state，无需返回新对象
          state.count -= 1
        }),
    })),
    { name: "example-store" }
  )
)
