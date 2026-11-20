import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | fromanother",
  description:
    "fromanother is an artist-led creative agency and consultancy across strategy, digital product, brand and direction, and experiential work.",
};

const SECTIONS = [
  {
    id: "strategy",
    index: "01",
    title: "Strategy & Consulting",
    body: "We help brands figure out what to build, what to say, and where to say it. Our strategists work alongside founders and CMOs on brand positioning, market entry into Asia, cross-cultural adaptation for Asian brands going global, and the AI-era questions that no playbook has answered yet — how to use generative tools without flattening the work that makes a brand worth choosing.",
    capabilities: [
      "Brand strategy",
      "Creative consulting",
      "Market entry (East ↔ West)",
      "Cultural and audience research",
      "AI strategy for brand and marketing teams",
      "Naming and verbal identity",
      "Positioning and messaging",
      "Go-to-market creative",
    ],
  },
  {
    id: "design",
    index: "02",
    title: "Design & Product",
    body: "Digital product work for brands that need their UX to match the craft of their identity. We design websites, flagship digital experiences, ecommerce journeys, and product interfaces — end to end, from research and IA through interaction design, prototypes, and design systems that scale with your team.",
    capabilities: [
      "UI/UX design",
      "Digital product design",
      "Web experiences and flagships",
      "Ecommerce and storefront design",
      "Interaction and motion design",
      "Design systems",
      "Prototyping and testing",
      "Accessibility and performance",
    ],
  },
  {
    id: "brand",
    index: "03",
    title: "Brand & Direction",
    body: "The artist-led craft the studio is known for. We build brand identities from scratch, direct campaigns, and produce commercials, CGI, and image-making for luxury, beauty, fashion, and culture clients. AI is a tool in our process, not a substitute for taste.",
    capabilities: [
      "Brand identity",
      "Art direction",
      "Design concept",
      "Commercials and campaign films",
      "CGI and 3D",
      "Photography direction",
      "Music video and film",
      "Content systems",
    ],
  },
  {
    id: "experiential",
    index: "04",
    title: "Experiential & Offline",
    body: "The work AI cannot replace — physical, in the room, attended by humans. We design immersive launches, retail concepts, interactive installations, and out-of-home campaigns that turn cultural moments into places people show up to.",
    capabilities: [
      "Immersive events and launches",
      "Interactive art installations",
      "Retail and pop-up design",
      "Out-of-home and outdoor",
      "Experiential campaigns",
      "Exhibition and showroom design",
      "Print and editorial",
      "Merchandise and collectibles",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="ServicesPage_root__YPbLP">
      <div className="Container_container__A7FAx">
        <div className="ServicesPage_intro__gVhPk">
          <div className="ServicesPage_eyebrow__rwv6Z">What we do</div>
          <h1 className="ServicesPage_heading__Dqjmc">
            A creative agency and consultancy, built for the AI era.
          </h1>
          <p className="ServicesPage_lede__6t6So">
            fromanother is an artist-led creative studio and consultancy
            co-founded by Robin Mahieux and Vicki Dang. We partner with global
            brands on strategy, digital product, brand and direction, and
            experiential work, from four studios — Saigon, Hong Kong, Tokyo, and
            Paris. The practice was established in 2020 and has operated under
            the fromanother name since 2022, working with Louis Vuitton, Chanel,
            Dior, L&apos;Oréal, La Mer, Glossier, Oribe, OnePlus, Oppo, The North
            Face, and 88rising.
          </p>
          <div className="ServicesPage_studios__hUj1Q">
            <span>Saigon</span>
            <span>Hong Kong</span>
            <span>Tokyo</span>
            <span>Paris</span>
          </div>
        </div>

        <div className="ServicesPage_sections__ERDEG">
          {SECTIONS.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="ServicesPage_section__Qg_Ee"
            >
              <div>
                <div className="ServicesPage_sectionIndex__WeMtT">
                  {sec.index}
                </div>
              </div>
              <div>
                <h2 className="ServicesPage_sectionTitle__qaoMC">
                  {sec.title}
                </h2>
                <p className="ServicesPage_sectionBody__IIK2h">{sec.body}</p>
                <ul className="ServicesPage_capabilities__edMn9">
                  {sec.capabilities.map((cap) => (
                    <li key={cap} className="ServicesPage_capability__1wNHX">
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        <div className="ServicesPage_footer__TG3hm">
          <h2 className="ServicesPage_footerTitle__AYS_S">Start a project.</h2>
          <p className="ServicesPage_footerBody__IYjL2">
            Working on a launch, a rebrand, a new product, or a market entry
            into Asia or Europe? We read every brief.
          </p>
          <a
            className="ServicesPage_cta__LwJND"
            href="mailto:firstcontact@fromanother.love"
          >
            firstcontact@fromanother.love
          </a>
        </div>
      </div>
    </main>
  );
}
