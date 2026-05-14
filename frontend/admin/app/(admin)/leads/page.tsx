'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import TableSkeleton from '@/components/TableSkeleton'
import Modal from '@/components/Modal'

interface Lead {
  id: string
  name: string
  specialty?: string
  tower_preference?: string
  score: number
  source?: string
  status: string
  assigned_to?: string
  created_at: string
  phone?: string
  email?: string
  notes?: string
  unit_type?: string
}

interface LeadsResponse {
  leads: Lead[]
  total: number
  hot_count: number
  warm_count: number
  avg_score: number
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-700 font-semibold'
  if (score >= 40) return 'text-amber-600 font-semibold'
  return 'text-gray-400 font-semibold'
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-green-100'
  if (score >= 40) return 'bg-amber-100'
  return 'bg-gray-100'
}

const AGENT_OPTIONS = ['Unassigned', 'Sarah Al-Ahmad', 'Mohammed Al-Rashid', 'Fatima Al-Zahra', 'Ahmed Hassan']
const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'cold']

export default function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [assignDropdown, setAssignDropdown] = useState<string | null>(null)
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)
  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  const fetchLeads = () => {
    setLoading(true)
    api.get('/api/leads')
      .then((res) => {
        if (Array.isArray(res)) {
          // API returned plain array
          const hot = res.filter((l: Lead) => l.score >= 70).length
          const warm = res.filter((l: Lead) => l.score >= 40 && l.score < 70).length
          const avg = res.length ? Math.round(res.reduce((s: number, l: Lead) => s + (l.score || 0), 0) / res.length) : 0
          setData({ leads: res, total: res.length, hot_count: hot, warm_count: warm, avg_score: avg })
        } else if (res && res.leads) {
          setData(res)
        } else {
          setData({ leads: [], total: 0, hot_count: 0, warm_count: 0, avg_score: 0 })
        }
      })
      .catch(() => setError('Failed to load leads'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLeads() }, [])

  const handleAssign = async (leadId: string, agent: string) => {
    setUpdating(prev => ({ ...prev, [leadId]: true }))
    try {
      await api.patch(`/api/leads/${leadId}/assign`, { assigned_to: agent })
      setData(prev => prev ? {
        ...prev,
        leads: prev.leads.map(l => l.id === leadId ? { ...l, assigned_to: agent } : l)
      } : prev)
    } catch {
      // ignore
    } finally {
      setUpdating(prev => ({ ...prev, [leadId]: false }))
      setAssignDropdown(null)
    }
  }

  const handleStatusUpdate = async (leadId: string, status: string) => {
    setUpdating(prev => ({ ...prev, [leadId]: true }))
    try {
      await api.patch(`/api/leads/${leadId}/status`, { status })
      setData(prev => prev ? {
        ...prev,
        leads: prev.leads.map(l => l.id === leadId ? { ...l, status } : l)
      } : prev)
    } catch {
      // ignore
    } finally {
      setUpdating(prev => ({ ...prev, [leadId]: false }))
      setStatusDropdown(null)
    }
  }

  const leads = data?.leads || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage prospect leads</p>
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
            <MetricCard title="Hot Leads" value={data?.hot_count ?? 0} subtitle="Score ≥ 70" color="red" />
            <MetricCard title="Warm Leads" value={data?.warm_count ?? 0} subtitle="Score 40–69" color="amber" />
            <MetricCard title="Avg Score" value={data?.avg_score ?? 0} subtitle="All active leads" color="default" />
            <MetricCard title="Total Pipeline" value={data?.total ?? 0} subtitle="All tracked leads" color="green" />
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Specialty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tower</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-6"><TableSkeleton rows={6} cols={9} /></td></tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={`border-b border-gray-50 hover:bg-green-50 cursor-pointer ${idx % 2 === 0 ? '' : 'bg-[#F8F7F4]'}`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.specialty || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.tower_preference || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${scoreBg(lead.score)} ${scoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.source || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setStatusDropdown(statusDropdown === lead.id ? null : lead.id)}
                          className="hover:opacity-80"
                        >
                          <StatusBadge status={lead.status} />
                        </button>
                        {statusDropdown === lead.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[130px]">
                            {STATUS_OPTIONS.map(s => (
                              <button
                                key={s}
                                onClick={() => handleStatusUpdate(lead.id, s)}
                                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 capitalize"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{lead.assigned_to || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(lead.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setAssignDropdown(assignDropdown === lead.id ? null : lead.id)}
                          disabled={updating[lead.id]}
                          className="px-2.5 py-1 rounded text-xs font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Assign
                        </button>
                        {assignDropdown === lead.id && (
                          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[170px]">
                            {AGENT_OPTIONS.map(agent => (
                              <button
                                key={agent}
                                onClick={() => handleAssign(lead.id, agent)}
                                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                              >
                                {agent}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <Modal open={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Details" maxWidth="max-w-lg">
        {selectedLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                <p className="font-medium text-gray-900">{selectedLead.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <StatusBadge status={selectedLead.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                <p className="text-gray-700">{selectedLead.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-gray-700">{selectedLead.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Specialty</p>
                <p className="text-gray-700">{selectedLead.specialty || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tower Preference</p>
                <p className="text-gray-700">{selectedLead.tower_preference || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unit Type</p>
                <p className="text-gray-700">{selectedLead.unit_type || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Score</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${scoreBg(selectedLead.score)} ${scoreColor(selectedLead.score)}`}>
                  {selectedLead.score}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Source</p>
                <p className="text-gray-700">{selectedLead.source || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Assigned To</p>
                <p className="text-gray-700">{selectedLead.assigned_to || 'Unassigned'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Created</p>
                <p className="text-gray-700">
                  {new Date(selectedLead.created_at).toLocaleString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {selectedLead.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Click outside handler for dropdowns */}
      {(assignDropdown || statusDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setAssignDropdown(null); setStatusDropdown(null) }}
        />
      )}
    </div>
  )
}
