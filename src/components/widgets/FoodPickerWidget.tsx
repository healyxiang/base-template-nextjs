"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { useStore } from "@/store/zen-store"

const FOODS = [
  { name: "火锅", nameEn: "Hotpot", emoji: "🍲" },
  { name: "麻辣烫", nameEn: "Mala Tang", emoji: "🔥" },
  { name: "兰州拉面", nameEn: "Ramen", emoji: "🍜" },
  { name: "宫保鸡丁", nameEn: "Kung Pao Chicken", emoji: "🍗" },
  { name: "肉夹馍", nameEn: "Roujiamo", emoji: "🥙" },
  { name: "广式点心", nameEn: "Dim Sum", emoji: "🥟" },
  { name: "煲仔饭", nameEn: "Claypot Rice", emoji: "🍚" },
  { name: "剁椒鱼头", nameEn: "Steamed Fish Head", emoji: "🐟" },
  { name: "北京烤鸭", nameEn: "Peking Duck", emoji: "🦆" },
  { name: "小笼包", nameEn: "Soup Dumplings", emoji: "🥡" },
  { name: "螺蛳粉", nameEn: "River Snail Noodles", emoji: "🍜" },
  { name: "麻婆豆腐", nameEn: "Mapo Tofu", emoji: "🥘" },
  { name: "意式披萨", nameEn: "Pizza", emoji: "🍕" },
  { name: "经典汉堡", nameEn: "Burger", emoji: "🍔" },
  { name: "安格斯牛排", nameEn: "Steak", emoji: "🥩" },
  { name: "奶油意面", nameEn: "Pasta", emoji: "🍝" },
  { name: "墨西哥塔可", nameEn: "Tacos", emoji: "🌮" },
  { name: "法式焗饭", nameEn: "Gratin", emoji: "🥘" },
  { name: "炸鱼薯条", nameEn: "Fish & Chips", emoji: "🍟" },
  { name: "凯撒沙拉", nameEn: "Caesar Salad", emoji: "🥗" },
  { name: "三文鱼波奇饭", nameEn: "Poke Bowl", emoji: "🥗" },
  { name: "日式寿司", nameEn: "Sushi", emoji: "🍣" },
  { name: "韩式炸鸡", nameEn: "Korean Fried Chicken", emoji: "🍗" },
  { name: "赛百味", nameEn: "Subway", emoji: "🥪" },
  { name: "照烧鸡腿饭", nameEn: "Teriyaki Chicken", emoji: "🍱" },
  { name: "泰式冬阴功", nameEn: "Tom Yum Goong", emoji: "🥘" },
  { name: "越南粉", nameEn: "Pho", emoji: "🍲" },
  { name: "印度咖喱", nameEn: "Curry", emoji: "🍛" },
  { name: "便利店关东煮", nameEn: "Oden", emoji: "🍢" },
  { name: "三明治", nameEn: "Sandwich", emoji: "🥪" },
  { name: "章鱼小丸子", nameEn: "Takoyaki", emoji: "🍡" },
  { name: "烤冷面", nameEn: "Grilled Cold Noodles", emoji: "🥘" },
  { name: "麻辣香锅", nameEn: "Mala Xiang Guo", emoji: "🍲" },
  { name: "煎饼果子", nameEn: "Jianbing", emoji: "🫓" },
  { name: "炸酱面", nameEn: "Zha Jiang Mian", emoji: "🍜" },
  { name: "水饺", nameEn: "Dumplings", emoji: "🥟" },
  { name: "冒菜", nameEn: "Maocai", emoji: "🍲" },
  { name: "牛油果吐司", nameEn: "Avocado Toast", emoji: "🍞" },
  { name: "水果燕麦碗", nameEn: "Acai Bowl", emoji: "🥣" },
  { name: "海南鸡饭", nameEn: "Hainan Chicken Rice", emoji: "🍗" },
]

export const FoodPickerWidget: React.FC = () => {
  const t = useTranslations()
  const locale = useLocale()
  const isDark = useStore((s) => s.theme === "dark")
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedFood, setSelectedFood] = useState<(typeof FOODS)[0] | null>(null)
  const [displayFood, setDisplayFood] = useState<(typeof FOODS)[0]>(FOODS[0])

  const spin = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setSelectedFood(null)

    let count = 0
    const maxSpins = 20
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * FOODS.length)
      setDisplayFood(FOODS[randomIndex])
      count++

      if (count >= maxSpins) {
        clearInterval(interval)
        const finalFood = FOODS[Math.floor(Math.random() * FOODS.length)]
        setSelectedFood(finalFood)
        setDisplayFood(finalFood)
        setIsSpinning(false)
      }
    }, 80)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full text-center">
      <div
        className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-1 opacity-50 transition-colors
        ${isDark ? "text-orange-400" : "text-orange-500"}`}
      >
        {selectedFood ? t("food.result") : t("food.idle")}
      </div>

      <div className="relative h-20 flex flex-col items-center justify-center mb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayFood.name + (isSpinning ? Math.random() : "")}
            initial={{
              y: isSpinning ? 10 : 0,
              opacity: isSpinning ? 0.4 : 0,
            }}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: isSpinning ? -10 : 0,
              opacity: isSpinning ? 0.4 : 0,
            }}
            transition={{
              duration: isSpinning ? 0.08 : 0.4,
              ease: "easeOut",
            }}
            className="flex flex-col items-center"
          >
            <div className="text-4xl mb-0.5 drop-shadow-sm">{displayFood.emoji}</div>
            <div
              className={`text-lg font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              {locale === "zh" ? displayFood.name : displayFood.nameEn}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-[400px]">
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`w-full py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md
            ${
              isSpinning
                ? isDark
                  ? "bg-slate-800 text-slate-500"
                  : "bg-slate-100 text-slate-400"
                : isDark
                ? "bg-orange-600 text-white shadow-orange-900/10"
                : "bg-orange-500 text-white shadow-orange-100"
            }`}
        >
          {isSpinning ? t("food.spinning") : t("food.pick")}
        </button>
      </div>

      {selectedFood && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2"
        >
          <i className="fas fa-sparkles text-orange-400 animate-pulse text-[10px]" />
        </motion.div>
      )}
    </div>
  )
}
