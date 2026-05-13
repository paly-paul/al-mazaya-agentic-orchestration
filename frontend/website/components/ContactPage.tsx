"use client";

import { useState } from "react";
import SectionHeading from "./SectionHeading";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white">
      <div className="bg-[#005B41] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-200 text-xs uppercase tracking-widest mb-2">Contact</p>
          <h1 className="font-heading font-bold text-3xl md:text-4xl">Get in Touch</h1>
          <p className="text-green-100 mt-3 max-w-xl text-sm">We&apos;ll respond within 24 hours.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <SectionHeading label="SEND US A MESSAGE" title="Contact Form" />
            {submitted ? (
              <div className="bg-[#F0F8F5] border border-[#005B41]/30 rounded p-8 text-center">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">Message Received!</h3>
                <p className="text-gray-600 text-sm">
                  Thank you for reaching out. Our team will respond to your enquiry within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-[#005B41] text-sm hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#005B41] focus:ring-1 focus:ring-[#005B41]"
                      placeholder="Dr. Ahmad Al-Hassan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#005B41] focus:ring-1 focus:ring-[#005B41]"
                      placeholder="doctor@clinic.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#005B41] focus:ring-1 focus:ring-[#005B41]"
                      placeholder="+965 XXXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Subject *
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#005B41] focus:ring-1 focus:ring-[#005B41] text-gray-700"
                    >
                      <option value="">Select subject...</option>
                      <option>Clinic Space Enquiry</option>
                      <option>Maintenance Issue</option>
                      <option>Facility Services</option>
                      <option>Vendor Registration</option>
                      <option>Investor Relations</option>
                      <option>Media / Press</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#005B41] focus:ring-1 focus:ring-[#005B41] resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#005B41] text-white font-semibold px-6 py-2.5 rounded hover:bg-[#004A36] transition-colors text-sm shadow"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-[#F5F5F5] border border-[#E0E0E0] rounded p-6">
              <h3 className="font-heading font-bold text-base text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: "📍", label: "Address", value: "Al Mazaya Tower, Kuwait City, Kuwait" },
                  { icon: "📞", label: "Phone", value: "+965 2XXX XXXX" },
                  { icon: "📧", label: "Email", value: "info@mazayaclinics.com" },
                  { icon: "🕐", label: "Hours", value: "Sun – Thu, 8:00 AM – 5:00 PM" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</div>
                      <div className="text-gray-700">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#005B41] text-white rounded p-6">
              <h3 className="font-heading font-bold text-sm mb-2">Need Immediate Help?</h3>
              <p className="text-green-100 text-xs mb-4">Our AI assistant is available 24/7 for leasing enquiries, maintenance requests, and service quotes.</p>
              <p className="text-green-200 text-xs">Use the &quot;Talk to Us&quot; button on the bottom-right of this page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
