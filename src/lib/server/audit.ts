import { createServiceSupabaseClient } from "@/lib/supabase/server"

export interface AuditEvent {
  adminId: string
  adminEmail: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export async function logAdminAction(event: AuditEvent) {
  const client = createServiceSupabaseClient()
  const { error } = await client.from("admin_audit_log").insert({
    admin_id: event.adminId,
    admin_email: event.adminEmail,
    action: event.action,
    entity_type: event.entityType,
    entity_id: event.entityId || null,
    details: event.details ? JSON.parse(JSON.stringify(event.details)) : null,
    ip_address: event.ipAddress || null,
  })
  if (error) {
    console.error("Failed to log admin audit event:", error.message)
  }
}
