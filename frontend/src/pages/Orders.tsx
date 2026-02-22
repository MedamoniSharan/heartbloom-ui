import { useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Clock, Truck, CheckCircle2, XCircle } from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useAuthStore } from "@/stores/authStore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { LottieFromPath } from "@/components/LottieFromPath";

const statusConfig = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Pending" },
  processing: { icon: Package, color: "text-primary", bg: "bg-primary/10", label: "Processing" },
  shipped: { icon: Truck, color: "text-[hsl(210,80%,55%)]", bg: "bg-[hsl(210,80%,55%)]/10", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Cancelled" },
};

const Orders = () => {
  const { orders, fetchOrders, ordersLoading } = useProductStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  const myOrders = user?.role === "admin" ? orders : orders.filter((o) => o.userId === user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 px-6 pb-16 max-w-4xl mx-auto">
        <h1 className="text-h1 text-foreground mb-8">My Orders</h1>

        {ordersLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <LottieFromPath path="/Order%20now.json" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-h3 text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
            <Link to="/products" className="px-6 py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm inline-block">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order, i) => {
              const cfg = statusConfig[order.status];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-5 shadow-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm font-bold text-foreground font-display">{order.id}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                      <Icon className="w-3.5 h-3.5" /> {cfg.label}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {order.items.map((item) => (
                      <img key={item.product.id} src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                    <span className="font-display font-bold text-foreground">${order.total.toFixed(2)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
