import { AdminShell } from "@/components/admin/AdminShell"

/**
 * Persistent admin layout — wraps all /admin/* pages.
 * Auth enforcement is handled by middleware.ts; this layout only provides
 * the sidebar chrome.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
