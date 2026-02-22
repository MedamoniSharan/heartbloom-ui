import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

type CursorState = "default" | "hover" | "button" | "text" | "link";

export const MagneticCursor = () => {
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [isTouch, setIsTouch] = useState(false);
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Outer ring follows with spring lag
  const ringX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.8 });
  const ringY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.8 });

  // Trail dots
  const trailRefs = useRef<{ x: ReturnType<typeof useSpring>; y: ReturnType<typeof useSpring> }[]>([]);

  const trail0X = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const trail0Y = useSpring(mouseY, { stiffness: 120, damping: 22 });
  const trail1X = useSpring(trail0X, { stiffness: 120, damping: 22 });
  const trail1Y = useSpring(trail0Y, { stiffness: 120, damping: 22 });
  const trail2X = useSpring(trail1X, { stiffness: 120, damping: 22 });
  const trail2Y = useSpring(trail1Y, { stiffness: 120, damping: 22 });
  const trail3X = useSpring(trail2X, { stiffness: 120, damping: 22 });
  const trail3Y = useSpring(trail2Y, { stiffness: 120, damping: 22 });

  const trails = [
    { x: trail0X, y: trail0Y, opacity: 0.35 },
    { x: trail1X, y: trail1Y, opacity: 0.25 },
    { x: trail2X, y: trail2Y, opacity: 0.15 },
    { x: trail3X, y: trail3Y, opacity: 0.08 },
  ];

  useEffect(() => {
    // Detect touch device
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(isTouchDevice);
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (target.closest("button") || target.closest("[data-magnetic]")) {
        setCursorState("button");
        // Magnetic pull
        const el = (target.closest("button") || target.closest("[data-magnetic]")) as HTMLElement;
        if (el?.hasAttribute("data-magnetic")) {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dx = (e.clientX - centerX) * 0.3;
          const dy = (e.clientY - centerY) * 0.3;
          el.style.transform = `translate(${Math.min(12, Math.max(-12, dx))}px, ${Math.min(12, Math.max(-12, dy))}px)`;
        }
      } else if (target.closest("a")) {
        setCursorState("link");
      } else if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        setCursorState("text");
      } else if (target.closest("img") || target.closest("[data-cursor='hover']")) {
        setCursorState("hover");
      } else {
        setCursorState("default");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest("[data-magnetic]")) {
        const el = target.closest("[data-magnetic]") as HTMLElement;
        el.style.transform = "";
        el.style.transition = "transform 0.3s cubic-bezier(0.25,0.1,0.25,1)";
        setTimeout(() => { el.style.transition = ""; }, 300);
      }
      setCursorState("default");
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, visible]);

  if (isTouch) return null;

  const ringSize = cursorState === "hover" ? 60 : cursorState === "button" ? 50 : 40;
  const dotVisible = cursorState !== "hover" && cursorState !== "button";

  return (
    <>
      {/* Add cursor:none globally */}
      <style>{`
        @media (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: visible ? (cursorState === "hover" ? 0.8 : 0.4) : 0,
          backgroundColor:
            cursorState === "hover"
              ? "hsla(326,82%,51%,0.15)"
              : "transparent",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div
          className="w-full h-full rounded-full border-[1.5px]"
          style={{
            borderColor:
              cursorState === "button"
                ? "hsl(326,82%,51%)"
                : "hsl(0,0%,100%)",
          }}
        />
        {/* VIEW text for hover state */}
        {cursorState === "hover" && (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tracking-widest text-white">
            VIEW
          </span>
        )}
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: "hsl(326,82%,51%)",
        }}
        animate={{
          width: cursorState === "text" ? 2 : dotVisible ? 8 : 0,
          height: cursorState === "text" ? 20 : dotVisible ? 8 : 0,
          borderRadius: cursorState === "text" ? "1px" : "50%",
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />

      {/* Trail dots */}
      {trails.map((t, i) => (
        <motion.div
          key={i}
          className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
          style={{
            x: t.x,
            y: t.y,
            translateX: "-50%",
            translateY: "-50%",
            width: 4,
            height: 4,
            backgroundColor: "hsl(326,82%,51%)",
            opacity: visible ? t.opacity : 0,
          }}
        />
      ))}
    </>
  );
};
