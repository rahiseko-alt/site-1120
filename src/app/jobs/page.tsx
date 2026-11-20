"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";
import { Footer } from "@/components/layout/Footer";
import jobsData from "@/data/jobs.json";

const useCareerHoverStore = create<{
  hoveredIndex: number;
  setHoveredIndex: (idx: number) => void;
}>((set, get) => ({
  hoveredIndex: -1,
  setHoveredIndex: (idx) => {
    if (get().hoveredIndex !== idx) set({ hoveredIndex: idx });
  },
}));

interface CareerItemData {
  role?: string;
  type?: string;
  location?: string;
  poster?: {
    url?: string;
    alt?: string;
    dimensions?: { width: number; height: number };
  };
  description?: RichTextField;
}

const SENIOR_CD_DATA: CareerItemData = {
  role: "Senior Creative Director",
  type: "",
  location: "Asia / Asia hours",
  poster: {
    dimensions: { width: 1122, height: 1402 },
    alt: "fromanother is hiring a Senior Creative Director. Apply at fromanother.love/jobs.",
    url: "/senior-creative-director-poster.png",
  },
  description: [
    {
      type: "paragraph",
      text: "fromanother is looking for a Senior Creative Director to lead ambitious ideas from the first conversation through to the final delivered work.",
      spans: [],
    },
    {
      type: "paragraph",
      text: "We are an artist-led creative agency and consultancy working across brand and direction, digital products and experiences. This role calls for strong creative judgment, clear storytelling, hands-on craft and the ability to guide collaborators through production.",
      spans: [],
    },
    {
      type: "paragraph",
      text: "What you will do",
      spans: [{ start: 0, end: 16, type: "em" }],
    },
    {
      type: "list-item",
      text: "Shape creative concepts and turn them into a clear direction that teams and clients can act on.",
      spans: [],
    },
    {
      type: "list-item",
      text: "Lead projects from brief and research through design, production and delivery, protecting the idea while making practical decisions.",
      spans: [],
    },
    {
      type: "list-item",
      text: "Give specific, constructive feedback and bring the right creative and technical collaborators into the work.",
      spans: [],
    },
    {
      type: "list-item",
      text: "Present the thinking behind the work and explain choices around craft, scope, timing and production.",
      spans: [],
    },
    {
      type: "paragraph",
      text: "What we are looking for",
      spans: [{ start: 0, end: 23, type: "em" }],
    },
    {
      type: "list-item",
      text: "At least four years of relevant professional experience, with completed work that demonstrates creative direction and leadership.",
      spans: [],
    },
    {
      type: "list-item",
      text: "A portfolio of delivered projects, clear personal credits and evidence of what you actually led or made.",
      spans: [],
    },
    {
      type: "list-item",
      text: "An established professional network of collaborators, supported by examples of people and disciplines you have worked with successfully.",
      spans: [],
    },
    {
      type: "list-item",
      text: "The ability to collaborate reliably with our team in Ho Chi Minh City time (UTC+7). Candidates outside Asia should explain the recurring overlap they can commit to.",
      spans: [],
    },
    {
      type: "paragraph",
      text: "Responsible use of AI can be part of your process. AI images or moodboards alone do not demonstrate senior creative leadership: we want to understand your judgment, your contribution and how the work reached its final audience.",
      spans: [],
    },
    {
      type: "paragraph",
      text: "How to apply",
      spans: [{ start: 0, end: 12, type: "em" }],
    },
    {
      type: "paragraph",
      text: "Use the application form and include your portfolio plus three completed projects. For each, explain the client or context, brief, final output, your exact personal contribution and credits, collaborators, and a significant production decision. Share only material you have permission to share; describe a permitted walkthrough if the final work is confidential.",
      spans: [],
    },
    {
      type: "paragraph",
      text: "Include your experience timeline, current location and time zone, availability and practical overlap with Ho Chi Minh City, collaborator-network examples, and gross compensation expectations with currency and basis (monthly salary or freelance rate).",
      spans: [],
    },
    {
      type: "paragraph",
      text: "Apply for Senior Creative Director",
      spans: [
        {
          start: 0,
          end: 34,
          type: "hyperlink",
          data: {
            link_type: "Web",
            url: "https://docs.google.com/forms/d/e/1FAIpQLSeNIFLdhqSS5IrkQhrE-8y_eONAYwnE9PnAY0n3yw1EBd-NkA/viewform",
            target: "_blank",
          },
        },
      ],
    },
  ] as unknown as RichTextField,
};

function CareerRow({
  index,
  item,
  data,
}: {
  index: number;
  item?: { uid?: string; data?: CareerItemData };
  data?: CareerItemData;
}) {
  const rowData = data ?? item?.data ?? null;
  const liRef = useRef<HTMLLIElement>(null);
  const setHoveredIndex = useCareerHoverStore((s) => s.setHoveredIndex);

  const onHoverChange = useCallback(
    (hovered: number) => {
      const active = hovered !== -1 && (hovered === index || hovered + 1 === index);
      liRef.current?.classList.toggle("Career_item__divider_highlight__ABJYC", active);
    },
    [index]
  );

  useEffect(() => {
    let prev = -1;
    return useCareerHoverStore.subscribe((s) => {
      if (s.hoveredIndex !== prev) {
        prev = s.hoveredIndex;
        onHoverChange(s.hoveredIndex);
      }
    });
  }, [onHoverChange]);

  return (
    <li
      ref={liRef}
      className="Career_item__u27FB"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(-1)}
    >
      <div className="Career_item_divider__bsxNt" />
      <div
        className="Career_item_top__gx4u1"
        onClick={() => liRef.current?.classList.toggle("Career_item__expanded__4jdHg")}
      >
        <div className="Career_item_top_index__KRDbt">{rowData ? index + 1 : ""}</div>
        <div className="Career_item_top_role__4JrHc">{rowData?.role}</div>
        <div className="Career_item_top_meta__Liakp">
          <div className="Career_item_top_type____Czb">{rowData?.type}</div>
          {!!rowData?.type && !!rowData?.location && (
            <div className="Career_item_top_dot__n7R_H" />
          )}
          <div className="Career_item_top_location__8_t5C">{rowData?.location}</div>
        </div>
        <div className="Career_item_top_icon___4MGp">
          <div className="Career_item_top_icon_wrapper__ACSxo">
            {!!rowData && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/icons/no-filled_chevron_down.svg"
                alt="Chevron down"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="Career_item_bottom_wrapper__zGUtL">
        <div className="Career_item_bottom__1_8t2">
          {rowData?.poster?.url && (
            <div className="Career_item_bottom_poster__ABasP">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rowData.poster.url}
                width={rowData.poster.dimensions?.width}
                height={rowData.poster.dimensions?.height}
                alt={rowData.poster.alt || `${rowData.role || "Open role"} hiring poster`}
              />
            </div>
          )}
          <div className="Career_item_bottom_description__bRTy5">
            {rowData?.description && (
              <PrismicRichText
                field={rowData.description}
                components={{
                  hyperlink: ({ node, children }) => (
                    <a
                      href={(node.data as { url?: string }).url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="common-link-effect"
                    >
                      {children}
                    </a>
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function JobsPage() {
  const data = jobsData as unknown as {
    heading?: string;
    hidden?: boolean;
    slices?: Array<{
      slice_type: string;
      primary?: { list?: Array<{ item: { uid?: string; data?: CareerItemData } }> };
    }>;
    globalDocument: {
      data: {
        email_address?: string;
        branches?: Array<{
          utc?: string | number;
          country?: string;
          address_block?: RichTextField;
          phone_number?: string;
        }>;
        socials?: Array<{
          key?: string;
          link_type?: string;
          url?: string;
          text?: string;
        }>;
        slices?: Array<{
          slice_type?: string;
          primary?: { featured_word?: Array<{ word?: string }> };
        }>;
      };
    };
    footerMedia?: { videoUrl?: string; posterUrl?: string };
  };

  const careerSlice = data.slices?.find((s) => s.slice_type === "career_list");
  const list = careerSlice?.primary?.list ?? [];
  const hasSeniorCd = list.some(
    ({ item }) =>
      item?.uid === "senior-creative-director" ||
      item?.data?.role?.trim().replace(/\s+/g, " ").toLowerCase() ===
        "senior creative director"
  );
  const needsFallbackCd = !hasSeniorCd;
  const totalCount = list.length + (needsFallbackCd ? 1 : 0);

  const footerSlice = data.globalDocument?.data?.slices?.find(
    (s) => s.slice_type === "footer"
  );

  return (
    <div className="CareerPage_page__njh1K">
      <div className="CareerPage_content__vLgaZ">
        <div
          className={`CareerPage_content_heading__Wova_ ${
            data.hidden ? "CareerPage_content_heading__empty__RnEwR" : ""
          }`}
        >
          <h1>{data.hidden ? "No open positions at the moment" : data.heading ?? "Join our team"}</h1>
        </div>

        {!data.hidden && (
          <div className="Careers_container__znhRM">
            <div className="Careers_container_row__R9WrJ Careers_container_row__header__7MpOm">
              <div className="Careers_container_row_index__cZ6zA" />
              <div className="Careers_container_row_role__w52kw">Role</div>
              <div className="Careers_container_row_type__0U38m">Type</div>
              <div className="Careers_container_row_location__X6mu8">Location</div>
            </div>
            <ul className="Careers_container_list__8ipvH">
              {list.map((entry, idx) => (
                <CareerRow key={idx} index={idx} item={entry.item} />
              ))}
              {needsFallbackCd && <CareerRow index={list.length} data={SENIOR_CD_DATA} />}
              <CareerRow index={totalCount} />
            </ul>
          </div>
        )}
      </div>

      <Footer
        contactEmail={data.globalDocument?.data?.email_address}
        branches={data.globalDocument?.data?.branches}
        thumbnailVideoUrl={data.footerMedia?.videoUrl || undefined}
        posterUrl={data.footerMedia?.posterUrl}
        featuredWords={footerSlice?.primary?.featured_word}
        socials={data.globalDocument?.data?.socials}
      />
    </div>
  );
}
