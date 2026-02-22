import { create } from "zustand";

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  /** CSS filter string applied by editor */
  filter: string;
  /** Adjustments values */
  adjustments: Adjustments;
  /** Crop data */
  crop: CropData | null;
  /** Rotation in degrees */
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export interface Adjustments {
  brightness: number;
  exposure: number;
  gamma: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  warmth: number;
  enhance: number;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 1,
  exposure: 1,
  gamma: 1,
  contrast: 1,
  saturation: 1,
  vibrance: 1,
  warmth: 1,
  enhance: 0,
};

export const MAX_PHOTOS = 9;

export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface PhotoStore {
  photos: PhotoItem[];
  addPhotos: (files: File[]) => void;
  removePhoto: (id: string) => void;
  updatePhoto: (id: string, updates: Partial<PhotoItem>) => void;
  reorderPhotos: (fromIndex: number, toIndex: number) => void;
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  photos: [],

  addPhotos: (files) =>
    set((state) => {
      const remaining = MAX_PHOTOS - state.photos.length;
      const toAdd = files.slice(0, remaining);
      const newPhotos: PhotoItem[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        filter: "",
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        crop: null,
        rotation: 0,
        flipH: false,
        flipV: false,
      }));
      return { photos: [...state.photos, ...newPhotos] };
    }),

  removePhoto: (id) =>
    set((state) => {
      const photo = state.photos.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return { photos: state.photos.filter((p) => p.id !== id) };
    }),

  updatePhoto: (id, updates) =>
    set((state) => ({
      photos: state.photos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  reorderPhotos: (fromIndex, toIndex) =>
    set((state) => {
      const arr = [...state.photos];
      const [item] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, item);
      return { photos: arr };
    }),

  clearPhotos: () =>
    set((state) => {
      state.photos.forEach((p) => URL.revokeObjectURL(p.preview));
      return { photos: [] };
    }),
}));

/** Build CSS filter string from adjustments */
export function buildFilterString(adj: Adjustments, filterPreset: string): string {
  const parts: string[] = [];
  if (adj.brightness !== 1) parts.push(`brightness(${adj.brightness})`);
  if (adj.contrast !== 1) parts.push(`contrast(${adj.contrast})`);
  if (adj.saturation !== 1) parts.push(`saturate(${adj.saturation})`);
  if (adj.warmth !== 1) {
    // Approximate warmth with sepia + hue-rotate
    const sepia = Math.max(0, (adj.warmth - 1) * 0.4);
    if (sepia > 0) parts.push(`sepia(${sepia})`);
  }
  if (adj.exposure !== 1) parts.push(`brightness(${adj.exposure})`);
  if (filterPreset) parts.push(filterPreset);
  return parts.join(" ") || "none";
}

/** Preset filter definitions */
export const FILTER_PRESETS = [
  { name: "Original", filter: "" },
  { name: "Vivid", filter: "saturate(1.4) contrast(1.1)" },
  { name: "Warm", filter: "sepia(0.2) saturate(1.2) brightness(1.05)" },
  { name: "Cool", filter: "saturate(0.9) hue-rotate(15deg) brightness(1.05)" },
  { name: "Fade", filter: "saturate(0.7) brightness(1.1) contrast(0.9)" },
  { name: "Noir", filter: "grayscale(1) contrast(1.2) brightness(0.95)" },
  { name: "Vintage", filter: "sepia(0.35) contrast(0.9) brightness(1.05) saturate(1.1)" },
  { name: "Chrome", filter: "contrast(1.3) saturate(1.1) brightness(1.05)" },
  { name: "Matte", filter: "contrast(0.85) saturate(0.9) brightness(1.1)" },
] as const;
