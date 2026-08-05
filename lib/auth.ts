/**
 * Client-side auth utilities for Civic Service Index.
 *
 * Access tokens are stored in module-level memory only — never in localStorage
 * or sessionStorage — to prevent XSS exfiltration.
 *
 * The refresh token travels exclusively as an httpOnly cookie managed by the
 * backend; this module never reads or writes it directly.
 *
 * The access token is ALSO written to a client-accessible cookie (access_token,
 * path=/, max-age=1800) so that Next.js Edge middleware can read it for auth
 * gating without needing the httpOnly refresh_token (which has path=/api/v1/auth
 * and is therefore invisible to middleware running on /admin/* routes).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

// ── Cookie helpers ────────────────────────────────────────────────────────────

const ACCESS_COOKIE = "access_token"
const ACCESS_COOKIE_MAX_AGE = 1800 // 30 minutes, matching JWT expiry

function _setAccessCookie(token: string): void {
  if (typeof document === "undefined") return
  document.cookie = `${ACCESS_COOKIE}=${token}; path=/; max-age=${ACCESS_COOKIE_MAX_AGE}; SameSite=Lax`
}

function _clearAccessCookie(): void {
  if (typeof document === "undefined") return
  document.cookie = `${ACCESS_COOKIE}=; path=/; max-age=0`
}

// ── In-memory store ───────────────────────────────────────────────────────────

let _accessToken: string | null = null

export interface UserInfo {
  id: string
  email: string
  role: string
  is_active: boolean
}

let _user: UserInfo | null = null

// ── Public API ────────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return _accessToken
}

export function getUser(): UserInfo | null {
  return _user
}

export function isAuthenticated(): boolean {
  return _accessToken !== null
}

/**
 * Log in with email + password.
 * On success, stores the access token in memory, fetches /auth/me to populate
 * user info, and returns the user's role string.
 * On failure returns null.
 */
export async function login(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // allow the refresh cookie to be set
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) return null

  const data = await res.json()
  _accessToken = data.access_token ?? null
  if (!_accessToken) return null

  _setAccessCookie(_accessToken)

  // Fetch user info so getUser() and getRole() work immediately after login
  await _fetchUserInfo()

  return _user?.role ?? null
}

/**
 * Attempt to obtain a fresh access token using the httpOnly refresh cookie.
 * Called on page load when the in-memory token has been lost (e.g. page refresh).
 * Returns true if a new token was obtained.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })

  if (!res.ok) {
    _accessToken = null
    _user = null
    return false
  }

  const data = await res.json()
  _accessToken = data.access_token ?? null
  if (!_accessToken) return false

  _setAccessCookie(_accessToken)

  // Populate user info if not already loaded
  if (!_user) await _fetchUserInfo()

  return true
}

/**
 * Log out: revoke the refresh token server-side and clear local state.
 */
export async function logout(): Promise<void> {
  _accessToken = null
  _user = null
  _clearAccessCookie()
  await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {
    // best-effort — local state is already cleared
  })
}

/**
 * Return a fetch-compatible Authorization header object if a token is present.
 */
export function authHeaders(): Record<string, string> {
  return _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function _fetchUserInfo(): Promise<void> {
  if (!_accessToken) return
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${_accessToken}` },
    })
    if (res.ok) _user = await res.json()
  } catch {
    // non-fatal — user info stays null
  }
}
