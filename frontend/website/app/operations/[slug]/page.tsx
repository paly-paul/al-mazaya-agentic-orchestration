import { notFound } from "next/navigation";
import { clinics, getClinicBySlug } from "@/lib/clinicsData";
import ClinicDetailPage from "@/components/ClinicDetailPage";

export async function generateStaticParams() {
  return clinics.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const clinic = getClinicBySlug(params.slug);
  if (!clinic) return { title: "Not Found" };
  return {
    title: `Clinic ${clinic.romanNumeral} — ${clinic.name} | Mazaya Clinics`,
    description: clinic.description,
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const clinic = getClinicBySlug(params.slug);
  if (!clinic) notFound();
  return <ClinicDetailPage clinic={clinic} />;
}
