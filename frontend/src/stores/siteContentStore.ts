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
  book1to1Description: string;
  book1to1Url: string;
  book1to1Points: string[];
  bookGroupLabel: string;
  bookGroupDescription: string;
  bookGroupUrl: string;
  bookGroupPoints: string[];
}

export interface OrderQuantityConfig {
  min: number;
  max: number;
}

export interface HeroStatsConfig {
  happyCustomers: number;
  magnetsPrinted: number;
  avgRating: number;
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
  book1to1Description: "One-on-one with our expert",
  book1to1Url: "https://calendly.com",
  book1to1Points: ["Personalized guidance", "Business setup help", "Live Q&A"],
  bookGroupLabel: "Book Group Session",
  bookGroupDescription: "Join a group workshop",
  bookGroupUrl: "https://calendly.com",
  bookGroupPoints: ["Meet other makers", "Group discounts", "Hands-on practice"],
};

const defaultOrderQuantity: OrderQuantityConfig = {
  min: 4,
  max: 15,
};

const defaultHeroStats: HeroStatsConfig = {
  happyCustomers: 70000,
  magnetsPrinted: 800000,
  avgRating: 4.9,
};

interface SiteContentState {
  bulkOrder: BulkOrderConfig;
  courses: CoursesConfig;
  orderQuantity: OrderQuantityConfig;
  heroStats: HeroStatsConfig;
  setBulkOrder: (config: Partial<BulkOrderConfig>) => void;
  setCourses: (config: Partial<CoursesConfig>) => void;
  setOrderQuantity: (config: Partial<OrderQuantityConfig>) => void;
  setHeroStats: (config: Partial<HeroStatsConfig>) => void;
}

export const useSiteContentStore = create<SiteContentState>()(
  persist(
    (set) => ({
      bulkOrder: defaultBulk,
      courses: defaultCourses,
      orderQuantity: defaultOrderQuantity,
      heroStats: defaultHeroStats,
      setBulkOrder: (config) =>
        set((s) => ({ bulkOrder: { ...s.bulkOrder, ...config } })),
      setCourses: (config) =>
        set((s) => ({ courses: { ...s.courses, ...config } })),
      setOrderQuantity: (config) =>
        set((s) => ({ orderQuantity: { ...s.orderQuantity, ...config } })),
      setHeroStats: (config) =>
        set((s) => ({ heroStats: { ...s.heroStats, ...config } })),
    }),
    { name: "magnetic-bliss-site-content" }
  )
);
