import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      toast({ title: "Welcome back!", description: "You've been logged in successfully." });
      navigate("/products");
    } else {
      toast({ title: "Login failed", description: "Invalid email or password. Try admin@heartprinted.com / admin123", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="font-display text-2xl font-bold text-foreground">Magnetic Bliss India</span>
          </Link>
          <h1 className="text-h2 text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="floating-label-group">
            <input type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label>Email Address</label>
          </div>
          <div className="floating-label-group relative">
            <input type={showPassword ? "text" : "password"} placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required />
            <label>Password</label>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <motion.button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </motion.button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign Up</Link>
          </p>

          <div className="text-xs text-muted-foreground text-center border-t border-border pt-3 mt-3">
            <p>Demo: <code className="bg-muted px-1 rounded">admin@heartprinted.com</code> / <code className="bg-muted px-1 rounded">admin123</code></p>
            <p className="mt-1">Or: <code className="bg-muted px-1 rounded">jane@example.com</code> / <code className="bg-muted px-1 rounded">password</code></p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
