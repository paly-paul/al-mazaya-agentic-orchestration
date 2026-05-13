import Link from "next/link";
import { t, Lang } from "@/lib/translations";

interface FooterProps {
  lang: Lang;
}

export default function Footer({ lang }: FooterProps) {
  const tr = t(lang);

  return (
    <footer className="bg-[#1a1a1a] text-[#CCCCCC]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1 — Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#005B41] rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg font-heading">M</span>
              </div>
              <div>
                <div className="font-heading font-bold text-white text-base">Mazaya Clinics</div>
                <div className="text-[10px] text-gray-400 tracking-wider uppercase">Al Mazaya Holding</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">{tr.footer.description}</p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="text-white font-semibold uppercase text-sm tracking-wider mb-4 pb-2 border-b border-gray-700">
              {tr.footer.quickLinks}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: tr.footer.home, href: "/" },
                { label: tr.footer.about, href: "/about" },
                { label: tr.footer.operations, href: "/operations" },
                { label: tr.footer.services, href: "/services" },
                { label: tr.footer.investors, href: "/investor-relations" },
                { label: tr.footer.contact, href: "/contact" },
                { label: tr.footer.vendorReg, href: "/vendor-registration" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#005B41] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h3 className="text-white font-semibold uppercase text-sm tracking-wider mb-4 pb-2 border-b border-gray-700">
              {tr.footer.contactTitle}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-400">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#005B41]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {tr.footer.address}
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4 flex-shrink-0 text-[#005B41]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {tr.footer.phone}
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4 flex-shrink-0 text-[#005B41]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {tr.footer.email}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>{tr.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">{tr.footer.privacy}</Link>
            <Link href="/sitemap" className="hover:text-gray-300 transition-colors">{tr.footer.sitemap}</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">{tr.footer.relatedSites}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
