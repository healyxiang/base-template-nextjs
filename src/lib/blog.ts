import "server-only"
import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"
import { cache } from "react"
import type { Locale } from "@/config/site"
const meta = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  author: z.string().min(1),
  draft: z.boolean().default(false),
})
export const posts = cache(async (locale: Locale) => {
  const dir = path.join(process.cwd(), "content/blog", locale)
  const files = await fs.readdir(dir).catch(() => [] as string[])
  const entries = await Promise.all(
    files
      .filter((file) => /^[a-z0-9-]+\.mdx$/.test(file))
      .map(async (file) => {
        const { data, content } = matter(await fs.readFile(path.join(dir, file), "utf8"))
        return { ...meta.parse(data), slug: file.slice(0, -4), locale, content }
      })
  )
  return entries.filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date))
})
export async function post(locale: Locale, slug: string) {
  return (await posts(locale)).find((p) => p.slug === slug)
}
export function headings(content: string) {
  let inCode = false
  return content.split("\n").flatMap((line) => {
    if (line.startsWith("```")) {
      inCode = !inCode
      return []
    }
    const match = !inCode && /^## (.+)$/.exec(line)
    return match ? [match[1]] : []
  })
}
