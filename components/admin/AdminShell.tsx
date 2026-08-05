"use client"

/**
 * AdminShell — persistent sidebar layout for all /admin/* pages.
 *
 * Responsibilities:
 *   - On mount: attempt token refresh so getUser() is populated after a
 *     page reload (access token is in-memory only).
 *   - Sidebar nav links scoped by role (csi_staff sees all; client_contact
 *     sees only dashboard).
 *   - Hamburger collapse on mobile (lg:always-visible).
 *   - Logout button calls POST /auth/logout then redirects to /login.
 */

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { getUser, isAuthenticated, logout, refreshAccessToken } from "@/lib/auth"
import type { UserInfo } from "@/lib/auth"

interface NavItem {
  href: string
  label: string
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard",       label: "Dashboard",   roles: ["client_contact", "csi_staff"] },
  { href: "/admin/csi",             label: "Overview",    roles: ["csi_staff"] },
  { href: "/admin/csi/providers",   label: "Providers",   roles: ["csi_staff"] },
  { href: "/admin/csi/taxonomy",    label: "Taxonomy",    roles: ["csi_staff"] },
  { href: "/admin/csi/clients",     label: "Clients",     roles: ["csi_staff"] },
]

const ROLE_LABELS: Record<string, string> = {
  csi_staff:      "CSI Staff",
  client_contact: "Client Contact",
  public:         "Public",
}

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const router   = useRouter()
  const pathname = usePathname()

  const [user, setUser]           = useState<UserInfo | null>(null)
  const [sidebarOpen, setSidebar] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [ready, setReady]         = useState(false)

  // On mount: refresh access token so user info is available after a page reload.
  useEffect(() => {
    async function init() {
      if (!isAuthenticated()) {
        await refreshAccessToken()
      }
      setUser(getUser())
      setReady(true)
    }
    void init()
  }, [])

  const handleLogout = useCallback(async () => {
    setLoggingOut(true)
    await logout()
    router.push("/login")
  }, [router])

  const visibleNav = NAV_ITEMS.filter(
    item => !user || item.roles.includes(user.role),
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-on-surface/40 lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        id="admin-sidebar"
        className={[
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-border bg-surface",
          "transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Admin navigation"
      >
        {/* Logo / brand */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-base font-semibold text-foreground">
            CSI Admin
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul role="list" className="space-y-0.5">
            {visibleNav.map(item => {
              const active = pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebar(false)}
                    className={[
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info + logout */}
        <div className="border-t border-border px-4 py-3">
          {ready && user ? (
            <>
              <p className="truncate text-xs font-medium text-foreground">{user.email}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </>
          ) : (
            <div className="h-8 animate-pulse rounded bg-muted" />
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-3 w-full rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center border-b border-border bg-surface px-4 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
            onClick={() => setSidebar(true)}
            className="rounded-md p-1.5 text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {/* Hamburger icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 14.75z"
              />
            </svg>
          </button>
          <span className="ml-3 text-sm font-semibold text-foreground">CSI Admin</span>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
