"use client"

import { useState, FormEvent } from "react"
import { useAuth } from "@/app/lib/auth-context"
import { Heart, Loader2 } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(username, password)
    } catch {
      setError("Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1A0A0F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Mandala background rings ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", border: "1px solid rgba(139,26,47,0.12)", animation: "spin-slow 20s linear infinite" }} />
        <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", border: "1px dashed rgba(139,26,47,0.18)", animation: "spin-slow-reverse 15s linear infinite" }} />
        <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(201,149,106,0.12)", animation: "spin-slow 30s linear infinite" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(139,26,47,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(201,149,106,0.2)" }} />
      </div>

      {/* ── Card wrapper ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 440,
          margin: "0 24px",
          animation: "fade-up 0.6s ease forwards",
          animationDelay: "0.1s",
          opacity: 0,
        }}
      >
        {/* ── Logo mark ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(139,26,47,0.2)",
              border: "1px solid rgba(139,26,47,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Heart style={{ width: 22, height: 22, color: "#C9956A" }} />
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 38,
              fontWeight: 300,
              letterSpacing: "0.04em",
              color: "#F7F0E8",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            The Date Crew
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(201,149,106,0.7)",
              marginTop: 8,
            }}
          >
            Matchmaker Portal
          </p>
        </div>

        {/* ── Form card ── */}
        <div
          style={{
            background: "rgba(45,21,32,0.85)",
            border: "1px solid rgba(139,26,47,0.35)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: 20,
            padding: "40px 40px 36px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 26,
              fontWeight: 300,
              color: "#F7F0E8",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Welcome back
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "rgba(247,240,232,0.4)",
              marginBottom: 32,
            }}
          >
            Sign in to your matchmaker account
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Username */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(201,149,106,0.65)",
                  marginBottom: 8,
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. priya"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(26,10,15,0.7)",
                  border: "1px solid rgba(139,26,47,0.3)",
                  borderRadius: 12,
                  color: "#F7F0E8",
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(139,26,47,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(139,26,47,0.3)")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(201,149,106,0.65)",
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(26,10,15,0.7)",
                  border: "1px solid rgba(139,26,47,0.3)",
                  borderRadius: 12,
                  color: "#F7F0E8",
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(139,26,47,0.7)")}
                onBlur={e => (e.target.style.borderColor = "rgba(139,26,47,0.3)")}
              />
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#f87171",
                  background: "rgba(153,27,27,0.15)",
                  border: "1px solid rgba(153,27,27,0.3)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 0",
                marginTop: 6,
                background: loading
                  ? "rgba(139,26,47,0.4)"
                  : "linear-gradient(135deg, #8B1A2F 0%, #A82040 100%)",
                color: "#F7F0E8",
                border: "1px solid rgba(201,149,106,0.25)",
                borderRadius: 12,
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity 0.2s, transform 0.1s",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88" }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* ── Demo credentials ── */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid rgba(139,26,47,0.15)",
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "rgba(247,240,232,0.3)",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Demo credentials
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { user: "priya", pass: "tdc@123" },
                { user: "arjun", pass: "tdc@456" },
              ].map(({ user, pass }) => (
                <button
                  key={user}
                  type="button"
                  onClick={() => { setUsername(user); setPassword(pass) }}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    background: "rgba(26,10,15,0.5)",
                    border: "1px solid rgba(139,26,47,0.18)",
                    borderRadius: 10,
                    color: "rgba(247,240,232,0.5)",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    cursor: "pointer",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.85)"
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,26,47,0.4)"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.5)"
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,26,47,0.18)"
                  }}
                >
                  {user} / {pass}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
