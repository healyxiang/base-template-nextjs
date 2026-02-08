"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useStore } from "@/store/zen-store"

interface WeatherData {
  temp: number
  feelsLike: number
  condition: string
  code: number
  humidity: number
  windSpeed: number
  city: string
  isDay: boolean
}

const WMO_CODE_MAP: Record<number, { key: string; icon: string; color: string }> = {
  0: { key: "clear", icon: "sun", color: "text-amber-400" },
  1: { key: "clear", icon: "sun", color: "text-amber-400" },
  2: { key: "cloudy", icon: "cloud-sun", color: "text-sky-400" },
  3: { key: "cloudy", icon: "cloud", color: "text-slate-400" },
  45: { key: "cloudy", icon: "smog", color: "text-slate-300" },
  48: { key: "cloudy", icon: "smog", color: "text-slate-300" },
  51: { key: "rainy", icon: "cloud-rain", color: "text-blue-400" },
  53: { key: "rainy", icon: "cloud-rain", color: "text-blue-400" },
  55: { key: "rainy", icon: "cloud-rain", color: "text-blue-400" },
  61: { key: "rainy", icon: "cloud-showers-heavy", color: "text-blue-500" },
  63: { key: "rainy", icon: "cloud-showers-heavy", color: "text-blue-500" },
  65: { key: "rainy", icon: "cloud-showers-heavy", color: "text-blue-500" },
  71: { key: "snowy", icon: "snowflake", color: "text-sky-200" },
  73: { key: "snowy", icon: "snowflake", color: "text-sky-200" },
  75: { key: "snowy", icon: "snowflake", color: "text-sky-200" },
  95: { key: "storm", icon: "cloud-bolt", color: "text-indigo-400" },
}

export const WeatherWidget: React.FC = () => {
  const t = useTranslations()
  const isDark = useStore((s) => s.theme === "dark")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords

            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`
            )
            const weatherData = await weatherRes.json()

            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            )
            const geoData = await geoRes.json()
            const city =
              geoData.address.city ||
              geoData.address.town ||
              geoData.address.village ||
              "Unknown Location"

            const current = weatherData.current
            setWeather({
              temp: Math.round(current.temperature_2m),
              feelsLike: Math.round(current.apparent_temperature),
              code: current.weather_code,
              condition: WMO_CODE_MAP[current.weather_code]?.key || "unknown",
              humidity: current.relative_humidity_2m,
              windSpeed: current.wind_speed_10m,
              city,
              isDay: !!current.is_day,
            })
          },
          () => {
            setError("Location access denied")
          }
        )
      } catch (e) {
        setError("Failed to fetch weather")
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 1800000)
    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 opacity-40 text-xs italic text-center">
        {error}
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
        <i className="fas fa-circle-notch fa-spin text-2xl"></i>
        <span className="text-[10px] uppercase font-bold tracking-widest">
          {t("weather.loading")}
        </span>
      </div>
    )
  }

  const conditionInfo = WMO_CODE_MAP[weather.code] || {
    icon: "question",
    color: "text-slate-400",
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full text-center">
      <div
        className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-1 opacity-60
        ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {weather.city}
      </div>

      <div className="flex items-center gap-4 my-2">
        <motion.i
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`fas fa-${conditionInfo.icon} text-5xl ${conditionInfo.color} drop-shadow-sm`}
        />
        <div className="flex flex-col items-start leading-none">
          <span
            className={`text-4xl font-black tabular-nums tracking-tighter ${
              isDark ? "text-white" : "text-slate-800"
            }`}
          >
            {weather.temp}°
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest opacity-40 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {t(`weather.${weather.condition}`)}
          </span>
        </div>
      </div>

      <div className="flex gap-4 mt-4 w-full justify-center">
        <div className="flex flex-col items-center">
          <span
            className={`text-[9px] uppercase font-bold opacity-30 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {t("weather.humidity")}
          </span>
          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            {weather.humidity}%
          </span>
        </div>
        <div className={`w-[1px] h-6 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
        <div className="flex flex-col items-center">
          <span
            className={`text-[9px] uppercase font-bold opacity-30 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {t("weather.wind")}
          </span>
          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            {weather.windSpeed} <span className="text-[8px] font-normal opacity-50">km/h</span>
          </span>
        </div>
        <div className={`w-[1px] h-6 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
        <div className="flex flex-col items-center">
          <span
            className={`text-[9px] uppercase font-bold opacity-30 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {t("weather.feelsLike")}
          </span>
          <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            {weather.feelsLike}°
          </span>
        </div>
      </div>
    </div>
  )
}
