"use client"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { browserClient } from "@/lib/supabase/client"
import { track } from "@/lib/analytics"
type AuthState = {
  user: User | null
  ready: boolean
  configured: boolean
  signOut: () => Promise<void>
}
const AuthContext = createContext<AuthState>({
  user: null,
  ready: false,
  configured: false,
  signOut: async () => {},
})
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const client = browserClient()
    if (!client) {
      queueMicrotask(() => setReady(true))
      return
    }
    let active = true
    const update = (next: User | null) => {
      if (!active) return
      setUser(next)
      setReady(true)
      if (next)
        void fetch("/api/account")
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.signupCreated) track("sign_up")
          })
          .catch(() => {})
    }
    void client.auth
      .getUser()
      .then(({ data }) => update(data.user))
      .catch(() => {
        if (active) setReady(true)
      })
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => update(session?.user ?? null))
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])
  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        configured:
          !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        signOut: async () => {
          await browserClient()?.auth.signOut()
          setUser(null)
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  return useContext(AuthContext)
}
