'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import TableSkeleton from '@/components/TableSkeleton'
import Modal from '@/components/Modal'

interface Vendor {
  id: string
  name: string
  category: string
  towers?: string[]
  score: number
  jobs_30d?: number
  status: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  onboarded_at?: string
  notes?: string
}

interface VendorsResponse {
  vendors: Vendor[]
  total: number
  onboarding_count: number
  below_threshold: number
  avg_score: number
}

interface NewVendorForm {
  name: string
  category: string
  towers: string
  contact_name: string
  contact_phone: string
  contact_email: string
}

function scoreBar(score: number) {
  const color = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-semibold ${score >= 70 ? 'text-green-700' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
        {score}
      </span>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

const INITIAL_FORM: NewVendorForm = {
  name: '',
  category: '',
  towers: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
}

const CATEGORY_OPTIONS = ['Electrical', 'Plumbing', 'HVAC', 'Cleaning', 'Security', 'Pest Control', 'Civil Works', 'Other']

export default function VendorsPage() {
  const [data, setData] = useState<VendorsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showOnboard, setShowOnboard] = useState(false)
  const [form, setForm] = useState<NewVendorForm>(INITIAL_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [suspendLoading, setSuspendLoading] = useState(false)

  const fetchVendors = () => {
    setLoading(true)
    api.get('/api/vendors')
      .then((res) => {
        const vendors: Vendor[] = Array.isArray(res) ? res : (res?.vendors || [])
        const onboarding = vendors.filter(v => v.status === 'onboarding').length
        const belowThreshold = vendors.filter(v => v.score < 50).length
        const avg = vendors.length ? Math.round(vendors.reduce((s, v) => s + (v.score || 0), 0) / vendors.length) : 0
        setData({ vendors, total: vendors.length, onboarding_count: onboarding, below_threshold: belowThreshold, avg_score: avg })
      })
      .catch(() => setError('Failed to load vendors'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVendors() }, [])

  const handleFormChange = (field: keyof NewVendorForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      await api.post('/api/vendors', {
        name: form.name,
        category: form.category,
        towers: form.towers.split(',').map(t => t.trim()).filter(Boolean),
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        status: 'onboarding',
        score: 0,
      })
      setShowOnboard(false)
      setForm(INITIAL_FORM)
      fetchVendors()
    } catch {
      setFormError('Failed to create vendor. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSuspend = async (vendorId: string) => {
    setSuspendLoading(true)
    try {
      await api.patch(`/api/vendors/${vendorId}/suspend`, { status: 'suspended' })
      setData(prev => prev ? {
        ...prev,
        vendors: prev.vendors.map(v => v.id === vendorId ? { ...v, status: 'suspended' } : v)
      } : prev)
      setSelectedVendor(prev => prev ? { ...prev, status: 'suspended' } : prev)
    } catch {
      // ignore
    } finally {
      setSuspendLoading(false)
    }
  }

  const vendors = data?.vendors || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Registry</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage service provider vendors</p>
        </div>
        <button
          onClick={() => setShowOnboard(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2"
          style={{ backgroundColor: '#005B41' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Onboard New Vendor
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
              <div className="skeleton h-3 w-20 mb-3" /><div className="skeleton h-8 w-12" />
            </div>
          ))
        ) : (
          <>
            <MetricCard title="Total Vendors" value={data?.total ?? 0} subtitle="All registered vendors" color="default" />
            <MetricCard title="Onboarding" value={data?.onboarding_count ?? 0} subtitle="Pending approval" color="amber" />
            <MetricCard title="Below Threshold" value={data?.below_threshold ?? 0} subtitle="Score < 50" color="red" />
            <MetricCard title="Average Score" value={data?.avg_score ?? 0} subtitle="Performance score" color={data?.avg_score && data.avg_score >= 70 ? 'green' : 'amber'} />
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Vendors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Towers</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Jobs (30d)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6"><TableSkeleton rows={6} cols={6} /></td></tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No records found</td>
                </tr>
              ) : (
                vendors.map((vendor, idx) => (
                  <tr
                    key={vendor.id}
                    className={`border-b border-gray-50 hover:bg-green-50 cursor-pointer ${idx % 2 !== 0 ? 'bg-[#F8F7F4]' : ''}`}
                    onClick={() => setSelectedVendor(vendor)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{vendor.name}</td>
                    <td className="px-4 py-3 text-gray-600">{vendor.category}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {vendor.towers && vendor.towers.length > 0
                        ? vendor.towers.join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{scoreBar(vendor.score ?? 0)}</td>
                    <td className="px-4 py-3 text-gray-600">{vendor.jobs_30d ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={vendor.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Detail Modal */}
      <Modal open={!!selectedVendor} onClose={() => setSelectedVendor(null)} title="Vendor Details" maxWidth="max-w-lg">
        {selectedVendor && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                <p className="font-semibold text-gray-900">{selectedVendor.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <StatusBadge status={selectedVendor.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</p>
                <p className="text-gray-700">{selectedVendor.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Score</p>
                {scoreBar(selectedVendor.score ?? 0)}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contact Name</p>
                <p className="text-gray-700">{selectedVendor.contact_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-gray-700">{selectedVendor.contact_phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                <p className="text-gray-700">{selectedVendor.contact_email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jobs (30d)</p>
                <p className="text-gray-700">{selectedVendor.jobs_30d ?? '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Towers Covered</p>
                <p className="text-gray-700">
                  {selectedVendor.towers && selectedVendor.towers.length > 0
                    ? selectedVendor.towers.join(', ')
                    : '—'}
                </p>
              </div>
              {selectedVendor.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 leading-relaxed">{selectedVendor.notes}</p>
                </div>
              )}
            </div>
            {selectedVendor.status !== 'suspended' && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleSuspend(selectedVendor.id)}
                  disabled={suspendLoading}
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {suspendLoading ? 'Suspending...' : 'Suspend Vendor'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Onboard Modal */}
      <Modal open={showOnboard} onClose={() => { setShowOnboard(false); setForm(INITIAL_FORM); setFormError('') }} title="Onboard New Vendor" maxWidth="max-w-lg">
        <form onSubmit={handleOnboard} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
              <input
                required
                value={form.name}
                onChange={e => handleFormChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={form.category}
                onChange={e => handleFormChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white"
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Towers (comma-separated)</label>
              <input
                value={form.towers}
                onChange={e => handleFormChange('towers', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                placeholder="T1, T2, T3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
              <input
                required
                value={form.contact_name}
                onChange={e => handleFormChange('contact_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                required
                value={form.contact_phone}
                onChange={e => handleFormChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                placeholder="+965 xxxx xxxx"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                value={form.contact_email}
                onChange={e => handleFormChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                placeholder="vendor@example.com"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowOnboard(false); setForm(INITIAL_FORM); setFormError('') }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#005B41' }}
            >
              {formLoading ? 'Creating...' : 'Onboard Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
