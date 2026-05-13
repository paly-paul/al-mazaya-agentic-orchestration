"use client";

import Link from "next/link";
import { t } from "@/lib/translations";
import { clinics } from "@/lib/clinicsData";
import HeroBanner from "./HeroBanner";
import SectionHeading from "./SectionHeading";
import ClinicCard from "./ClinicCard";
import { useChatContext } from "./chat/ChatProvider";

export default function HomePage() {
  const { openChat, lang } = useChatContext();
  const tr = t(lang);

  return (
    <>
      {/* Hero */}
      <HeroBanner lang={lang} onEnquire={() => openChat("enquiry")} />

      {/* Clinics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            label={tr.clinics.sectionLabel}
            title={tr.clinics.sectionTitle}
            description={tr.clinics.sectionDesc}
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                lang={lang}
                onEnquire={() => openChat("enquiry")}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/operations"
              className="inline-flex items-center gap-2 border border-[#005B41] text-[#005B41] font-medium px-6 py-2.5 rounded hover:bg-[#F0F8F5] transition-colors text-sm"
            >
              {lang === "en" ? "View All Towers" : "عرض جميع الأبراج"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading
                label={tr.about.sectionLabel}
                title={tr.about.sectionTitle}
              />
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                {tr.about.body}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-[#005B41] text-white font-medium px-6 py-2.5 rounded hover:bg-[#004A36] transition-colors text-sm"
              >
                {tr.about.learnMore}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "8", label: lang === "en" ? "Clinic Towers" : "أبراج العيادات", color: "#005B41" },
                { num: "200+", label: lang === "en" ? "Active Clinics" : "عيادات نشطة", color: "#005B41" },
                { num: "KD 116M", label: lang === "en" ? "Investment Assets" : "الأصول الاستثمارية", color: "#004A36" },
                { num: "87%", label: lang === "en" ? "Occupancy Rate" : "نسبة الإشغال", color: "#004A36" },
              ].map(({ num, label, color }) => (
                <div
                  key={label}
                  className="bg-white border border-[#E0E0E0] p-6 rounded text-center shadow-sm"
                >
                  <div className="font-heading font-bold text-2xl md:text-3xl mb-1" style={{ color }}>
                    {num}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            label={tr.services.sectionLabel}
            title={tr.services.sectionTitle}
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: tr.services.leasing.title,
                desc: tr.services.leasing.desc,
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                href: "/services/clinic-space-leasing",
                onClick: () => openChat("enquiry"),
              },
              {
                title: tr.services.facility.title,
                desc: tr.services.facility.desc,
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                href: "/services/facility-services",
                onClick: () => openChat("facility"),
              },
              {
                title: tr.services.maintenance.title,
                desc: tr.services.maintenance.desc,
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                href: "/services/maintenance",
                onClick: () => openChat("maintenance"),
              },
              {
                title: tr.services.vendor.title,
                desc: tr.services.vendor.desc,
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                href: "/services/vendor-registration",
                onClick: () => openChat("vendor"),
              },
            ].map(({ title, desc, icon, onClick }) => (
              <div
                key={title}
                className="bg-white border border-[#E0E0E0] p-6 rounded group hover:shadow-md transition-shadow"
              >
                <div className="text-[#005B41] mb-4">{icon}</div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
                <button
                  onClick={onClick}
                  className="text-[#005B41] text-sm font-medium hover:underline flex items-center gap-1"
                >
                  {lang === "en" ? "Get started →" : "ابدأ الآن →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-[#005B41]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
            {lang === "en" ? "Ready to Open Your Clinic?" : "هل أنت مستعد لفتح عيادتك؟"}
          </h2>
          <p className="text-green-100 mb-8 text-sm md:text-base max-w-xl mx-auto">
            {lang === "en"
              ? "Talk to our AI assistant now and get a lead qualification score in under 5 minutes."
              : "تحدث مع مساعدنا الذكي الآن واحصل على تقييم أولي في أقل من 5 دقائق."}
          </p>
          <button
            onClick={() => openChat("enquiry")}
            className="bg-white text-[#005B41] font-semibold px-8 py-3 rounded hover:bg-green-50 transition-colors shadow-md text-sm"
          >
            {lang === "en" ? "💬 Start Your Enquiry" : "💬 ابدأ استفسارك"}
          </button>
        </div>
      </section>
    </>
  );
}
