"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { formatPrice, cn } from "@/lib/utils"
import { DataTable, type Column } from "@/components/admin/data-table"

const statusStyles: Record<string, string> = {
  pending: "bg-stone/10 text-stone border-stone/20",
  confirmed: "bg-gold/10 text-gold border-gold/20",
  tailoring: "bg-jet/5 text-jet border-jet/10",
  "quality-check": "bg-gold/10 text-gold border-gold/20",
  shipped: "bg-emerald/10 text-emerald border-emerald/20",
  delivered: "bg-emerald/10 text-emerald border-emerald/20",
  cancelled: "bg-burgundy/10 text-burgundy border-burgundy/20",
}

interface OrderRow {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  itemsCount: number
  total: number
  status: string
  paymentStatus: string
  createdAt: string
}

async function fetchOrders(): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(name, email, phone)")
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data as Record<string, unknown>[]) || []
  } catch {
    return []
  }
}

function mapOrder(raw: Record<string, unknown>): OrderRow {
  const customer = raw.customers as Record<string, unknown> | undefined
  return {
    id: String(raw.id || ""),
    orderNumber: String(raw.order_number || raw.id || ""),
    customerName: String(customer?.name || "Guest"),
    customerEmail: String(customer?.email || ""),
    customerPhone: String(customer?.phone || ""),
    itemsCount: Number(raw.items_count || 0),
    total: Number(raw.total || 0),
    status: String(raw.status || "pending"),
    paymentStatus: String(raw.payment_status || "pending"),
    createdAt: String(raw.created_at || new Date().toISOString()),
  }
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders((data || []).map((o) => mapOrder(o)))
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(
    () => statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter),
    [orders, statusFilter]
  )

  const statuses = ["all", "pending", "confirmed", "tailoring", "quality-check", "shipped", "delivered", "cancelled"]

  const columns: Column<OrderRow>[] = useMemo(
    () => [
      {
        key: "orderNumber",
        header: "Order",
        sortable: true,
        render: (o) => (<span className="font-medium text-jet">{o.orderNumber}</span>),
      },
      {
        key: "customerName",
        header: "Customer",
        sortable: true,
        render: (o) => o.customerName,
      },
      {
        key: "itemsCount",
        header: "Items",
        render: (o) => (<span className="text-jet/60">{o.itemsCount} item{o.itemsCount !== 1 ? "s" : ""}</span>),
        className: "hidden lg:table-cell",
      },
      {
        key: "total",
        header: "Total",
        sortable: true,
        render: (o) => formatPrice(o.total),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (o) => (
          <span className={cn("inline-block px-2.5 py-1 text-[10px] font-poppins uppercase tracking-luxe border", statusStyles[o.status])}>
            {o.status.replace("-", " ")}
          </span>
        ),
      },
      {
        key: "paymentStatus",
        header: "Payment",
        render: (o) => (
          <span className={cn("text-[10px] font-poppins uppercase tracking-luxe",
            o.paymentStatus === "paid" ? "text-emerald" : o.paymentStatus === "refunded" ? "text-burgundy" : "text-stone"
          )}>
            {o.paymentStatus}
          </span>
        ),
        className: "hidden lg:table-cell",
      },
      {
        key: "createdAt",
        header: "Date",
        sortable: true,
        render: (o) => new Date(o.createdAt).toLocaleDateString(),
        className: "hidden lg:table-cell",
      },
    ],
    []
  )

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-9 w-32 bg-jet/5 animate-pulse" />
          <div className="h-4 w-24 bg-jet/5 animate-pulse mt-2" />
        </div>
        <div className="bg-cream border border-jet/5 p-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-jet/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-jet">Orders</h1>
        <p className="text-jet/50 text-sm font-poppins mt-1">{orders.length} total orders</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-4 py-2 text-[10px] font-poppins uppercase tracking-luxe border transition-all",
              statusFilter === s ? "bg-jet text-cream border-jet" : "border-jet/10 text-jet/50 hover:border-jet/30"
            )}
          >
            {s === "all" ? "All" : s.replace("-", " ")}
            {s !== "all" && (
              <span className="ml-1.5 text-[9px] opacity-60">({orders.filter((o) => o.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-cream border border-jet/5">
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={filtered as unknown as Record<string, unknown>[]}
          keyExtractor={(o) => o.orderNumber as string}
          onRowClick={(o) => router.push(`/admin/orders/${o.id}`)}
          searchable
          searchPlaceholder="Search by order # or customer..."
          pageSize={15}
          emptyMessage="No orders match this filter"
        />
      </div>
    </div>
  )
}
