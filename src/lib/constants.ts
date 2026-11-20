export const ROUTES = {
  HOME: "/",
  WORK: "/work",
  SERVICES: "/services",
  LAB: "/lab",
  JOBS: "/jobs",
  BRIEF: "/brief",
} as const;

export const NAV_ITEMS = {
  HOME: { label: "Home", href: ROUTES.HOME },
  WORK: { label: "Work", href: ROUTES.WORK },
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
  YELLOW: "#fffde2",
  DARK_BLUE: "#051236",
  BLUE: "#1740a9",
  JOBS_BG: "#182e2f",
} as const;
