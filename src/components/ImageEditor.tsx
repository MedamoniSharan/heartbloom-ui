import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Crop, Sliders, Sparkles, RotateCw, FlipHorizontal, FlipVertical,
  Undo2, Redo2, RotateCcw,
} from "lucide-react";
import {
  type PhotoItem, type Adjustments, DEFAULT_ADJUSTMENTS,
  FILTER_PRESETS, buildFilterString,
} from "@/stores/photoStore";

type EditorTab = "crop" | "adjust" | "filters";

interface ImageEditorProps {
  photo: PhotoItem;
  onSave: (updates: Partial<PhotoItem>) => void;
  onClose: () => void;
}

interface HistoryEntry {
  adjustments: Adjustments;
  filter: string;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  crop: CropBox | null;
}

interface CropBox {
  x: number; y: number; w: number; h: number;
}

const SLIDER_CONFIG: { key: keyof Adjustments; label: string; min: number; max: number; step: number; defaultVal: number }[] = [
  { key: "brightness", label: "Brightness", min: 0.5, max: 1.5, step: 0.01, defaultVal: 1 },
  { key: "exposure", label: "Exposure", min: 0.5, max: 1.5, step: 0.01, defaultVal: 1 },
  { key: "gamma", label: "Gamma", min: 0.5, max: 2.0, step: 0.01, defaultVal: 1 },
  { key: "contrast", label: "Contrast", min: 0.5, max: 1.5, step: 0.01, defaultVal: 1 },
  { key: "saturation", label: "Saturation", min: 0, max: 2, step: 0.01, defaultVal: 1 },
  { key: "vibrance", label: "Vibrance", min: 0, max: 2, step: 0.01, defaultVal: 1 },
  { key: "warmth", label: "Warmth", min: 0.5, max: 1.5, step: 0.01, defaultVal: 1 },
  { key: "enhance", label: "Enhance", min: 0, max: 1, step: 0.01, defaultVal: 0 },
];

const ASPECT_RATIOS = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "16:9", ratio: 16 / 9 },
] as const;

export const ImageEditor = ({ photo, onSave, onClose }: ImageEditorProps) => {
  const [tab, setTab] = useState<EditorTab>("adjust");
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...photo.adjustments });
  const [selectedFilter, setSelectedFilter] = useState(photo.filter);
  const [rotation, setRotation] = useState(photo.rotation);
  const [flipH, setFlipH] = useState(photo.flipH);
  const [flipV, setFlipV] = useState(photo.flipV);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([
    { adjustments: { ...photo.adjustments }, filter: photo.filter, rotation: photo.rotation, flipH: photo.flipH, flipV: photo.flipV, crop: null },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Initialize crop box when switching to crop tab
  useEffect(() => {
    if (tab === "crop" && !cropBox && imageRef.current && imageContainerRef.current) {
      const container = imageContainerRef.current.getBoundingClientRect();
      const img = imageRef.current.getBoundingClientRect();
      const relX = img.left - container.left;
      const relY = img.top - container.top;
      setCropBox({ x: relX + 20, y: relY + 20, w: img.width - 40, h: img.height - 40 });
    }
  }, [tab, cropBox]);

  const pushHistory = useCallback(() => {
    const entry: HistoryEntry = { adjustments: { ...adjustments }, filter: selectedFilter, rotation, flipH, flipV, crop: cropBox };
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, entry].slice(-20);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  }, [adjustments, selectedFilter, rotation, flipH, flipV, historyIndex, cropBox]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setAdjustments({ ...prev.adjustments });
    setSelectedFilter(prev.filter);
    setRotation(prev.rotation);
    setFlipH(prev.flipH);
    setFlipV(prev.flipV);
    setCropBox(prev.crop);
    setHistoryIndex((i) => i - 1);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setAdjustments({ ...next.adjustments });
    setSelectedFilter(next.filter);
    setRotation(next.rotation);
    setFlipH(next.flipH);
    setFlipV(next.flipV);
    setCropBox(next.crop);
    setHistoryIndex((i) => i + 1);
  }, [history, historyIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") handleSave();
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const filterString = useMemo(
    () => buildFilterString(adjustments, selectedFilter),
    [adjustments, selectedFilter]
  );

  const transformStyle = useMemo(() => {
    const parts: string[] = [];
    if (rotation) parts.push(`rotate(${rotation}deg)`);
    if (flipH) parts.push("scaleX(-1)");
    if (flipV) parts.push("scaleY(-1)");
    return parts.join(" ") || "none";
  }, [rotation, flipH, flipV]);

  const handleSave = () => {
    onSave({
      adjustments: { ...adjustments },
      filter: selectedFilter,
      rotation,
      flipH,
      flipV,
    });
    onClose();
  };

  const updateSlider = (key: keyof Adjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const resetSlider = (key: keyof Adjustments) => {
    setAdjustments((prev) => ({ ...prev, [key]: DEFAULT_ADJUSTMENTS[key] }));
  };

  const resetAll = () => {
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setSelectedFilter("");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropBox(null);
  };

  const getPercent = (key: keyof Adjustments) => {
    const cfg = SLIDER_CONFIG.find(s => s.key === key)!;
    return Math.round(((adjustments[key] - cfg.min) / (cfg.max - cfg.min)) * 100);
  };

  // --- Crop drag handlers ---
  const handleCropMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    if (cropBox) setCropStart({ ...cropBox });
  };

  useEffect(() => {
    if (!dragging || !cropBox) return;
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      let { x, y, w, h } = cropStart;

      if (dragging === "move") {
        x = Math.max(0, Math.min(rect.width - w, x + dx));
        y = Math.max(0, Math.min(rect.height - h, y + dy));
      } else if (dragging === "se") {
        w = Math.max(40, Math.min(rect.width - x, w + dx));
        h = aspectRatio ? w / aspectRatio : Math.max(40, Math.min(rect.height - y, h + dy));
      } else if (dragging === "sw") {
        const newW = Math.max(40, w - dx);
        x = x + (w - newW);
        w = newW;
        h = aspectRatio ? w / aspectRatio : Math.max(40, Math.min(rect.height - y, h + dy));
      } else if (dragging === "ne") {
        w = Math.max(40, Math.min(rect.width - x, w + dx));
        const newH = aspectRatio ? w / aspectRatio : Math.max(40, h - dy);
        y = y + (h - newH);
        h = newH;
      } else if (dragging === "nw") {
        const newW = Math.max(40, w - dx);
        const newH = aspectRatio ? newW / aspectRatio : Math.max(40, h - dy);
        x = x + (w - newW);
        y = y + (h - newH);
        w = newW;
        h = newH;
      } else if (dragging === "n") {
        const newH = Math.max(40, h - dy);
        y = y + (h - newH);
        h = newH;
        if (aspectRatio) w = h * aspectRatio;
      } else if (dragging === "s") {
        h = Math.max(40, Math.min(rect.height - y, h + dy));
        if (aspectRatio) w = h * aspectRatio;
      } else if (dragging === "e") {
        w = Math.max(40, Math.min(rect.width - x, w + dx));
        if (aspectRatio) h = w / aspectRatio;
      } else if (dragging === "w") {
        const newW = Math.max(40, w - dx);
        x = x + (w - newW);
        w = newW;
        if (aspectRatio) h = w / aspectRatio;
      }

      setCropBox({ x, y, w, h });
    };

    const handleUp = () => {
      setDragging(null);
      pushHistory();
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, dragStart, cropStart, aspectRatio]);

  const tabs: { id: EditorTab; icon: typeof Crop; label: string }[] = [
    { id: "crop", icon: Crop, label: "Crop" },
    { id: "adjust", icon: Sliders, label: "Adjust" },
    { id: "filters", icon: Sparkles, label: "Filters" },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col bg-[hsl(var(--navy))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
        <motion.button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.9 }}
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-colors"
            whileTap={{ scale: 0.9 }}
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-colors"
            whileTap={{ scale: 0.9 }}
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </motion.button>
          <div className="flex gap-1 mx-2">
            {history.slice(0, 8).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === historyIndex ? "bg-[hsl(var(--primary))]" : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          className="h-9 px-5 rounded-full bg-[hsl(var(--primary))] flex items-center gap-2 text-sm font-medium text-white"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
        >
          <Check className="w-4 h-4" />
          Save
        </motion.button>
      </div>

      {/* Image preview area */}
      <div
        ref={imageContainerRef}
        className="relative flex-1 flex items-center justify-center p-8 overflow-hidden select-none"
      >
        <motion.img
          ref={imageRef}
          src={photo.preview}
          alt="Editing preview"
          className="max-w-full max-h-full rounded-lg object-contain"
          style={{ filter: filterString, transform: transformStyle }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          draggable={false}
        />

        {/* Crop overlay */}
        {tab === "crop" && cropBox && imageContainerRef.current && (
          <>
            {/* Dark overlay around crop area */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top */}
              <div className="absolute bg-black/50" style={{ top: 0, left: 0, right: 0, height: cropBox.y }} />
              {/* Bottom */}
              <div className="absolute bg-black/50" style={{ top: cropBox.y + cropBox.h, left: 0, right: 0, bottom: 0 }} />
              {/* Left */}
              <div className="absolute bg-black/50" style={{ top: cropBox.y, left: 0, width: cropBox.x, height: cropBox.h }} />
              {/* Right */}
              <div className="absolute bg-black/50" style={{ top: cropBox.y, left: cropBox.x + cropBox.w, right: 0, height: cropBox.h }} />
            </div>

            {/* Crop frame */}
            <div
              className="absolute border-2 border-white cursor-move"
              style={{ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h }}
              onMouseDown={(e) => handleCropMouseDown(e, "move")}
            >
              {/* Rule of thirds grid */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
              </div>

              {/* Dimension badge */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                {Math.round(cropBox.w)} × {Math.round(cropBox.h)}
              </div>

              {/* Corner handles */}
              {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                <div
                  key={corner}
                  className="absolute w-5 h-5 cursor-nwse-resize z-10"
                  style={{
                    ...(corner.includes("n") ? { top: -3 } : { bottom: -3 }),
                    ...(corner.includes("w") ? { left: -3 } : { right: -3 }),
                    cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                  }}
                  onMouseDown={(e) => handleCropMouseDown(e, corner)}
                >
                  <div
                    className="absolute bg-white rounded-sm"
                    style={{
                      width: 16, height: 3,
                      ...(corner.includes("n") ? { top: 0 } : { bottom: 0 }),
                      ...(corner.includes("w") ? { left: 0 } : { right: 0 }),
                    }}
                  />
                  <div
                    className="absolute bg-white rounded-sm"
                    style={{
                      width: 3, height: 16,
                      ...(corner.includes("n") ? { top: 0 } : { bottom: 0 }),
                      ...(corner.includes("w") ? { left: 0 } : { right: 0 }),
                    }}
                  />
                </div>
              ))}

              {/* Edge handles */}
              {(["n", "s", "e", "w"] as const).map((edge) => (
                <div
                  key={edge}
                  className="absolute z-10"
                  style={{
                    ...(edge === "n" ? { top: -2, left: "33%", width: "34%", height: 6, cursor: "ns-resize" } : {}),
                    ...(edge === "s" ? { bottom: -2, left: "33%", width: "34%", height: 6, cursor: "ns-resize" } : {}),
                    ...(edge === "e" ? { right: -2, top: "33%", height: "34%", width: 6, cursor: "ew-resize" } : {}),
                    ...(edge === "w" ? { left: -2, top: "33%", height: "34%", width: 6, cursor: "ew-resize" } : {}),
                  }}
                  onMouseDown={(e) => handleCropMouseDown(e, edge)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom panel */}
      <div className="shrink-0 border-t border-white/10 bg-[hsl(var(--navy))]/95 backdrop-blur-sm">
        {/* Tab bar */}
        <div className="flex justify-center gap-2 px-4 py-3">
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-[hsl(var(--primary))] text-white shadow-lg shadow-[hsl(var(--primary))]/25"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 pb-6 pt-1 max-h-[35vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* CROP TAB */}
            {tab === "crop" && (
              <motion.div
                key="crop"
                className="space-y-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Aspect ratio pills */}
                <div className="flex justify-center gap-2">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.label}
                      onClick={() => {
                        setAspectRatio(ar.ratio);
                        if (ar.ratio && cropBox) {
                          setCropBox({ ...cropBox, h: cropBox.w / ar.ratio });
                        }
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        aspectRatio === ar.ratio
                          ? "bg-[hsl(var(--primary))] text-white"
                          : "bg-white/8 text-white/50 hover:text-white/80 hover:bg-white/12"
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>

                {/* Rotation + Flip */}
                <div className="flex justify-center gap-3">
                  {[
                    { icon: RotateCcw, label: "Rotate left", action: () => { setRotation((r) => (r - 90) % 360); pushHistory(); } },
                    { icon: RotateCw, label: "Rotate right", action: () => { setRotation((r) => (r + 90) % 360); pushHistory(); } },
                    { icon: FlipHorizontal, label: "Flip H", action: () => { setFlipH((f) => !f); pushHistory(); }, active: flipH },
                    { icon: FlipVertical, label: "Flip V", action: () => { setFlipV((f) => !f); pushHistory(); }, active: flipV },
                  ].map((btn, i) => (
                    <motion.button
                      key={i}
                      onClick={btn.action}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                        btn.active
                          ? "bg-[hsl(var(--primary))] text-white"
                          : "bg-white/8 text-white/50 hover:text-white hover:bg-white/12"
                      }`}
                      whileTap={{ scale: 0.9 }}
                      aria-label={btn.label}
                    >
                      <btn.icon className="w-4 h-4" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ADJUST TAB */}
            {tab === "adjust" && (
              <motion.div
                key="adjust"
                className="space-y-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-end">
                  <button
                    onClick={() => { resetAll(); pushHistory(); }}
                    className="text-xs text-[hsl(var(--primary))] hover:underline font-medium"
                  >
                    Reset All
                  </button>
                </div>

                <div className="grid gap-4">
                  {SLIDER_CONFIG.map((s) => {
                    const pct = ((adjustments[s.key] - s.min) / (s.max - s.min)) * 100;
                    const displayVal = getPercent(s.key);
                    const isDefault = adjustments[s.key] === s.defaultVal;

                    return (
                      <div key={s.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white/70">{s.label}</span>
                          <button
                            onClick={() => resetSlider(s.key)}
                            className={`text-xs font-mono tabular-nums min-w-[32px] text-right transition-colors ${
                              isDefault ? "text-white/30" : "text-[hsl(var(--primary))] hover:text-white cursor-pointer"
                            }`}
                          >
                            {displayVal}
                          </button>
                        </div>

                        <div className="relative h-6 flex items-center group">
                          {/* Track background */}
                          <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10" />
                          {/* Track fill */}
                          <div
                            className="absolute h-1.5 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                          {/* Input */}
                          <input
                            type="range"
                            min={s.min}
                            max={s.max}
                            step={s.step}
                            value={adjustments[s.key]}
                            onChange={(e) => updateSlider(s.key, parseFloat(e.target.value))}
                            onMouseUp={pushHistory}
                            onTouchEnd={pushHistory}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                          />
                          {/* Thumb visual */}
                          <div
                            className="absolute w-4 h-4 rounded-full bg-white border-2 border-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary))]/30 pointer-events-none transition-all group-hover:scale-110"
                            style={{ left: `calc(${pct}% - 8px)` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* FILTERS TAB */}
            {tab === "filters" && (
              <motion.div
                key="filters"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
                  {FILTER_PRESETS.map((preset, idx) => {
                    const isActive = selectedFilter === preset.filter;
                    return (
                      <motion.button
                        key={preset.name}
                        onClick={() => { setSelectedFilter(preset.filter); pushHistory(); }}
                        className="flex-shrink-0 flex flex-col items-center gap-2"
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <div
                          className={`relative w-20 h-20 rounded-2xl overflow-hidden ring-2 transition-all ${
                            isActive
                              ? "ring-[hsl(var(--primary))] scale-105 shadow-lg shadow-[hsl(var(--primary))]/20"
                              : "ring-transparent hover:ring-white/20"
                          }`}
                        >
                          <img
                            src={photo.preview}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                            style={{ filter: preset.filter || "none" }}
                            draggable={false}
                          />
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center bg-black/20"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </div>
                        <span className={`text-[11px] font-medium transition-colors ${
                          isActive ? "text-[hsl(var(--primary))]" : "text-white/50"
                        }`}>
                          {preset.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
