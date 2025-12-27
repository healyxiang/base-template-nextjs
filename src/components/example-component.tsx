"use client"

import { Button } from "./ui/button"
import { useExampleStore } from "@/store/example-store"
import { Heart } from "lucide-react"

export function ExampleComponent() {
  const { count, increment, decrement } = useExampleStore()

  return (
    <div className="flex flex-col items-center gap-4 p-8 border rounded-lg">
      <div className="flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" />
        <span className="text-2xl font-bold text-red-300">计数: {count}</span>
      </div>
      <div className="flex gap-2">
        <Button onClick={decrement} variant="outline">
          减少
        </Button>
        <Button onClick={increment} variant="default">
          增加
        </Button>
      </div>
    </div>
  )
}
