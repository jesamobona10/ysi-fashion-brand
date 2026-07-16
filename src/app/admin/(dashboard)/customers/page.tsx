"use client"

import { useMemo, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { formatPrice, cn } from "@/lib/utils"
import { DataTable, type Column } from "@/components/admin/data-table"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Phone, Calendar, ShoppingBag, DollarSign, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomerRow {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  totalOrders: number
  totalSpent: number
  joinDate: string
  status: string
  lastOrderDate?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
  }
}

async function fetchCustomers(): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return (data as Record<string, unknown>[]) || []
  } catch {
    return []
  }
}

function mapCustomer(raw: Record<string, unknown>): CustomerRow {
  return {
    id: String(raw.id || ""),
    name: String(raw.name || ""),
    email: String(raw.email || ""),
    phone: String(raw.phone || ""),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(String(raw.name || ""))}&background=1a1a1a&color=d4af37`,
    totalOrders: Number(raw.total_orders || 0),
    totalSpent: Number(raw.total_spent || 0),
    joinDate: String(raw.created_at || new Date().toISOString()),
    status: String(raw.status || "active"),
    lastOrderDate: raw.last_order_date ? String(raw.last_order_date) : undefined,
    address: raw.address as { street: string; city: string; state: string; country: string } | undefined,
  }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CustomerRow | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchCustomers().then((data) => {
      setCustomers((data || []).map((c) => mapCustomer(c)))
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(
    () => statusFilter === "all" ? customers : customers.filter((c) => c.status === statusFilter),
    [customers, statusFilter]
  )

  const columns: Column<CustomerRow>[] = useMemo(
    () => [
      {
        key: "avatar",
        header: "",
        render: (c) => c.avatar ? (
          <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-jet/10 flex items-center justify-center text-[10px] font-poppins text-jet/40">{getInitials(c.name)}</div>
        ),
      },
      {
        key: "name",
        header: "Name",
        sortable: true,
        render: (c) => (
          <div>
            <p className="font-medium text-jet">{c.name}</p>
            <p className="text-[10px] text-jet/40">{c.email}</p>
          </div>
        ),
      },
      { key: "phone", header: "Phone", className: "hidden lg:table-cell" },
      { key: "totalOrders", header: "Orders", sortable: true, className: "hidden lg:table-cell" },
      {
        key: "totalSpent",
        header: "Total Spent",
        sortable: true,
        render: (c) => formatPrice(c.totalSpent),
      },
      {
        key: "joinDate",
        header: "Member Since",
        sortable: true,
        render: (c) => new Date(c.joinDate).toLocaleDateString(),
        className: "hidden lg:table-cell",
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (c) => (
          <span className={cn("inline-block px-2.5 py-1 text-[10px] font-poppins uppercase tracking-luxe border",
            c.status === "vip" ? "bg-gold/10 text-gold border-gold/20" : c.status === "active" ? "bg-emerald/10 text-emerald border-emerald/20" : "bg-stone/10 text-stone border-stone/20")}>
            {c.status}
          </span>
        ),
      },
    ],
    []
  )

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-9 w-48 bg-jet/5 animate-pulse" />
          <div className="h-4 w-36 bg-jet/5 animate-pulse mt-2" />
        </div>
        <div className="bg-cream border border-jet/5 p-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-jet/5 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-jet/5 animate-pulse" />
                  <div className="h-3 w-24 bg-jet/5 animate-pulse mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-jet">Customers</h1>
        <p className="text-jet/50 text-sm font-poppins mt-1">{customers.length} registered customers</p>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "active", "vip", "inactive"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("px-4 py-2 text-[10px] font-poppins uppercase tracking-luxe border transition-all",
              statusFilter === s ? "bg-jet text-cream border-jet" : "border-jet/10 text-jet/50 hover:border-jet/30")}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="bg-cream border border-jet/5">
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={filtered as unknown as Record<string, unknown>[]}
          keyExtractor={(c) => c.id as string}
          onRowClick={(c) => setSelected(c as unknown as CustomerRow)}
          searchable
          searchPlaceholder="Search customers..."
          pageSize={10}
          emptyMessage="No customers found"
        />
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-jet/20 backdrop-blur-sm flex justify-end"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg bg-cream h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt={selected.name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-jet/10 flex items-center justify-center text-sm font-poppins text-jet/40">{getInitials(selected.name)}</div>
                    )}
                    <div>
                      <h2 className="font-display text-2xl text-jet">{selected.name}</h2>
                      <span className={cn("inline-block mt-1 px-2.5 py-1 text-[10px] font-poppins uppercase tracking-luxe border",
                        selected.status === "vip" ? "bg-gold/10 text-gold border-gold/20" : selected.status === "active" ? "bg-emerald/10 text-emerald border-emerald/20" : "bg-stone/10 text-stone border-stone/20")}>
                        {selected.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-jet/30 hover:text-jet transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <DetailRow icon={<Mail size={14} />} label="Email" value={selected.email} />
                  <DetailRow icon={<Phone size={14} />} label="Phone" value={selected.phone} />
                  <DetailRow icon={<Calendar size={14} />} label="Member Since" value={new Date(selected.joinDate).toLocaleDateString()} />
                  <DetailRow icon={<ShoppingBag size={14} />} label="Total Orders" value={String(selected.totalOrders)} />
                  <DetailRow icon={<DollarSign size={14} />} label="Total Spent" value={formatPrice(selected.totalSpent)} />
                  {selected.lastOrderDate && <DetailRow icon={<Calendar size={14} />} label="Last Order" value={new Date(selected.lastOrderDate).toLocaleDateString()} />}
                  {selected.address && <DetailRow icon={<MapPin size={14} />} label="Address" value={`${selected.address.street}, ${selected.address.city}, ${selected.address.state}, ${selected.address.country}`} />}
                </div>
                <div className="mt-8 pt-6 border-t border-jet/5">
                  <h3 className="font-poppins text-[10px] uppercase tracking-luxe text-jet/40 mb-3">Quick Actions</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Mail size={13} /> Send Email</Button>
                    <Button variant="outline" size="sm">View Orders</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-jet/5 last:border-0">
      <span className="text-jet/30 w-5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-poppins uppercase tracking-luxe text-jet/40">{label}</p>
        <p className="text-sm font-poppins text-jet">{value}</p>
      </div>
    </div>
  )
}
