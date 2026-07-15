export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "tailoring" | "quality-check" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "paystack" | "flutterwave" | "stripe" | "bank-transfer" | "cash-on-delivery";
  paymentStatus: "paid" | "pending" | "refunded";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: string;
    date: string;
    note?: string;
  }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  status: "active" | "inactive" | "vip";
  lastOrderDate?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  notes?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: "restock" | "adjustment" | "return" | "sale";
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  note: string;
  performedBy: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "super-admin" | "admin" | "manager";
  phone?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeProducts: number;
  productsChange: number;
  totalCustomers: number;
  customersChange: number;
  lowStockItems: number;
  pendingOrders: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
}

export const adminUser: AdminUser = {
  id: "a1",
  name: "Jesam Obona",
  email: "admin@ysi.ng",
  avatar: "https://i.pravatar.cc/80?img=12",
  role: "super-admin",
  phone: "+234 800 YSI",
};

export const adminUsers: AdminUser[] = [
  adminUser,
  {
    id: "a2",
    name: "Chioma Eze",
    email: "chioma@ysi.ng",
    avatar: "https://i.pravatar.cc/80?img=5",
    role: "admin",
    phone: "+234 801 YSI",
  },
  {
    id: "a3",
    name: "Tunde Adebayo",
    email: "tunde@ysi.ng",
    avatar: "https://i.pravatar.cc/80?img=8",
    role: "manager",
    phone: "+234 802 YSI",
  },
];

export const orders: Order[] = [
  {
    id: "o1",
    orderNumber: "YSI-2026-0001",
    customer: {
      id: "c1",
      name: "Amara Okafor",
      email: "amara.o@email.com",
      phone: "+234 803 123 4567",
    },
    items: [
      {
        productId: "p4",
        name: "The Bridal Masterpiece",
        quantity: 1,
        price: 1200000,
        size: "M",
        color: "Ivory",
      },
      {
        productId: "p6",
        name: "The Aso Oke Blazer",
        quantity: 1,
        price: 380000,
        size: "42",
        color: "Gold",
      },
    ],
    subtotal: 1580000,
    shipping: 0,
    total: 1580000,
    status: "quality-check",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    shippingAddress: {
      street: "12 Bourdillon Road",
      city: "Ikoyi",
      state: "Lagos",
      country: "Nigeria",
      zip: "101233",
    },
    notes: "Bridal rush - needs to be ready by Nov 15",
    createdAt: "2026-04-10T10:30:00Z",
    updatedAt: "2026-05-20T14:00:00Z",
    timeline: [
      { status: "pending", date: "2026-04-10T10:30:00Z" },
      { status: "confirmed", date: "2026-04-10T14:00:00Z", note: "Payment confirmed via Paystack" },
      { status: "tailoring", date: "2026-04-15T09:00:00Z", note: "Measurements taken, fabric selected" },
      { status: "quality-check", date: "2026-05-20T14:00:00Z", note: "Garment ready for final inspection" },
    ],
  },
  {
    id: "o2",
    orderNumber: "YSI-2026-0002",
    customer: {
      id: "c2",
      name: "David Kalu",
      email: "david.k@email.com",
      phone: "+234 805 987 6543",
    },
    items: [
      {
        productId: "p1",
        name: "The Executive Tailored Blazer",
        quantity: 1,
        price: 450000,
        size: "42",
        color: "Jet Black",
      },
      {
        productId: "p3",
        name: "The Signature Tailored Trousers",
        quantity: 2,
        price: 185000,
        size: "34",
        color: "Navy",
      },
    ],
    subtotal: 820000,
    shipping: 5000,
    total: 825000,
    status: "delivered",
    paymentMethod: "flutterwave",
    paymentStatus: "paid",
    shippingAddress: {
      street: "45 Garki Area 3",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      zip: "900001",
    },
    createdAt: "2026-03-22T08:15:00Z",
    updatedAt: "2026-04-10T11:00:00Z",
    timeline: [
      { status: "pending", date: "2026-03-22T08:15:00Z" },
      { status: "confirmed", date: "2026-03-22T10:00:00Z" },
      { status: "tailoring", date: "2026-03-25T09:00:00Z" },
      { status: "quality-check", date: "2026-04-05T16:00:00Z" },
      { status: "shipped", date: "2026-04-07T12:00:00Z" },
      { status: "delivered", date: "2026-04-10T11:00:00Z", note: "Signed for by David" },
    ],
  },
  {
    id: "o3",
    orderNumber: "YSI-2026-0003",
    customer: {
      id: "c3",
      name: "Chioma Eze",
      email: "chioma.e@email.com",
      phone: "+234 806 555 7890",
    },
    items: [
      {
        productId: "p2",
        name: "The Empress Evening Gown",
        quantity: 1,
        price: 680000,
        size: "M",
        color: "Burgundy",
      },
    ],
    subtotal: 680000,
    shipping: 0,
    total: 680000,
    status: "shipped",
    paymentMethod: "stripe",
    paymentStatus: "paid",
    shippingAddress: {
      street: "8 Woji Road",
      city: "Port Harcourt",
      state: "Rivers",
      country: "Nigeria",
      zip: "500001",
    },
    createdAt: "2026-05-01T12:00:00Z",
    updatedAt: "2026-06-10T09:00:00Z",
    timeline: [
      { status: "pending", date: "2026-05-01T12:00:00Z" },
      { status: "confirmed", date: "2026-05-01T14:30:00Z" },
      { status: "tailoring", date: "2026-05-05T10:00:00Z" },
      { status: "quality-check", date: "2026-06-05T15:00:00Z" },
      { status: "shipped", date: "2026-06-08T08:00:00Z" },
    ],
  },
  {
    id: "o4",
    orderNumber: "YSI-2026-0004",
    customer: {
      id: "c4",
      name: "Tunde Adebayo",
      email: "tunde.a@email.com",
      phone: "+234 802 444 3210",
    },
    items: [
      {
        productId: "p8",
        name: "The Velvet Tuxedo",
        quantity: 1,
        price: 620000,
        size: "42",
        color: "Jet Black",
      },
      {
        productId: "p5",
        name: "The Linen Resort Shirt",
        quantity: 2,
        price: 95000,
        size: "L",
        color: "White",
      },
    ],
    subtotal: 810000,
    shipping: 5000,
    total: 815000,
    status: "confirmed",
    paymentMethod: "bank-transfer",
    paymentStatus: "paid",
    shippingAddress: {
      street: "22 Allen Avenue",
      city: "Ikeja",
      state: "Lagos",
      country: "Nigeria",
      zip: "100001",
    },
    createdAt: "2026-06-15T09:45:00Z",
    updatedAt: "2026-06-16T11:00:00Z",
    timeline: [
      { status: "pending", date: "2026-06-15T09:45:00Z" },
      { status: "confirmed", date: "2026-06-16T11:00:00Z", note: "Bank transfer confirmed" },
    ],
  },
  {
    id: "o5",
    orderNumber: "YSI-2026-0005",
    customer: {
      id: "c5",
      name: "Zara Mohammed",
      email: "zara.m@email.com",
      phone: "+233 501 234 5678",
    },
    items: [
      {
        productId: "p7",
        name: "The Power Suit",
        quantity: 1,
        price: 750000,
        size: "S",
        color: "Navy",
      },
      {
        productId: "p9",
        name: "The Leather Crossbody",
        quantity: 1,
        price: 250000,
        color: "Cognac",
      },
    ],
    subtotal: 1000000,
    shipping: 15000,
    total: 1015000,
    status: "tailoring",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    shippingAddress: {
      street: "15 Airport Residential Area",
      city: "Accra",
      state: "Greater Accra",
      country: "Ghana",
      zip: "GA-123",
    },
    createdAt: "2026-06-20T14:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
    timeline: [
      { status: "pending", date: "2026-06-20T14:00:00Z" },
      { status: "confirmed", date: "2026-06-20T16:00:00Z" },
      { status: "tailoring", date: "2026-06-25T09:00:00Z", note: "International client - measurements sent" },
    ],
  },
  {
    id: "o6",
    orderNumber: "YSI-2026-0006",
    customer: {
      id: "c1",
      name: "Amara Okafor",
      email: "amara.o@email.com",
      phone: "+234 803 123 4567",
    },
    items: [
      {
        productId: "p10",
        name: "The Cashmere Overcoat",
        quantity: 1,
        price: 890000,
        size: "40",
        color: "Camel",
      },
    ],
    subtotal: 890000,
    shipping: 0,
    total: 890000,
    status: "pending",
    paymentMethod: "cash-on-delivery",
    paymentStatus: "pending",
    shippingAddress: {
      street: "12 Bourdillon Road",
      city: "Ikoyi",
      state: "Lagos",
      country: "Nigeria",
      zip: "101233",
    },
    createdAt: "2026-07-05T16:20:00Z",
    updatedAt: "2026-07-05T16:20:00Z",
    timeline: [
      { status: "pending", date: "2026-07-05T16:20:00Z" },
    ],
  },
  {
    id: "o7",
    orderNumber: "YSI-2026-0007",
    customer: {
      id: "c6",
      name: "Ngozi Felicia",
      email: "ngozi.f@email.com",
      phone: "+234 809 777 8888",
    },
    items: [
      {
        productId: "p6",
        name: "The Aso Oke Blazer",
        quantity: 2,
        price: 380000,
        size: "40",
        color: "Emerald",
      },
    ],
    subtotal: 760000,
    shipping: 5000,
    total: 765000,
    status: "cancelled",
    paymentMethod: "flutterwave",
    paymentStatus: "refunded",
    shippingAddress: {
      street: "7 Diamond Estate",
      city: "Enugu",
      state: "Enugu",
      country: "Nigeria",
      zip: "400001",
    },
    notes: "Customer requested cancellation - full refund issued",
    createdAt: "2026-05-10T11:00:00Z",
    updatedAt: "2026-05-18T09:00:00Z",
    timeline: [
      { status: "pending", date: "2026-05-10T11:00:00Z" },
      { status: "confirmed", date: "2026-05-10T13:00:00Z" },
      { status: "cancelled", date: "2026-05-18T09:00:00Z", note: "Refund processed via Flutterwave" },
    ],
  },
  {
    id: "o8",
    orderNumber: "YSI-2026-0008",
    customer: {
      id: "c7",
      name: "Michael Akpan",
      email: "michael.a@email.com",
      phone: "+234 807 333 2222",
    },
    items: [
      {
        productId: "p3",
        name: "The Signature Tailored Trousers",
        quantity: 3,
        price: 185000,
        size: "36",
        color: "Charcoal",
      },
      {
        productId: "p5",
        name: "The Linen Resort Shirt",
        quantity: 3,
        price: 95000,
        size: "XL",
        color: "Sky Blue",
      },
    ],
    subtotal: 840000,
    shipping: 0,
    total: 840000,
    status: "delivered",
    paymentMethod: "paystack",
    paymentStatus: "paid",
    shippingAddress: {
      street: "100 Awolowo Road",
      city: "Ikoyi",
      state: "Lagos",
      country: "Nigeria",
      zip: "101233",
    },
    createdAt: "2026-05-05T08:30:00Z",
    updatedAt: "2026-05-22T14:00:00Z",
    timeline: [
      { status: "pending", date: "2026-05-05T08:30:00Z" },
      { status: "confirmed", date: "2026-05-05T10:00:00Z" },
      { status: "tailoring", date: "2026-05-08T09:00:00Z" },
      { status: "quality-check", date: "2026-05-18T15:00:00Z" },
      { status: "shipped", date: "2026-05-20T12:00:00Z" },
      { status: "delivered", date: "2026-05-22T14:00:00Z" },
    ],
  },
];

export const customers: Customer[] = [
  {
    id: "c1",
    name: "Amara Okafor",
    email: "amara.o@email.com",
    phone: "+234 803 123 4567",
    avatar: "https://i.pravatar.cc/80?img=1",
    totalOrders: 2,
    totalSpent: 2470000,
    joinDate: "2025-11-15",
    status: "vip",
    lastOrderDate: "2026-07-05",
    address: { street: "12 Bourdillon Road", city: "Ikoyi", state: "Lagos", country: "Nigeria" },
  },
  {
    id: "c2",
    name: "David Kalu",
    email: "david.k@email.com",
    phone: "+234 805 987 6543",
    avatar: "https://i.pravatar.cc/80?img=3",
    totalOrders: 1,
    totalSpent: 825000,
    joinDate: "2026-01-10",
    status: "active",
    lastOrderDate: "2026-03-22",
    address: { street: "45 Garki Area 3", city: "Abuja", state: "FCT", country: "Nigeria" },
  },
  {
    id: "c3",
    name: "Chioma Eze",
    email: "chioma.e@email.com",
    phone: "+234 806 555 7890",
    avatar: "https://i.pravatar.cc/80?img=5",
    totalOrders: 1,
    totalSpent: 680000,
    joinDate: "2026-02-20",
    status: "vip",
    lastOrderDate: "2026-05-01",
    address: { street: "8 Woji Road", city: "Port Harcourt", state: "Rivers", country: "Nigeria" },
  },
  {
    id: "c4",
    name: "Tunde Adebayo",
    email: "tunde.a@email.com",
    phone: "+234 802 444 3210",
    avatar: "https://i.pravatar.cc/80?img=8",
    totalOrders: 1,
    totalSpent: 815000,
    joinDate: "2026-03-05",
    status: "active",
    lastOrderDate: "2026-06-15",
    address: { street: "22 Allen Avenue", city: "Ikeja", state: "Lagos", country: "Nigeria" },
  },
  {
    id: "c5",
    name: "Zara Mohammed",
    email: "zara.m@email.com",
    phone: "+233 501 234 5678",
    avatar: "https://i.pravatar.cc/80?img=9",
    totalOrders: 1,
    totalSpent: 1015000,
    joinDate: "2026-04-12",
    status: "active",
    lastOrderDate: "2026-06-20",
    address: { street: "15 Airport Residential Area", city: "Accra", state: "Greater Accra", country: "Ghana" },
  },
  {
    id: "c6",
    name: "Ngozi Felicia",
    email: "ngozi.f@email.com",
    phone: "+234 809 777 8888",
    avatar: "https://i.pravatar.cc/80?img=47",
    totalOrders: 1,
    totalSpent: 765000,
    joinDate: "2026-04-20",
    status: "inactive",
    lastOrderDate: "2026-05-10",
    address: { street: "7 Diamond Estate", city: "Enugu", state: "Enugu", country: "Nigeria" },
  },
  {
    id: "c7",
    name: "Michael Akpan",
    email: "michael.a@email.com",
    phone: "+234 807 333 2222",
    avatar: "https://i.pravatar.cc/80?img=53",
    totalOrders: 1,
    totalSpent: 840000,
    joinDate: "2026-05-05",
    status: "active",
    lastOrderDate: "2026-05-05",
    address: { street: "100 Awolowo Road", city: "Ikoyi", state: "Lagos", country: "Nigeria" },
  },
  {
    id: "c8",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+234 810 666 4444",
    avatar: "https://i.pravatar.cc/80?img=23",
    totalOrders: 0,
    totalSpent: 0,
    joinDate: "2026-06-28",
    status: "inactive",
  },
];

export const inventoryLogs: InventoryLog[] = [
  { id: "il1", productId: "p1", productName: "The Executive Tailored Blazer", type: "restock", quantity: 15, previousStock: 5, newStock: 20, date: "2026-07-01T10:00:00Z", note: "Weekly restock - Italian Wool", performedBy: "Jesam Obona" },
  { id: "il2", productId: "p2", productName: "The Empress Evening Gown", type: "sale", quantity: 1, previousStock: 8, newStock: 7, date: "2026-07-05T14:00:00Z", note: "Order #YSI-2026-0006", performedBy: "System" },
  { id: "il3", productId: "p3", productName: "The Signature Tailored Trousers", type: "restock", quantity: 30, previousStock: 12, newStock: 42, date: "2026-06-28T09:00:00Z", note: "Bulk restock - Super 120s Wool", performedBy: "Chioma Eze" },
  { id: "il4", productId: "p5", productName: "The Linen Resort Shirt", type: "adjustment", quantity: -2, previousStock: 25, newStock: 23, date: "2026-06-25T11:00:00Z", note: "Damaged in storage - written off", performedBy: "Tunde Adebayo" },
  { id: "il5", productId: "p9", productName: "The Leather Crossbody", type: "restock", quantity: 10, previousStock: 3, newStock: 13, date: "2026-06-20T15:00:00Z", note: "New batch from supplier", performedBy: "Jesam Obona" },
  { id: "il6", productId: "p10", productName: "The Cashmere Overcoat", type: "return", quantity: 1, previousStock: 6, newStock: 7, date: "2026-06-18T10:00:00Z", note: "Customer return - size exchange", performedBy: "Chioma Eze" },
  { id: "il7", productId: "p4", productName: "The Bridal Masterpiece", type: "sale", quantity: 1, previousStock: 2, newStock: 1, date: "2026-06-15T09:00:00Z", note: "Custom order - made to measure", performedBy: "System" },
  { id: "il8", productId: "p6", productName: "The Aso Oke Blazer", type: "restock", quantity: 8, previousStock: 4, newStock: 12, date: "2026-06-12T14:00:00Z", note: "Handwoven batch received", performedBy: "Jesam Obona" },
];

export function computeDashboardStats(): DashboardStats {
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const activeProducts = 10;
  const totalCustomers = customers.length;
  const lowStockItems = 3;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const monthlyRevenue = months.map((month, i) => ({
    month,
    revenue: Math.round(totalRevenue * (0.08 + Math.random() * 0.12)),
    orders: Math.round(totalOrders * (0.05 + Math.random() * 0.15)),
  }));

  const statuses = ["pending", "confirmed", "tailoring", "quality-check", "shipped", "delivered", "cancelled"] as const;
  const ordersByStatus = statuses.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));

  const categories = ["Bespoke", "Evening Wear", "Ready-to-Wear", "Wedding", "Accessories"];
  const categoryDistribution = categories.map((category, i) => ({
    category,
    count: Math.round(10 * (0.1 + Math.random() * 0.2)),
  }));

  return {
    totalRevenue,
    revenueChange: 12.5,
    totalOrders,
    ordersChange: 8.3,
    activeProducts,
    productsChange: 4.2,
    totalCustomers,
    customersChange: 15.7,
    lowStockItems,
    pendingOrders,
    monthlyRevenue,
    ordersByStatus,
    categoryDistribution,
  };
}

export function getProductStock(productId: string): { current: number; lowStockThreshold: number; lastRestocked: string } {
  const stocks: Record<string, { current: number; lowStockThreshold: number; lastRestocked: string }> = {
    p1: { current: 20, lowStockThreshold: 5, lastRestocked: "2026-07-01" },
    p2: { current: 7, lowStockThreshold: 3, lastRestocked: "2026-06-20" },
    p3: { current: 42, lowStockThreshold: 10, lastRestocked: "2026-06-28" },
    p4: { current: 1, lowStockThreshold: 2, lastRestocked: "2026-05-15" },
    p5: { current: 23, lowStockThreshold: 10, lastRestocked: "2026-06-25" },
    p6: { current: 12, lowStockThreshold: 5, lastRestocked: "2026-06-12" },
    p7: { current: 4, lowStockThreshold: 5, lastRestocked: "2026-06-10" },
    p8: { current: 8, lowStockThreshold: 3, lastRestocked: "2026-06-15" },
    p9: { current: 13, lowStockThreshold: 5, lastRestocked: "2026-06-20" },
    p10: { current: 7, lowStockThreshold: 3, lastRestocked: "2026-06-18" },
  };
  return stocks[productId] || { current: 0, lowStockThreshold: 5, lastRestocked: "N/A" };
}
