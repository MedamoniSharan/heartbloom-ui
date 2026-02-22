import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package, DollarSign, Users, TrendingUp, Plus,
  Eye, Trash2, ChevronDown, Tag, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useProductStore, Product, Order, PromoCode } from "@/stores/productStore";
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
  const { products, orders, promoCodes, addProduct, removeProduct, updateOrderStatus, addPromoCode, removePromoCode, togglePromoCode } = useProductStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<"orders" | "products" | "add" | "promos">("orders");
  const [newPromo, setNewPromo] = useState({ code: "", discount: "", description: "", expiresAt: "" });

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
        <div className="flex gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
          {(["orders", "products", "add", "promos"] as const).map((t) => {
            const labels: Record<string, string> = { orders: "Orders", products: "Products", add: "Add Product", promos: "Promo Codes" };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
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

        {/* Promo Codes Tab */}
        {tab === "promos" && (
          <div className="space-y-6">
            {/* Add promo form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPromo.code || !newPromo.discount) return;
                addPromoCode({
                  code: newPromo.code.toUpperCase(),
                  discount: parseFloat(newPromo.discount),
                  description: newPromo.description,
                  active: true,
                  expiresAt: newPromo.expiresAt || undefined,
                });
                toast({ title: "Promo code created!", description: `Code "${newPromo.code.toUpperCase()}" is now live.` });
                setNewPromo({ code: "", discount: "", description: "", expiresAt: "" });
              }}
              className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4 max-w-lg"
            >
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Create Promo Code</h3>
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
                <Plus className="w-4 h-4" /> Create Promo Code
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
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePromoCode(promo.id)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle promo">
                        {promo.active ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <button onClick={() => { removePromoCode(promo.id); toast({ title: "Promo removed" }); }} className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
