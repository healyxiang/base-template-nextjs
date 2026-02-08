export async function decomposeTask(taskDescription: string): Promise<string[]> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "decomposeTask",
        payload: taskDescription,
      }),
    })
    const data = await res.json()
    return data.result
  } catch (error) {
    console.error("AI decomposition failed:", error)
    return ["Action item 1", "Action item 2"]
  }
}

export async function getPickSuggestion(category: string): Promise<string> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getPickSuggestion",
        payload: category,
      }),
    })
    const data = await res.json()
    return data.result
  } catch (error) {
    return "Surprise me!"
  }
}
