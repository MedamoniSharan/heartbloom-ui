import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package, DollarSign, Users, TrendingUp, Plus,
  Eye, Trash2, ChevronDown, Tag, ToggleLeft, ToggleRight,
  Upload, ImageIcon, X, BarChart3, ShoppingCart, Calendar,
} from "lucide-react";
import { useProductStore, Product, Order, PromoCode } from "@/stores/productStore";
import { useSiteContentStore } from "@/stores/siteContentStore";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
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
          <div className="text-right"><p className="text-2xl font-bold text-foreground font-display">${totalRevenue.toFixed(0)}</p><p className="text-xs text-[hsl(var(--success))]">↑ 18% vs last week</p></div>
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
  const [tab, setTab] = useState<"dashboard" | "analytics" | "orders" | "products" | "add" | "promos" | "bulk" | "courses">("dashboard");
  const [newPromo, setNewPromo] = useState({ code: "", discount: "", description: "", expiresAt: "" });
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders(true);
      fetchPromos();
    }
  }, [user?.role, fetchOrders, fetchPromos]);

  const SIZE_OPTIONS = ["2.5 x 2.5", "2 x 2", "Upload"] as const;
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", image: "", category: "2.5 x 2.5" });
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      const ok = await useProductStore.getState().updateProduct(editingProductId, {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        image: newProduct.image,
        category: newProduct.category,
      });
      if (ok) {
        toast({ title: "Product updated!" });
        setNewProduct({ name: "", description: "", price: "", image: "", category: "2.5 x 2.5" });
        clearImage();
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
        image: newProduct.image || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop",
        category: newProduct.category,
        rating: 4.5,
        reviews: 0,
        inStock: true,
      });
      if (ok) {
        toast({ title: "Product added!" });
        setNewProduct({ name: "", description: "", price: "", image: "", category: "2.5 x 2.5" });
        clearImage();
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
        <div className="flex gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
          {(["dashboard", "analytics", "orders", "products", "add", "promos", "bulk", "courses"] as const).map((t) => {
            const labels: Record<string, string> = { dashboard: "Dashboard", analytics: "Analytics", orders: "Orders", products: "Products", add: "Add Product", promos: "Promo Codes", bulk: "Bulk Orders", courses: "Courses" };
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
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-4 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-display font-bold text-foreground">{order.id}</span>
                    <p className="text-xs text-muted-foreground">{order.userName} · {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{order.address.street}, {order.address.city}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-foreground">Rs{order.total.toFixed(2)}</span>
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
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
                        setNewProduct({ name: p.name, description: p.description, price: p.price.toString(), image: p.image, category: SIZE_OPTIONS.includes(p.category as any) ? p.category : "2.5 x 2.5" });
                        setImagePreview(p.image);
                        setTab("add");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-1.5 rounded-lg border flex items-center justify-center text-xs font-medium text-muted-foreground border-border hover:bg-muted hover:text-foreground transition-colors"
                    >
                      Edit
                    </button>
                    <button onClick={async () => {
                      const ok = await removeProduct(p.id);
                      if (ok) toast({ title: "Product removed" });
                      else toast({ title: "Failed to remove", variant: "destructive" });
                    }} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Product Form */}
        {tab === "add" && (
          <form onSubmit={handleAddProduct} className="max-w-xl bg-card border border-border rounded-2xl p-6 shadow-card space-y-4 relative">
            {editingProductId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setNewProduct({ name: "", description: "", price: "", image: "", category: "2.5 x 2.5" });
                  clearImage();
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
              <label>Price (Rs)</label>
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Size / Subcategory</label>
              <select value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
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

export default Admin;
