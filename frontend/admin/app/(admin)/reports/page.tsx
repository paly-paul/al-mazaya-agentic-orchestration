'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';

interface ReportData {
  leads_this_week: number;
  tickets_resolved: number;
  service_revenue_kd: number;
  avg_vendor_score: number;
  weekly_resolution: { day: string; resolved: number }[];
  lead_funnel: { stage: string; count: number }[];
}

const FUNNEL_COLORS = ['#005B41', '#0F6E56', '#854F0B', '#A32D2D'];
const DAY_COLOR = '#005B41';

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await api.getReports(params) as ReportData;
      setData(res);
    } catch {
      // use mock data for demo
      setData({
        leads_this_week: 14,
        tickets_resolved: 38,
        service_revenue_kd: 4280,
        avg_vendor_score: 78,
        weekly_resolution: [
          { day: 'Mon', resolved: 8 },
          { day: 'Tue', resolved: 5 },
          { day: 'Wed', resolved: 9 },
          { day: 'Thu', resolved: 7 },
          { day: 'Fri', resolved: 6 },
          { day: 'Sat', resolved: 3 },
          { day: 'Sun', resolved: 0 },
        ],
        lead_funnel: [
          { stage: 'Enquiries', count: 48 },
          { stage: 'Qualified', count: 31 },
          { stage: 'Proposal', count: 12 },
          { stage: 'Converted', count: 5 },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader
        title="Reports"
        sub="Weekly and monthly operational analytics"
        action={
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ width: 140 }}
            />
            <span className="text-[#6B6B65] text-sm">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ width: 140 }}
            />
            <button
              className="btn-secondary text-xs opacity-40 cursor-not-allowed"
              title="Available in Phase 2"
            >
              Push to Power BI
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#005B41] border-t-transparent" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard label="Leads this week" value={data.leads_this_week} accent="#005B41" />
            <MetricCard label="Tickets resolved" value={data.tickets_resolved} accent="#0F6E56" />
            <MetricCard label="Service revenue (KD)" value={data.service_revenue_kd.toFixed(0)} accent="#005B41" />
            <MetricCard label="Avg vendor score" value={data.avg_vendor_score} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Weekly resolution */}
            <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65] mb-4">
                Weekly Ticket Resolution Rate
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.weekly_resolution} margin={{ bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E8E5DF', borderRadius: 6 }} />
                  <Bar dataKey="resolved" fill={DAY_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lead funnel */}
            <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65] mb-4">
                Lead Conversion Funnel
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.lead_funnel} margin={{ bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E8E5DF', borderRadius: 6 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.lead_funnel.map((_entry, i) => (
                      <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
