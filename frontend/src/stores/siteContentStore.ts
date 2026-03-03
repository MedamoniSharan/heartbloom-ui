import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BulkOrderConfig {
  title: string;
  subtitle: string;
  formIntro: string;
  price50: number;
  price100: number;
}

export interface CoursesConfig {
  title: string;
  description: string;
  youtubeUrl: string;
  book1to1Label: string;
  book1to1Url: string;
  bookGroupLabel: string;
  bookGroupUrl: string;
}

export interface OrderQuantityConfig {
  min: number;
  max: number;
}

const defaultBulk: BulkOrderConfig = {
  title: "Wholesale Orders",
  subtitle: "Interested in bulk orders?",
  formIntro: "Please fill out the form below and we will be in touch with you!",
  price50: 2499,
  price100: 4499,
};

const defaultCourses: CoursesConfig = {
  title: "Courses",
  description: "Learn to create beautiful photo magnets. Watch our intro video and book a 1:1 or group session with our team.",
  youtubeUrl: "",
  book1to1Label: "Book 1:1 Session",
  book1to1Url: "https://calendly.com",
  bookGroupLabel: "Book Group Session",
  bookGroupUrl: "https://calendly.com",
};

const defaultOrderQuantity: OrderQuantityConfig = {
  min: 4,
  max: 12,
};

interface SiteContentState {
  bulkOrder: BulkOrderConfig;
  courses: CoursesConfig;
  orderQuantity: OrderQuantityConfig;
  setBulkOrder: (config: Partial<BulkOrderConfig>) => void;
  setCourses: (config: Partial<CoursesConfig>) => void;
  setOrderQuantity: (config: Partial<OrderQuantityConfig>) => void;
}

export const useSiteContentStore = create<SiteContentState>()(
  persist(
    (set) => ({
      bulkOrder: defaultBulk,
      courses: defaultCourses,
      orderQuantity: defaultOrderQuantity,
      setBulkOrder: (config) =>
        set((s) => ({ bulkOrder: { ...s.bulkOrder, ...config } })),
      setCourses: (config) =>
        set((s) => ({ courses: { ...s.courses, ...config } })),
      setOrderQuantity: (config) =>
        set((s) => ({ orderQuantity: { ...s.orderQuantity, ...config } })),
    }),
    { name: "magnetic-bliss-site-content" }
  )
);
