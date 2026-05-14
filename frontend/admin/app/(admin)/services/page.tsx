'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import MetricCard from '@/components/MetricCard'
import StatusBadge from '@/components/StatusBadge'
import TableSkeleton from '@/components/TableSkeleton'
import Modal from '@/components/Modal'

interface ServiceOrder {
  id: string
  reference: string
  clinic?: string
  tower?: string
  service_type: string
  quote_kd?: number
  status: string
  vendor_name?: string
  created_at: string
  description?: string
  requester?: string
  completed_at?: string
}

interface ServicesResponse {
  orders: ServiceOrder[]
  open_count: number
  completed_7d: number
  revenue_7d: number
  avg_quote_time_hrs: number
}

function formatKD(val?: number): string {
  if (val === undefined || val === null) return '—'
  return `KD ${val.toFixed(3)}`
}

export default function ServicesPage() {
  const [data, setData] = useState<ServicesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approvalModal, setApprovalModal] = useState<ServiceOrder | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionResult, setActionResult] = useState<Record<string, 'approved' | 'rejected'>>({})

  const fetchServices = () => {
    setLoading(true)
    api.get('/api/work-orders')
      .then((res) => {
        const orders: ServiceOrder[] = Array.isArray(res) ? res : (res?.orders || res?.work_orders || [])
        const now = Date.now()
        const sevenDaysAgo = now - 7 * 24 * 3600000
        const completed7d = orders.filter(o =>
          (o.status === 'completed' || o.status === 'approved') &&
          o.completed_at && new Date(o.completed_at).getTime() > sevenDaysAgo
        ).length
        const revenue7d = orders
          .filter(o => (o.status === 'completed' || o.status === 'approved') && o.completed_at && new Date(o.completed_at).getTime() > sevenDaysAgo)
          .reduce((s, o) => s + (o.quote_kd || 0), 0)
        const openCount = orders.filter(o => ['pending', 'open', 'quoted', 'in_progress'].includes(o.status)).length
        setData({ orders, open_count: openCount, completed_7d: completed7d, revenue_7d: revenue7d, avg_quote_time_hrs: 4.2 })
      })
      .catch(() => setError('Failed to load service orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchServices() }, [])

  const handleApprove = async (id: string) => {
    setActionLoading(true)
    try {
      await api.patch(`/api/work-orders/${id}/approve`, {})
      setActionResult(prev => ({ ...prev, [id]: 'approved' }))
      setData(prev => prev ? {
        ...prev,
        orders: prev.orders.map(o => o.id === id ? { ...o, status: 'approved' } : o)
      } : prev)
      setApprovalModal(null)
    } catch {
      // ignore
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(true)
    try {
      await api.patch(`/api/work-orders/${id}/reject`, {})
      setActionResult(prev => ({ ...prev, [id]: 'rejected' }))
      setData(prev => prev ? {
        ...prev,
        orders: prev.orders.map(o => o.id === id ? { ...o, status: 'rejected' } : o)
      } : prev)
      setApprovalModal(null)
    } catch {
      // ignore
    } finally {
      setActionLoading(false)
    }
  }

  const orders = data?.orders || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Facility Services</h1>
        <p className="text-sm text-gray-500 mt-0.5">Work orders and facility service requests</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
              <div className="skeleton h-3 w-20 mb-3" /><div className="skeleton h-8 w-16" />
            </div>
          ))
        ) : (
          <>
            <MetricCard title="Open Requests" value={data?.open_count ?? 0} subtitle="Pending / in progress" color="amber" />
            <MetricCard title="Completed (7d)" value={data?.completed_7d ?? 0} subtitle="Last 7 days" color="green" />
            <MetricCard title="Revenue (7d)" value={formatKD(data?.revenue_7d)} subtitle="Work order revenue" color="green" />
            <MetricCard
              title="Avg Quote Time"
              value={data?.avg_quote_time_hrs ? `${data.avg_quote_time_hrs.toFixed(1)}h` : '—'}
              subtitle="Average to first quote"
              color="default"
            />
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Service Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ref</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Clinic / Tower</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Quote (KD)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6"><TableSkeleton rows={6} cols={6} /></td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No records found</td>
                </tr>
              ) : (
                orders.map((order, idx) => {
                  const isPending = order.status === 'pending' || order.status === 'quoted'
                  const finalStatus = actionResult[order.id] || order.status
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-50 ${isPending ? 'hover:bg-amber-50 cursor-pointer' : 'hover:bg-green-50 cursor-pointer'} ${idx % 2 !== 0 ? 'bg-[#F8F7F4]' : ''}`}
                      onClick={() => isPending && !actionResult[order.id] ? setApprovalModal(order) : undefined}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{order.reference || order.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-gray-700">{order.clinic || order.tower || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{order.service_type}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{formatKD(order.quote_kd)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={finalStatus} />
                        {isPending && !actionResult[order.id] && (
                          <span className="ml-1.5 text-xs text-amber-600 font-medium">· click to review</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.vendor_name || '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal open={!!approvalModal} onClose={() => setApprovalModal(null)} title="Review Service Order" maxWidth="max-w-md">
        {approvalModal && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reference</p>
                <p className="font-mono text-sm font-medium">{approvalModal.reference || approvalModal.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <StatusBadge status={approvalModal.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Service Type</p>
                <p className="text-gray-700">{approvalModal.service_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quote (KD)</p>
                <p className="text-gray-700 font-semibold">{formatKD(approvalModal.quote_kd)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                <p className="text-gray-700">{approvalModal.clinic || approvalModal.tower || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vendor</p>
                <p className="text-gray-700">{approvalModal.vendor_name || '—'}</p>
              </div>
              {approvalModal.requester && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Requester</p>
                  <p className="text-gray-700">{approvalModal.requester}</p>
                </div>
              )}
              {approvalModal.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 leading-relaxed">{approvalModal.description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleApprove(approvalModal.id)}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(approvalModal.id)}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
