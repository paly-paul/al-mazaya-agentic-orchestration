"use client";

import Link from "next/link";
import { clinics } from "@/lib/clinicsData";
import { useChatContext } from "./chat/ChatProvider";

export default function ServiceLeasingPage() {
  const { openChat } = useChatContext();

  return (
    <div className="bg-white">
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-green-200 text-xs mb-4">
            <Link href="/services" className="hover:text-white">Services</Link> / Clinic Space Leasing
          </nav>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Clinic Space Leasing</h1>
          <p className="text-green-100 mt-3 max-w-xl text-sm">Find Your Ideal Clinic Space</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14 space-y-12">
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
              Mazaya Clinics offers flexible leasing options for specialist practitioners across all 8 towers. Whether you need a compact consultation room or a multi-room specialist suite, we have options to fit your requirements and budget.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Our AI leasing assistant guides you through a qualification process in under 5 minutes, collecting your specialty, size requirements, preferred location, budget, and timeline — and provides an instant match score and tower recommendation.
            </p>
            <button
              onClick={() => openChat("enquiry")}
              className="bg-[#005B41] text-white font-semibold px-6 py-3 rounded hover:bg-[#004A36] transition-colors text-sm shadow"
            >
              💬 Start Your Enquiry Now
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Units Available", value: `${clinics.reduce((a, c) => a + c.availableUnits, 0)}+` },
              { label: "Towers", value: "8" },
              { label: "Price from", value: "KD 700/mo" },
              { label: "Min Size", value: "45 sqm" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F5F5F5] border border-[#E0E0E0] p-5 rounded text-center">
                <div className="font-heading font-bold text-2xl text-[#005B41]">{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div>
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">The Leasing Process</h2>
          <div className="w-10 h-1 bg-[#005B41] mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Chat Enquiry", desc: "Answer 5 quick questions via our AI assistant to determine your best match." },
              { step: "02", title: "Score & Match", desc: "Receive an instant qualification score and tower recommendation." },
              { step: "03", title: "Site Visit", desc: "Our leasing team arranges a guided tour of matching units." },
              { step: "04", title: "Sign & Move In", desc: "Flexible lease terms with fit-out support from day one." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative pl-4 border-l-2 border-[#005B41]">
                <div className="text-xs text-[#005B41] font-bold uppercase tracking-widest mb-1">Step {step}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tower list */}
        <div>
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Available Towers</h2>
          <div className="w-10 h-1 bg-[#005B41] mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clinics.map((c) => (
              <Link
                key={c.id}
                href={`/operations/${c.slug}`}
                className="border border-[#E0E0E0] rounded p-4 hover:border-[#005B41] hover:shadow-sm transition-all group"
              >
                <div className="font-semibold text-sm text-gray-900 group-hover:text-[#005B41]">
                  Clinic {c.romanNumeral} — {c.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">{c.location}</div>
                <div className="text-xs text-[#005B41] font-medium mt-2">{c.availableUnits} units · {c.priceRange}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
