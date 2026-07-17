"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  Tags,
  UserCog,
  MessageSquare,
  BarChart3,
  Shield,
  Newspaper,
  Home,
  Zap,
  CalendarCheck,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "./auth-provider";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Pre-Orders", href: "/admin/pre-orders", icon: CalendarCheck },
  { label: "Journal", href: "/admin/journal", icon: Newspaper },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "Webhooks", href: "/admin/webhooks", icon: Zap },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Users & Roles", href: "/admin/users", icon: UserCog },
  { label: "Permissions", href: "/admin/permissions", icon: Shield },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-jet/5">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="font-display text-xl font-black tracking-[0.12em] text-jet">
            {collapsed ? "Y" : "YSI"}
          </span>
          {!collapsed && (
            <span className="text-[8px] font-poppins uppercase tracking-luxe text-stone">
              Admin
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-poppins transition-all duration-300",
                isActive
                  ? "bg-jet text-cream"
                  : "text-jet/60 hover:text-jet hover:bg-jet/5",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-jet/5 p-4">
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-poppins font-medium text-jet truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-stone capitalize">{user.role.replace("-", " ")}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-poppins text-jet/40 hover:text-burgundy hover:bg-burgundy/5 transition-all duration-300",
            collapsed && "justify-center"
          )}
          title="Logout"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-cream border-r border-jet/5 h-screen sticky top-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {nav}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-cream border border-jet/10 flex items-center justify-center text-jet/40 hover:text-jet transition-colors"
        >
          <ChevronLeft size={12} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-lg bg-cream border border-jet/10 flex items-center justify-center text-jet shadow-soft"
      >
        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-cream border-r border-jet/5 h-full shadow-luxury">
            {nav}
          </div>
          <div
            className="flex-1 bg-jet/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
