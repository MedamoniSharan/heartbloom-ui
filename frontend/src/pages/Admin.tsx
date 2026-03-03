import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package, DollarSign, Users, TrendingUp, Plus,
  Eye, Trash2, ChevronDown, ChevronUp, Tag, ToggleLeft, ToggleRight,
  Upload, ImageIcon, X, BarChart3, ShoppingCart, Calendar, MapPin, Phone, User, Camera, Filter, Copy,
} from "lucide-react";
import { useProductStore, Product, Order, PromoCode } from "@/stores/productStore";
import { useSiteContentStore } from "@/stores/siteContentStore";
import { useAuthStore } from "@/stores/authStore";
import { journeyVideosApi, type ApiJourneyVideo, eventPacksApi, type ApiEventPack } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from "recharts";

const statCards = (orders: Order[], products: Product[]) => [
  { label: "Total Orders", value: orders.length, icon: Package, change: "" },
  { label: "Revenue", value: `Rs${orders.reduce((s, o) => s + o.total, 0).toFixed(0)}`, icon: DollarSign, change: "" },
  { label: "Products", value: products.length, icon: TrendingUp, change: "" },
  { label: "Customers", value: new Set(orders.map((o) => o.userId)).size, icon: Users, change: "" },
];

const CHART_COLORS = ["hsl(330,80%,55%)", "hsl(220,70%,50%)", "hsl(150,60%,45%)", "hsl(40,90%,55%)", "hsl(270,60%,55%)", "hsl(10,80%,55%)"];

const generateRevenueData = (orders: Order[]) => {
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10) });
  return last7.map((date) => {
    const dayO = orders.filter(o => new Date(o.createdAt).toISOString().slice(0, 10) === date);
    return { date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }), revenue: dayO.reduce((s, o) => s + o.total, 0), orders: dayO.length };
  });
};
const getStatusData = (orders: Order[]) => {
  const c: Record<string, number> = {}; orders.forEach(o => { c[o.status] = (c[o.status] || 0) + 1 });
  return Object.entries(c).map(([n, v]) => ({ name: n.charAt(0).toUpperCase() + n.slice(1), value: v }));
};
const getCategoryData = (products: Product[]) => {
  const c: Record<string, number> = {}; products.forEach(p => { c[p.category] = (c[p.category] || 0) + 1 });
  return Object.entries(c).map(([name, value]) => ({ name, value }));
};
const getMonthlyTrend = (orders: Order[]) => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); return { m: d.getMonth(), y: d.getFullYear(), name: d.toLocaleDateString("en-US", { month: "short" }) };
  });
  return months.map(({ m, y, name }) => {
    const monthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    return { month: name, revenue: monthOrders.reduce((s, o) => s + o.total, 0), customers: new Set(monthOrders.map(o => o.userId)).size };
  });
};
const getTopProducts = (orders: Order[]) => {
  const counts: Record<string, { name: string; sold: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach(i => {
      if (!counts[i.product.id]) counts[i.product.id] = { name: i.product.name, sold: 0, revenue: 0 };
      counts[i.product.id].sold += i.quantity;
      counts[i.product.id].revenue += (i.product.price * i.quantity);
    });
  });
  return Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
};

const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 };
const tickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

const DashboardTab = ({ orders, products, setTab }: { orders: Order[]; products: Product[]; setTab: (t: any) => void }) => {
  const revenueData = useMemo(() => generateRevenueData(orders), [orders]);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-display font-bold text-foreground">Revenue Overview</h3><p className="text-xs text-muted-foreground">Last 7 days</p></div>
          <div className="text-right"><p className="text-2xl font-bold text-foreground font-display">Rs{totalRevenue.toFixed(0)}</p><p className="text-xs text-[hsl(var(--success))]">↑ 18% vs last week</p></div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData}>
            <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(330,80%,55%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(330,80%,55%)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(330,80%,55%)" fill="url(#colorRev)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Avg Order Value", value: `Rs${avgOrder.toFixed(2)}`, icon: ShoppingCart }, { label: "Conversion Rate", value: "--", icon: TrendingUp }, { label: "Active Promos", value: "--", icon: Tag }, { label: "This Month", value: `Rs${totalRevenue.toFixed(0)}`, icon: Calendar }].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-3 shadow-card">
            <s.icon className="w-4 h-4 text-primary mb-1" /><p className="text-lg font-bold text-foreground font-display">{s.value}</p><p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-3">Recent Orders</h3>
          {orders.slice(0, 5).length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : (
            <div className="space-y-2">{orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div><p className="text-sm font-medium text-foreground">{order.id}</p><p className="text-xs text-muted-foreground">{order.userName}</p></div>
                <div className="text-right"><p className="text-sm font-bold text-foreground">Rs{order.total.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "delivered" ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]" : order.status === "pending" ? "bg-amber-500/20 text-amber-500" : "bg-primary/20 text-primary"}`}>{order.status}</span>
                </div>
              </div>
            ))}</div>
          )}
          <button onClick={() => setTab("orders")} className="mt-3 text-xs text-primary hover:underline">View all orders →</button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Add Product", icon: Plus, tab: "add" }, { label: "Manage Promos", icon: Tag, tab: "promos" }, { label: "View Products", icon: Package, tab: "products" }, { label: "Analytics", icon: BarChart3, tab: "analytics" }].map(a => (
              <button key={a.label} onClick={() => setTab(a.tab)} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-primary/10 transition-colors">
                <a.icon className="w-6 h-6 text-primary" /><span className="text-xs font-medium text-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsTab = ({ orders, products }: { orders: Order[]; products: Product[] }) => {
  const revenueData = useMemo(() => generateRevenueData(orders), [orders]);
  const statusData = useMemo(() => getStatusData(orders), [orders]);
  const categoryData = useMemo(() => getCategoryData(products), [products]);
  const monthlyTrend = useMemo(() => getMonthlyTrend(orders), [orders]);
  const topProducts = useMemo(() => getTopProducts(orders), [orders]);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-1">Daily Revenue</h3><p className="text-xs text-muted-foreground mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} /><YAxis tick={tickStyle} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="revenue" fill="hsl(330,80%,55%)" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-1">Daily Orders</h3><p className="text-xs text-muted-foreground mb-4">Last 7 days</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} /><YAxis tick={tickStyle} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="orders" fill="hsl(220,70%,50%)" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-1">Order Status</h3><p className="text-xs text-muted-foreground mb-4">Breakdown by status</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-1">Products by Category</h3><p className="text-xs text-muted-foreground mb-4">Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart><Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>{categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-bold text-foreground mb-1">Monthly Trend</h3><p className="text-xs text-muted-foreground mb-4">Revenue & customers over 6 months</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyTrend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} /><YAxis yAxisId="left" tick={tickStyle} axisLine={false} tickLine={false} /><YAxis yAxisId="right" orientation="right" tick={tickStyle} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 12 }} /><Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(28,52%,42%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(28,52%,42%)" }} name="Revenue (Rs)" /><Line yAxisId="right" type="monotone" dataKey="customers" stroke="hsl(220,70%,50%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(220,70%,50%)" }} name="Customers" /></LineChart>
        </ResponsiveContainer>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="font-display font-bold text-foreground mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium text-xs">#</th><th className="text-left py-2 text-muted-foreground font-medium text-xs">Product</th><th className="text-right py-2 text-muted-foreground font-medium text-xs">Units Sold</th><th className="text-right py-2 text-muted-foreground font-medium text-xs">Revenue</th></tr></thead>
            <tbody>{topProducts.map((p, i) => (<tr key={i} className="border-b border-border last:border-0"><td className="py-3 text-muted-foreground">{i + 1}</td><td className="py-3 font-medium text-foreground">{p.name}</td><td className="py-3 text-right text-foreground">{p.sold}</td><td className="py-3 text-right font-bold text-foreground">Rs {p.revenue.toLocaleString()}</td></tr>))}</tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};


const Admin = () => {
  const { user } = useAuthStore();
  const { products, orders, promoCodes, fetchOrders, fetchPromos, addProduct, removeProduct, updateOrderStatus, addPromoCode, removePromoCode, togglePromoCode, updatePromoCode } = useProductStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<"dashboard" | "analytics" | "orders" | "products" | "add" | "promos" | "bulk" | "courses" | "events" | "journey" | "settings">("dashboard");
  const [newPromo, setNewPromo] = useState({ code: "", discount: "", description: "", expiresAt: "" });
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderFilter, setOrderFilter] = useState<"all" | Order["status"]>("all");

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders(true);
      fetchPromos();
    }
  }, [user?.role, fetchOrders, fetchPromos]);

  const REFERENCE_IMAGE_COUNT = 4;
  const existingCategories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const [newProduct, setNewProduct] = useState<{
    name: string;
    description: string;
    price: string;
    originalPrice: string;
    image: string;
    category: string;
    images: string[];
    minQuantity: string;
    maxQuantity: string;
  }>({ name: "", description: "", price: "", originalPrice: "", image: "", category: "", images: [], minQuantity: "", maxQuantity: "" });
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [refImagePreviews, setRefImagePreviews] = useState<(string | null)[]>([null, null, null, null]);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setNewProduct((p) => ({ ...p, image: url }));
    }
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setNewProduct((p) => ({ ...p, image: url }));
    }
  }, []);

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setNewProduct((p) => ({ ...p, image: "" }));
  };

  const handleRefImageSelect = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setRefImagePreviews((prev) => { const next = [...prev]; next[index] = url; return next; });
      setNewProduct((p) => {
        const next = [...(p.images || [])];
        while (next.length <= index) next.push("");
        next[index] = url;
        return { ...p, images: next.slice(0, REFERENCE_IMAGE_COUNT) };
      });
    }
  }, []);

  const clearRefImage = (index: number) => {
    setRefImagePreviews((prev) => { const next = [...prev]; if (next[index]) URL.revokeObjectURL(next[index]!); next[index] = null; return next; });
    setNewProduct((p) => {
      const next = [...(p.images || [])];
      next[index] = "";
      return { ...p, images: next.slice(0, REFERENCE_IMAGE_COUNT) };
    });
  };

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      const ok = await useProductStore.getState().updateProduct(editingProductId, {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : undefined,
        image: newProduct.image,
        images: newProduct.images?.slice(0, REFERENCE_IMAGE_COUNT).filter(Boolean) || [],
        category: newProduct.category,
        minQuantity: newProduct.minQuantity ? parseInt(newProduct.minQuantity) : null,
        maxQuantity: newProduct.maxQuantity ? parseInt(newProduct.maxQuantity) : null,
      });
      if (ok) {
        toast({ title: "Product updated!" });
        setNewProduct({ name: "", description: "", price: "", originalPrice: "", image: "", category: "", images: [], minQuantity: "", maxQuantity: "" });
        clearImage();
        setRefImagePreviews([null, null, null, null]);
        setEditingProductId(null);
        setTab("products");
      } else {
        toast({ title: "Failed to update product", variant: "destructive" });
      }
    } else {
      const ok = await addProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : undefined,
        image: newProduct.image || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop",
        images: newProduct.images?.slice(0, REFERENCE_IMAGE_COUNT).filter(Boolean) || [],
        category: newProduct.category,
        rating: 0,
        reviews: 0,
        inStock: true,
        minQuantity: newProduct.minQuantity ? parseInt(newProduct.minQuantity) : null,
        maxQuantity: newProduct.maxQuantity ? parseInt(newProduct.maxQuantity) : null,
      });
      if (ok) {
        toast({ title: "Product added!" });
        setNewProduct({ name: "", description: "", price: "", originalPrice: "", image: "", category: "", images: [], minQuantity: "", maxQuantity: "" });
        clearImage();
        setRefImagePreviews([null, null, null, null]);
        setTab("products");
      } else {
        toast({ title: "Failed to add product", variant: "destructive" });
      }
    }
  };

  const stats = statCards(orders, products);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 px-6 pb-16 max-w-6xl mx-auto">
        <h1 className="text-h1 text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8 text-sm">Manage orders, products, and analytics</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-card"
            >
              <div className="flex items-center justify-between mb-2">
                <s.icon className="w-5 h-5 text-primary" />
                {s.change && <span className="text-xs text-[hsl(var(--success))] font-medium">{s.change}</span>}
              </div>
              <p className="text-2xl font-bold text-foreground font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-3 overflow-x-auto scrollbar-hide">
          {(["dashboard", "analytics", "orders", "products", "add", "promos", "bulk", "courses", "events", "journey", "settings"] as const).map((t) => {
            const labels: Record<string, string> = { dashboard: "Dashboard", analytics: "Analytics", orders: "Orders", products: "Products", add: "Add Product", promos: "Promo Codes", bulk: "Bulk Orders", courses: "Courses", events: "Event Packs", journey: "Follow My Journey", settings: "Settings" };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && <DashboardTab orders={orders} products={products} setTab={setTab} />}

        {/* Analytics Tab */}
        {tab === "analytics" && <AnalyticsTab orders={orders} products={products} />}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-4">
            {/* Status filter */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {(["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => {
                const counts: Record<string, number> = { all: orders.length };
                orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
                return (
                  <button
                    key={s}
                    onClick={() => setOrderFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${orderFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  >
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} {counts[s] ? `(${counts[s]})` : ""}
                  </button>
                );
              })}
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No orders yet.</p>
            ) : orders.filter((o) => orderFilter === "all" || o.status === orderFilter).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No {orderFilter} orders.</p>
            ) : orders.filter((o) => orderFilter === "all" || o.status === orderFilter).map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const toggleExpand = () => setExpandedOrders((prev) => {
                const next = new Set(prev);
                if (next.has(order.id)) next.delete(order.id); else next.add(order.id);
                return next;
              });
              const statusColor: Record<string, string> = {
                pending: "bg-amber-500/15 text-amber-600",
                processing: "bg-blue-500/15 text-blue-600",
                shipped: "bg-purple-500/15 text-purple-600",
                delivered: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
                cancelled: "bg-destructive/15 text-destructive",
              };
              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                  {/* Order header — always visible */}
                  <button
                    type="button"
                    onClick={toggleExpand}
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-foreground text-sm">{order.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor[order.status] || "bg-muted text-muted-foreground"}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.allowSocialMediaFeature && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">Social Media OK</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{order.userName} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-foreground">Rs{order.total.toFixed(2)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-4">
                        {/* Status selector */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-muted-foreground">Update status:</span>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={async (e) => {
                                const ok = await updateOrderStatus(order.id, e.target.value as Order["status"]);
                                if (!ok) toast({ title: "Failed to update status", variant: "destructive" });
                              }}
                              className="appearance-none bg-muted border border-border rounded-lg px-3 py-1.5 pr-7 text-xs font-medium text-foreground cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Address card */}
                          <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Address</h4>
                            <div className="space-y-1.5">
                              <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" /> {order.address.fullName}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {order.address.phone}</p>
                              <div className="text-sm text-muted-foreground pl-5">
                                <p>{order.address.street}</p>
                                <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                                <p>{order.address.country}</p>
                              </div>
                            </div>
                          </div>

                          {/* Order summary card */}
                          <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-primary" /> Order Summary</h4>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-medium text-foreground">{order.id}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="text-foreground">{order.userName}</span></div>
                              <div className="flex justify-between border-t border-border pt-1.5 mt-1.5"><span className="font-medium text-foreground">Total</span><span className="font-bold text-foreground font-display">Rs{order.total.toFixed(2)}</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Ordered products */}
                        <div>
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5 text-primary" /> Products Ordered</h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border bg-background">
                                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × Rs{item.product.price}</p>
                                </div>
                                <p className="text-sm font-bold text-foreground font-display flex-shrink-0">Rs{(item.product.price * item.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer uploaded photos */}
                        {order.customerPhotos && order.customerPhotos.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Camera className="w-3.5 h-3.5 text-primary" /> Customer Photos ({order.customerPhotos.length})</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {order.customerPhotos.map((photoUrl, idx) => (
                                <a key={idx} href={photoUrl} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden border border-border bg-background hover:ring-2 hover:ring-primary/40 transition-all">
                                  <img src={photoUrl} alt={`Customer photo ${idx + 1}`} className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                  <img src={p.image} alt={p.name} className="w-full aspect-video object-cover" />
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-foreground text-sm">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Rs{p.price} · {p.category}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingProductId(p.id);
                          const refImgs = (p.images || []).slice(0, REFERENCE_IMAGE_COUNT);
                          setNewProduct({ name: p.name, description: p.description, price: p.price.toString(), originalPrice: p.originalPrice != null ? p.originalPrice.toString() : "", image: p.image, category: p.category, images: refImgs, minQuantity: p.minQuantity != null ? p.minQuantity.toString() : "", maxQuantity: p.maxQuantity != null ? p.maxQuantity.toString() : "" });
                          setImagePreview(p.image);
                          setRefImagePreviews([refImgs[0] || null, refImgs[1] || null, refImgs[2] || null, refImgs[3] || null]);
                          setTab("add");
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 py-1.5 rounded-lg border flex items-center justify-center text-xs font-medium text-muted-foreground border-border hover:bg-muted hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AlertDialog open={!!deletingProduct} onOpenChange={(open) => { if (!open) setDeletingProduct(null); }}>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{deletingProduct?.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove the product from your store.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      if (!deletingProduct) return;
                      const ok = await removeProduct(deletingProduct.id);
                      if (ok) toast({ title: "Product removed" });
                      else toast({ title: "Failed to remove", variant: "destructive" });
                      setDeletingProduct(null);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* Add/Edit Product Form */}
        {tab === "add" && (
          <form onSubmit={handleAddProduct} className="max-w-xl bg-card border border-border rounded-2xl p-6 shadow-card space-y-4 relative">
            {editingProductId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setNewProduct({ name: "", description: "", price: "", originalPrice: "", image: "", category: "", images: [], minQuantity: "", maxQuantity: "" });
                  clearImage();
                  setRefImagePreviews([null, null, null, null]);
                  setTab("products");
                }}
                className="absolute top-4 right-4 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel Edit
              </button>
            )}
            <h3 className="font-display font-semibold text-foreground mb-4">
              {editingProductId ? "Edit Product" : "Add New Product"}
            </h3>
            <div className="floating-label-group">
              <input type="text" placeholder=" " value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} required />
              <label>Product Name</label>
            </div>
            <div className="floating-label-group">
              <input type="text" placeholder=" " value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} required />
              <label>Description</label>
            </div>
            <div className="floating-label-group">
              <input type="number" step="0.01" placeholder=" " value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} required />
              <label>Price (Rs) — sale price</label>
            </div>
            <div className="floating-label-group">
              <input type="number" step="0.01" placeholder=" " value={newProduct.originalPrice} onChange={(e) => setNewProduct((p) => ({ ...p, originalPrice: e.target.value }))} />
              <label>Original price (Rs) — optional, for showing discount</label>
            </div>
            {/* Drag & Drop Image Upload */}
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : imagePreview
                  ? "border-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById("admin-image-input")?.click()}
            >
              <input
                id="admin-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              {imagePreview ? (
                <div className="relative p-3">
                  <img src={imagePreview} alt="Preview" className="w-full aspect-video object-cover rounded-xl" />
                  <motion.button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                    animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
                  >
                    {dragOver ? (
                      <Upload className="w-6 h-6 text-primary" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-primary" />
                    )}
                  </motion.div>
                  <p className="text-sm font-medium text-foreground">
                    {dragOver ? "Drop image here" : "Drag & drop product image"}
                  </p>
                  <p className="text-xs text-muted-foreground">or click to browse · PNG, JPG, WebP</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Reference images (up to 4) — optional</label>
              <p className="text-xs text-muted-foreground">These show on the product page as reference. Main image above is always first.</p>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => {
                  const preview = refImagePreviews[i] || newProduct.images?.[i] || null;
                  return (
                    <div key={i} className="relative">
                      <input
                        id={`ref-image-input-${i}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleRefImageSelect(i, e)}
                      />
                      {preview ? (
                        <div className="relative aspect-square rounded-xl overflow-hidden border border-primary/30 bg-primary/5 group">
                          <img src={preview} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <motion.button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); clearRefImage(i); }}
                              className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
                              whileTap={{ scale: 0.9 }}
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                            {refImagePreviews.some((p, idx) => idx !== i && !p && !newProduct.images?.[idx]) && (
                              <motion.button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRefImagePreviews((prev) => {
                                    const next = [...prev];
                                    const emptyIdx = next.findIndex((p, idx) => idx !== i && !p && !newProduct.images?.[idx]);
                                    if (emptyIdx !== -1) next[emptyIdx] = preview;
                                    return next;
                                  });
                                }}
                                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
                                whileTap={{ scale: 0.9 }}
                                title="Copy to next empty slot"
                              >
                                <Copy className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                          <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-card/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-foreground">#{i + 1}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById(`ref-image-input-${i}`)?.click()}
                          className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col items-center justify-center gap-1.5"
                        >
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground font-medium">Image #{i + 1}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <input
                type="text"
                list="category-suggestions"
                placeholder="Type or select a category"
                value={newProduct.category}
                onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground"
              />
              <datalist id="category-suggestions">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {existingCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {existingCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewProduct((p) => ({ ...p, category: cat }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${newProduct.category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Quantity Limits (optional, per product)</label>
              <p className="text-xs text-muted-foreground">Leave blank to use global defaults from Settings.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="floating-label-group">
                  <input type="number" min="1" placeholder=" " value={newProduct.minQuantity} onChange={(e) => setNewProduct((p) => ({ ...p, minQuantity: e.target.value }))} />
                  <label>Min quantity</label>
                </div>
                <div className="floating-label-group">
                  <input type="number" min="1" placeholder=" " value={newProduct.maxQuantity} onChange={(e) => setNewProduct((p) => ({ ...p, maxQuantity: e.target.value }))} />
                  <label>Max quantity</label>
                </div>
              </div>
            </div>
            <motion.button type="submit" className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
              {editingProductId ? "Save Changes" : <><Plus className="w-4 h-4" /> Add Product</>}
            </motion.button>
          </form>
        )}

        {/* Promo Codes Tab */}
        {tab === "promos" && (
          <div className="space-y-6">
            {/* Add/Edit promo form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newPromo.code || !newPromo.discount) return;

                const promoData = {
                  code: newPromo.code.toUpperCase(),
                  discount: parseFloat(newPromo.discount),
                  description: newPromo.description,
                  active: true,
                  expiresAt: newPromo.expiresAt || undefined,
                };

                if (editingPromoId) {
                  const ok = await updatePromoCode(editingPromoId, promoData);
                  if (ok) {
                    toast({ title: "Promo updated!" });
                    setNewPromo({ code: "", discount: "", description: "", expiresAt: "" });
                    setEditingPromoId(null);
                  } else toast({ title: "Failed to update", variant: "destructive" });
                } else {
                  const ok = await addPromoCode(promoData);
                  if (ok) {
                    toast({ title: "Promo code created!", description: `Code "${newPromo.code.toUpperCase()}" is now live.` });
                    setNewPromo({ code: "", discount: "", description: "", expiresAt: "" });
                  } else toast({ title: "Failed to create promo", variant: "destructive" });
                }
              }}
              className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4 max-w-lg relative"
            >
              {editingPromoId && (
                <button
                  type="button"
                  onClick={() => { setEditingPromoId(null); setNewPromo({ code: "", discount: "", description: "", expiresAt: "" }); }}
                  className="absolute top-4 right-4 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel Edit
                </button>
              )}
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> {editingPromoId ? "Edit Promo Code" : "Create Promo Code"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="floating-label-group">
                  <input type="text" placeholder=" " value={newPromo.code} onChange={(e) => setNewPromo((p) => ({ ...p, code: e.target.value }))} required />
                  <label>Code (e.g. SAVE20)</label>
                </div>
                <div className="floating-label-group">
                  <input type="number" min="1" max="100" placeholder=" " value={newPromo.discount} onChange={(e) => setNewPromo((p) => ({ ...p, discount: e.target.value }))} required />
                  <label>Discount %</label>
                </div>
              </div>
              <div className="floating-label-group">
                <input type="text" placeholder=" " value={newPromo.description} onChange={(e) => setNewPromo((p) => ({ ...p, description: e.target.value }))} required />
                <label>Description (shown to customers)</label>
              </div>
              <div className="floating-label-group">
                <input type="date" placeholder=" " value={newPromo.expiresAt} onChange={(e) => setNewPromo((p) => ({ ...p, expiresAt: e.target.value }))} />
                <label>Expires (optional)</label>
              </div>
              <motion.button type="submit" className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                {editingPromoId ? "Save Changes" : <><Plus className="w-4 h-4" /> Create Promo Code</>}
              </motion.button>
            </form>

            {/* Existing promos list */}
            <div className="space-y-3">
              <h3 className="font-display font-semibold text-foreground text-sm">Active Promo Codes</h3>
              {promoCodes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No promo codes yet.</p>
              ) : (
                promoCodes.map((promo) => (
                  <div key={promo.id} className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-card">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-foreground">{promo.code}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${promo.active ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-muted text-muted-foreground"}`}>
                          {promo.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{promo.description} — {promo.discount}% off</p>
                      {promo.expiresAt && <p className="text-xs text-muted-foreground">Expires: {new Date(promo.expiresAt).toLocaleDateString()}</p>}
                    </div>
                    <div className="flex items-center gap-2 border-l border-border pl-4">
                      <button
                        onClick={() => {
                          setEditingPromoId(promo.id);
                          setNewPromo({
                            code: promo.code,
                            discount: promo.discount.toString(),
                            description: promo.description,
                            expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 10) : "",
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-xs font-medium text-primary hover:underline px-2"
                      >
                        Edit
                      </button>
                      <button onClick={async () => {
                        const ok = await togglePromoCode(promo.id);
                        if (!ok) toast({ title: "Failed to update promo", variant: "destructive" });
                      }} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle promo">
                        {promo.active ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <button onClick={async () => {
                        const ok = await removePromoCode(promo.id);
                        if (ok) toast({ title: "Promo removed" });
                        else toast({ title: "Failed to remove", variant: "destructive" });
                      }} className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bulk Orders Tab */}
        {tab === "bulk" && (
          <BulkOrdersAdminTab />
        )}

        {/* Courses Tab */}
        {tab === "courses" && (
          <CoursesAdminTab />
        )}

        {tab === "events" && (
          <EventPacksAdminTab />
        )}

        {/* Follow My Journey Tab */}
        {tab === "journey" && (
          <JourneyAdminTab toast={toast} />
        )}

        {tab === "settings" && (
          <div className="space-y-8">
            <HeroStatsAdminTab />
            <OrderQuantityAdminTab />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

function BulkOrdersAdminTab() {
  const { bulkOrder, setBulkOrder } = useSiteContentStore();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({
    title: bulkOrder.title,
    subtitle: bulkOrder.subtitle,
    formIntro: bulkOrder.formIntro,
    price50: bulkOrder.price50.toString(),
    price100: bulkOrder.price100.toString(),
  }));
  useEffect(() => {
    setForm({
      title: bulkOrder.title,
      subtitle: bulkOrder.subtitle,
      formIntro: bulkOrder.formIntro,
      price50: bulkOrder.price50.toString(),
      price100: bulkOrder.price100.toString(),
    });
  }, [bulkOrder.title, bulkOrder.subtitle, bulkOrder.formIntro, bulkOrder.price50, bulkOrder.price100]);

  const save = () => {
    setBulkOrder({
      title: form.title,
      subtitle: form.subtitle,
      formIntro: form.formIntro,
      price50: parseFloat(form.price50) || 0,
      price100: parseFloat(form.price100) || 0,
    });
    toast({ title: "Bulk Orders content saved!" });
  };

  return (
    <div className="max-w-xl space-y-4">
      <h3 className="font-display font-semibold text-foreground">Bulk Orders page content</h3>
      <p className="text-xs text-muted-foreground">This content appears on the Bulk Orders page. Subcategories: 50 items and 100 items with prices.</p>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="floating-label-group">
          <input type="text" placeholder=" " value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <label>Page title</label>
        </div>
        <div className="floating-label-group">
          <input type="text" placeholder=" " value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
          <label>Subtitle</label>
        </div>
        <div className="floating-label-group">
          <input type="text" placeholder=" " value={form.formIntro} onChange={(e) => setForm((f) => ({ ...f, formIntro: e.target.value }))} />
          <label>Form intro text</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="floating-label-group">
            <input type="number" min="0" step="1" placeholder=" " value={form.price50} onChange={(e) => setForm((f) => ({ ...f, price50: e.target.value }))} />
            <label>Price for 50 items (Rs)</label>
          </div>
          <div className="floating-label-group">
            <input type="number" min="0" step="1" placeholder=" " value={form.price100} onChange={(e) => setForm((f) => ({ ...f, price100: e.target.value }))} />
            <label>Price for 100 items (Rs)</label>
          </div>
        </div>
        <motion.button type="button" onClick={save} className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
          Save Bulk Orders content
        </motion.button>
      </div>
    </div>
  );
}

function CoursesAdminTab() {
  const { courses, setCourses } = useSiteContentStore();
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({
    title: courses.title,
    description: courses.description,
    youtubeUrl: courses.youtubeUrl,
    book1to1Label: courses.book1to1Label,
    book1to1Url: courses.book1to1Url,
    bookGroupLabel: courses.bookGroupLabel,
    bookGroupUrl: courses.bookGroupUrl,
  }));
  useEffect(() => {
    setForm({
      title: courses.title,
      description: courses.description,
      youtubeUrl: courses.youtubeUrl,
      book1to1Label: courses.book1to1Label,
      book1to1Url: courses.book1to1Url,
      bookGroupLabel: courses.bookGroupLabel,
      bookGroupUrl: courses.bookGroupUrl,
    });
  }, [courses.title, courses.description, courses.youtubeUrl, courses.book1to1Label, courses.book1to1Url, courses.bookGroupLabel, courses.bookGroupUrl]);

  const save = () => {
    setCourses({
      title: form.title,
      description: form.description,
      youtubeUrl: form.youtubeUrl,
      book1to1Label: form.book1to1Label,
      book1to1Url: form.book1to1Url,
      bookGroupLabel: form.bookGroupLabel,
      bookGroupUrl: form.bookGroupUrl,
    });
    toast({ title: "Courses content saved!" });
  };

  return (
    <div className="max-w-xl space-y-4">
      <h3 className="font-display font-semibold text-foreground">Courses page content</h3>
      <p className="text-xs text-muted-foreground">YouTube video, 1:1 session link, and group session link. Shown on the Courses page.</p>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="floating-label-group">
          <input type="text" placeholder=" " value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <label>Page title</label>
        </div>
        <div className="floating-label-group">
          <textarea placeholder=" " rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="resize-none" />
          <label>Description</label>
        </div>
        <div className="floating-label-group">
          <input type="url" placeholder=" " value={form.youtubeUrl} onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))} />
          <label>YouTube video URL</label>
        </div>
        <div className="floating-label-group">
          <input type="text" placeholder=" " value={form.book1to1Label} onChange={(e) => setForm((f) => ({ ...f, book1to1Label: e.target.value }))} />
          <label>Book 1:1 session – button label</label>
        </div>
        <div className="floating-label-group">
          <input type="url" placeholder=" " value={form.book1to1Url} onChange={(e) => setForm((f) => ({ ...f, book1to1Url: e.target.value }))} />
          <label>Book 1:1 session – URL</label>
        </div>
        <div className="floating-label-group">
          <input type="text" placeholder=" " value={form.bookGroupLabel} onChange={(e) => setForm((f) => ({ ...f, bookGroupLabel: e.target.value }))} />
          <label>Book group session – button label</label>
        </div>
        <div className="floating-label-group">
          <input type="url" placeholder=" " value={form.bookGroupUrl} onChange={(e) => setForm((f) => ({ ...f, bookGroupUrl: e.target.value }))} />
          <label>Book group session – URL</label>
        </div>
        <motion.button type="button" onClick={save} className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
          Save Courses content
        </motion.button>
      </div>
    </div>
  );
}

function JourneyAdminTab({ toast }: { toast: (t: { title: string; description?: string; variant?: "destructive" }) => void }) {
  const [videos, setVideos] = useState<ApiJourneyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    url: "",
    platform: "instagram" as "instagram" | "facebook",
    thumbnailUrl: "",
    username: "heartprinted",
    views: "",
    likes: "",
    comments: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbDragOver, setThumbDragOver] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const processThumbImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setThumbPreview(base64);
      setForm((f) => ({ ...f, thumbnailUrl: base64 }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleThumbDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setThumbDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processThumbImage(file);
  }, [processThumbImage]);

  const handleThumbSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processThumbImage(file);
  }, [processThumbImage]);

  const clearThumb = useCallback(() => {
    setThumbPreview(null);
    setForm((f) => ({ ...f, thumbnailUrl: "" }));
  }, []);

  const fetchVideos = useCallback(() => {
    setLoading(true);
    journeyVideosApi.getAll().then(setVideos).catch(() => setVideos([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) {
      toast({ title: "URL is required", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await journeyVideosApi.update(editingId, form);
        toast({ title: "Video updated!" });
        setEditingId(null);
      } else {
        await journeyVideosApi.create(form);
        toast({ title: "Video added!" });
      }
      setForm({ url: "", platform: "instagram", thumbnailUrl: "", username: "heartprinted", views: "", likes: "", comments: "" });
      setThumbPreview(null);
      fetchVideos();
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    try {
      await journeyVideosApi.delete(id);
      toast({ title: "Video removed" });
      fetchVideos();
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="font-display font-semibold text-foreground">Follow My Journey videos</h3>
      <p className="text-xs text-muted-foreground">Instagram or Facebook video URLs. They appear in the carousel on the home page. Add thumbnail URL and engagement stats (views, likes, comments) for display.</p>
      <form onSubmit={save} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="floating-label-group">
          <input type="url" placeholder=" " value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} required />
          <label>Video URL (Instagram Reel or Facebook Reel)</label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Platform</label>
            <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as "instagram" | "facebook" }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          <div className="floating-label-group">
            <input type="text" placeholder=" " value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            <label>Username (e.g. heartprinted)</label>
          </div>
        </div>
        {/* Drag & Drop Thumbnail Upload */}
        <div
          className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${thumbDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : thumbPreview
              ? "border-primary/30 bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setThumbDragOver(true); }}
          onDragLeave={() => setThumbDragOver(false)}
          onDrop={handleThumbDrop}
          onClick={() => document.getElementById("journey-thumb-input")?.click()}
        >
          <input
            id="journey-thumb-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleThumbSelect}
          />
          {thumbPreview ? (
            <div className="relative p-3">
              <img src={thumbPreview} alt="Thumbnail preview" className="w-full aspect-video object-cover rounded-xl" />
              <motion.button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearThumb(); }}
                className="absolute top-5 right-5 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Drop thumbnail image here</p>
              <p className="text-xs text-muted-foreground">or click to browse (optional)</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="floating-label-group">
            <input type="text" placeholder=" " value={form.views} onChange={(e) => setForm((f) => ({ ...f, views: e.target.value }))} />
            <label>Views (e.g. 27m)</label>
          </div>
          <div className="floating-label-group">
            <input type="text" placeholder=" " value={form.likes} onChange={(e) => setForm((f) => ({ ...f, likes: e.target.value }))} />
            <label>Likes (e.g. 605k)</label>
          </div>
          <div className="floating-label-group">
            <input type="text" placeholder=" " value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} />
            <label>Comments</label>
          </div>
        </div>
        <motion.button type="submit" className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
          {editingId ? "Save Changes" : <><Plus className="w-4 h-4" /> Add Video</>}
        </motion.button>
      </form>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Videos on home page ({videos.length})</h4>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No videos yet. Add one above.</p>
        ) : (
          videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 shadow-card">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{v.url}</p>
                <p className="text-xs text-muted-foreground">{v.platform} · @{v.username} {v.views && `· ${v.views} views`}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(v.id);
                    setForm({ url: v.url, platform: v.platform, thumbnailUrl: v.thumbnailUrl || "", username: v.username || "heartprinted", views: v.views || "", likes: v.likes || "", comments: v.comments || "" });
                    setThumbPreview(v.thumbnailUrl || null);
                  }}
                  className="text-xs font-medium text-primary hover:underline px-2"
                >
                  Edit
                </button>
                <button type="button" onClick={() => remove(v.id)} className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EventPacksAdminTab() {
  const { toast } = useToast();
  const [packs, setPacks] = useState<ApiEventPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ApiEventPack | null>(null);
  const [showForm, setShowForm] = useState(false);
  const emptyForm = { name: "", tagline: "", description: "", icon: "Heart", image: "", qty: "", pricePerUnit: "", totalPrice: "", savings: "", features: "", color: "from-pink to-pink-dark" };
  const [form, setForm] = useState(emptyForm);
  const [eventDragOver, setEventDragOver] = useState(false);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);

  const processEventImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setEventImagePreview(base64);
      setForm((f) => ({ ...f, image: base64 }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleEventImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setEventDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processEventImage(file);
  }, [processEventImage]);

  const handleEventImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processEventImage(file);
  }, [processEventImage]);

  const clearEventImage = useCallback(() => {
    setEventImagePreview(null);
    setForm((f) => ({ ...f, image: "" }));
  }, []);

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    try {
      const list = await eventPacksApi.getAll();
      setPacks(list);
    } catch { setPacks([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setEventImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (pack: ApiEventPack) => {
    setEditing(pack);
    setForm({
      name: pack.name,
      tagline: pack.tagline,
      description: pack.description,
      icon: pack.icon,
      image: pack.image,
      qty: pack.qty.toString(),
      pricePerUnit: pack.pricePerUnit.toString(),
      totalPrice: pack.totalPrice.toString(),
      savings: pack.savings.toString(),
      features: pack.features.join(", "),
      color: pack.color,
    });
    setEventImagePreview(pack.image || null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.image || !form.qty || !form.totalPrice) {
      toast({ title: "Please fill required fields", description: "Name, image, quantity, and total price are required.", variant: "destructive" });
      return;
    }
    const body = {
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      icon: form.icon,
      image: form.image,
      qty: parseInt(form.qty, 10),
      pricePerUnit: parseFloat(form.pricePerUnit) || 0,
      totalPrice: parseFloat(form.totalPrice),
      savings: parseFloat(form.savings) || 0,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
      color: form.color,
    };
    try {
      if (editing) {
        const updated = await eventPacksApi.update(editing.id, body);
        setPacks((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
        toast({ title: "Event pack updated!" });
      } else {
        const created = await eventPacksApi.create(body);
        setPacks((prev) => [...prev, created]);
        toast({ title: "Event pack added!" });
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditing(null);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventPacksApi.delete(id);
      setPacks((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Event pack deleted!" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const iconOptions = ["Heart", "PartyPopper", "Building2", "Gift"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground text-lg">Event Packs</h3>
        <motion.button onClick={openAdd} className="px-4 py-2 rounded-xl bg-gradient-pink text-primary-foreground text-sm font-medium flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Plus className="w-4 h-4" /> Add Pack
        </motion.button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <h4 className="font-medium text-foreground">{editing ? "Edit Event Pack" : "New Event Pack"}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="floating-label-group col-span-2">
              <input placeholder=" " value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <label>Pack Name *</label>
            </div>
            <div className="floating-label-group col-span-2">
              <input placeholder=" " value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              <label>Tagline</label>
            </div>
            <div className="floating-label-group col-span-2">
              <textarea placeholder=" " rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <label>Description</label>
            </div>
            {/* Drag & Drop Event Image Upload */}
            <div
              className={`col-span-2 relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${eventDragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : eventImagePreview
                  ? "border-primary/30 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setEventDragOver(true); }}
              onDragLeave={() => setEventDragOver(false)}
              onDrop={handleEventImageDrop}
              onClick={() => document.getElementById("event-image-input")?.click()}
            >
              <input
                id="event-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleEventImageSelect}
              />
              {eventImagePreview ? (
                <div className="relative p-3">
                  <img src={eventImagePreview} alt="Preview" className="w-full aspect-video object-cover rounded-xl" />
                  <motion.button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearEventImage(); }}
                    className="absolute top-5 right-5 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Drop event image here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Icon</label>
              <div className="flex gap-2">
                {iconOptions.map((ico) => (
                  <button key={ico} type="button" onClick={() => setForm({ ...form, icon: ico })} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.icon === ico ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {ico}
                  </button>
                ))}
              </div>
            </div>
            <div className="floating-label-group">
              <input placeholder=" " value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              <label>Gradient Color</label>
            </div>
            <div className="floating-label-group">
              <input type="number" min={1} placeholder=" " value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
              <label>Quantity *</label>
            </div>
            <div className="floating-label-group">
              <input type="number" min={0} step={0.01} placeholder=" " value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
              <label>Price Per Unit (Rs)</label>
            </div>
            <div className="floating-label-group">
              <input type="number" min={0} step={0.01} placeholder=" " value={form.totalPrice} onChange={(e) => setForm({ ...form, totalPrice: e.target.value })} />
              <label>Total Price (Rs) *</label>
            </div>
            <div className="floating-label-group">
              <input type="number" min={0} placeholder=" " value={form.savings} onChange={(e) => setForm({ ...form, savings: e.target.value })} />
              <label>Savings (Rs)</label>
            </div>
            <div className="floating-label-group col-span-2">
              <input placeholder=" " value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
              <label>Features (comma-separated)</label>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button type="button" onClick={handleSave} className="flex-1 py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
              {editing ? "Update Pack" : "Add Pack"}
            </motion.button>
            <motion.button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-3 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors" whileTap={{ scale: 0.97 }}>
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-16 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : packs.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No event packs yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packs.map((pack) => (
            <motion.div key={pack.id} className="bg-card border border-border rounded-2xl p-5 shadow-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex gap-4">
                <img src={pack.image} alt={pack.name} className="w-28 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{pack.name}</h4>
                      <p className="text-xs text-muted-foreground">{pack.tagline}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(pack)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm(`Delete "${pack.name}"?`)) handleDelete(pack.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Rs{pack.totalPrice}</span>
                    <span>{pack.qty} magnets</span>
                    <span>Rs{pack.pricePerUnit}/unit</span>
                    {pack.savings > 0 && <span className="text-[hsl(var(--success))] font-medium">Save Rs{pack.savings}</span>}
                  </div>
                  {pack.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {pack.features.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function HeroStatsAdminTab() {
  const { heroStats, setHeroStats } = useSiteContentStore();
  const { toast } = useToast();
  const [customers, setCustomers] = useState(() => heroStats.happyCustomers.toString());
  const [magnets, setMagnets] = useState(() => heroStats.magnetsPrinted.toString());
  const [rating, setRating] = useState(() => heroStats.avgRating.toString());

  const save = () => {
    const c = parseInt(customers, 10);
    const m = parseInt(magnets, 10);
    const r = parseFloat(rating);
    if (isNaN(c) || isNaN(m) || isNaN(r) || c < 0 || m < 0 || r < 0 || r > 5) {
      toast({ title: "Invalid values", description: "Please enter valid numbers. Rating must be 0–5.", variant: "destructive" });
      return;
    }
    setHeroStats({ happyCustomers: c, magnetsPrinted: m, avgRating: Math.round(r * 10) / 10 });
    toast({ title: "Hero stats saved!" });
  };

  return (
    <div className="max-w-xl space-y-4">
      <h3 className="font-display font-semibold text-foreground">Hero Section Stats</h3>
      <p className="text-xs text-muted-foreground">These numbers are displayed on the home page hero section. Update them anytime.</p>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="floating-label-group">
            <input type="number" min={0} placeholder=" " value={customers} onChange={(e) => setCustomers(e.target.value)} />
            <label>Happy Customers</label>
          </div>
          <div className="floating-label-group">
            <input type="number" min={0} placeholder=" " value={magnets} onChange={(e) => setMagnets(e.target.value)} />
            <label>Magnets Printed</label>
          </div>
          <div className="floating-label-group">
            <input type="number" min={0} max={5} step={0.1} placeholder=" " value={rating} onChange={(e) => setRating(e.target.value)} />
            <label>Average Rating</label>
          </div>
        </div>
        <motion.button type="button" onClick={save} className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
          Save hero stats
        </motion.button>
      </div>
    </div>
  );
}

function OrderQuantityAdminTab() {
  const { orderQuantity, setOrderQuantity } = useSiteContentStore();
  const { toast } = useToast();
  const [min, setMin] = useState(() => orderQuantity.min.toString());
  const [max, setMax] = useState(() => orderQuantity.max.toString());

  const save = () => {
    const minN = parseInt(min, 10);
    const maxN = parseInt(max, 10);
    if (isNaN(minN) || isNaN(maxN) || minN < 1 || maxN < minN) {
      toast({ title: "Invalid values", description: "Min must be ≥ 1, max must be ≥ min.", variant: "destructive" });
      return;
    }
    setOrderQuantity({ min: minN, max: maxN });
    toast({ title: "Order quantity limits saved!" });
  };

  return (
    <div className="max-w-xl space-y-4">
      <h3 className="font-display font-semibold text-foreground">Order quantity limits</h3>
      <p className="text-xs text-muted-foreground">Minimum and maximum quantity per product on product detail and in cart. Default: min 4, max 12.</p>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="floating-label-group">
            <input type="number" min={1} placeholder=" " value={min} onChange={(e) => setMin(e.target.value)} />
            <label>Minimum quantity</label>
          </div>
          <div className="floating-label-group">
            <input type="number" min={1} placeholder=" " value={max} onChange={(e) => setMax(e.target.value)} />
            <label>Maximum quantity</label>
          </div>
        </div>
        <motion.button type="button" onClick={save} className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
          Save quantity limits
        </motion.button>
      </div>
    </div>
  );
}

export default Admin;
