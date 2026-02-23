import { useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Clock, Truck, CheckCircle2, XCircle, Check } from "lucide-react";
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

const Timeline = ({ currentStatus }: { currentStatus: string }) => {
  if (currentStatus === "cancelled") {
    return (
      <div className="mt-4 mb-4 py-3 border-t border-b border-border flex items-center gap-2 text-destructive">
        <XCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Order Cancelled</span>
      </div>
    );
  }

  const steps = ["pending", "processing", "shipped", "delivered"];
  const cIdx = steps.indexOf(currentStatus);
  const currentIndex = cIdx === -1 ? 0 : cIdx;

  return (
    <div className="mt-5 mb-6 pt-4 border-t border-border">
      <div className="relative max-w-sm mx-auto">
        <div className="absolute top-4 left-[10%] right-[10%] h-[3px] bg-muted rounded-full" />
        <div
          className="absolute top-4 left-[10%] h-[3px] bg-[hsl(var(--success))] rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `calc(${(currentIndex / (steps.length - 1)) * 80}% + ${currentIndex === 0 ? 0 : 5}px)` }}
        />
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const StepIcon = statusConfig[step as keyof typeof statusConfig].icon;
            return (
              <div key={step} className="flex flex-col items-center gap-2 z-10 w-16">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-card ${idx < currentIndex ? "bg-[hsl(var(--success))] text-white" :
                      idx === currentIndex ? "bg-primary text-primary-foreground scale-110 shadow-sm" :
                        "bg-muted text-muted-foreground"
                    }`}
                >
                  {idx < currentIndex ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-medium text-center ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                  {statusConfig[step as keyof typeof statusConfig].label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
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
            <div className="w-56 h-56 mx-auto mb-4 flex items-center justify-center">
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
                  <Timeline currentStatus={order.status} />
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {order.items.map((item) => (
                      <img key={item.product.id} src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                    <span className="font-display font-bold text-foreground">₹{order.total.toFixed(2)}</span>
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
