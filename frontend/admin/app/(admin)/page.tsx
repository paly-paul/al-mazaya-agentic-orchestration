'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { api } from '@/lib/api'
import MetricCard from '@/components/MetricCard'

interface DashboardStats {
  open_tickets: number
  avg_tat_hrs: number
  lead_pipeline: number
  active_vendors: number
  chat_sessions: number
  sla_compliance_pct: number
  tickets_by_tower: Array<{ tower: string; count: number }>
  leads_by_score_tier: Array<{ tier: string; count: number }>
  tickets_by_priority: Array<{ priority: string; count: number }>
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-3 w-32" />
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then((data) => {
        setStats(data)
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time operations overview</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <MetricCard
              title="Open Tickets"
              value={stats.open_tickets ?? 0}
              subtitle="Active maintenance tickets"
              color={stats.open_tickets > 20 ? 'red' : stats.open_tickets > 10 ? 'amber' : 'default'}
            />
            <MetricCard
              title="Avg TAT (hrs)"
              value={typeof stats.avg_tat_hrs === 'number' ? stats.avg_tat_hrs.toFixed(1) : '—'}
              subtitle="Average turnaround time"
              color={stats.avg_tat_hrs > 24 ? 'red' : stats.avg_tat_hrs > 12 ? 'amber' : 'green'}
            />
            <MetricCard
              title="Lead Pipeline"
              value={stats.lead_pipeline ?? 0}
              subtitle="Total active leads"
              color="default"
            />
            <MetricCard
              title="Active Vendors"
              value={stats.active_vendors ?? 0}
              subtitle="Currently active vendors"
              color="green"
            />
            <MetricCard
              title="Chat Sessions"
              value={stats.chat_sessions ?? 0}
              subtitle="Live chat sessions today"
              color="default"
            />
            <MetricCard
              title="SLA Compliance"
              value={typeof stats.sla_compliance_pct === 'number' ? `${stats.sla_compliance_pct.toFixed(1)}%` : '—'}
              subtitle="Within SLA targets"
              color={stats.sla_compliance_pct >= 90 ? 'green' : stats.sla_compliance_pct >= 70 ? 'amber' : 'red'}
            />
          </>
        ) : null}
      </div>

      {/* Charts */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by Tower */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Tickets by Tower
            </h2>
            {stats.tickets_by_tower && stats.tickets_by_tower.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stats.tickets_by_tower}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tower" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#005B41" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
                No tower data available
              </div>
            )}
          </div>

          {/* Leads by Score Tier + Tickets by Priority */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Leads by Score Tier
              </h2>
              {stats.leads_by_score_tier && stats.leads_by_score_tier.length > 0 ? (
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={stats.leads_by_score_tier} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#005B41" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[110px] flex items-center justify-center text-gray-400 text-sm">
                  No tier data available
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Tickets by Priority
              </h2>
              {stats.tickets_by_priority && stats.tickets_by_priority.length > 0 ? (
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={stats.tickets_by_priority} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[110px] flex items-center justify-center text-gray-400 text-sm">
                  No priority data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading chart placeholders */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="skeleton h-4 w-32 mb-4" />
              <div className="skeleton h-[260px] w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
