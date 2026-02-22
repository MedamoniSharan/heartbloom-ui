import { useState, useRef, type ReactNode, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

/* ───────────────────────────────────────────────
 * Ripple Button — Primary with ripple effect
 * ─────────────────────────────────────────────── */
interface RippleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "destructive";
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  "data-magnetic"?: string;
}

export const RippleButton = ({
  children,
  onClick,
  variant = "primary",
  loading = false,
  success = false,
  disabled = false,
  className = "",
  icon,
  ...rest
}: RippleButtonProps) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
    }
    onClick?.();
  };

  const variantClasses = {
    primary: "bg-gradient-pink text-primary-foreground glow-pink-sm",
    secondary: "bg-muted text-foreground border border-border",
    destructive: "bg-destructive text-destructive-foreground",
  };

  return (
    <motion.button
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm transition-shadow disabled:opacity-50 touch-target ${variantClasses[variant]} ${className}`}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97, y: 0 }}
      {...rest}
    >
      {/* Ripple effects */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-primary-foreground/30 animate-ripple"
          style={{ left: r.x, top: r.y, width: 10, height: 10, transform: "translate(-50%,-50%)" }}
        />
      ))}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.span>
        ) : success ? (
          <motion.span key="success" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check className="w-4 h-4" />
          </motion.span>
        ) : icon ? (
          <motion.span key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {icon}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <span className={loading ? "opacity-60" : ""}>{children}</span>
    </motion.button>
  );
};

/* ───────────────────────────────────────────────
 * Animated Switch Toggle
 * ─────────────────────────────────────────────── */
interface AnimatedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const AnimatedSwitch = ({ checked, onChange, label }: AnimatedSwitchProps) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-12 h-7 rounded-full transition-colors duration-200 touch-target ${
      checked ? "bg-primary" : "bg-border"
    }`}
  >
    <motion.div
      className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-primary-foreground shadow-sm"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);

/* ───────────────────────────────────────────────
 * Animated Checkbox with SVG checkmark draw
 * ─────────────────────────────────────────────── */
interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export const AnimatedCheckbox = ({ checked, onChange, label, id }: AnimatedCheckboxProps) => (
  <label className="inline-flex items-center gap-2 cursor-pointer touch-target" htmlFor={id}>
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`custom-checkbox ${checked ? "checked" : ""}`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <motion.path
          d="M2 6L5 9L10 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: checked ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </svg>
    </button>
    <span className="text-sm text-foreground">{label}</span>
  </label>
);

/* ───────────────────────────────────────────────
 * Loading Spinner — Three bouncing dots
 * ─────────────────────────────────────────────── */
export const LoadingDots = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex items-center gap-1 ${className}`} role="status" aria-label="Loading">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ scale: [0.5, 1, 0.5] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </span>
);

/* ───────────────────────────────────────────────
 * Confirm Delete Button — two-step
 * ─────────────────────────────────────────────── */
interface ConfirmDeleteButtonProps {
  onConfirm: () => void;
  children?: ReactNode;
}

export const ConfirmDeleteButton = ({ onConfirm, children = "Delete" }: ConfirmDeleteButtonProps) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!confirming ? (
        <motion.button
          key="initial"
          onClick={() => setConfirming(true)}
          className="px-4 py-2 rounded-xl text-sm text-destructive-foreground bg-destructive/80 hover:bg-destructive transition-colors touch-target"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.button>
      ) : (
        <motion.div
          key="confirm"
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
        >
          <span className="text-xs text-muted-foreground">Sure?</span>
          <button
            onClick={() => { onConfirm(); setConfirming(false); }}
            className="px-3 py-1.5 rounded-lg text-xs bg-destructive text-destructive-foreground font-medium"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-3 py-1.5 rounded-lg text-xs bg-muted text-foreground"
          >
            No
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
