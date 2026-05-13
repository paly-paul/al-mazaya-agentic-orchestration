import SectionHeading from "@/components/SectionHeading";

export const metadata = { title: "Media Center — Mazaya Clinics" };

const pressReleases = [
  {
    date: "May 2025",
    title: "Al Mazaya Holding Launches AI-Powered Facility Management System",
    excerpt: "Kuwait's leading clinic tower operator deploys an agentic AI system for lead qualification, maintenance routing, and vendor management across all 8 towers.",
    readTime: "3 min read",
  },
  {
    date: "March 2025",
    title: "Mazaya Clinic VIII — Grand Opening in Sabah Al Salem",
    excerpt: "The latest addition to the Mazaya portfolio opens with 40 modern clinic units targeting family medicine, paediatrics, and gynaecology in Kuwait's rapidly growing south.",
    readTime: "2 min read",
  },
  {
    date: "January 2025",
    title: "Al Mazaya Reports Strong Tenant Retention for 2024",
    excerpt: "The group maintained 87% portfolio occupancy despite challenging market conditions, driven by improved maintenance response times and new facility services.",
    readTime: "4 min read",
  },
];

const news = [
  {
    date: "May 2025",
    title: "New Digital Signage Programme Launched Across 8 Towers",
    excerpt: "Mazaya Clinics introduces a tenant-facing digital display service, enabling clinic branding upgrades at competitive rates with a 10-minute AI-powered quoting system.",
    category: "Technology",
  },
  {
    date: "April 2025",
    title: "Vendor Network Expanded to 40 Approved Suppliers",
    excerpt: "The FM team has completed a round of vendor onboarding, adding 12 new empaneled service companies across electrical, HVAC, plumbing, and civil categories.",
    category: "Operations",
  },
  {
    date: "February 2025",
    title: "Patient Footfall Increases 22% at Salmiya Tower",
    excerpt: "Clinic VI in Salmiya records its highest ever monthly patient footfall following a comprehensive signage and lobby directory upgrade completed in January.",
    category: "Property",
  },
];

export default function MediaCenterPage() {
  return (
    <div className="bg-white">
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-200 text-xs uppercase tracking-widest mb-2">Media Center</p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">News & Press Releases</h1>
        </div>
      </div>

      {/* Press Releases */}
      <section id="press" className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading label="PRESS RELEASES" title="Official Statements" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pressReleases.map(({ date, title, excerpt, readTime }) => (
              <article key={title} className="bg-white border border-[#E0E0E0] rounded overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-[#005B41] to-[#007A56] flex items-end p-4">
                  <span className="text-xs text-green-200 bg-black bg-opacity-30 px-2 py-0.5 rounded">
                    {date}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-bold text-sm text-gray-900 mb-2 leading-snug">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{readTime}</span>
                    <button className="text-[#005B41] text-xs font-medium hover:underline">Read more →</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section id="news" className="py-14 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading label="NEWS" title="Latest Updates" />
          <div className="space-y-4">
            {news.map(({ date, title, excerpt, category }) => (
              <article key={title} className="bg-white border border-[#E0E0E0] rounded p-5 flex flex-col sm:flex-row gap-4 hover:shadow-sm transition-shadow">
                <div className="flex-shrink-0 text-right sm:text-left">
                  <div className="text-xs text-gray-400 mb-1">{date}</div>
                  <span className="bg-[#F0F8F5] text-[#005B41] text-xs font-medium px-2 py-0.5 rounded border border-[#005B41]/20">
                    {category}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{excerpt}</p>
                </div>
                <button className="text-[#005B41] text-xs font-medium hover:underline self-start sm:self-center flex-shrink-0">
                  Read →
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
