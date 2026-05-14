'use client'

import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts'
import MetricCard from '@/components/MetricCard'

const weeklyResolutionData = [
  { day: 'Mon', resolved: 12, opened: 9 },
  { day: 'Tue', resolved: 18, opened: 14 },
  { day: 'Wed', resolved: 15, opened: 11 },
  { day: 'Thu', resolved: 22, opened: 16 },
  { day: 'Fri', resolved: 8, opened: 7 },
  { day: 'Sat', resolved: 5, opened: 3 },
  { day: 'Sun', resolved: 10, opened: 8 },
]

const leadFunnelData = [
  { stage: 'Inquiries', count: 240 },
  { stage: 'Qualified', count: 156 },
  { stage: 'Proposal', count: 89 },
  { stage: 'Negotiation', count: 42 },
  { stage: 'Won', count: 21 },
]

const slaComplianceData = [
  { week: 'Wk 1', compliance: 87 },
  { week: 'Wk 2', compliance: 91 },
  { week: 'Wk 3', compliance: 84 },
  { week: 'Wk 4', compliance: 93 },
  { week: 'Wk 5', compliance: 89 },
  { week: 'Wk 6', compliance: 95 },
]

const vendorPerformanceData = [
  { vendor: 'Al-Badr', score: 88 },
  { vendor: 'Gulf Maint', score: 74 },
  { vendor: 'Pro-Tech', score: 91 },
  { vendor: 'CleanPro', score: 67 },
  { vendor: 'SecureNet', score: 82 },
]

export default function ReportsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Operations performance analytics and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
            Period: Last 6 weeks (PoC mock data)
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Resolution Rate" value="89%" subtitle="Tickets resolved on time" color="green" />
        <MetricCard title="Lead Conversion" value="8.75%" subtitle="Inquiries to won" color="default" />
        <MetricCard title="Avg SLA Score" value="90%" subtitle="6-week average" color="green" />
        <MetricCard title="Vendor Avg Score" value="80.4" subtitle="Portfolio average" color="amber" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Resolution Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
            Weekly Ticket Resolution
          </h2>
          <p className="text-xs text-gray-400 mb-5">Opened vs resolved per day (current week)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyResolutionData} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="resolved" name="Resolved" fill="#005B41" radius={[4, 4, 0, 0]} />
              <Bar dataKey="opened" name="Opened" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
            Lead Conversion Funnel
          </h2>
          <p className="text-xs text-gray-400 mb-5">Pipeline stage breakdown (last 30 days)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leadFunnelData} layout="vertical" margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" name="Leads" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Compliance Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
            SLA Compliance Trend
          </h2>
          <p className="text-xs text-gray-400 mb-5">Weekly SLA compliance percentage</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={slaComplianceData} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Compliance']} />
              <Line
                type="monotone"
                dataKey="compliance"
                stroke="#005B41"
                strokeWidth={2.5}
                dot={{ fill: '#005B41', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
            Vendor Performance Scores
          </h2>
          <p className="text-xs text-gray-400 mb-5">Top vendors by performance score</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vendorPerformanceData} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="vendor" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v, 'Score']} />
              <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]}>
                {vendorPerformanceData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.score >= 80 ? '#005B41' : entry.score >= 65 ? '#F59E0B' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        Note: This is a PoC — charts use mock data. Connect to the backend analytics API for live data.
      </p>
    </div>
  )
}
