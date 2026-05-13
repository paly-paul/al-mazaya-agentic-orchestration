"use client";

import Link from "next/link";
import { useChatContext } from "./chat/ChatProvider";

const PRIORITY_LEVELS = [
  { code: "P1", label: "Critical", color: "#dc2626", bg: "#fef2f2", sla: "2-hour SLA", examples: "Fire system, structural flooding, total power failure, medical gas" },
  { code: "P2", label: "Operational", color: "#d97706", bg: "#fffbeb", sla: "8-hour SLA", examples: "HVAC failure, partial electrical, plumbing leak, lift out of service" },
  { code: "P3", label: "Routine", color: "#16a34a", bg: "#f0fdf4", sla: "48-hour SLA", examples: "Minor civil, cleaning, non-critical electrical, pest control" },
];

const ISSUE_TYPES = ["Air conditioning / HVAC", "Electrical fault", "Plumbing / water", "Lift / elevator", "Fire system", "Medical gas", "Civil / structural", "Cleaning / pest", "Other"];

export default function ServiceMaintenancePage() {
  const { openChat } = useChatContext();

  return (
    <div className="bg-white">
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-green-200 text-xs mb-4">
            <Link href="/services" className="hover:text-white">Services</Link> / Maintenance
          </nav>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Maintenance</h1>
          <p className="text-green-100 mt-3 max-w-xl text-sm">24/7 SLA-backed maintenance across all 8 towers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14 space-y-12">
        {/* Intro + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
              Report maintenance issues directly through our AI chat assistant. Issues are automatically classified by priority and dispatched to an empaneled vendor within minutes. Track your ticket status in real-time and receive proactive updates.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Every ticket receives a reference number (e.g., MX-2407), a priority tier, and an assigned vendor — all communicated immediately via the chat interface.
            </p>
            <button
              onClick={() => openChat("maintenance")}
              className="bg-[#005B41] text-white font-semibold px-6 py-3 rounded hover:bg-[#004A36] transition-colors text-sm shadow"
            >
              🛠️ Report a Maintenance Issue
            </button>
          </div>
          <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">What Happens When You Submit</h3>
            <ol className="space-y-3">
              {[
                "AI classifies issue type and assigns priority (P1/P2/P3)",
                "Ticket reference number issued immediately (e.g. MX-2407)",
                "Best-matched empaneled vendor selected and dispatched",
                "Vendor accepts within 30-minute window or escalation triggered",
                "3 status updates sent: assigned, en route, completed",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-[#005B41] text-white text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Priority levels */}
        <div>
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Priority Levels & SLAs</h2>
          <div className="w-10 h-1 bg-[#005B41] mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRIORITY_LEVELS.map(({ code, label, color, bg, sla, examples }) => (
              <div key={code} className="border rounded p-5" style={{ borderColor: color, backgroundColor: bg }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm px-2 py-0.5 rounded text-white" style={{ backgroundColor: color }}>
                    {code}
                  </span>
                  <span className="font-semibold text-gray-900">{label}</span>
                </div>
                <div className="font-bold text-sm mb-2" style={{ color }}>{sla}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{examples}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Issue types */}
        <div>
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Issue Categories</h2>
          <div className="w-10 h-1 bg-[#005B41] mb-6" />
          <div className="flex flex-wrap gap-2">
            {ISSUE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => openChat("maintenance")}
                className="border border-[#E8E5DF] text-gray-700 text-sm px-4 py-2 rounded-full hover:border-[#005B41] hover:text-[#005B41] hover:bg-[#F0F8F5] transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
