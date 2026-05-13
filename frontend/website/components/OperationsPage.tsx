"use client";

import SectionHeading from "./SectionHeading";
import ClinicCard from "./ClinicCard";
import { clinics } from "@/lib/clinicsData";
import { useChatContext } from "./chat/ChatProvider";

export default function OperationsPage() {
  const { openChat } = useChatContext();

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-200 text-xs uppercase tracking-widest mb-2">Operations</p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Medical Clinics — Ready for Rent</h1>
          <p className="text-green-100 mt-3 max-w-xl text-sm">
            8 premium clinic towers across Kuwait&apos;s major districts. Modern spaces for specialist practitioners.
          </p>
        </div>
      </div>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            label="ALL TOWERS"
            title="Mazaya Clinic Portfolio"
            description="Explore all 8 towers. Click 'Enquire for Space' on any card to begin your qualification with our AI leasing assistant."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                lang="en"
                onEnquire={() => openChat("enquiry")}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
