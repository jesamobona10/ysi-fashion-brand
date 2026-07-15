"use client"

import { useAdminAuth } from "@/components/admin/auth-provider"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading, user } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.replace("/admin/login")
    }
  }, [loading, isAuthenticated, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center border border-jet/5 bg-ivory p-8 shadow-card">
          <h1 className="font-display text-2xl text-jet">Admin access required</h1>
          <p className="text-sm text-jet/50 font-poppins mt-3">
            Redirecting you to the admin login screen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-ivory/50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}