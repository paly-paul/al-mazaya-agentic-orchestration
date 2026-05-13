"use client";

import Link from "next/link";
import { Clinic } from "@/lib/clinicsData";
import { Lang, t } from "@/lib/translations";

interface ClinicCardProps {
  clinic: Clinic;
  lang: Lang;
  onEnquire?: (clinicId: string) => void;
}

export default function ClinicCard({ clinic, lang, onEnquire }: ClinicCardProps) {
  const tr = t(lang);
  const name = lang === "ar" ? clinic.nameAr : clinic.name;
  const location = lang === "ar" ? clinic.locationAr : clinic.location;
  const description = lang === "ar" ? clinic.descriptionAr : clinic.description;
  const floors = lang === "ar" ? clinic.floorsAr : clinic.floors;
  const specialties = lang === "ar" ? clinic.specialtiesAr : clinic.specialties;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image placeholder */}
      <div className="relative h-48 overflow-hidden" style={{ background: `linear-gradient(135deg, ${clinic.colorAccent}dd 0%, ${clinic.colorAccent}88 100%)` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-5xl font-heading font-bold opacity-30">{clinic.romanNumeral}</div>
          <div className="text-lg font-heading font-semibold mt-1 text-center px-4">{name}</div>
        </div>
        {/* Tower label */}
        <div className="absolute top-3 left-3 bg-white bg-opacity-90 text-[#005B41] text-xs font-semibold px-2 py-1 rounded">
          {lang === "ar" ? `كلينيك ${clinic.romanNumeral}` : `Clinic ${clinic.romanNumeral}`}
        </div>
        {/* Available badge */}
        {clinic.availableUnits > 0 && (
          <div className="absolute top-3 right-3 bg-[#005B41] text-white text-xs px-2 py-1 rounded">
            {clinic.availableUnits} {tr.clinics.available}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">{name}</h3>
        <p className="text-[#005B41] text-sm font-medium mb-3 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{description}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {specialties.slice(0, 3).map((s) => (
            <span key={s} className="bg-[#F0F8F5] text-[#005B41] text-xs px-2 py-0.5 rounded-full border border-[#005B41]/20">
              {s}
            </span>
          ))}
          {specialties.length > 3 && (
            <span className="text-gray-400 text-xs px-2 py-0.5">+{specialties.length - 3}</span>
          )}
        </div>

        <div className="text-xs text-gray-500 mb-4 space-y-1">
          <div><span className="font-medium text-gray-700">{tr.clinics.floors}:</span> {floors}</div>
          <div><span className="font-medium text-gray-700">{tr.clinics.priceRange}:</span> {lang === "ar" ? clinic.priceRangeAr : clinic.priceRange}</div>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <button
            onClick={() => onEnquire?.(clinic.id)}
            className="flex-1 bg-[#005B41] text-white text-sm font-medium py-2 px-3 rounded hover:bg-[#004A36] transition-colors text-center"
          >
            {tr.clinics.enquire}
          </button>
          <Link
            href={`/operations/${clinic.slug}`}
            className="flex-1 border border-[#005B41] text-[#005B41] text-sm font-medium py-2 px-3 rounded hover:bg-[#F0F8F5] transition-colors text-center"
          >
            {tr.clinics.viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
}
