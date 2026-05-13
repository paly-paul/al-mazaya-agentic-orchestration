"use client";

import Link from "next/link";
import { useChatContext } from "./chat/ChatProvider";

const CATEGORIES = [
  "Electrical", "Plumbing / MEP", "HVAC", "Civil / Fit-out",
  "Digital Signage", "Cleaning", "Security / CCTV", "Pest Control",
];

const BENEFITS = [
  { icon: "📋", title: "Structured Job Cards", desc: "Receive digital job cards with full specifications, location, and deadline." },
  { icon: "📊", title: "Performance Scoring", desc: "Transparent score system: +5 on-time, −10 late, −30 no-show. Improve your ranking." },
  { icon: "💼", title: "Steady Pipeline", desc: "Access maintenance and fit-out work across 200+ active clinics in 8 towers." },
  { icon: "⚡", title: "Fast Dispatch", desc: "AI-powered matching dispatches jobs to best-matched vendor within 45 minutes of ticket creation." },
];

export default function VendorRegistrationPage() {
  const { openChat } = useChatContext();

  return (
    <div className="bg-white">
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Vendor Registration</h1>
          <p className="text-green-100 mt-3 max-w-xl text-sm">
            Join the Mazaya Empaneled Supplier Network
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14 space-y-12">
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">Why Join the Mazaya Network?</h2>
            <div className="w-10 h-1 bg-[#005B41] mb-5" />
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Register your technical services company to receive job cards for maintenance, fit-out, signage, and facility upgrade projects across all 8 Mazaya Clinic towers. Our AI-powered dispatch system connects you with jobs matching your category and coverage area.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              All vendors start with an initial score of 70/100 and can improve through consistent on-time delivery. The scoring system ensures fair, performance-based job allocation.
            </p>
            <button
              onClick={() => openChat("vendor")}
              className="bg-[#005B41] text-white font-semibold px-8 py-3 rounded hover:bg-[#004A36] transition-colors text-sm shadow-md"
            >
              🤝 Register as a Vendor
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Registration takes approx. 5 minutes via our AI assistant.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {BENEFITS.map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#F5F5F5] border border-[#E0E0E0] p-4 rounded">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-semibold text-sm text-gray-900 mb-1">{title}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Service Categories</h2>
          <div className="w-10 h-1 bg-[#005B41] mb-5" />
          <p className="text-gray-500 text-sm mb-4">We accept vendors across the following categories (multi-category registration allowed):</p>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="border border-[#E0E0E0] rounded px-4 py-2 text-sm text-gray-700 bg-[#F5F5F5]">
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Registration steps */}
        <div>
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Registration Process</h2>
          <div className="w-10 h-1 bg-[#005B41] mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { n: "1", title: "Chat Registration", desc: "Provide company name, service categories, tower coverage, contact details, and trade licence number via the AI assistant." },
              { n: "2", title: "FM Review", desc: "Our FM team verifies your trade licence and reviews your application within 24 hours." },
              { n: "3", title: "Approval & Activation", desc: "Once approved, your vendor profile goes ACTIVE with an initial score of 70/100. You start receiving job cards." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="border border-[#E0E0E0] rounded p-5 relative">
                <div className="w-8 h-8 rounded-full bg-[#005B41] text-white text-sm font-bold flex items-center justify-center mb-3">
                  {n}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#005B41] rounded p-8 text-white text-center">
          <h2 className="font-heading font-bold text-xl mb-3">Ready to Join?</h2>
          <p className="text-green-100 text-sm mb-6 max-w-lg mx-auto">
            Start your vendor registration now via our AI assistant. It takes approximately 5 minutes to complete.
          </p>
          <button
            onClick={() => openChat("vendor")}
            className="bg-white text-[#005B41] font-semibold px-8 py-3 rounded hover:bg-green-50 transition-colors shadow text-sm"
          >
            🤝 Start Registration
          </button>
        </div>
      </div>
    </div>
  );
}
