import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload, X, Camera, Link2, Check, AlertCircle, Plus, ShoppingCart, Copy, ZoomIn, ArrowLeft,
} from "lucide-react";
import { usePhotoStore, MAX_PHOTOS, ACCEPTED_TYPES, MAX_FILE_SIZE } from "@/stores/photoStore";
import { Switch } from "@/components/ui/switch";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  requiredCount?: number;
  onAddToCart?: (socialMediaConsent: boolean) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "done" | "error";
  errorMsg?: string;
  preview?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return `File too large (max 20MB)`;
  const ext = file.name.toLowerCase().split(".").pop();
  const validExts = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
  if (!validExts.includes(ext || "")) return `Invalid format (.${ext})`;
  return null;
}

export const UploadModal = ({ open, onClose, requiredCount, onAddToCart }: UploadModalProps) => {
  const { photos, addPhotos } = usePhotoStore();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [socialMediaConsent, setSocialMediaConsent] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const remaining = requiredCount != null
    ? Math.max(0, requiredCount - photos.length)
    : MAX_PHOTOS - photos.length;
  const canAddToCart = requiredCount != null && onAddToCart != null && photos.length >= requiredCount;

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      alert("Camera access denied or unavailable.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
          processFiles([file]);
          stopCamera();
        }
      }, "image/jpeg", 0.9);
    }
  };

  const processFiles = useCallback(
    async (accepted: File[]) => {
      if (remaining <= 0) return;
      const toProcess = accepted.slice(0, remaining);
      const newUploading: UploadingFile[] = [];
      const validFiles: File[] = [];

      for (const file of toProcess) {
        const error = validateFile(file);
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        if (error) {
          newUploading.push({ id, name: file.name, size: formatFileSize(file.size), progress: 0, status: "error", errorMsg: error });
        } else {
          let processedFile = file;
          if (file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif")) {
            try {
              const heic2any = (await import("heic2any")).default;
              const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 }) as Blob;
              processedFile = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
            } catch {
              newUploading.push({ id, name: file.name, size: formatFileSize(file.size), progress: 0, status: "error", errorMsg: "Failed to convert HEIC" });
              continue;
            }
          }
          validFiles.push(processedFile);
          newUploading.push({ id, name: processedFile.name, size: formatFileSize(processedFile.size), progress: 0, status: "uploading", preview: URL.createObjectURL(processedFile) });
        }
      }

      setUploadingFiles((prev) => [...prev, ...newUploading]);
      const uploading = newUploading.filter((f) => f.status === "uploading");
      for (const uf of uploading) {
        let progress = 0;
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            progress += Math.random() * 30 + 15;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              setUploadingFiles((prev) => prev.map((f) => (f.id === uf.id ? { ...f, progress: 100, status: "done" as const } : f)));
              resolve();
            } else {
              setUploadingFiles((prev) => prev.map((f) => (f.id === uf.id ? { ...f, progress } : f)));
            }
          }, 200);
        });
      }
      addPhotos(validFiles);
    },
    [remaining, addPhotos]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"] },
    maxSize: MAX_FILE_SIZE,
    maxFiles: remaining,
    disabled: remaining <= 0,
    noClick: false,
  });

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;
    try {
      const res = await fetch(urlInput.trim());
      const blob = await res.blob();
      const name = urlInput.split("/").pop()?.split("?")[0] || "imported.jpg";
      const file = new File([blob], name, { type: blob.type });
      processFiles([file]);
      setUrlInput("");
      setShowUrlInput(false);
    } catch {
      setUploadingFiles((prev) => [
        ...prev,
        { id: Date.now().toString(), name: "URL Import", size: "0", progress: 0, status: "error", errorMsg: "Failed to fetch URL" },
      ]);
    }
  };

  const clearUploads = () => setUploadingFiles([]);

  const totalSlots = requiredCount ?? MAX_PHOTOS;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal container */}
          <motion.div
            className="relative z-10 w-full max-w-5xl bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
            style={{ maxHeight: "90vh" }}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Upload Images</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {photos.length}/{totalSlots} photos added
                  {remaining > 0 && photos.length > 0 && (
                    <span className="text-primary ml-2 font-medium">• {remaining} more needed</span>
                  )}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Content — scrollable */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 70px)" }}>
              {/* Upload area */}
              <div className="px-6 pt-5 pb-4">
                {remaining > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Drop zone */}
                    <div
                      {...getRootProps()}
                      className={`flex-1 rounded-xl border-2 border-dashed px-6 py-5 text-center transition-all cursor-pointer ${
                        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/20"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        {isDragActive ? "Drop to upload" : "Drop photos or click to browse"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">JPG, PNG, WEBP, HEIC • Max 20MB</p>
                    </div>

                    {/* Quick actions */}
                    <div className="flex sm:flex-col gap-2 sm:w-28">
                      <button
                        onClick={startCamera}
                        className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Camera</span>
                      </button>
                      <button
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Link2 className="w-5 h-5" />
                        <span className="text-[10px] font-medium">URL</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">All {totalSlots} slots filled!</p>
                      <p className="text-xs text-muted-foreground">Remove a photo to replace it with a different one</p>
                    </div>
                  </div>
                )}

                {/* URL import input */}
                <AnimatePresence>
                  {showUrlInput && (
                    <motion.div className="flex gap-2 mt-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
                        autoFocus
                      />
                      <motion.button onClick={handleUrlImport} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium" whileTap={{ scale: 0.95 }}>
                        Import
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload progress */}
                <AnimatePresence>
                  {uploadingFiles.length > 0 && (
                    <motion.div className="mt-3 space-y-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground font-medium">Recent uploads</span>
                        <button onClick={clearUploads} className="text-[11px] text-muted-foreground hover:text-foreground">Clear</button>
                      </div>
                      {uploadingFiles.slice(-3).map((file) => (
                        <div key={file.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                          {file.preview && <img src={file.preview} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate">{file.name}</p>
                            {file.status === "uploading" && (
                              <div className="mt-0.5 h-1 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-gradient-pink rounded-full transition-all" style={{ width: `${file.progress}%` }} />
                              </div>
                            )}
                          </div>
                          {file.status === "done" && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                          {file.status === "error" && <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider with label */}
              <div className="px-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Preview Grid</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </div>

              {/* Preview grid */}
              <div className="p-6">
                {requiredCount != null && requiredCount > 0 ? (
                  <div className={`grid gap-4 ${requiredCount <= 2 ? "grid-cols-2" : requiredCount <= 4 ? "grid-cols-2 sm:grid-cols-4" : requiredCount <= 6 ? "grid-cols-3 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4"}`}>
                    {Array.from({ length: requiredCount }).map((_, idx) => {
                      const photo = photos[idx];
                      return (
                        <motion.div
                          key={idx}
                          className={`relative aspect-square rounded-2xl overflow-hidden ${
                            photo
                              ? "ring-2 ring-primary/30 shadow-md"
                              : "border-2 border-dashed border-border hover:border-primary/30 bg-muted/10 hover:bg-muted/20"
                          } transition-all`}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          {photo ? (
                            <>
                              <img src={photo.preview} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                              {/* Slot number */}
                              <span className="absolute top-2.5 left-2.5 min-w-[26px] h-[26px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md px-1">
                                {idx + 1}
                              </span>

                              {/* Top-right actions */}
                              <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                                <button
                                  onClick={() => setPreviewImage(photo.preview)}
                                  className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                                  title="Zoom"
                                >
                                  <ZoomIn className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => { usePhotoStore.getState().removePhoto(photo.id); }}
                                  className="w-7 h-7 rounded-full bg-black/50 hover:bg-destructive text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                                  title="Remove"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Copy button */}
                              {photos.length < requiredCount && (
                                <button
                                  onClick={() => { usePhotoStore.getState().addPhotos([photo.file]); }}
                                  className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/50 hover:bg-primary text-white text-[11px] font-medium backdrop-blur-sm transition-colors"
                                  title="Copy to next empty slot"
                                >
                                  <Copy className="w-3 h-3" />
                                  Fill next
                                </button>
                              )}
                            </>
                          ) : (
                            <div
                              {...getRootProps()}
                              className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-2 transition-colors"
                            >
                              <div className="w-12 h-12 rounded-full bg-border/30 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-muted-foreground/50" />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground/60">Slot {idx + 1}</span>
                              <span className="text-[10px] text-muted-foreground/40">Click or drop image</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {photos.map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        className="relative aspect-square rounded-2xl overflow-hidden ring-2 ring-primary/30 shadow-md"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute top-2.5 left-2.5 min-w-[26px] h-[26px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md px-1">
                          {i + 1}
                        </span>
                        <button
                          onClick={() => setPreviewImage(photo.preview)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                    {remaining > 0 && (
                      <div
                        {...getRootProps()}
                        className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/30 flex flex-col items-center justify-center cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors gap-2"
                      >
                        <Plus className="w-7 h-7 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground">Add more</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-muted-foreground/30" />
                    </div>
                    <p className="text-base font-medium text-muted-foreground/50">No images yet</p>
                    <p className="text-sm text-muted-foreground/30 mt-1">Upload photos using the area above</p>
                  </div>
                )}
              </div>

              {/* Bottom action bar */}
              {(canAddToCart || (photos.length > 0 && !requiredCount)) && (
                <div className="sticky bottom-0 px-6 py-4 bg-card/95 backdrop-blur-sm border-t border-border">
                  {canAddToCart && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                        <Switch checked={socialMediaConsent} onCheckedChange={setSocialMediaConsent} />
                        <span className="text-xs text-foreground">I agree to have my order featured in your social media content.</span>
                      </label>
                      <motion.button
                        onClick={() => { onAddToCart?.(socialMediaConsent); onClose(); }}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </motion.button>
                    </div>
                  )}
                  {!canAddToCart && photos.length > 0 && !requiredCount && (
                    <motion.button
                      onClick={onClose}
                      className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue with {photos.length} photo{photos.length !== 1 ? "s" : ""}
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Full-screen zoom overlay */}
            <AnimatePresence>
              {previewImage && (
                <motion.div
                  className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setPreviewImage(null)}
                >
                  <motion.button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-sm transition-colors z-10"
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.img
                    src={previewImage}
                    alt="Full preview"
                    className="max-w-[85%] max-h-[85%] object-contain rounded-2xl shadow-2xl"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Camera Overlay */}
            <AnimatePresence>
              {showCamera && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute inset-0 z-50 bg-black flex flex-col"
                >
                  <div className="p-4 flex justify-between items-center bg-black/50 absolute top-0 w-full z-10">
                    <span className="text-white font-medium text-sm">Camera Capture</span>
                    <button onClick={stopCamera} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  </div>
                  <div className="p-6 pb-8 bg-black flex justify-center w-full">
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <div className="w-12 h-12 bg-white rounded-full" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
