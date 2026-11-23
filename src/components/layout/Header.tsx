"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  useHeroExpandedSubscription,
  useLabModalSubscription,
  useMenuStore,
  useMenuSubscription,
  useSectionIndexSubscription,
  useSectionStore,
  useWorkVideoSubscription,
} from "@/stores/appStore";
import { usePageEnter, useViewport } from "@/hooks/usePageLifecycle";
import { ROUTES } from "@/lib/constants";
import { HoverText, type HoverTextHandle } from "@/components/common/HoverText";
import { TransitionLink } from "@/components/common/TransitionLink";

gsap.registerPlugin(useGSAP);

function MenuToggle() {
  const hamburgerRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const textContentRef = useRef<HTMLSpanElement>(null);
  const menuTextRef = useRef<HoverTextHandle>(null);
  const closeTextRef = useRef<HoverTextHandle>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const slideTweenRef = useRef<gsap.core.Tween | null>(null);

  const { contextSafe } = useGSAP(() => {
    if (!line1Ref.current || !line2Ref.current) return;
    tlRef.current?.kill();
    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.4, ease: "power3" },
    });
    tl.fromTo(line1Ref.current, { xPercent: 0 }, { xPercent: 105 });
    tl.fromTo(
      line2Ref.current,
      { xPercent: 0 },
      {
        xPercent: 105,
        onComplete: () => {
          const isOpen = useMenuStore.getState().isOpen;
          hamburgerRef.current?.classList.toggle("Header_close__Kd18j", isOpen);
        },
      },
      0.1
    );
    tl.fromTo(line1Ref.current, { xPercent: -105 }, { xPercent: 0 });
    tl.fromTo(line2Ref.current, { xPercent: -105 }, { xPercent: 0 }, 0.6);
    gsap.set(line1Ref.current, { xPercent: 0 });
    gsap.set(line2Ref.current, { xPercent: 0 });
    tlRef.current = tl;
    return () => tl.kill();
  });

  const onMouseEnter = contextSafe(() => {
    if (!tlRef.current) return;
    tlRef.current.kill();
    tlRef.current.restart();
    if (useMenuStore.getState().isOpen) {
      closeTextRef.current?.onHover({ duration: 1.2, ease: "power3.out" });
    } else {
      menuTextRef.current?.onHover({ duration: 1.2, ease: "power3.out" });
    }
  });

  useMenuSubscription((isOpen) => {
    if (!textContentRef.current) return;
    slideTweenRef.current?.kill();
    tlRef.current?.kill();
    tlRef.current?.restart();
    slideTweenRef.current = gsap.to(textContentRef.current, {
      yPercent: isOpen ? -100 : 0,
      duration: 1.2,
      ease: "power3.out",
    });
  });

  return (
    <button
      className="Header_header_left_menu__CDHoo"
      type="button"
      aria-label="Toggle navigation menu"
      onMouseEnter={onMouseEnter}
      onClick={() => useMenuStore.getState().setIsOpen(!useMenuStore.getState().isOpen)}
    >
      <span className="Header_header_left_menu_hamburger__Uiyy7" ref={hamburgerRef}>
        <span className="Header_header_left_menu_hamburger_line__BIUUo">
          <span ref={line1Ref} />
        </span>
        <span className="Header_header_left_menu_hamburger_line__BIUUo">
          <span ref={line2Ref} />
        </span>
      </span>
      <span className="Header_header_left_menu_text__wv3_H">
        <span className="Header_header_left_menu_text_content__THjSX" ref={textContentRef}>
          <HoverText ref={menuTextRef}>Menu</HoverText>
          <span className="Header_header_left_menu_text_content_close__cSqbM">
            <HoverText ref={closeTextRef}>Close</HoverText>
          </span>
        </span>
      </span>
    </button>
  );
}

export function Header({
  contactEmail = "firstcontact@fromanother.love",
}: {
  contactEmail?: string;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const { isDesktop } = useViewport();
  const isWorkDetail = !!pathname.split("/").filter(Boolean)[1];
  const isLab = pathname === ROUTES.LAB;
  const isJobs = pathname === ROUTES.JOBS;
  const forceDifference = isLab || isWorkDetail || isJobs;

  const mixTimerRef = useRef<gsap.core.Tween | null>(null);
  const downTimerRef = useRef<gsap.core.Tween | null>(null);
  const chatTextRef = useRef<HoverTextHandle>(null);
  const arrowWrapRef = useRef<HTMLSpanElement>(null);
  const arrowTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleDown = (active: boolean) => {
    downTimerRef.current?.kill();
    if (active) {
      headerRef.current?.classList.toggle("Header_header__down___Fn4h", true);
    } else {
      downTimerRef.current = gsap.delayedCall(0.4, () => {
        headerRef.current?.classList.toggle("Header_header__down___Fn4h", false);
      });
    }
  };

  useHeroExpandedSubscription(toggleDown);
  useWorkVideoSubscription((id) => toggleDown(!!id));
  useLabModalSubscription((idx) => toggleDown(idx !== null));

  usePageEnter(() => {
    headerRef.current?.classList.toggle("Header_header__down___Fn4h", false);
    headerRef.current?.classList.toggle("Header_header__hidden__qvMgH", false);
  });

  useMenuSubscription((isOpen) => {
    mixTimerRef.current?.kill();
    const isHome = pathname === ROUTES.HOME;
    const secIdx = useSectionStore.getState().currentSectionIndex;
    if (isOpen || (isHome && (secIdx === 1 || secIdx === 7 || secIdx === 8))) {
      headerRef.current?.classList.toggle("Header_header__mixBlendMode__wLXrQ", true);
    } else if (!forceDifference) {
      mixTimerRef.current = gsap.delayedCall(0.6, () => {
        const cur = pathRef.current;
        if (cur !== ROUTES.LAB && !cur.split("/").filter(Boolean)[1]) {
          headerRef.current?.classList.toggle("Header_header__mixBlendMode__wLXrQ", false);
        }
      });
    }
  });

  useSectionIndexSubscription((idx) => {
    if (pathname === ROUTES.HOME) {
      headerRef.current?.classList.toggle(
        "Header_header__mixBlendMode__wLXrQ",
        idx === 1 || idx === 7 || idx === 8
      );
    }
  });

  useEffect(() => {
    if (!isDesktop) {
      return useSectionStore.subscribe(() => {
        const { currentSectionIndex: idx } =
          useSectionStore.getState();
        if (pathRef.current === ROUTES.HOME) {
          headerRef.current?.classList.toggle(
            "Header_header__mixBlendMode__wLXrQ",
            idx === 1 || idx === 7 || idx === 8
          );
        }
      });
    }
  }, [isDesktop]);

  useEffect(() => {
    if (forceDifference) {
      headerRef.current?.classList.add("Header_header__mixBlendMode__wLXrQ");
    } else {
      headerRef.current?.classList.remove("Header_header__mixBlendMode__wLXrQ");
    }
  }, [pathname, forceDifference]);

  return (
    <div
      data-brand-header
      className={`Header_header__W3r_v ${
        forceDifference ? "Header_header__mixBlendMode__wLXrQ" : ""
      }`}
      ref={headerRef}
    >
      <div className="Header_header_left__xm1WC">
        <MenuToggle />
      </div>

      <div className="Header_header_center__65N2s">
        <TransitionLink href={ROUTES.HOME} className="Header_header_center_logo__DZO2V">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/main-logo.svg"
            alt="Logo"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
        </TransitionLink>
      </div>

      <div className="Header_header_right__3SVyr">
        <a
          href={`mailto:${contactEmail}`}
          className="Header_header_right_contact__2knWE"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Send us an email"
          onMouseEnter={() => {
            arrowTweenRef.current?.kill();
            chatTextRef.current?.onHover({ duration: 1.2, ease: "power3.out" });
            if (arrowWrapRef.current) {
              arrowTweenRef.current = gsap.fromTo(
                arrowWrapRef.current,
                { "--progress": 0 },
                { "--progress": 1, duration: 1.2, ease: "power3.out" }
              );
            }
          }}
        >
          <span className="Header_header_right_contact_text__kL_VR">
            <HoverText ref={chatTextRef}>Let’s chat</HoverText>
          </span>
          <span className="Header_header_right_contact_arrow__GW4QE" ref={arrowWrapRef}>
            <span className="Header_header_right_contact_arrow_icon__BHXvc">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/arrow_right.svg"
                alt="Arrow Right"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              />
            </span>
            <span className="Header_header_right_contact_arrow_icon__BHXvc">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/arrow_right.svg"
                alt="Arrow Right"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              />
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
