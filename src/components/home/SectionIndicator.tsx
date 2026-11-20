"use client";

import React from "react";
import { useSectionStore } from "@/stores/appStore";

const SECTION_ITEMS = [
  { index: 1, title: "About" },
  { index: 2, title: "What we do" },
  { index: 3, title: "Featured work" },
  { index: 4, title: "Our team" },
  { index: 5, title: "They trust us" },
  { index: 6, title: "Awards" },
  { index: 7, title: "Press" },
];

export function SectionIndicator() {
  const current = useSectionStore((s) => s.currentSectionIndex);
  const visible = current >= 1 && current <= 7;
  const isLightBg = current === 3 || current === 6;

  return (
    <div
      className="SectionIndicator_sectionIndicator__o_q9L"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.4s ease",
        color: isLightBg ? "var(--brand-dark-blue)" : "var(--brand-yellow)",
      }}
    >
      <ul className="SectionIndicator_sectionIndicator_list__placeholder">
        {SECTION_ITEMS.map((item) => {
          const active = current === item.index;
          return (
            <li
              key={item.index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                opacity: active ? 1 : 0.35,
                transition: "opacity 0.3s ease",
                marginBottom: "0.6rem",
                fontSize: "1.2rem",
              }}
            >
              <span style={{ fontStyle: "italic", fontFamily: "var(--font-herbik)" }}>
                {item.index}
              </span>
              {active && (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "2rem",
                      height: "1px",
                      backgroundColor: "currentColor",
                    }}
                  />
                  <span style={{ fontStyle: "italic", fontFamily: "var(--font-herbik)" }}>
                    {item.title}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
