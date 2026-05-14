'use client';

import { useState } from 'react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Clinics', href: '#clinics' },
  { label: 'Contact', href: '#contact' },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: '#005B41' }}
            >
              M
            </div>
            <span className="font-semibold text-lg text-gray-900 group-hover:text-[#005B41] transition-colors">
              Mazaya Clinics
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#005B41] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#005B41] transition-all group-hover:w-full" />
              </a>
            ))}
            <a
              href="#contact"
              className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#005B41' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#007A58')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#005B41')}
            >
              Get in Touch
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#005B41] hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-[#005B41] hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-white mt-2"
              style={{ backgroundColor: '#005B41' }}
            >
              Get in Touch
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
