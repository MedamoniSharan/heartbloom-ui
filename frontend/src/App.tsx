import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PromoTicker } from "./components/PromoTicker";
import { Loader } from "./components/Loader";
import { useAuthStore } from "./stores/authStore";
import { useProductStore } from "./stores/productStore";
import { useWishlistStore } from "./stores/wishlistStore";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Equipment from "./pages/Equipment";
import Wishlist from "./pages/Wishlist";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
const queryClient = new QueryClient();

const App = () => {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const fetchActivePromos = useProductStore((s) => s.fetchActivePromos);
  const syncFromApi = useWishlistStore((s) => s.syncFromApi);
  useEffect(() => {
    fetchMe();
    fetchProducts();
    fetchActivePromos();
  }, [fetchMe, fetchProducts, fetchActivePromos]);
  useEffect(() => {
    if (isAuthenticated) syncFromApi();
  }, [isAuthenticated, syncFromApi]);

  const productsLoading = useProductStore((s) => s.productsLoading);
  const authLoading = useAuthStore((s) => s.isLoading);

  const isGlobalLoading = productsLoading || authLoading;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={150}>
        <Toaster />
        <Sonner />
        {isGlobalLoading && <Loader />}
        <BrowserRouter>
          <PromoTicker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/address" element={<Address />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
