"use client";

import Link from "next/link";
import { Clinic } from "@/lib/clinicsData";
import { useChatContext } from "./chat/ChatProvider";

interface Props {
  clinic: Clinic;
}

export default function ClinicDetailPage({ clinic }: Props) {
  const { openChat } = useChatContext();

  return (
    <div className="bg-white">
      {/* Header */}
      <div
        className="text-white py-14"
        style={{ background: `linear-gradient(135deg, #003828 0%, ${clinic.colorAccent} 50%, #007A56 100%)` }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-green-200 text-xs mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/operations" className="hover:text-white">Operations</Link>
            <span>/</span>
            <span className="text-white">Clinic {clinic.romanNumeral}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="text-green-200 text-xs uppercase tracking-widest mb-2">
                Clinic {clinic.romanNumeral}
              </p>
              <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">{clinic.name}</h1>
              <p className="text-green-100 flex items-center gap-1.5 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {clinic.location}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openChat("enquiry")}
                className="bg-white text-[#005B41] font-semibold px-6 py-2.5 rounded hover:bg-green-50 transition-colors shadow text-sm"
              >
                Enquire for Space
              </button>
              <Link
                href="/contact"
                className="border border-white text-white font-semibold px-6 py-2.5 rounded hover:bg-white hover:bg-opacity-10 transition-colors text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">About This Tower</h2>
              <div className="w-10 h-1 bg-[#005B41] mb-4" />
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{clinic.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">Tower Features</h2>
              <div className="w-10 h-1 bg-[#005B41] mb-4" />
              <ul className="space-y-2">
                {clinic.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-600 text-sm">
                    <svg className="w-4 h-4 text-[#005B41] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specialties */}
            <div>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">Available Specialties</h2>
              <div className="w-10 h-1 bg-[#005B41] mb-4" />
              <div className="flex flex-wrap gap-2">
                {clinic.specialties.map((s) => (
                  <span key={s} className="bg-[#F0F8F5] text-[#005B41] text-sm px-3 py-1 rounded-full border border-[#005B41]/20 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Image placeholder */}
            <div>
              <h2 className="font-heading font-bold text-xl text-gray-900 mb-3">Gallery</h2>
              <div className="w-10 h-1 bg-[#005B41] mb-4" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded overflow-hidden flex items-center justify-center text-white text-xs"
                    style={{
                      background: `linear-gradient(135deg, ${clinic.colorAccent}aa, ${clinic.colorAccent}44)`,
                    }}
                  >
                    <span className="opacity-60">{clinic.name} · {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick facts */}
            <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded p-5">
              <h3 className="font-heading font-bold text-base text-gray-900 mb-4">Tower Details</h3>
              {[
                { label: "Floors", value: clinic.floors },
                { label: "Total Units", value: String(clinic.totalUnits) },
                { label: "Available Units", value: String(clinic.availableUnits) },
                { label: "Price Range", value: clinic.priceRange },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0 text-sm">
                  <span className="text-gray-500 font-medium">{label}</span>
                  <span className="text-gray-900 font-semibold">{value}</span>
                </div>
              ))}
            </div>

            {/* Availability */}
            <div className="bg-[#005B41] text-white rounded p-5">
              <div className="text-3xl font-heading font-bold mb-1">{clinic.availableUnits}</div>
              <div className="text-green-200 text-sm mb-4">Units Currently Available</div>
              <button
                onClick={() => openChat("enquiry")}
                className="w-full bg-white text-[#005B41] font-semibold py-2.5 rounded hover:bg-green-50 transition-colors text-sm"
              >
                Enquire for Space
              </button>
            </div>

            {/* Contact */}
            <div className="bg-white border border-[#E0E0E0] rounded p-5">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Leasing Team</h3>
              <p className="text-gray-500 text-xs mb-3">
                Our AI leasing assistant is available 24/7. For direct contact:
              </p>
              <a href="tel:+96521234567" className="flex items-center gap-2 text-[#005B41] text-sm font-medium hover:underline mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +965 2XXX XXXX
              </a>
              <a href="mailto:leasing@mazayaclinics.com" className="flex items-center gap-2 text-[#005B41] text-sm font-medium hover:underline">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                leasing@mazayaclinics.com
              </a>
            </div>

            {/* Navigation */}
            <div className="bg-white border border-[#E0E0E0] rounded p-5">
              <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Other Towers</h3>
              <Link href="/operations" className="text-[#005B41] text-sm hover:underline flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                View all 8 towers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
