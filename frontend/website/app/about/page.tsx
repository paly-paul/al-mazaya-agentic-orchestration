import SectionHeading from "@/components/SectionHeading";

export const metadata = {
  title: "About Us — Mazaya Clinics",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-200 text-xs uppercase tracking-widest mb-2">About Us</p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Al Mazaya Holding Co. KSCP</h1>
        </div>
      </div>

      {/* Overview */}
      <section id="overview" className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading label="OVERVIEW" title="Who We Are" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-4">
              <p>
                Al Mazaya Holding Co. KSCP is a publicly listed Kuwaiti real estate company managing a diversified portfolio of investment properties valued at KD 116M. Established with a mission to develop world-class real estate solutions, we specialize in purpose-built medical clinic towers that serve Kuwait&apos;s growing healthcare sector.
              </p>
              <p>
                Our Mazaya Clinics portfolio represents Kuwait&apos;s largest network of dedicated medical clinic towers, offering modern, fully-serviced spaces to specialist practitioners across all major districts of Kuwait.
              </p>
              <p>
                We believe that world-class healthcare starts with world-class facilities. By providing premium clinic spaces with full facility management support, we enable Kuwait&apos;s finest medical professionals to focus entirely on patient care.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Established", value: "2005" },
                { label: "Listed on", value: "KSE" },
                { label: "Investment Assets", value: "KD 116M" },
                { label: "Clinic Towers", value: "8" },
                { label: "Active Clinics", value: "200+" },
                { label: "Group Headcount", value: "94" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F5F5F5] p-5 rounded border border-[#E0E0E0]">
                  <div className="font-heading font-bold text-xl text-[#005B41]">{value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Al Mazaya Profile */}
      <section id="profile" className="py-14 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading label="PROFILE" title="Al Mazaya Holding" />
          <div className="prose prose-sm max-w-none text-gray-600">
            <p className="text-sm md:text-base leading-relaxed mb-4">
              Al Mazaya Holding was founded in 2005 with a focus on Kuwait&apos;s specialized real estate sector. Over two decades, we have built the country&apos;s most comprehensive network of purpose-built medical facilities, establishing ourselves as the trusted partner for Kuwait&apos;s specialist medical community.
            </p>
            <p className="text-sm md:text-base leading-relaxed mb-4">
              Our portfolio of eight clinic towers spans all major residential and commercial districts — from Al Jabriya and Hawally in the core urban zone, to Jahra in the western governorate and Sabah Al Salem in the south. This geographic spread ensures that Mazaya Clinics serves patients and practitioners across the full breadth of Kuwait.
            </p>
            <p className="text-sm md:text-base leading-relaxed">
              The company is listed on the Kuwait Stock Exchange (KSE) and governed by a board that combines deep real estate expertise with medical sector understanding.
            </p>
          </div>
        </div>
      </section>

      {/* Group Structure */}
      <section id="structure" className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading label="STRUCTURE" title="Group Structure" />
          <div className="flex justify-center">
            <div className="text-center space-y-4 max-w-lg w-full">
              {[
                { name: "Al Mazaya Holding Co. KSCP", sub: "Parent Listed Company — KSE", color: "#005B41", textColor: "white" },
                { name: "Mazaya Clinics (Subsidiary)", sub: "8 Clinic Tower Operations", color: "#004A36", textColor: "white" },
                { name: "FM Operations Unit", sub: "Maintenance · Vendors · Services", color: "#F5F5F5", textColor: "#1a1a1a" },
              ].map(({ name, sub, color, textColor }, i) => (
                <div key={name} className="relative">
                  {i > 0 && (
                    <div className="flex justify-center mb-2">
                      <div className="w-0.5 h-6 bg-gray-300" />
                    </div>
                  )}
                  <div
                    className="py-4 px-6 rounded border text-center mx-auto max-w-xs"
                    style={{ backgroundColor: color, borderColor: color === "#F5F5F5" ? "#E0E0E0" : color, color: textColor }}
                  >
                    <div className="font-semibold text-sm">{name}</div>
                    <div className="text-xs opacity-80 mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Board of Directors */}
      <section id="board" className="py-14 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading label="GOVERNANCE" title="Board of Directors" centered />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { name: "H.E. Sheikh Khalid Al Mazaya", role: "Chairman" },
              { name: "Eng. Ahmed Al-Rashidi", role: "Vice Chairman" },
              { name: "Mr. Faisal Al-Mutairi", role: "Managing Director" },
              { name: "Dr. Nadia Al-Hassan", role: "Independent Director" },
              { name: "Mr. Yousef Al-Abdullah", role: "Independent Director" },
            ].map(({ name, role }) => (
              <div key={name} className="bg-white border border-[#E0E0E0] p-5 rounded text-center hover:shadow-sm transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#005B41] text-white flex items-center justify-center text-xl font-heading font-bold mx-auto mb-3">
                  {name.split(" ").find(w => /^[A-Z]/.test(w) && w !== "H.E.")?.charAt(0) ?? name.charAt(0)}
                </div>
                <div className="font-semibold text-sm text-gray-900 mb-1">{name}</div>
                <div className="text-xs text-[#005B41] font-medium">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
