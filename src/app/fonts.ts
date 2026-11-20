import localFont from "next/font/local";

export const twkFont = localFont({
  src: [
    { path: "../fonts/0e797165e26b272a-s.p.woff2", weight: "400", style: "normal" },
    { path: "../fonts/0f04903bd21782ae-s.p.woff2", weight: "400", style: "italic" },
    { path: "../fonts/e663c8077c28d5ba-s.p.woff2", weight: "600", style: "normal" },
    { path: "../fonts/60843f0480501197-s.p.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-twk",
  display: "swap",
});

export const ivoryFont = localFont({
  src: [
    { path: "../fonts/42be8d39b5a0952f-s.p.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-ivory",
  display: "swap",
});

export const herbikFont = localFont({
  src: [
    { path: "../fonts/6820b3f787b3ee4d-s.p.woff2", weight: "400", style: "normal" },
    { path: "../fonts/519123459e8eb17e-s.p.woff2", weight: "400", style: "italic" },
    { path: "../fonts/580e01973e5f8f14-s.p.woff2", weight: "500", style: "normal" },
    { path: "../fonts/bae1c9bbe0dbd3b6-s.p.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-herbik",
  display: "swap",
});
