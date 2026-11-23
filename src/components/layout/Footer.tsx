"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";
import { HoverText, type HoverTextHandle } from "@/components/common/HoverText";
import { HlsVideo } from "@/components/common/HlsVideo";
import { TransitionLink } from "@/components/common/TransitionLink";
import { ROUTES } from "@/lib/constants";

gsap.registerPlugin(useGSAP);

interface Branch {
  utc?: string | number;
  country?: string;
  address_block?: RichTextField;
  phone_number?: string;
}

interface SocialItem {
  key?: string;
  link_type?: string;
  url?: string;
  text?: string;
}

interface FeaturedWord {
  word?: string;
}

function AnalogClock({
  timezone = 0,
  hourLength = "0.9rem",
  minuteLength = "1.3rem",
}: {
  timezone?: number;
  hourLength?: string;
  minuteLength?: string;
}) {
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const local = new Date(
        now.getTime() + 60000 * now.getTimezoneOffset() + 3600000 * timezone
      );
      const mins = local.getMinutes();
      const hrs = local.getHours();
      if (minuteRef.current) {
        minuteRef.current.style.transform = `translate(-50%, 0) rotate(${6 * mins}deg)`;
      }
      if (hourRef.current) {
        hourRef.current.style.transform = `translate(-50%, 0) rotate(${
          (hrs % 12) * 30 + 0.5 * mins
        }deg)`;
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return (
    <div className="Footer_footer_container_top_right_item_branch_clock__s2_LJ">
      <div
        ref={hourRef}
        className="Footer_footer_container_top_right_item_branch_clock_hand__SAjjs Footer_footer_container_top_right_item_branch_clock_hand__hour__Xz83c"
        style={{ height: hourLength }}
      />
      <div
        ref={minuteRef}
        className="Footer_footer_container_top_right_item_branch_clock_hand__SAjjs Footer_footer_container_top_right_item_branch_clock_hand__minute__zHglh"
        style={{ height: minuteLength }}
      />
      <div className="Footer_footer_container_top_right_item_branch_clock_center__placeholder" />
    </div>
  );
}

function SocialLink({ social }: { social: SocialItem }) {
  const ref = useRef<HoverTextHandle>(null);
  return (
    <a
      href={social.link_type === "Any" ? "#" : social.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="common-link-effect-2"
      onMouseEnter={() => ref.current?.onHover()}
    >
      <HoverText ref={ref}>{social.text || "Untitled"}</HoverText>
    </a>
  );
}

export function Footer({
  contactEmail = "firstcontact@fromanother.love",
  branches = [],
  thumbnailVideoUrl,
  posterUrl,
  featuredWords = [],
  socials = [],
}: {
  contactEmail?: string;
  branches?: Branch[];
  thumbnailVideoUrl?: string;
  posterUrl?: string;
  featuredWords?: FeaturedWord[];
  socials?: SocialItem[];
}) {
  const emailRef = useRef<HoverTextHandle>(null);
  const emailBottomRef = useRef<HoverTextHandle>(null);
  const briefTopRef = useRef<HoverTextHandle>(null);
  const briefBottomRef = useRef<HoverTextHandle>(null);
  const wordIndexRef = useRef(0);
  const wordsWrapRef = useRef<HTMLParagraphElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useGSAP(
    () => {
      if (!wordsWrapRef.current) return;
      const spans = wordsWrapRef.current.querySelectorAll("span");
      if (spans.length === 0) return;

      spans.forEach((el, idx) => {
        gsap.set(el, {
          opacity: idx === 0 ? 1 : 0,
          filter: idx === 0 ? "blur(0px)" : "blur(10px)",
        });
      });

      const startCycle = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          const cur = spans[wordIndexRef.current];
          const next = spans[(wordIndexRef.current + 1) % spans.length];
          gsap.fromTo(
            cur,
            { opacity: 1, filter: "blur(0px)" },
            { opacity: 0, filter: "blur(10px)", duration: 1, ease: "power3.inOut" }
          );
          gsap.fromTo(
            next,
            { opacity: 0, filter: "blur(10px)" },
            { opacity: 1, filter: "blur(0px)", duration: 1.6, ease: "power3.inOut" }
          );
          wordIndexRef.current = (wordIndexRef.current + 1) % spans.length;
        }, 5000);
      };

      const stopCycle = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      startCycle();
      const onVis = () => (document.hidden ? stopCycle() : startCycle());
      document.addEventListener("visibilitychange", onVis);
      return () => {
        stopCycle();
        document.removeEventListener("visibilitychange", onVis);
      };
    },
    { dependencies: [featuredWords] }
  );

  return (
    <div className="Footer_footer__lZFSB">
      {thumbnailVideoUrl && (
        <div className="Footer_footer_videoWrapper__h4y_R">
          <HlsVideo
            src={thumbnailVideoUrl}
            poster={posterUrl}
            muted
            loop
            autoPlay
          />
        </div>
      )}

      <div className="Container_container__A7FAx Footer_footer_container__xSG9i">
        {/* Top Row: Horizontal Global Studios & Analog Clocks Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "3.2rem",
            paddingTop: "12rem",
            paddingBottom: "6rem",
            borderBottom: "1px solid rgba(242, 239, 233, 0.16)",
            width: "100%",
          }}
        >
          {branches.slice(0, 4).map((branch, idx) => (
            <div
              key={`${branch.country}-${idx}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.6rem",
                padding: "2rem",
                borderRadius: "0.4rem",
                background: "rgba(242, 239, 233, 0.03)",
                border: "1px solid rgba(242, 239, 233, 0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <AnalogClock
                  timezone={Number(branch.utc || 0)}
                  hourLength="0.9rem"
                  minuteLength="1.3rem"
                />
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontFamily: "var(--font-herbik)",
                    fontStyle: "italic",
                    color: "var(--brand-accent)",
                  }}
                >
                  UTC{Number(branch.utc || 0) >= 0 ? `+${branch.utc}` : branch.utc}
                </span>
              </div>
              <div className="Footer_footer_container_top_right_item_branch_info__qyDHz" style={{ width: "100%" }}>
                <p className="Footer_footer_container_top_right_item_branch_info_country__NWBVf">
                  {branch.country || "Unknown"}
                </p>
                <div className="Footer_footer_container_top_right_item_branch_info_address__7v1wY">
                  {branch.address_block && (
                    <PrismicRichText field={branch.address_block} />
                  )}
                </div>
                <p className="Footer_footer_container_top_right_item_branch_info_phone__Qt0nv">
                  {branch.phone_number || ""}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Row: Asymmetric Oversized Slogan on Right, Direct Contact on Left */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "4.8rem",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
            <span
              style={{
                fontSize: "1.1rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--brand-accent)",
                fontWeight: 600,
              }}
            >
              Initiate Dialogue
            </span>
            <TransitionLink
              href={ROUTES.BRIEF}
              className="common-link-effect-2"
              onMouseEnter={() => briefTopRef.current?.onHover()}
              style={{ fontSize: "2.4rem", width: "fit-content" }}
            >
              <HoverText ref={briefTopRef}>Explore capabilities &amp; start a brief →</HoverText>
            </TransitionLink>
          </div>

          <div
            className="Footer_footer_container_top_left_slogan__B_mgI"
            style={{ textAlign: "right", marginLeft: "auto" }}
          >
            <p>Let’s</p>
            <p>architect</p>
            <p
              className="Footer_footer_container_top_left_slogan_words__ZH_wt"
              ref={wordsWrapRef}
              style={{ color: "var(--brand-accent)" }}
            >
              {featuredWords?.map((fw, idx) => (
                <span key={`${fw.word}-${idx}`}>{fw.word}</span>
              ))}
            </p>
            <p>together</p>
          </div>
        </div>

        <div className="Grid_grid__8e_U7">
          <div className="Footer_footer_container_bottom_left___hy9x">
            <div className="Footer_footer_container_bottom_left_socials__0fix_">
              <p className="Footer_footer_container_bottom_left_socials_title__U0UgV">
                Follow us
              </p>
              <ul className="Footer_footer_container_bottom_left_socials_list__noNGz">
                {socials?.map((s, idx) => (
                  <li key={s.key || idx}>
                    <SocialLink social={s} />
                  </li>
                ))}
              </ul>
            </div>

            <TransitionLink
              href={ROUTES.BRIEF}
              className="Footer_footer_container_bottom_left_brief__dWn44 common-link-effect-2"
              onMouseEnter={() => briefBottomRef.current?.onHover()}
            >
              <HoverText ref={briefBottomRef}>Start a brief</HoverText>
            </TransitionLink>

            <p className="Footer_footer_container_bottom_left_label__cbx50">
              Contact us
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="Footer_footer_container_bottom_left_link__Qfj72 common-link-effect"
              onMouseEnter={() => emailBottomRef.current?.onHover()}
              style={
                {
                  width: "fit-content",
                  "--duration": ".3s !important",
                } as React.CSSProperties
              }
            >
              <HoverText ref={emailBottomRef}>{contactEmail}</HoverText>
            </a>
          </div>

          <div className="Footer_footer_container_bottom_center__9dgO0">
            <div className="Footer_footer_container_bottom_center_socials__RMynW">
              <ul className="Footer_footer_container_bottom_center_socials_list__48FJn">
                {socials?.map((s, idx) => (
                  <li key={s.key || idx}>
                    <SocialLink social={s} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="Footer_footer_container_bottom_right__qnWO_">
            <p className="Footer_footer_container_bottom_right_copyright__RyUDT">
              © 2027 All rights reserved. fromanother.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
