"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/lib/auth-context"
import { Heart, Users, LogOut, Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#1A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 24, height: 24, color: "#8B1A2F", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  if (!user) return null

  const isActive = pathname === "/dashboard"

  return (
    <div style={{ minHeight: "100vh", background: "#1A0A0F", display: "flex" }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "rgba(45,21,32,0.97)",
          borderRight: "1px solid rgba(139,26,47,0.25)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 18px",
            borderBottom: "1px solid rgba(139,26,47,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(139,26,47,0.2)",
                border: "1px solid rgba(139,26,47,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart style={{ width: 15, height: 15, color: "#C9956A" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#F7F0E8", fontSize: 18, lineHeight: 1, margin: 0 }}>TDC</p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(201,149,106,0.5)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0, marginTop: 2 }}>Matchmaker</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.15s",
              ...(isActive
                ? { background: "rgba(139,26,47,0.22)", color: "#F7F0E8", border: "1px solid rgba(139,26,47,0.35)" }
                : { background: "transparent", color: "rgba(247,240,232,0.5)", border: "1px solid transparent" }),
            }}
          >
            <Users style={{ width: 15, height: 15 }} />
            My Clients
          </Link>
        </nav>

        {/* User + logout */}
        <div style={{ padding: "14px 14px 16px", borderTop: "1px solid rgba(139,26,47,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8B1A2F, #C9956A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F7F0E8",
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "#F7F0E8", fontSize: 13, fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.38)", fontSize: 11, margin: 0, marginTop: 1 }}>Matchmaker</p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 10px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid transparent",
              color: "rgba(247,240,232,0.38)",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.75)"
              ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(139,26,47,0.1)"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.38)"
              ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
            }}
          >
            <LogOut style={{ width: 13, height: 13 }} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  )
}
