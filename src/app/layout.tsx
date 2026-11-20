import type { Metadata } from "next";
import { twkFont, ivoryFont, herbikFont } from "./fonts";
import "./globals.css";
import "../styles/modules.css";
import { LenisProvider } from "@/components/layout/LenisProvider";
import { PageLoader } from "@/components/layout/PageLoader";
import { Header } from "@/components/layout/Header";
import { Menu } from "@/components/layout/Menu";
import { PageEffect } from "@/components/layout/PageEffect";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { ResizeOverlay } from "@/components/layout/ResizeOverlay";
import { ImagePlaceholder } from "@/components/layout/ImagePlaceholder";
import { CookieConsent } from "@/components/layout/CookieConsent";
import homeData from "@/data/home.json";

export const metadata: Metadata = {
  title: "fromanother",
  description: "We are an Artist - Led Creative Agency/Studio/Collective",
  openGraph: {
    title: "fromanother",
    description: "We are an Artist - Led Creative Agency/Studio/Collective",
    images: [
      {
        url: "https://images.prismic.io/fromanother-2026/abLhU1xvIZEnjnzT_Opengraph.jpg?auto=format%2Ccompress&fit=crop&w=1200&h=630",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "fromanother",
    description: "We are an Artist - Led Creative Agency/Studio/Collective",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalDoc = homeData.globalDocument as {
    data: {
      contact_email?: string;
      menu_video?: { url?: string };
    };
  };
  const bgMedia = homeData.backgroundMedia as {
    menu?: { videoUrl?: string; posterUrl?: string };
  };

  return (
    <html
      lang="en"
      className={`${twkFont.variable} ${ivoryFont.variable} ${herbikFont.variable}`}
    >
      <body>
        <LenisProvider>
          <PageLoader />
          <div style={{ width: "100vw", overflowX: "clip" }}>
            <Header contactEmail={globalDoc?.data?.contact_email || "firstcontact@fromanother.love"} />
            <ScrollProgress />
            {children}
            <Menu
              contactEmail={globalDoc?.data?.contact_email || "firstcontact@fromanother.love"}
              thumbnailVideoUrl={bgMedia?.menu?.videoUrl}
              posterUrl={bgMedia?.menu?.posterUrl}
              showCareerNav={true}
            />
            <ResizeOverlay />
            <ImagePlaceholder />
          </div>
          <PageEffect />
          <CookieConsent />
        </LenisProvider>
      </body>
    </html>
  );
}
