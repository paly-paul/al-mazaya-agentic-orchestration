"use client";

import Link from "next/link";
import { useChatContext } from "./chat/ChatProvider";

export default function ServicesPage() {
  const { openChat } = useChatContext();

  const services = [
    {
      icon: "🏥",
      title: "Clinic Space Leasing",
      desc: "Flexible lease terms for specialist clinic spaces across all 8 towers. From small consultation rooms to large multi-specialty suites. Guided qualification via our AI assistant.",
      href: "/services/clinic-space-leasing",
      cta: "Find a Space",
      onClick: () => openChat("enquiry"),
    },
    {
      icon: "🔧",
      title: "Facility Services",
      desc: "Digital signage, LED displays, partition walls, lighting upgrades, CCTV — all managed through our AI-powered service request system with instant indicative quotes.",
      href: "/services/facility-services",
      cta: "Request a Service",
      onClick: () => openChat("facility"),
    },
    {
      icon: "🛠️",
      title: "Maintenance",
      desc: "24/7 maintenance support with SLA-backed response times. P1 Critical: 2-hour response. P2 Operational: 8 hours. P3 Routine: 48 hours. All tickets tracked in real-time.",
      href: "/services/maintenance",
      cta: "Report an Issue",
      onClick: () => openChat("maintenance"),
    },
    {
      icon: "🤝",
      title: "Vendor Registration",
      desc: "Join our empaneled supplier network. Receive structured job cards for maintenance and fit-out work across all towers. Performance-scored and accountable.",
      href: "/services/vendor-registration",
      cta: "Register Now",
      onClick: () => openChat("vendor"),
    },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-200 text-xs uppercase tracking-widest mb-2">Services</p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Comprehensive Clinic Solutions</h1>
          <p className="text-green-100 mt-3 max-w-xl text-sm">
            Everything your clinic needs — space, services, maintenance, and vendor connections.
          </p>
        </div>
      </div>

      {/* Services grid */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map(({ icon, title, desc, href, cta, onClick }) => (
              <div key={title} className="bg-white border border-[#E0E0E0] rounded-sm p-8 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{icon}</div>
                <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">{title}</h2>
                <div className="w-8 h-1 bg-[#005B41] mb-4" />
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{desc}</p>
                <div className="flex gap-3">
                  <button
                    onClick={onClick}
                    className="bg-[#005B41] text-white text-sm font-medium px-5 py-2 rounded hover:bg-[#004A36] transition-colors"
                  >
                    {cta}
                  </button>
                  <Link
                    href={href}
                    className="border border-[#005B41] text-[#005B41] text-sm font-medium px-5 py-2 rounded hover:bg-[#F0F8F5] transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
