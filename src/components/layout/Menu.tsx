"use client";

import React, { useCallback, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMenuSubscription } from "@/stores/appStore";
import { useLenis } from "@/components/layout/LenisProvider";
import { useTabVideoVisibility } from "@/hooks/usePageLifecycle";
import { DURATION, NAV_ITEMS, ROUTES } from "@/lib/constants";
import { HoverText, type HoverTextHandle } from "@/components/common/HoverText";
import { HlsVideo } from "@/components/common/HlsVideo";
import { TransitionLink } from "@/components/common/TransitionLink";

gsap.registerPlugin(useGSAP);

function MenuNavItem({
  item,
  index,
}: {
  item: { label: string; href: string };
  index: number;
}) {
  const liRef = useRef<HTMLLIElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const { contextSafe } = useGSAP(() => {
    if (liRef.current) {
      gsap.set(liRef.current, {
        opacity: 0,
        filter: "blur(10px)",
        willChange: "auto",
        visibility: "hidden",
      });
    }
  }, []);

  const animate = useCallback(
    contextSafe((open: boolean) => {
      if (!liRef.current) return;
      tweenRef.current?.kill();
      const vars: gsap.TweenVars = open
        ? {
            overwrite: true,
            opacity: 1,
            filter: "blur(0px)",
            delay: 0.3 + 0.05 * index,
            onStart: () => {
              gsap.set(liRef.current, { visibility: "visible" });
            },
          }
        : {
            overwrite: true,
            opacity: 0,
            filter: "blur(10px)",
            delay: 0,
            onComplete: () => {
              gsap.set(liRef.current, { visibility: "hidden" });
            },
          };
      tweenRef.current = gsap.to(liRef.current, vars);
    }),
    [index]
  );

  useMenuSubscription((isOpen) => animate(isOpen));

  return (
    <li ref={liRef} className="Menu_menu_nav_item__PfuBn">
      <TransitionLink href={item.href}>{item.label}</TransitionLink>
    </li>
  );
}

export function Menu({
  contactEmail = "firstcontact@fromanother.love",
  thumbnailVideoUrl,
  posterUrl,
  showCareerNav = true,
}: {
  contactEmail?: string;
  thumbnailVideoUrl?: string;
  posterUrl?: string;
  showCareerNav?: boolean;
}) {
  const items = Object.values(NAV_ITEMS).filter(
    (item) => item.href !== ROUTES.JOBS || showCareerNav
  );
  const { __lenis } = useLenis();
  const menuRef = useRef<HTMLDivElement>(null);
  const emailTextRef = useRef<HoverTextHandle>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const maskTweenRef = useRef<gsap.core.Tween | null>(null);
  const { contextSafe } = useGSAP();

  useTabVideoVisibility(videoRef);

  const openMenu = contextSafe(() => {
    if (!menuRef.current) return;
    maskTweenRef.current?.kill();
    maskTweenRef.current = gsap.to(menuRef.current, {
      "--menu-mask-height": "0%",
      duration: DURATION.NORMAL,
      ease: "power3.out",
      onStart: () => {
        gsap.set(menuRef.current, {
          pointerEvents: "auto",
          visibility: "visible",
        });
        __lenis?.stop();
        videoRef.current?.play().catch(() => {});
      },
    });
  });

  const closeMenu = contextSafe(() => {
    if (!menuRef.current) return;
    maskTweenRef.current?.kill();
    maskTweenRef.current = gsap.to(menuRef.current, {
      "--menu-mask-height": "100%",
      duration: DURATION.FAST,
      ease: "power3.out",
      onComplete: () => {
        gsap.set(menuRef.current, {
          pointerEvents: "none",
          visibility: "hidden",
        });
        __lenis?.start();
        videoRef.current?.pause();
      },
    });
  });

  useMenuSubscription((isOpen) => {
    if (isOpen) openMenu();
    else closeMenu();
  });

  return (
    <div ref={menuRef} className="Menu_menu__K8jw6">
      <div className="Menu_menu_videoWrapper__So_Ha">
        {thumbnailVideoUrl && (
          <HlsVideo
            src={thumbnailVideoUrl}
            poster={posterUrl}
            ref={videoRef}
            autoPlay={false}
          />
        )}
      </div>

      <div className="Menu_menu_content__AcDgH">
        <ul className="Menu_menu_nav__WX0Ml">
          {items.map((item, idx) => (
            <MenuNavItem key={item.href} item={item} index={idx} />
          ))}
        </ul>

        <div className="Menu_menu_info__3vEOa">
          <p className="Menu_menu_info_label__8bFqR">
            Contact us or{" "}
            <TransitionLink
              href={ROUTES.BRIEF}
              className="Menu_menu_info_label_brief__64DJu common-link-effect-2"
            >
              start a brief
            </TransitionLink>
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="Menu_menu_info_link__uq81a common-link-effect"
            onMouseEnter={() => emailTextRef.current?.onHover()}
            style={
              {
                width: "fit-content",
                "--duration": ".3s !important",
              } as React.CSSProperties
            }
          >
            <HoverText ref={emailTextRef}>{contactEmail}</HoverText>
          </a>
        </div>
      </div>
    </div>
  );
}
