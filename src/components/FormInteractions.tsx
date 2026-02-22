import { useState, useRef, type InputHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Loader2 } from "lucide-react";

/* ───────────────────────────────────────────────
 * Floating Label Input
 * ─────────────────────────────────────────────── */
interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
}

export const FloatingInput = ({
  label,
  error,
  success,
  loading,
  className = "",
  ...props
}: FloatingInputProps) => {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value || !!props.defaultValue;

  return (
    <div className="space-y-1">
      <div className="floating-label-group">
        <input
          {...props}
          placeholder=" "
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={`peer ${error ? "!border-destructive !ring-destructive/20" : ""} ${
            success ? "!border-green-500" : ""
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
        />
        <label className={error ? "!text-destructive" : ""}>{label}</label>

        {/* Status icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
          {success && !loading && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check className="w-4 h-4 text-green-500" />
            </motion.div>
          )}
          {error && !loading && (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={props.id ? `${props.id}-error` : undefined}
            className="text-xs text-destructive flex items-center gap-1 px-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ───────────────────────────────────────────────
 * Quantity Selector
 * ─────────────────────────────────────────────── */
interface QuantitySelectorProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export const QuantitySelector = ({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const startIncrement = (delta: number) => {
    const next = value + delta;
    if (next >= min && next <= max) onChange(next);
    intervalRef.current = setInterval(() => {
      onChange(Math.max(min, Math.min(max, value + delta)));
    }, 150);
  };

  const stopIncrement = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="inline-flex items-center gap-0 rounded-xl border border-border bg-background">
      <motion.button
        className="w-10 h-10 flex items-center justify-center text-foreground disabled:opacity-30 touch-target rounded-l-xl hover:bg-muted transition-colors"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        onMouseDown={() => startIncrement(-1)}
        onMouseUp={stopIncrement}
        onMouseLeave={stopIncrement}
        whileTap={{ scale: 0.9 }}
        aria-label="Decrease quantity"
      >
        <span className="text-lg font-medium">−</span>
      </motion.button>

      <div className="w-10 h-10 flex items-center justify-center overflow-hidden" style={{ perspective: "100px" }}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            className="text-sm font-semibold text-foreground"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        className="w-10 h-10 flex items-center justify-center text-foreground disabled:opacity-30 touch-target rounded-r-xl hover:bg-muted transition-colors"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        onMouseDown={() => startIncrement(1)}
        onMouseUp={stopIncrement}
        onMouseLeave={stopIncrement}
        whileTap={{ scale: 0.9 }}
        aria-label="Increase quantity"
      >
        <span className="text-lg font-medium">+</span>
      </motion.button>
    </div>
  );
};

/* ───────────────────────────────────────────────
 * Coupon Code Input
 * ─────────────────────────────────────────────── */
interface CouponInputProps {
  onApply: (code: string) => Promise<boolean>;
}

export const CouponInput = ({ onApply }: CouponInputProps) => {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    const valid = await onApply(code.trim());
    setLoading(false);
    if (valid) {
      setApplied(code.trim());
      setCode("");
      setExpanded(false);
    } else {
      setError("Invalid code");
    }
  };

  if (applied) {
    return (
      <motion.div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <span className="font-medium">{applied}</span>
        <button
          onClick={() => setApplied(null)}
          className="hover:text-destructive transition-colors"
          aria-label="Remove coupon"
        >
          ×
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="link"
            className="text-sm text-primary hover:underline"
            onClick={() => setExpanded(true)}
            exit={{ opacity: 0 }}
          >
            Apply Coupon
          </motion.button>
        ) : (
          <motion.div
            key="input"
            className="flex gap-2"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
          >
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              placeholder="Enter code"
              className={`px-3 py-2 rounded-xl border text-sm bg-background text-foreground w-36 ${
                error ? "border-destructive animate-shake" : "border-border"
              }`}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              autoFocus
            />
            <motion.button
              onClick={handleApply}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              whileTap={{ scale: 0.95 }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};
