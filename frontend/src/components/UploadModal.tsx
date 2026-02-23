import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload, X, Camera, Image, Link2, Check, AlertCircle, Plus,
} from "lucide-react";
import { usePhotoStore, MAX_PHOTOS, ACCEPTED_TYPES, MAX_FILE_SIZE } from "@/stores/photoStore";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
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

const sourceButtons = [
  { icon: Camera, label: "Camera", desc: "Take a photo" },
  { icon: Link2, label: "URL", desc: "Paste image link" },
];

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return `File too large (max 20MB)`;
  const ext = file.name.toLowerCase().split(".").pop();
  const validExts = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
  if (!validExts.includes(ext || "")) return `Invalid format (.${ext})`;
  return null;
}

export const UploadModal = ({ open, onClose }: UploadModalProps) => {
  const { photos, addPhotos } = usePhotoStore();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const remaining = MAX_PHOTOS - photos.length;

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
    return () => {
      stopCamera();
    };
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
    } catch (err) {
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
          newUploading.push({
            id, name: file.name, size: formatFileSize(file.size),
            progress: 0, status: "error", errorMsg: error,
          });
        } else {
          let processedFile = file;

          // Convert HEIC to JPG
          if (file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif")) {
            try {
              const heic2any = (await import("heic2any")).default;
              const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 }) as Blob;
              processedFile = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
            } catch {
              newUploading.push({
                id, name: file.name, size: formatFileSize(file.size),
                progress: 0, status: "error", errorMsg: "Failed to convert HEIC",
              });
              continue;
            }
          }

          validFiles.push(processedFile);
          newUploading.push({
            id, name: processedFile.name, size: formatFileSize(processedFile.size),
            progress: 0, status: "uploading",
            preview: URL.createObjectURL(processedFile),
          });
        }
      }

      setUploadingFiles((prev) => [...prev, ...newUploading]);

      // Simulate upload progress then add to store
      const uploading = newUploading.filter((f) => f.status === "uploading");
      for (const uf of uploading) {
        let progress = 0;
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            progress += Math.random() * 30 + 15;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              setUploadingFiles((prev) =>
                prev.map((f) => (f.id === uf.id ? { ...f, progress: 100, status: "done" as const } : f))
              );
              resolve();
            } else {
              setUploadingFiles((prev) =>
                prev.map((f) => (f.id === uf.id ? { ...f, progress } : f))
              );
            }
          }, 200);
        });
      }

      // Add to global store
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
      // Show error in uploading files
      setUploadingFiles((prev) => [
        ...prev,
        { id: Date.now().toString(), name: "URL Import", size: "0", progress: 0, status: "error", errorMsg: "Failed to fetch URL" },
      ]);
    }
  };

  const clearUploads = () => setUploadingFiles([]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(12px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg max-h-[85vh] bg-card rounded-3xl shadow-elevated border border-border overflow-y-auto"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-3 bg-card/95 backdrop-blur-sm">
              <div>
                <h3 className="font-display text-h3 text-foreground">Upload Photos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{photos.length}/{MAX_PHOTOS} photos added</p>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {remaining > 0 ? (
                <>
                  {/* Drop zone */}
                  <div
                    {...getRootProps()}
                    className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${isDragActive
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border hover:border-primary/40"
                      }`}
                  >
                    <input {...getInputProps()} />
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    </motion.div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {isDragActive ? "Drop to upload" : "Drop photos here or click to browse"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WEBP, HEIC • Max 20MB • {remaining} slot{remaining !== 1 ? "s" : ""} remaining
                    </p>
                  </div>

                  {/* Source buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {sourceButtons.map((src, i) => (
                      <motion.button
                        key={src.label}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (src.label === "URL") {
                            setShowUrlInput(true);
                          } else if (src.label === "Camera") {
                            startCamera();
                          } else {
                            // Social sources placeholder - user click triggers file selector for now
                            const el = document.querySelector("[data-dropzone-input]") as HTMLInputElement;
                            el?.click();
                          }
                        }}
                      >
                        <src.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{src.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* URL import */}
                  <AnimatePresence>
                    {showUrlInput && (
                      <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <input
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="Paste image URL..."
                          className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm"
                          onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
                          autoFocus
                        />
                        <motion.button
                          onClick={handleUrlImport}
                          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                          whileTap={{ scale: 0.95 }}
                        >
                          Import
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">All {MAX_PHOTOS} slots filled!</p>
                  <p className="text-xs text-muted-foreground mt-1">Remove a photo to add a different one</p>
                </div>
              )}

              {/* Uploading file list */}
              <AnimatePresence>
                {uploadingFiles.length > 0 && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Recent uploads</span>
                      <button onClick={clearUploads} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                    </div>
                    {uploadingFiles.slice(-5).map((file) => (
                      <motion.div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        layout
                      >
                        {file.preview && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <img src={file.preview} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.errorMsg || file.size}
                          </p>
                          {file.status === "uploading" && (
                            <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-pink rounded-full"
                                animate={{ width: `${file.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}
                        </div>
                        {file.status === "done" && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}>
                            <Check className="w-5 h-5 text-primary" />
                          </motion.div>
                        )}
                        {file.status === "error" && (
                          <motion.div animate={{ x: [0, -4, 4, -4, 0] }} transition={{ duration: 0.4 }}>
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Added photos thumbnail strip */}
              {photos.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Added photos</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {photos.map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border relative group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                    {remaining > 0 && (
                      <div
                        {...getRootProps()}
                        className="w-14 h-14 rounded-xl border-2 border-dashed border-border flex items-center justify-center flex-shrink-0 hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {photos.length > 0 && (
                <motion.button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue with {photos.length} photo{photos.length !== 1 ? "s" : ""}
                </motion.button>
              )}
            </div>

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
                      <div className="w-12 h-12 bg-white rounded-full"></div>
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
