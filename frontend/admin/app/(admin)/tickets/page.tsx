'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import TableSkeleton from '@/components/TableSkeleton'
import Modal from '@/components/Modal'

interface Ticket {
  id: string
  reference: string
  tower: string
  floor?: string
  category: string
  priority: 'P1' | 'P2' | 'P3' | string
  vendor_name?: string
  vendor_id?: string
  status: string
  sla_deadline?: string
  created_at: string
  description?: string
  location?: string
  requester?: string
  resolved_at?: string
  avg_tat_hrs?: number
}

interface TicketsResponse {
  tickets: Ticket[]
  p1_count: number
  p2_count: number
  p3_count: number
  avg_tat_hrs: number
}

function priorityDot(priority: string) {
  if (priority === 'P1') return <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />P1</span>
  if (priority === 'P2') return <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />P2</span>
  return <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />{priority || 'P3'}</span>
}

function slaColor(deadline?: string) {
  if (!deadline) return { cls: 'text-gray-400', label: '—' }
  const now = Date.now()
  const dl = new Date(deadline).getTime()
  const diffHrs = (dl - now) / 3600000
  if (diffHrs < 0) return { cls: 'text-red-600 font-semibold', label: 'Overdue' }
  if (diffHrs < 2) return { cls: 'text-red-500', label: `${Math.round(diffHrs * 60)}m left` }
  if (diffHrs < 8) return { cls: 'text-amber-600', label: `${Math.round(diffHrs)}h left` }
  return { cls: 'text-green-600', label: `${Math.round(diffHrs)}h left` }
}

const PRIORITY_OPTIONS = ['P1', 'P2', 'P3']
const VENDOR_OPTIONS = ['Auto-assign', 'Al-Badr Electrical', 'Gulf Maintenance Co.', 'Pro-Tech HVAC', 'CleanPro Services']

export default function TicketsPage() {
  const [data, setData] = useState<TicketsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [priorities, setPriorities] = useState<string[]>(['P1', 'P2', 'P3'])
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  const fetchTickets = () => {
    setLoading(true)
    api.get('/api/tickets')
      .then((res) => {
        if (Array.isArray(res)) {
          const p1 = res.filter((t: Ticket) => t.priority === 'P1').length
          const p2 = res.filter((t: Ticket) => t.priority === 'P2').length
          const p3 = res.filter((t: Ticket) => t.priority === 'P3').length
          const tats = res.filter((t: Ticket) => t.avg_tat_hrs).map((t: Ticket) => t.avg_tat_hrs || 0)
          const avgTat = tats.length ? tats.reduce((a: number, b: number) => a + b, 0) / tats.length : 0
          setData({ tickets: res, p1_count: p1, p2_count: p2, p3_count: p3, avg_tat_hrs: avgTat })
        } else if (res && res.tickets) {
          setData(res)
        } else {
          setData({ tickets: [], p1_count: 0, p2_count: 0, p3_count: 0, avg_tat_hrs: 0 })
        }
      })
      .catch(() => setError('Failed to load tickets'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTickets() }, [])

  const handleClose = async (ticketId: string) => {
    setActionLoading(prev => ({ ...prev, [ticketId]: true }))
    try {
      await api.patch(`/api/tickets/${ticketId}/status`, { status: 'closed' })
      setData(prev => prev ? {
        ...prev,
        tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, status: 'closed' } : t)
      } : prev)
      setSelectedTicket(null)
    } catch {
      // ignore
    } finally {
      setActionLoading(prev => ({ ...prev, [ticketId]: false }))
    }
  }

  const handleReassign = async (ticketId: string, vendor: string) => {
    setActionLoading(prev => ({ ...prev, [ticketId]: true }))
    try {
      await api.patch(`/api/tickets/${ticketId}/vendor`, { vendor_name: vendor })
      setData(prev => prev ? {
        ...prev,
        tickets: prev.tickets.map(t => t.id === ticketId ? { ...t, vendor_name: vendor } : t)
      } : prev)
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, vendor_name: vendor } : prev)
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(prev => ({ ...prev, [ticketId]: false }))
    }
  }

  const togglePriority = (p: string) => {
    setPriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const tickets = (data?.tickets || []).filter(t => priorities.includes(t.priority))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Tickets</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage facility maintenance requests</p>
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
            <MetricCard title="P1 Critical" value={data?.p1_count ?? 0} subtitle="Urgent tickets" color="red" />
            <MetricCard title="P2 High" value={data?.p2_count ?? 0} subtitle="High priority" color="amber" />
            <MetricCard title="P3 Normal" value={data?.p3_count ?? 0} subtitle="Standard tickets" color="default" />
            <MetricCard
              title="Avg TAT (hrs)"
              value={typeof data?.avg_tat_hrs === 'number' ? data.avg_tat_hrs.toFixed(1) : '—'}
              subtitle="Average turnaround"
              color={data?.avg_tat_hrs && data.avg_tat_hrs > 24 ? 'red' : 'green'}
            />
          </>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-6">
          <h2 className="text-sm font-semibold text-gray-700">Tickets</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-medium">Filter by priority:</span>
            {PRIORITY_OPTIONS.map(p => (
              <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priorities.includes(p)}
                  onChange={() => togglePriority(p)}
                  className="rounded"
                />
                <span className="text-xs font-medium text-gray-700">{p}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ref</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tower · Floor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SLA Remaining</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-6"><TableSkeleton rows={6} cols={7} /></td></tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No records found</td>
                </tr>
              ) : (
                tickets.map((ticket, idx) => {
                  const sla = slaColor(ticket.sla_deadline)
                  return (
                    <tr
                      key={ticket.id}
                      className={`border-b border-gray-50 hover:bg-green-50 cursor-pointer ${idx % 2 !== 0 ? 'bg-[#F8F7F4]' : ''}`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{ticket.reference || ticket.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {ticket.tower}{ticket.floor ? ` · ${ticket.floor}` : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{ticket.category}</td>
                      <td className="px-4 py-3 text-xs font-medium">{priorityDot(ticket.priority)}</td>
                      <td className="px-4 py-3 text-gray-600">{ticket.vendor_name || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                      <td className={`px-4 py-3 text-xs ${sla.cls}`}>{sla.label}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <Modal open={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Ticket Details" maxWidth="max-w-lg">
        {selectedTicket && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reference</p>
                <p className="font-mono text-sm font-medium text-gray-900">{selectedTicket.reference || selectedTicket.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tower / Floor</p>
                <p className="text-gray-700">{selectedTicket.tower}{selectedTicket.floor ? ` · ${selectedTicket.floor}` : ''}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Priority</p>
                <span className="text-sm">{priorityDot(selectedTicket.priority)}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</p>
                <p className="text-gray-700">{selectedTicket.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vendor</p>
                <p className="text-gray-700">{selectedTicket.vendor_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Requester</p>
                <p className="text-gray-700">{selectedTicket.requester || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">SLA Deadline</p>
                <p className={`text-sm ${slaColor(selectedTicket.sla_deadline).cls}`}>
                  {selectedTicket.sla_deadline
                    ? new Date(selectedTicket.sla_deadline).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </p>
              </div>
              {selectedTicket.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">{selectedTicket.description}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Reassign Vendor</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {VENDOR_OPTIONS.map(vendor => (
                  <button
                    key={vendor}
                    onClick={() => handleReassign(selectedTicket.id, vendor)}
                    disabled={actionLoading[selectedTicket.id]}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {vendor}
                  </button>
                ))}
              </div>
              {selectedTicket.status !== 'closed' && (
                <button
                  onClick={() => handleClose(selectedTicket.id)}
                  disabled={actionLoading[selectedTicket.id]}
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading[selectedTicket.id] ? 'Closing...' : 'Close Ticket'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
