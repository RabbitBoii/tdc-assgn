"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { login as apiLogin } from "@/app/lib/api"

interface AuthUser {
  username: string
  name: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("tdc_user")
    const token = localStorage.getItem("tdc_token")
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const token = await apiLogin(username, password)
    // Derive display name from username
    const nameMap: Record<string, string> = {
      priya: "Priya Sharma",
      arjun: "Arjun Mehta",
    }
    const authUser: AuthUser = { username, name: nameMap[username] || username }
    localStorage.setItem("tdc_token", token)
    localStorage.setItem("tdc_user", JSON.stringify(authUser))
    setUser(authUser)
    router.push("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem("tdc_token")
    localStorage.removeItem("tdc_user")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
