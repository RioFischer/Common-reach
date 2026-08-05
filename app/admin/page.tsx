import { cookies } from "next/headers"
import { redirect } from "next/navigation"

/**
 * /admin — server-side role-based redirect.
 *
 * Middleware has already confirmed the refresh_token cookie is present.
 * Decode the role claim to send users to the right home page:
 *   csi_staff       → /admin/csi
 *   client_contact  → /admin/dashboard
 *   anything else   → /admin/dashboard (safe fallback)
 */
export default function AdminRootPage() {
  const cookieStore = cookies()
  const refreshToken = cookieStore.get("refresh_token")?.value ?? null

  let role: string | null = null
  if (refreshToken) {
    try {
      const parts = refreshToken.split(".")
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(
            parts[1].replace(/-/g, "+").replace(/_/g, "/"),
            "base64",
          ).toString("utf8"),
        ) as Record<string, unknown>
        role = (payload.role as string) ?? null
      }
    } catch {
      // fall through to default redirect
    }
  }

  redirect(role === "csi_staff" ? "/admin/csi" : "/admin/dashboard")
}
