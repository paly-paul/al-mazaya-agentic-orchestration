interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeading({ label, title, description, centered = false, light = false }: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${centered ? "text-center" : ""}`}>
      {label && (
        <p className={`text-xs font-semibold uppercase tracking-[0.15em] mb-2 ${light ? "text-green-200" : "text-[#005B41]"}`}>
          {label}
        </p>
      )}
      <h2 className={`font-heading font-bold text-2xl md:text-3xl mb-3 ${light ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      <div className={`w-12 h-1 ${light ? "bg-green-400" : "bg-[#005B41]"} ${centered ? "mx-auto" : ""} mb-4`} />
      {description && (
        <p className={`text-sm md:text-base leading-relaxed max-w-2xl ${centered ? "mx-auto" : ""} ${light ? "text-green-100" : "text-gray-600"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
