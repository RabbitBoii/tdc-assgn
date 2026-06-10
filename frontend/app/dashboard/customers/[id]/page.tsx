"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCustomer, getMatches } from "@/app/lib/api"
import type { Profile, MatchResult } from "@/app/types"
import SendMatchModal from "@/app/components/SendMatchModal"
import {
  Loader2, ArrowLeft, MapPin, ChevronDown, ChevronUp, Send
} from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | number | string[] | null }) {
  if (!value && value !== 0) return null
  const display = Array.isArray(value) ? value.join(", ") : String(value)
  return (
    <div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(201,149,106,0.4)", margin: 0, marginBottom: 3 }}>{label}</p>
      <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.8)", fontSize: 13, textTransform: "capitalize", margin: 0 }}>{display}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(139,26,47,0.18)" }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(139,26,47,0.7)", margin: 0, whiteSpace: "nowrap" }}>{title}</p>
        <div style={{ flex: 1, height: 1, background: "rgba(139,26,47,0.18)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
        {children}
      </div>
    </div>
  )
}

const MATCH_LABEL_STYLES: Record<string, React.CSSProperties> = {
  excellent: { background: "#1a3020", color: "#4ade80", border: "1px solid #166534" },
  high:      { background: "#1a2535", color: "#60a5fa", border: "1px solid #1d4ed8" },
  good:      { background: "#2D1520", color: "#C9956A", border: "1px solid #8A6245" },
  possible:  { background: "#2a2520", color: "#a8a29e", border: "1px solid #57534e" },
}

function MatchLabel({ label }: { label: string }) {
  const lower = label.toLowerCase()
  const style =
    lower.includes("excellent") ? MATCH_LABEL_STYLES.excellent :
    lower.includes("high") || lower.includes("potential") ? MATCH_LABEL_STYLES.high :
    lower.includes("good") ? MATCH_LABEL_STYLES.good :
    MATCH_LABEL_STYLES.possible
  return (
    <span style={{
      ...style,
      padding: "2px 9px",
      borderRadius: 999,
      fontSize: 10,
      fontFamily: "'Inter', sans-serif",
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      fontWeight: 500,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 80 ? "#4ade80" : score >= 65 ? "#60a5fa" : score >= 50 ? "#C9956A" : "#a8a29e"
  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <svg viewBox="0 0 44 44" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(139,26,47,0.2)" strokeWidth="3" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: "#F7F0E8",
      }}>
        {score}
      </span>
    </div>
  )
}

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  active:  { background: "#1a2a3a", color: "#60a5fa", border: "1px solid #1d4ed8" },
  new:     { background: "#1a3a2a", color: "#4ade80", border: "1px solid #166534" },
  on_hold: { background: "#3a2a1a", color: "#fb923c", border: "1px solid #9a3412" },
  matched: { background: "#2a1a3a", color: "#c084fc", border: "1px solid #7e22ce" },
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [customer, setCustomer] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loadingCustomer, setLoadingCustomer] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    getCustomer(id)
      .then(setCustomer)
      .catch(e => setError(e.message))
      .finally(() => setLoadingCustomer(false))
    getMatches(id)
      .then(setMatches)
      .catch(() => {})
      .finally(() => setLoadingMatches(false))
  }, [id])

  if (loadingCustomer) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "160px 0" }}>
        <Loader2 style={{ width: 24, height: 24, color: "#8B1A2F", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div style={{ padding: 32, fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.4)", fontSize: 14 }}>
        {error || "Customer not found."}
      </div>
    )
  }

  const statusStyle = STATUS_STYLES[customer.status_tag] ?? STATUS_STYLES.active

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── Left panel: biodata ── */}
      <div
        style={{
          width: 360,
          flexShrink: 0,
          overflowY: "auto",
          padding: "24px 24px 32px",
          borderRight: "1px solid rgba(139,26,47,0.2)",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: "rgba(247,240,232,0.4)",
            fontSize: 12,
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            marginBottom: 22,
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.75)")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.4)")}
        >
          <ArrowLeft style={{ width: 13, height: 13 }} /> Back to clients
        </button>

        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: "linear-gradient(135deg, #5C1120, #8B1A2F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24,
              color: "#F7F0E8",
              flexShrink: 0,
            }}
          >
            {customer.first_name.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 300, color: "#F7F0E8", margin: 0, lineHeight: 1.2 }}>
              {customer.first_name} {customer.last_name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.4)", fontSize: 12 }}>
                <MapPin style={{ width: 11, height: 11 }} />{customer.city}
              </span>
              <span style={{ color: "rgba(247,240,232,0.2)", fontSize: 12 }}>·</span>
              <span style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.4)", fontSize: 12 }}>{customer.age} yrs</span>
            </div>
            {customer.status_tag && (
              <span style={{
                ...statusStyle,
                display: "inline-block",
                marginTop: 8,
                padding: "2px 10px",
                borderRadius: 999,
                fontSize: 10,
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
              }}>
                {customer.status_tag.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {customer.notes && (
          <div style={{
            background: "rgba(139,26,47,0.08)",
            border: "1px solid rgba(139,26,47,0.18)",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 22,
            fontFamily: "'Inter', sans-serif",
            color: "rgba(247,240,232,0.55)",
            fontSize: 12,
            fontStyle: "italic",
            lineHeight: 1.6,
          }}>
            {customer.notes}
          </div>
        )}

        {/* Bio sections */}
        <Section title="Personal">
          <Field label="Gender" value={customer.gender} />
          <Field label="Date of Birth" value={customer.date_of_birth} />
          <Field label="Religion" value={customer.religion} />
          <Field label="Caste" value={customer.caste} />
          <Field label="Marital Status" value={customer.marital_status?.replace("_", " ")} />
          <Field label="Mother Tongue" value={customer.mother_tongue} />
          <Field label="Languages" value={customer.languages_known} />
          <Field label="Manglik" value={customer.manglik} />
        </Section>

        <Section title="Professional">
          <Field label="Company" value={customer.current_company} />
          <Field label="Designation" value={customer.designation} />
          <Field label="Income" value={`₹${customer.income_lpa}L per annum`} />
          <Field label="College" value={customer.undergraduate_college} />
          <Field label="Degree" value={customer.degree} />
        </Section>

        <Section title="Location & Family">
          <Field label="City" value={customer.city} />
          <Field label="Country" value={customer.country} />
          <Field label="Height" value={`${customer.height_cm} cm`} />
          <Field label="Siblings" value={customer.siblings} />
          <Field label="Family Type" value={customer.family_type} />
          <Field label="Family Values" value={customer.family_values} />
        </Section>

        <Section title="Preferences">
          <Field label="Wants Kids" value={customer.want_kids} />
          <Field label="Open to Relocate" value={customer.open_to_relocate} />
          <Field label="Open to Pets" value={customer.open_to_pets} />
          <Field label="Diet" value={customer.diet} />
          <Field label="Drinking" value={customer.drinking} />
          <Field label="Smoking" value={customer.smoking} />
        </Section>

        <Section title="Contact">
          <Field label="Email" value={customer.email} />
          <Field label="Phone" value={customer.phone} />
        </Section>
      </div>

      {/* ── Right panel: matches ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, color: "#F7F0E8", margin: 0 }}>Suggested Matches</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.38)", fontSize: 12, marginTop: 4 }}>
              AI-ranked by compatibility · {matches.length} candidates
            </p>
          </div>
          {loadingMatches && <Loader2 style={{ width: 16, height: 16, color: "#8B1A2F", animation: "spin 1s linear infinite" }} />}
        </div>

        {matches.length === 0 && !loadingMatches ? (
          <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.3)", fontSize: 14 }}>
            No matches found for this profile.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {matches.map((m, i) => {
              const isExpanded = expandedMatch === m.profile.id
              return (
                <div
                  key={m.profile.id}
                  style={{
                    background: "rgba(45,21,32,0.75)",
                    border: "1px solid rgba(139,26,47,0.22)",
                    borderRadius: 14,
                    overflow: "hidden",
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  {/* Match card header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                    <ScoreRing score={m.score} />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", color: "#F7F0E8", fontSize: 14, fontWeight: 500 }}>
                          {m.profile.first_name} {m.profile.last_name}
                        </span>
                        <MatchLabel label={m.ai_label} />
                      </div>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(247,240,232,0.4)", fontSize: 12, margin: 0, marginTop: 3 }}>
                        {m.profile.age} yrs · {m.profile.city} · {m.profile.designation}
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(201,149,106,0.65)", fontSize: 11, fontStyle: "italic", margin: 0, marginTop: 4, lineHeight: 1.5 }}>
                        "{m.ai_explanation}"
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => setSelectedMatch(m.profile)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 13px",
                          background: "linear-gradient(135deg, rgba(139,26,47,0.35), rgba(168,32,64,0.35))",
                          border: "1px solid rgba(139,26,47,0.45)",
                          borderRadius: 9,
                          color: "rgba(247,240,232,0.75)",
                          fontSize: 12,
                          fontFamily: "'Inter', sans-serif",
                          cursor: "pointer",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#F7F0E8")}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.75)")}
                      >
                        <Send style={{ width: 12, height: 12 }} /> Send Match
                      </button>
                      <button
                        onClick={() => setExpandedMatch(isExpanded ? null : m.profile.id)}
                        style={{
                          padding: "7px 8px",
                          background: "transparent",
                          border: "1px solid rgba(139,26,47,0.2)",
                          borderRadius: 9,
                          color: "rgba(247,240,232,0.35)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.65)")}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(247,240,232,0.35)")}
                      >
                        {isExpanded
                          ? <ChevronUp style={{ width: 14, height: 14 }} />
                          : <ChevronDown style={{ width: 14, height: 14 }} />}
                      </button>
                    </div>
                  </div>

                  {/* Match reason chips */}
                  {m.match_reasons.length > 0 && (
                    <div style={{ padding: "0 18px 12px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {m.match_reasons.map((r, ri) => (
                        <span
                          key={ri}
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 10,
                            color: "rgba(247,240,232,0.5)",
                            background: "rgba(26,10,15,0.55)",
                            border: "1px solid rgba(139,26,47,0.18)",
                            padding: "2px 9px",
                            borderRadius: 999,
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expanded profile */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: "14px 18px",
                        borderTop: "1px solid rgba(139,26,47,0.18)",
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "10px 16px",
                      }}
                    >
                      {[
                        ["Religion",   m.profile.religion],
                        ["Caste",      m.profile.caste],
                        ["Education",  m.profile.degree],
                        ["College",    m.profile.undergraduate_college],
                        ["Income",     `₹${m.profile.income_lpa}L`],
                        ["Height",     `${m.profile.height_cm}cm`],
                        ["Marital",    m.profile.marital_status?.replace("_", " ")],
                        ["Wants Kids", m.profile.want_kids],
                        ["Relocate",   m.profile.open_to_relocate],
                        ["Diet",       m.profile.diet],
                        ["Values",     m.profile.family_values],
                        ["Languages",  m.profile.languages_known?.join(", ")],
                      ].map(([label, val]) => val ? (
                        <div key={label as string}>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(201,149,106,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, marginBottom: 2 }}>{label}</p>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(247,240,232,0.6)", textTransform: "capitalize", margin: 0 }}>{val as string}</p>
                        </div>
                      ) : null)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Send match modal ── */}
      {selectedMatch && (
        <SendMatchModal
          customerId={id}
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}
