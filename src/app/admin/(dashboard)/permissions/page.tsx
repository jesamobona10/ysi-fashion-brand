"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Shield, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { useAdminAuth } from "@/components/admin/auth-provider"

interface PermissionGroup {
  [group: string]: { code: string; name: string; description: string | null }[]
}

export default function AdminPermissionsPage() {
  const [groups, setGroups] = useState<PermissionGroup>({})
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({})
  const [roles] = useState(["super-admin", "admin", "manager"])
  const [activeRole, setActiveRole] = useState("manager")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const { user } = useAdminAuth()
  const { toast } = useToast()

  const isSuperAdmin = user?.role === "super-admin"

  useEffect(() => { fetchPermissions() }, [])

  async function fetchPermissions() {
    setLoading(true)
    try {
      const res = await fetch("/api/permissions")
      const data = await res.json()
      if (data.groups) setGroups(data.groups)
      if (data.rolePermissions) setRolePermissions(data.rolePermissions)
    } catch {} finally {
      setLoading(false)
    }
  }

  async function togglePermission(permissionCode: string, currentlyGranted: boolean) {
    if (!isSuperAdmin) {
      toast({ title: "Only super admins can change permissions", variant: "error" })
      return
    }
    setSaving(permissionCode)
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: activeRole,
          permissionCode,
          granted: !currentlyGranted,
        }),
      })
      if (!res.ok) throw new Error("Failed to update")
      setRolePermissions((prev) => {
        const current = prev[activeRole] || []
        return {
          ...prev,
          [activeRole]: currentlyGranted
            ? current.filter((c) => c !== permissionCode)
            : [...current, permissionCode],
        }
      })
      toast({ title: currentlyGranted ? "Permission revoked" : "Permission granted", variant: "success" })
    } catch {
      toast({ title: "Failed to update permission", variant: "error" })
    } finally {
      setSaving(null)
    }
  }

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
          <h1 className="text-2xl font-playfair text-jet">Permissions</h1>
          <p className="text-jet/50 text-sm font-poppins mt-1">Granular role-based access control</p>
        </div>
        <Button onClick={fetchPermissions} variant="outline" size="sm">
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {/* Role selector */}
      <div className="flex gap-2 mb-8">
        {roles.map((role) => {
          const permCount = rolePermissions[role]?.length || 0
          return (
            <button key={role} onClick={() => setActiveRole(role)}
              className={cn(
                "flex items-center gap-2 px-5 h-11 text-xs font-poppins uppercase tracking-luxe transition-all",
                activeRole === role
                  ? "bg-jet text-cream"
                  : "bg-cream text-jet/50 border border-jet/10 hover:text-jet"
              )}>
              <Shield size={14} />
              <span>{role.replace("-", " ")}</span>
              <span className={cn("text-[10px] ml-1", activeRole === role ? "text-cream/50" : "text-jet/30")}>
                {permCount} perms
              </span>
            </button>
          )
        })}
      </div>

      {!isSuperAdmin && (
        <div className="mb-6 p-4 bg-amber/5 border border-amber/20 text-amber text-xs font-poppins">
          You are viewing permissions. Only super admins can make changes.
        </div>
      )}

      {/* Permission groups */}
      <div className="space-y-6">
        {Object.entries(groups).map(([group, perms]) => (
          <div key={group} className="bg-cream border border-jet/10">
            <div className="px-6 py-3 border-b border-jet/5">
              <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40">{group}</h3>
            </div>
            <div className="divide-y divide-jet/5">
              {perms.map((perm) => {
                const granted = rolePermissions[activeRole]?.includes(perm.code) || false
                const isSaving = saving === perm.code
                return (
                  <div key={perm.code} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="font-poppins text-sm text-jet">{perm.name}</p>
                      {perm.description && (
                        <p className="text-[11px] font-poppins text-jet/40 mt-0.5">{perm.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => togglePermission(perm.code, granted)}
                      disabled={!isSuperAdmin || isSaving}
                      className={cn(
                        "w-9 h-9 flex items-center justify-center transition-all shrink-0",
                        granted ? "text-emerald bg-emerald/5" : "text-jet/20 bg-jet/5",
                        isSuperAdmin && !isSaving && "hover:bg-jet/10",
                        isSaving && "animate-pulse"
                      )}>
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : granted ? <Check size={15} /> : <X size={15} />}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
