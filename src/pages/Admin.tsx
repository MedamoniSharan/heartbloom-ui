import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, DollarSign, Users, TrendingUp, Plus,
  Eye, Trash2, ChevronDown,
} from "lucide-react";
import { useProductStore, Product, Order } from "@/stores/productStore";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const statCards = (orders: Order[], products: Product[]) => [
  { label: "Total Orders", value: orders.length, icon: Package, change: "+12%" },
  { label: "Revenue", value: `$${orders.reduce((s, o) => s + o.total, 0).toFixed(0)}`, icon: DollarSign, change: "+8%" },
  { label: "Products", value: products.length, icon: TrendingUp, change: "" },
  { label: "Customers", value: new Set(orders.map((o) => o.userId)).size, icon: Users, change: "+3%" },
];

const Admin = () => {
  const { user } = useAuthStore();
  const { products, orders, addProduct, removeProduct, updateOrderStatus } = useProductStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<"orders" | "products" | "add">("orders");

  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", image: "", category: "Photo Magnets" });

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      image: newProduct.image || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop",
      category: newProduct.category,
      rating: 4.5,
      reviews: 0,
      inStock: true,
    });
    toast({ title: "Product added!" });
    setNewProduct({ name: "", description: "", price: "", image: "", category: "Photo Magnets" });
    setTab("products");
  };

  const stats = statCards(orders, products);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 px-6 pb-16 max-w-6xl mx-auto">
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
        <div className="flex gap-2 mb-6 border-b border-border pb-3">
          {(["orders", "products", "add"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t === "add" ? "Add Product" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

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
                    <span className="font-display font-bold text-foreground">${order.total.toFixed(2)}</span>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
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
                  <p className="text-xs text-muted-foreground mt-1">${p.price} · {p.category}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { removeProduct(p.id); toast({ title: "Product removed" }); }} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Product Tab */}
        {tab === "add" && (
          <form onSubmit={handleAddProduct} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4 max-w-lg">
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
              <label>Price ($)</label>
            </div>
            <div className="floating-label-group">
              <input type="url" placeholder=" " value={newProduct.image} onChange={(e) => setNewProduct((p) => ({ ...p, image: e.target.value }))} />
              <label>Image URL (optional)</label>
            </div>
            <div className="floating-label-group">
              <input type="text" placeholder=" " value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} />
              <label>Category</label>
            </div>
            <motion.button type="submit" className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
              <Plus className="w-4 h-4" /> Add Product
            </motion.button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
