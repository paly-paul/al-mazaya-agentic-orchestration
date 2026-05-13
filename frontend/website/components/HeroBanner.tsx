"use client";

import { Lang, t } from "@/lib/translations";

interface HeroBannerProps {
  lang: Lang;
  onEnquire?: () => void;
}

export default function HeroBanner({ lang, onEnquire }: HeroBannerProps) {
  const tr = t(lang);

  return (
    <section
      className="relative min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #003828 0%, #005B41 40%, #007A56 70%, #003020 100%)",
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)",
          }}
        />
      </div>

      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute right-20 bottom-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="max-w-2xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 text-green-200 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white border-opacity-20">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            {lang === "ar" ? "مساحات متاحة الآن" : "Spaces Available Now"}
          </div>

          <h1 className="font-heading font-bold text-3xl md:text-5xl text-white leading-tight mb-6">
            {tr.hero.headline}
          </h1>
          <p className="text-green-100 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            {tr.hero.subheadline}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mb-8 text-white">
            {[
              { num: "8", label: lang === "ar" ? "أبراج" : "Towers" },
              { num: "200+", label: lang === "ar" ? "عيادات" : "Clinics" },
              { num: "87%", label: lang === "ar" ? "إشغال" : "Occupied" },
              { num: "KD 116M", label: lang === "ar" ? "أصول" : "Assets" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="font-heading font-bold text-2xl text-white">{num}</div>
                <div className="text-xs text-green-200 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onEnquire}
              className="bg-white text-[#005B41] font-semibold px-6 py-3 rounded hover:bg-green-50 transition-colors shadow-md text-sm"
            >
              {tr.hero.ctaEnquire}
            </button>
            <a
              href="/operations"
              className="border border-white text-white font-semibold px-6 py-3 rounded hover:bg-white hover:bg-opacity-10 transition-colors text-sm"
            >
              {tr.hero.ctaLearnMore}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L1440 60L1440 30C1200 0 960 60 720 30C480 0 240 60 0 30L0 60Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
