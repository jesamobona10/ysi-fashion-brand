"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Shield, UserCog, Search, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminUser {
  id: string
  email: string
  role: string
  created_at: string
  last_sign_in_at: string | null
  customers: { name: string | null; status: string } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    setError("")
    try {
      const { data: admins, error: adminErr } = await supabase
        .from("admins")
        .select("id, email, role, created_at, last_sign_in_at, customers:customers(name, status)")
        .order("created_at", { ascending: false })
      if (adminErr) throw adminErr
      setUsers((admins || []) as unknown as AdminUser[])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function toggleUserRole(userId: string, currentRole: string, userEmail: string) {
    setError("")
    if (currentRole === "superadmin") return
    const newRole = currentRole === "admin" ? "editor" : currentRole === "editor" ? "admin" : "editor"
    if (!confirm(`Change ${userEmail} from "${currentRole}" to "${newRole}"?`)) return
    try {
      const { error: updateErr } = await supabase
        .from("admins")
        .update({ role: newRole })
        .eq("id", userId)
      if (updateErr) throw updateErr
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.customers?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-playfair text-jet">Users & Roles</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Manage admin staff accounts and permissions</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-burgundy/10 border border-burgundy/20 text-burgundy text-sm font-poppins">{error}</div>
      )}

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-jet/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-4 bg-cream border border-jet/10 text-jet text-sm font-poppins focus:outline-none focus:border-gold/50"
          placeholder="Search by email or name..." />
      </div>

      <div className="bg-cream border border-jet/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-jet/10 text-jet/60 text-xs uppercase tracking-wider">
              <th className="text-left py-4 px-4 font-medium">User</th>
              <th className="text-left py-4 px-4 font-medium">Role</th>
              <th className="text-left py-4 px-4 font-medium">Status</th>
              <th className="text-left py-4 px-4 font-medium">Last Sign In</th>
              <th className="text-left py-4 px-4 font-medium">Joined</th>
              <th className="text-right py-4 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-jet/40 text-sm font-poppins">No users found</td>
              </tr>
            ) : (
              filtered.map((user) => {
                const isSuper = user.role === "superadmin"
                return (
                  <tr key={user.id} className="border-b border-jet/5 hover:bg-jet/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                          {isSuper ? <Shield size={15} /> : <UserCog size={15} />}
                        </div>
                        <div>
                          <p className="text-jet font-medium font-poppins text-sm">
                            {user.customers?.name || "No profile"}
                          </p>
                          <p className="text-jet/40 text-xs font-poppins">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-block px-2.5 py-1 text-xs font-poppins capitalize",
                        isSuper ? "bg-gold/10 text-gold" : "bg-jet/5 text-jet/70"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-block px-2.5 py-1 text-xs font-poppins",
                        user.customers?.status === "active" ? "text-emerald bg-emerald/5" : "text-burgundy bg-burgundy/5"
                      )}>
                        {user.customers?.status || "inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-jet/50 text-xs font-poppins">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 px-4 text-jet/50 text-xs font-poppins">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {!isSuper && (
                        <Button onClick={() => toggleUserRole(user.id, user.role, user.email)}
                          variant="ghost" size="sm">
                          {user.role === "editor" ? "Promote to Admin" : "Demote to Editor"}
                        </Button>
                      )}
                      {isSuper && <span className="text-xs text-jet/30 italic font-poppins">Superadmin</span>}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
