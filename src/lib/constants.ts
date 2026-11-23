export const ROUTES = {
  HOME: "/",
  WORK: "/work",
  SERVICES: "/#section-services",
  LAB: "/#section-lab",
  JOBS: "/#section-jobs",
  BRIEF: "/#section-services",
} as const;

export const NAV_ITEMS = {
  HOME: { label: "Home", href: "/#section-hero" },
  WORK: { label: "Work", href: "/#section-work" },
  SERVICES: { label: "Services", href: "/#section-services" },
  LAB: { label: "Lab", href: "/#section-lab" },
  JOBS: { label: "Jobs", href: "/#section-jobs" },
} as const;

export const DURATION = {
  FAST: 0.4,
  NORMAL: 0.8,
  SLOW: 1.2,
  VERY_SLOW: 1.6,
} as const;

export const RESIZE_DEBOUNCE = 200;
export const ASSETS_TIMEOUT = 4000;

export const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1200,
} as const;

export const BRAND_COLORS = {
  YELLOW: "#f2efe9",
  DARK_BLUE: "#08090c",
  BLUE: "#0d6e5e",
  ACCENT: "#d4572a",
  JOBS_BG: "#101615",
} as const;
