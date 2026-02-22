import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Camera, Image, Link, Check, AlertCircle, Plus } from "lucide-react";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

interface UploadFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "done" | "error";
  preview?: string;
}

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

const sourceButtons = [
  { icon: Camera, label: "Camera", desc: "Take a photo" },
  { icon: Image, label: "Gallery", desc: "Choose from gallery" },
  { icon: Link, label: "URL", desc: "Paste image link" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export const UploadModal = ({ open, onClose }: UploadModalProps) => {
  const [state, setState] = useState<UploadState>("idle");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      size: formatFileSize(f.size),
      progress: 0,
      status: "uploading" as const,
      preview: URL.createObjectURL(f),
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);
    setState("uploading");

    // Simulate progress for each file
    uploadFiles.forEach((uf) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) => (f.id === uf.id ? { ...f, progress: 100, status: "done" } : f))
          );
          // Check if all done
          setTimeout(() => {
            setFiles((prev) => {
              const allDone = prev.every((f) => f.status === "done");
              if (allDone && prev.length > 0) setState("success");
              return prev;
            });
          }, 200);
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === uf.id ? { ...f, progress } : f))
          );
        }
      }, 300 + Math.random() * 400);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (droppedFiles.length) simulateUpload(droppedFiles);
    },
    [simulateUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length) simulateUpload(selected);
    },
    [simulateUpload]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const resetModal = () => {
    setState("idle");
    setFiles([]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/40"
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(12px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-card rounded-3xl shadow-elevated border border-border overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h3 className="font-display text-h3 text-foreground">Upload Photos</h3>
              <motion.button
                onClick={() => { onClose(); resetModal(); }}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {/* Drop zone */}
              <motion.div
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                  state === "dragging"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
                onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
                onDragLeave={() => setState("idle")}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                animate={state === "dragging" ? { scale: 1.02 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                </motion.div>

                <p className="text-sm font-medium text-foreground mb-1">
                  {state === "dragging" ? "Drop to upload" : "Drop photos here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
              </motion.div>

              {/* Source buttons */}
              <div className="grid grid-cols-3 gap-2">
                {sourceButtons.map((src, i) => (
                  <motion.button
                    key={src.label}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => inputRef.current?.click()}
                  >
                    <src.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{src.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* File list */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {files.map((file) => (
                      <motion.div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                      >
                        {/* Thumbnail */}
                        {file.preview && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <img src={file.preview} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                          {/* Progress bar */}
                          {file.status === "uploading" && (
                            <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-pink rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${file.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Status icon */}
                        {file.status === "done" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Check className="w-5 h-5 text-green-500" />
                          </motion.div>
                        )}
                        {file.status === "error" && (
                          <motion.div
                            animate={{ x: [0, -4, 4, -4, 0] }}
                            transition={{ duration: 0.4 }}
                          >
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          </motion.div>
                        )}

                        <motion.button
                          onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                          className="text-muted-foreground hover:text-foreground"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success state */}
              <AnimatePresence>
                {state === "success" && (
                  <motion.div
                    className="text-center py-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <Check className="w-6 h-6 text-green-500" />
                    </motion.div>
                    <p className="text-sm font-medium text-foreground">
                      {files.length} photo{files.length !== 1 ? "s" : ""} uploaded!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Thumbnail strip */}
              {files.filter((f) => f.status === "done").length > 0 && state === "success" && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {files
                    .filter((f) => f.status === "done" && f.preview)
                    .map((file, i) => (
                      <motion.div
                        key={file.id}
                        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <img src={file.preview} alt="" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  <motion.button
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-border flex items-center justify-center flex-shrink-0 hover:border-primary/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { resetModal(); }}
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
