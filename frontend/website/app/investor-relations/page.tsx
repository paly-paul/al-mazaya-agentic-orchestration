import SectionHeading from "@/components/SectionHeading";

export const metadata = { title: "Investor Relations — Mazaya Clinics" };

export default function InvestorRelationsPage() {
  const highlights = [
    { label: "Total Assets", value: "KD 116M" },
    { label: "Revenue (2024)", value: "KD 8.4M" },
    { label: "Portfolio Occupancy", value: "87%" },
    { label: "Operating Towers", value: "8" },
    { label: "Active Clinics", value: "200+" },
    { label: "SLA Compliance", value: "91%" },
  ];

  const announcements = [
    { date: "May 2025", title: "Q1 2025 Operational Results", type: "Financial", desc: "Revenue of KD 2.1M for Q1 2025, representing a 4.2% improvement over Q4 2024. Occupancy remained stable at 87%." },
    { date: "April 2025", title: "New Vendor Onboarding System Launch", type: "Operations", desc: "Al Mazaya Holding launches AI-powered vendor onboarding and dispatch system across all 8 clinic towers." },
    { date: "March 2025", title: "Clinic VIII — Sabah Al Salem Grand Opening", type: "Corporate", desc: "The newest tower in the Mazaya portfolio opens with 40 modern clinic units targeting family and paediatric medicine." },
    { date: "February 2025", title: "Annual Tenant Satisfaction Survey Results", type: "Operations", desc: "87% tenant satisfaction rate recorded across the portfolio, with maintenance responsiveness scoring highest improvement." },
  ];

  const typeColor: Record<string, string> = {
    Financial: "#16a34a",
    Operations: "#d97706",
    Corporate: "#005B41",
  };

  return (
    <div className="bg-white">
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-200 text-xs uppercase tracking-widest mb-2">Investor Relations</p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Transparent Reporting for Our Shareholders</h1>
        </div>
      </div>

      {/* Financial highlights */}
      <section id="highlights" className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading label="FINANCIALS" title="Financial Highlights" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {highlights.map(({ label, value }) => (
              <div key={label} className="bg-[#F5F5F5] border border-[#E0E0E0] p-5 rounded text-center">
                <div className="font-heading font-bold text-xl text-[#005B41]">{value}</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">{label}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded p-6 text-sm text-gray-500 italic">
            All figures as of Q1 2025. Al Mazaya Holding Co. KSCP is listed on the Kuwait Stock Exchange (KSE). Full annual report available upon request.
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section id="announcements" className="py-14 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading label="ANNOUNCEMENTS" title="Latest Announcements" />
          <div className="space-y-4">
            {announcements.map(({ date, title, type, desc }) => (
              <div key={title} className="bg-white border border-[#E0E0E0] rounded p-6 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="text-xs text-gray-400 mb-1">{date}</div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: typeColor[type] ?? "#6b7280" }}
                  >
                    {type}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
