"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/app/lib/auth-context"
import { getCustomers } from "@/app/lib/api"
import type { CustomerSummary } from "@/app/types"
import { Loader2, ChevronRight, MapPin, User } from "lucide-react"

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  active:   { background: "#1a2a3a", color: "#60a5fa", border: "1px solid #1d4ed8" },
  new:      { background: "#1a3a2a", color: "#4ade80", border: "1px solid #166534" },
  on_hold:  { background: "#3a2a1a", color: "#fb923c", border: "1px solid #9a3412" },
  matched:  { background: "#2a1a3a", color: "#c084fc", border: "1px solid #7e22ce" },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.active
  return (
    <span
      style={{
        ...s,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 10,
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {status.replace("_", " ")}
    </span>
  )
}

function GenderBadge({ gender }: { gender: string }) {
  const isMale = gender === "male"
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontFamily: "'Inter', sans-serif",
        background: isMale ? "rgba(30,58,138,0.3)" : "rgba(131,24,67,0.25)",
        color: isMale ? "#93c5fd" : "#f9a8d4",
        border: isMale ? "1px solid rgba(30,64,175,0.35)" : "1px solid rgba(190,24,93,0.3)",
      }}
    >
      {isMale ? "♂ Male" : "♀ Female"}
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.city}`.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total:   customers.length,
    active:  customers.filter(c => c.status_tag === "active").length,
    matched: customers.filter(c => c.status_tag === "matched").length,
    new:     customers.filter(c => c.status_tag === "new").length,
  }

  return (
    <div style={{ padding: "36px 40px", maxWidth: 860, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 38, fontWeight: 300, color: "#F7F0E8", margin: 0 }}>
          Good morning, {user?.name.split(" ")[0]}
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.4)", fontSize: 13, marginTop: 6 }}>
          Here are the clients assigned to you
        </p>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {[
          { label: "Total Clients", value: stats.total },
          { label: "Active",        value: stats.active },
          { label: "Matched",       value: stats.matched },
          { label: "New",           value: stats.new },
        ].map(s => (
          <div
            key={s.label}
            style={{
              background: "rgba(45,21,32,0.75)",
              border: "1px solid rgba(139,26,47,0.22)",
              borderRadius: 14,
              padding: "18px 20px",
            }}
          >
            <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.38)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{s.label}</p>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#F7F0E8", fontSize: 34, fontWeight: 300, margin: 0, marginTop: 4, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 340,
            padding: "10px 16px",
            background: "rgba(45,21,32,0.75)",
            border: "1px solid rgba(139,26,47,0.22)",
            borderRadius: 12,
            color: "#F7F0E8",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={e => (e.target.style.borderColor = "rgba(139,26,47,0.55)")}
          onBlur={e => (e.target.style.borderColor = "rgba(139,26,47,0.22)")}
        />
      </div>

      {/* ── Client list ── */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 style={{ width: 24, height: 24, color: "#8B1A2F", animation: "spin 1s linear infinite" }} />
        </div>
      ) : error ? (
        <p style={{ fontFamily: "'Inter', sans-serif", color: "#f87171", fontSize: 13 }}>{error}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((c, i) => (
            <Link
              key={c.id}
              href={`/dashboard/customers/${c.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                background: "rgba(45,21,32,0.65)",
                border: "1px solid rgba(139,26,47,0.18)",
                borderRadius: 14,
                textDecoration: "none",
                transition: "border-color 0.15s, background 0.15s",
                animationDelay: `${i * 0.04}s`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,26,47,0.45)"
                ;(e.currentTarget as HTMLElement).style.background = "rgba(45,21,32,0.92)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,26,47,0.18)"
                ;(e.currentTarget as HTMLElement).style.background = "rgba(45,21,32,0.65)"
              }}
            >
              {/* Avatar */}
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
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {c.first_name.charAt(0)}{c.last_name.charAt(0)}
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", color: "#F7F0E8", fontSize: 14, fontWeight: 500 }}>
                    {c.first_name} {c.last_name}
                  </span>
                  <GenderBadge gender={c.gender} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.4)", fontSize: 12 }}>
                    <User style={{ width: 11, height: 11 }} /> {c.age} yrs
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.4)", fontSize: 12 }}>
                    <MapPin style={{ width: 11, height: 11 }} /> {c.city}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.3)", fontSize: 12, textTransform: "capitalize" }}>
                    {c.marital_status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <StatusBadge status={c.status_tag} />
              <ChevronRight style={{ width: 16, height: 16, color: "rgba(247,240,232,0.2)", flexShrink: 0 }} />
            </Link>
          ))}

          {filtered.length === 0 && (
            <p style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.3)", fontSize: 14 }}>
              No clients match your search.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
