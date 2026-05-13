"use client";

import { t, Lang } from "@/lib/translations";

interface TopBarProps {
  lang: Lang;
  onLangToggle: () => void;
}

export default function TopBar({ lang, onLangToggle }: TopBarProps) {
  const tr = t(lang);

  return (
    <div className="bg-[#1a1a1a] text-white text-xs py-1.5">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-gray-300">
          <span className="hidden sm:inline">Mazaya Clinics — Kuwait&apos;s Premier Medical Tower Operator</span>
        </div>
        <div className="flex items-center gap-4 text-gray-300">
          <a href="/contact" className="hover:text-white transition-colors">
            {tr.topbar.customerCare}
          </a>
          <span className="text-gray-600">|</span>
          <a href="/contact" className="hover:text-white transition-colors">
            {tr.topbar.contactUs}
          </a>
          <span className="text-gray-600">|</span>
          <a href="#" className="hover:text-white transition-colors">
            {tr.topbar.eLogin}
          </a>
          <span className="text-gray-600">|</span>
          <button
            onClick={onLangToggle}
            className="flex items-center gap-1.5 hover:text-white transition-colors font-medium"
          >
            <span className="text-base">{lang === "en" ? "🇰🇼" : "🇬🇧"}</span>
            <span>{tr.topbar.language}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
