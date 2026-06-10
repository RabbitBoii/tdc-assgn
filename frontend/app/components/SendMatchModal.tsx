"use client"

import { useState } from "react"
import { X, Send, Loader2, CheckCircle } from "lucide-react"
import { sendMatch } from "@/app/lib/api"
import type { Profile } from "@/app/types"

interface Props {
  customerId: string
  match: Profile
  onClose: () => void
}

export default function SendMatchModal({ customerId, match, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null)
  const [error, setError] = useState("")

  const handleSend = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await sendMatch(customerId, match.id)
      setResult({ subject: res.preview_subject, body: res.preview_body })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send match")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(10,4,7,0.88)",
        backdropFilter: "blur(8px)",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#2D1520",
          border: "1px solid rgba(139,26,47,0.45)",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(139,26,47,0.18)",
          }}
        >
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 300, color: "#F7F0E8", margin: 0 }}>
              Send Introduction
            </h3>
            <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.38)", fontSize: 12, marginTop: 4 }}>
              Preview the email that will be sent to your client
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(247,240,232,0.35)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.75)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.35)")}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* ── Match preview ── */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(139,26,47,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #5C1120, #8B1A2F)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F7F0E8",
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {match.first_name.charAt(0)}{match.last_name.charAt(0)}
            </div>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "#F7F0E8", fontSize: 14, fontWeight: 500, margin: 0 }}>
                {match.first_name} {match.last_name}
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.4)", fontSize: 12, margin: 0, marginTop: 2 }}>
                {match.age} yrs · {match.city} · {match.designation}
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px 24px" }}>
          {!result ? (
            <>
              <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.58)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                This will generate a personalised introduction email for your client about{" "}
                <span style={{ color: "#F7F0E8" }}>{match.first_name}</span>.
                {" "}No actual email is sent in this demo.
              </p>
              {error && (
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#f87171",
                  background: "rgba(153,27,27,0.15)",
                  border: "1px solid rgba(153,27,27,0.3)",
                  borderRadius: 10,
                  padding: "9px 13px",
                  marginBottom: 16,
                }}>
                  {error}
                </p>
              )}
              <button
                onClick={handleSend}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  background: loading ? "rgba(139,26,47,0.3)" : "linear-gradient(135deg, #8B1A2F, #A82040)",
                  border: "1px solid rgba(201,149,106,0.22)",
                  borderRadius: 12,
                  color: "#F7F0E8",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading
                  ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Generating...</>
                  : <><Send style={{ width: 15, height: 15 }} /> Preview introduction email</>}
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4ade80" }}>
                <CheckCircle style={{ width: 16, height: 16 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13 }}>Introduction email ready</span>
              </div>

              {/* Subject */}
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(201,149,106,0.5)", marginBottom: 6 }}>Subject</p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "rgba(247,240,232,0.8)",
                  fontSize: 12,
                  background: "rgba(26,10,15,0.55)",
                  border: "1px solid rgba(139,26,47,0.18)",
                  borderRadius: 10,
                  padding: "9px 13px",
                  margin: 0,
                }}>
                  {result.subject}
                </p>
              </div>

              {/* Body */}
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(201,149,106,0.5)", marginBottom: 6 }}>Email body</p>
                <pre style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "rgba(247,240,232,0.65)",
                  fontSize: 12,
                  background: "rgba(26,10,15,0.55)",
                  border: "1px solid rgba(139,26,47,0.18)",
                  borderRadius: 10,
                  padding: "12px 13px",
                  whiteSpace: "pre-wrap",
                  maxHeight: 200,
                  overflowY: "auto",
                  margin: 0,
                }}>
                  {result.body}
                </pre>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "11px 0",
                  background: "transparent",
                  border: "1px solid rgba(139,26,47,0.25)",
                  borderRadius: 12,
                  color: "rgba(247,240,232,0.55)",
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.9)")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.55)")}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
