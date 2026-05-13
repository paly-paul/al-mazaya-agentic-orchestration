"use client";

import Link from "next/link";
import { useChatContext } from "./chat/ChatProvider";

const SERVICES = [
  { icon: "📺", title: "Digital Display / LED Screen", sizes: ["32\"", "43\"", "55\"", "Custom"], priceFrom: "KD 160" },
  { icon: "🪧", title: "Clinic Signage", types: ["Door sign", "Waiting area", "Lobby directory", "Multiple"], priceFrom: "KD 95" },
  { icon: "🧱", title: "Partition Walls", types: ["Standard", "Glass partition", "With door"], priceFrom: "KD 55/sqm" },
  { icon: "💡", title: "Lighting Upgrade", types: ["Per fixture", "Full area", "Design included"], priceFrom: "KD 35/fixture" },
  { icon: "📷", title: "CCTV / Security Cameras", types: ["2-camera", "4-camera", "Full coverage"], priceFrom: "KD 85/camera" },
];

export default function ServiceFacilityPage() {
  const { openChat } = useChatContext();

  return (
    <div className="bg-white">
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-green-200 text-xs mb-4">
            <Link href="/services" className="hover:text-white">Services</Link> / Facility Services
          </nav>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Facility Services</h1>
          <p className="text-green-100 mt-3 max-w-xl text-sm">Upgrade Your Clinic Space</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14 space-y-12">
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
              Our AI-powered facility services system lets you request upgrades, installations, and fit-out work with a quick indicative quote generated in under 10 minutes. No need to call or wait — describe what you need and receive a line-item quote instantly.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Quotes under KD 500 are auto-approved and scheduled within 3–5 working days. Larger quotes go to our FM manager for review with a 2-hour turnaround guarantee.
            </p>
            <button
              onClick={() => openChat("facility")}
              className="bg-[#005B41] text-white font-semibold px-6 py-3 rounded hover:bg-[#004A36] transition-colors text-sm shadow"
            >
              💬 Request a Service Now
            </button>
          </div>
          <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">How It Works</h3>
            <ol className="space-y-3">
              {[
                "Open the chat assistant and select &quot;Request service&quot;",
                "Specify the service type and dimensions / requirements",
                "Receive an itemised quote in under 10 minutes",
                "Confirm your order — vendor assigned automatically",
                "Track progress and receive completion notification",
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

        {/* Services */}
        <div>
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Available Services</h2>
          <div className="w-10 h-1 bg-[#005B41] mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(({ icon, title, sizes, types, priceFrom }) => (
              <div key={title} className="border border-[#E0E0E0] rounded p-5 hover:border-[#005B41] hover:shadow-sm transition-all">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(sizes ?? types ?? []).map((v) => (
                    <span key={v} className="text-xs bg-[#F0F8F5] text-[#005B41] px-2 py-0.5 rounded border border-[#005B41]/20">
                      {v}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  Starting from <span className="font-semibold text-[#005B41]">{priceFrom}</span>
                </div>
              </div>
            ))}
            <div
              className="border-2 border-dashed border-[#005B41] rounded p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F0F8F5] transition-colors"
              onClick={() => openChat("facility")}
            >
              <div className="text-3xl mb-2">💬</div>
              <div className="font-semibold text-[#005B41] text-sm mb-1">Other / Custom</div>
              <div className="text-xs text-gray-500">Describe your requirement to our AI assistant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
