export const ROUTES = {
  HOME: "/",
  WORK: "/work",
  SERVICES: "/services",
  LAB: "/lab",
  JOBS: "/jobs",
  BRIEF: "/services",
} as const;

export const NAV_ITEMS = {
  HOME: { label: "Home", href: ROUTES.HOME },
  WORK: { label: "Work", href: ROUTES.WORK },
  SERVICES: { label: "Services", href: ROUTES.SERVICES },
  LAB: { label: "Lab", href: ROUTES.LAB },
  JOBS: { label: "Jobs", href: ROUTES.JOBS },
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
