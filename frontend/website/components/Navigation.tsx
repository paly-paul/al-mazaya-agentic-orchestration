"use client";

import { useState } from "react";
import Link from "next/link";
import { t, Lang } from "@/lib/translations";
import { clinics } from "@/lib/clinicsData";

interface NavProps {
  lang: Lang;
}

interface DropdownItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
}

export default function Navigation({ lang }: NavProps) {
  const tr = t(lang);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { label: tr.nav.home, href: "/" },
    {
      label: tr.nav.about,
      href: "/about",
      dropdown: [
        { label: tr.nav.aboutOverview, href: "/about" },
        { label: tr.nav.aboutProfile, href: "/about#profile" },
        { label: tr.nav.aboutStructure, href: "/about#structure" },
        { label: tr.nav.aboutBoard, href: "/about#board" },
      ],
    },
    {
      label: tr.nav.operations,
      href: "/operations",
      dropdown: [
        { label: tr.nav.operationsAll, href: "/operations" },
        ...clinics.map((c) => ({
          label: `${lang === "ar" ? "كلينيك" : "Clinic"} ${c.romanNumeral} — ${lang === "ar" ? c.nameAr : c.name}`,
          href: `/operations/${c.slug}`,
        })),
      ],
    },
    {
      label: tr.nav.services,
      href: "/services",
      dropdown: [
        { label: tr.nav.servicesLeasing, href: "/services/clinic-space-leasing" },
        { label: tr.nav.servicesFacility, href: "/services/facility-services" },
        { label: tr.nav.servicesMaintenance, href: "/services/maintenance" },
        { label: tr.nav.servicesVendor, href: "/services/vendor-registration" },
      ],
    },
    {
      label: tr.nav.investors,
      href: "/investor-relations",
      dropdown: [
        { label: tr.nav.investorsFinancial, href: "/investor-relations#highlights" },
        { label: tr.nav.investorsAnnouncements, href: "/investor-relations#announcements" },
      ],
    },
    {
      label: tr.nav.media,
      href: "/media-center",
      dropdown: [
        { label: tr.nav.mediaPressReleases, href: "/media-center#press" },
        { label: tr.nav.mediaNews, href: "/media-center#news" },
      ],
    },
    { label: tr.nav.contact, href: "/contact" },
  ];

  return (
    <nav className="bg-[#005B41] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <span className="text-[#005B41] font-bold text-lg font-heading">M</span>
            </div>
            <div className={lang === "ar" ? "text-right" : "text-left"}>
              <div className="font-heading font-bold text-base leading-tight">Mazaya Clinics</div>
              <div className="text-[10px] text-green-200 leading-tight tracking-wider uppercase">
                {lang === "ar" ? "مزايا كلينيك" : "Al Mazaya Holding"}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.href)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-5 text-sm font-medium hover:bg-[#004A36] transition-colors whitespace-nowrap"
                >
                  {item.label}
                  {item.dropdown && (
                    <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
                {item.dropdown && activeDropdown === item.href && (
                  <div className="absolute top-full left-0 bg-white shadow-lg min-w-[220px] z-50 border-t-2 border-[#005B41]">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F0F8F5] hover:text-[#005B41] transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded hover:bg-[#004A36] transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#004A36] py-2">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-[#004A36] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.dropdown && (
                  <div className="bg-[#004A36]">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-8 py-2 text-xs text-green-200 hover:text-white transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
