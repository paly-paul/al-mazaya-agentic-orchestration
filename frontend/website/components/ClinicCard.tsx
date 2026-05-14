interface ClinicCardProps {
  name: string;
  description: string;
  tower: string;
  icon?: string;
}

export default function ClinicCard({ name, description, tower, icon }: ClinicCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Tower badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: '#005B41' }}
        >
          {tower}
        </div>
        <div className="text-2xl">{icon || '🏥'}</div>
      </div>

      {/* Clinic name */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#005B41] transition-colors">
        {name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <button
          className="text-sm font-medium transition-colors flex items-center gap-1"
          style={{ color: '#005B41' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#007A58')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#005B41')}
        >
          Learn more
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
