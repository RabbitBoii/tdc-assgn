import type { CustomerSummary, Profile, MatchResult, SendMatchResponse } from "@/app/types"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("tdc_token")
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem("tdc_token")
    localStorage.removeItem("tdc_user")
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(err.detail || "Request failed")
  }
  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  const data = await handleResponse<{ access_token: string }>(res)
  return data.access_token
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function getCustomers(): Promise<CustomerSummary[]> {
  const res = await fetch(`${BASE}/customers`, { headers: authHeaders() })
  return handleResponse<CustomerSummary[]>(res)
}

export async function getCustomer(id: string): Promise<Profile> {
  const res = await fetch(`${BASE}/customers/${id}`, { headers: authHeaders() })
  return handleResponse<Profile>(res)
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function getMatches(customerId: string): Promise<MatchResult[]> {
  const res = await fetch(`${BASE}/matches/${customerId}`, { headers: authHeaders() })
  return handleResponse<MatchResult[]>(res)
}

// ─── Send match ───────────────────────────────────────────────────────────────

export async function sendMatch(customerId: string, matchId: string): Promise<SendMatchResponse> {
  const res = await fetch(`${BASE}/send-match`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ customer_id: customerId, match_id: matchId }),
  })
  return handleResponse<SendMatchResponse>(res)
}
