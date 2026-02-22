import { useState, useCallback, useMemo, useEffect } from "react";
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
}

const CROP_MODES = ["Free", "Fit", "Fill"] as const;

const SLIDER_CONFIG: { key: keyof Adjustments; label: string; min: number; max: number; step: number }[] = [
  { key: "brightness", label: "Brightness", min: 0.5, max: 1.5, step: 0.01 },
  { key: "exposure", label: "Exposure", min: 0.5, max: 1.5, step: 0.01 },
  { key: "gamma", label: "Gamma", min: 0.5, max: 2.0, step: 0.01 },
  { key: "contrast", label: "Contrast", min: 0.5, max: 1.5, step: 0.01 },
  { key: "saturation", label: "Saturation", min: 0, max: 2, step: 0.01 },
  { key: "vibrance", label: "Vibrance", min: 0, max: 2, step: 0.01 },
  { key: "warmth", label: "Warmth", min: 0.5, max: 1.5, step: 0.01 },
  { key: "enhance", label: "Enhance", min: 0, max: 1, step: 0.01 },
];

export const ImageEditor = ({ photo, onSave, onClose }: ImageEditorProps) => {
  const [tab, setTab] = useState<EditorTab>("crop");
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...photo.adjustments });
  const [selectedFilter, setSelectedFilter] = useState(photo.filter);
  const [rotation, setRotation] = useState(photo.rotation);
  const [flipH, setFlipH] = useState(photo.flipH);
  const [flipV, setFlipV] = useState(photo.flipV);
  const [cropMode, setCropMode] = useState<typeof CROP_MODES[number]>("Free");

  // Undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([
    { adjustments: { ...photo.adjustments }, filter: photo.filter, rotation: photo.rotation, flipH: photo.flipH, flipV: photo.flipV },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback(() => {
    const entry: HistoryEntry = { adjustments: { ...adjustments }, filter: selectedFilter, rotation, flipH, flipV };
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, entry].slice(-20);
      return updated;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  }, [adjustments, selectedFilter, rotation, flipH, flipV, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setAdjustments({ ...prev.adjustments });
    setSelectedFilter(prev.filter);
    setRotation(prev.rotation);
    setFlipH(prev.flipH);
    setFlipV(prev.flipV);
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
    setHistoryIndex((i) => i + 1);
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") handleSave();
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
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
  };

  const tabs: { id: EditorTab; icon: typeof Crop; label: string }[] = [
    { id: "crop", icon: Crop, label: "Crop" },
    { id: "adjust", icon: Sliders, label: "Adjust" },
    { id: "filters", icon: Sparkles, label: "Filters" },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-navy" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/20">
        <motion.button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
          whileTap={{ scale: 0.9 }}
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
            whileTap={{ scale: 0.9 }}
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
            whileTap={{ scale: 0.9 }}
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </motion.button>

          {/* History dots */}
          <div className="flex gap-1 mx-2">
            {history.slice(0, 10).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === historyIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
          whileTap={{ scale: 0.9 }}
          aria-label="Confirm"
        >
          <Check className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Image preview */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 overflow-hidden">
        <motion.img
          src={photo.preview}
          alt="Editing preview"
          className="max-w-full max-h-full rounded-lg object-contain"
          style={{ filter: filterString, transform: transformStyle }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        />

        {/* Crop overlay grid (shown in crop tab) */}
        {tab === "crop" && (
          <div className="absolute inset-6 pointer-events-none">
            {/* Rule of thirds grid */}
            <div className="w-full h-full relative">
              <div className="absolute top-1/3 left-0 right-0 h-px bg-primary-foreground/20" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-primary-foreground/20" />
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-primary-foreground/20" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-primary-foreground/20" />
            </div>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="relative z-10 border-t border-border/20">
        <div className="flex justify-center gap-1 px-4 py-2">
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-4 pb-6 pt-2 max-h-[40vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* CROP TAB */}
            {tab === "crop" && (
              <motion.div
                key="crop"
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Crop mode pills */}
                <div className="flex justify-center gap-2">
                  {CROP_MODES.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCropMode(mode)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        cropMode === mode
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Rotation + Flip */}
                <div className="flex justify-center gap-3">
                  <motion.button
                    onClick={() => { setRotation((r) => (r - 90) % 360); pushHistory(); }}
                    className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Rotate left"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => { setRotation((r) => (r + 90) % 360); pushHistory(); }}
                    className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    whileTap={{ scale: 0.9 }}
                    aria-label="Rotate right"
                  >
                    <RotateCw className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => { setFlipH((f) => !f); pushHistory(); }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      flipH ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Flip horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => { setFlipV((f) => !f); pushHistory(); }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      flipV ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Flip vertical"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ADJUST TAB */}
            {tab === "adjust" && (
              <motion.div
                key="adjust"
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex justify-end">
                  <button
                    onClick={() => { resetAll(); pushHistory(); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Reset All
                  </button>
                </div>
                {SLIDER_CONFIG.map((s) => (
                  <div key={s.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <button
                        onClick={() => resetSlider(s.key)}
                        className="text-[10px] text-muted-foreground/60 hover:text-foreground"
                      >
                        {adjustments[s.key].toFixed(2)}
                      </button>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={adjustments[s.key]}
                      onChange={(e) => updateSlider(s.key, parseFloat(e.target.value))}
                      onMouseUp={pushHistory}
                      onTouchEnd={pushHistory}
                      className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-foreground
                        [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                          ((adjustments[s.key] - s.min) / (s.max - s.min)) * 100
                        }%, hsl(var(--muted)) ${
                          ((adjustments[s.key] - s.min) / (s.max - s.min)) * 100
                        }%, hsl(var(--muted)) 100%)`,
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {/* FILTERS TAB */}
            {tab === "filters" && (
              <motion.div
                key="filters"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {FILTER_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.name}
                      onClick={() => {
                        setSelectedFilter(preset.filter);
                        pushHistory();
                      }}
                      className="flex-shrink-0 space-y-1.5"
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-colors ${
                          selectedFilter === preset.filter
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={photo.preview}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          style={{ filter: preset.filter || "none" }}
                        />
                        {selectedFilter === preset.filter && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className={`text-[10px] text-center font-medium ${
                        selectedFilter === preset.filter ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {preset.name}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
