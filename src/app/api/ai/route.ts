import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })
}

export async function POST(request: NextRequest) {
  const { action, payload } = await request.json()

  const ai = getAI()

  if (action === "decomposeTask") {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Decompose the following task into 3-6 actionable sub-tasks for a todo list. Return only the list of sub-tasks, one per line. Task: "${payload}"`,
        config: {
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      })

      const text = response.text || ""
      const result = text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-*•\d.]\s*/, "").trim())
      return NextResponse.json({ result })
    } catch (error) {
      console.error("AI decomposition failed:", error)
      return NextResponse.json({ result: ["Action item 1", "Action item 2"] })
    }
  }

  if (action === "getPickSuggestion") {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Pick one random but interesting and creative item for the category: "${payload}". Return only the item name.`,
        config: {
          maxOutputTokens: 50,
          temperature: 1.0,
        },
      })
      return NextResponse.json({
        result: response.text?.trim() || "Something amazing",
      })
    } catch (error) {
      return NextResponse.json({ result: "Surprise me!" })
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
