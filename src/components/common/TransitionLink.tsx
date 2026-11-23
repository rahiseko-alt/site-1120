"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useRouterTransition } from "@/hooks/usePageLifecycle";
import { useMenuStore } from "@/stores/appStore";

interface TransitionLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  typeEffect?: "fade" | "none" | "history";
  pageName?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  "aria-label"?: string;
}

export function TransitionLink({
  href,
  children,
  className,
  style,
  typeEffect = "fade",
  pageName = "Home",
  onClick,
  ...rest
}: TransitionLinkProps) {
  const pathname = usePathname();
  const { routerPrefetch } = useRouterTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (href.startsWith("http") || href.startsWith("mailto:")) {
      return;
    }
    if (href.startsWith("#") || (href.startsWith("/#") && pathname === "/")) {
      e.preventDefault();
      useMenuStore.getState().setIsOpen(false);
      const hash = href.replace(/^\/+/, "");
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    e.preventDefault();
    if (href === pathname) {
      useMenuStore.getState().setIsOpen(false);
      return;
    }
    routerPrefetch({ pathName: href, pageName, typeEffect });
  };

  return (
    <Link href={href} className={className} style={style} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
