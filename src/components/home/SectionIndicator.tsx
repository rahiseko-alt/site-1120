"use client";

import React from "react";
import { useSectionStore } from "@/stores/appStore";

const SECTION_ITEMS = [
  { index: 1, title: "Selected Works" },
  { index: 2, title: "Philosophy" },
  { index: 3, title: "Capabilities" },
  { index: 4, title: "Alliances" },
  { index: 5, title: "The Collective" },
  { index: 6, title: "Recognition" },
  { index: 7, title: "Press & Journal" },
];

export function SectionIndicator() {
  const current = useSectionStore((s) => s.currentSectionIndex);
  const visible = current >= 1 && current <= 7;
  const activeIdx = Math.max(1, Math.min(7, current));

  return (
    <div
      className="SectionIndicator_sectionIndicator___FhP9"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
        marginTop: "-100lvh",
        justifyItems: "end",
        paddingRight: "var(--padding-x)",
        paddingLeft: 0,
      }}
    >
      <div
        className="SectionIndicator_sectionIndicator_content__iFSv_"
        style={
          {
            "--current": activeIdx,
            "--progress": 0,
            gridColumn: "12 / -1",
            justifySelf: "end",
          } as React.CSSProperties
        }
      >
        <div
          className="SectionIndicator_sectionIndicator_content_names__j1bpl"
          style={{ textAlign: "right" }}
        >
          {SECTION_ITEMS.map((item) => (
            <span
              key={item.index}
              className="SectionIndicator_sectionIndicator_content_names_name__cn4Sf"
            >
              {item.title}
            </span>
          ))}
        </div>

        <div className="SectionIndicator_sectionIndicator_content_line___txWi" />

        <div className="SectionIndicator_sectionIndicator_content_indexes__SpTTG">
          {SECTION_ITEMS.map((item) => (
            <span
              key={item.index}
              className="SectionIndicator_sectionIndicator_content_indexes_index__ufLZ_"
            >
              0{item.index}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
