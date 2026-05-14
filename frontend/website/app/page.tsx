import NavBar from '@/components/NavBar';
import ClinicCard from '@/components/ClinicCard';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

const clinics = [
  {
    name: 'Clinic III',
    description:
      'A modern multi-specialty clinic offering general medicine, dermatology, and diagnostic services in a comfortable environment.',
    tower: 'Tower III',
    icon: '🏥',
  },
  {
    name: 'Clinic IV',
    description:
      'Specialising in dental care, ophthalmology, and ENT services with state-of-the-art equipment and experienced specialists.',
    tower: 'Tower IV',
    icon: '🦷',
  },
  {
    name: 'Clinic V',
    description:
      'A leading physiotherapy and rehabilitation centre, supporting patient recovery with personalised treatment plans.',
    tower: 'Tower V',
    icon: '💪',
  },
  {
    name: 'Clinic VI Tower A',
    description:
      'Premium cosmetic and aesthetic medicine services, including dermatology consultations and non-surgical procedures.',
    tower: 'Tower VI-A',
    icon: '✨',
  },
  {
    name: 'Clinic VI Tower B',
    description:
      'Comprehensive women's health and maternity services, paediatric care, and family medicine under one roof.',
    tower: 'Tower VI-B',
    icon: '👶',
  },
  {
    name: 'Medical Centre',
    description:
      'The flagship Medical Centre — a full-service outpatient facility with specialist consultations, laboratory, and imaging.',
    tower: 'Medical Centre',
    icon: '🩺',
  },
];

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    title: 'Prime Kuwait City Location',
    description:
      'Situated in the heart of Kuwait City, Mazaya offers unparalleled access across 8 landmark towers — minutes from major highways and public transport.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: 'World-Class Facilities',
    description:
      'Every clinic at Mazaya is purpose-built to international healthcare standards, equipped with the latest medical technology and designed for patient comfort.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: 'Dedicated FM Support',
    description:
      'Our professional Facility Management team ensures seamless operations — from maintenance and cleaning to vendor coordination — so clinicians can focus on care.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7F4' }}>
      <NavBar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ backgroundColor: '#005B41' }}
      >
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Kuwait City's Leading Medical Complex
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Kuwait&apos;s Premier
            <br />
            <span className="text-emerald-300">Medical Clinic</span> Destination
          </h1>

          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Eight landmark towers. World-class facilities. A single destination for healthcare excellence
            in the heart of Kuwait City.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#clinics"
              className="inline-flex items-center gap-2 bg-white font-semibold px-6 py-3 rounded-xl transition-all hover:bg-gray-50 hover:shadow-md"
              style={{ color: '#005B41' }}
            >
              Explore Our Clinics
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:bg-white/10"
            >
              Contact Us
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: '8', label: 'Towers' },
              { value: '50+', label: 'Specialties' },
              { value: '24/7', label: 'FM Support' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl py-4 px-2 border border-white/15">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/70 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinics Section */}
      <section id="clinics" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#005B41' }}>
              Our Locations
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Clinics Across the Complex
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From specialised dental care to full-service outpatient facilities, find the clinic that meets your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => (
              <ClinicCard
                key={clinic.name}
                name={clinic.name}
                description={clinic.description}
                tower={clinic.tower}
                icon={clinic.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Mazaya Section */}
      <section id="why" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#005B41' }}>
              Our Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Why Choose Mazaya?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              More than just a location — a complete ecosystem designed for healthcare excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-start p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#F8F7F4' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
                  style={{ backgroundColor: '#005B41' }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#005B41' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Interested in a Clinic Space?
          </h2>
          <p className="text-white/80 mb-8">
            Chat with our AI assistant to explore availability, submit a maintenance request, or register as a vendor — all in one place.
          </p>
          <button
            onClick={() => {
              // Trigger ChatWidget to open — dispatched as a custom event
              window.dispatchEvent(new CustomEvent('mazaya:open-chat'));
            }}
            className="inline-flex items-center gap-2 bg-white font-semibold px-6 py-3 rounded-xl transition-all hover:bg-gray-50"
            style={{ color: '#005B41' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Talk to Our Assistant
          </button>
        </div>
      </section>

      <Footer />

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
