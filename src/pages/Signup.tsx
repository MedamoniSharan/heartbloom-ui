import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (signup(name, email, password)) {
      toast({ title: "Account created!", description: "Welcome to Magnetic Bliss India!" });
      navigate("/products");
    } else {
      toast({ title: "Signup failed", description: "An account with this email already exists.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="font-display text-2xl font-bold text-foreground">Magnetic Bliss India</span>
          </Link>
          <h1 className="text-h2 text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Join Magnetic Bliss India and start creating</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="floating-label-group">
            <input type="text" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} required />
            <label>Full Name</label>
          </div>
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

          <motion.button type="submit" className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
            Create Account <ArrowRight className="w-4 h-4" />
          </motion.button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
