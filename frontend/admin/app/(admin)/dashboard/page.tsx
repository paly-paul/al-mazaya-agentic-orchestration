'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';
import { api } from '@/lib/api';
import MetricCard from '@/components/MetricCard';
import PageHeader from '@/components/PageHeader';
import type { DashboardStats } from '@/lib/types';

const TOWER_COLORS = ['#005B41', '#0F6E56', '#1A8A6E', '#2CA285', '#3DB89A', '#52CEAF', '#6DE4C4', '#88FAD9'];
const SCORE_COLORS: Record<string, string> = { hot: '#005B41', warm: '#854F0B', cold: '#6B6B65' };
const PRIORITY_COLORS: Record<string, string> = { P1: '#A32D2D', P2: '#854F0B', P3: '#0F6E56' };

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.getDashboardStats() as DashboardStats;
      setStats(data);
    } catch {
      // silently ignore for demo
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#005B41] border-t-transparent" />
      </div>
    );
  }

  const s: DashboardStats = stats ?? {
    open_tickets: 0, avg_tat_hours: 0, lead_pipeline_count: 0,
    active_vendors: 0, chat_sessions_today: 0, sla_compliance_pct: 0,
    tickets_by_tower: [], leads_by_score_tier: { hot: 0, warm: 0, cold: 0 },
    tickets_by_priority: { P1: 0, P2: 0, P3: 0 },
  };

  const scoreData = [
    { name: 'Hot', value: s.leads_by_score_tier.hot },
    { name: 'Warm', value: s.leads_by_score_tier.warm },
    { name: 'Cold', value: s.leads_by_score_tier.cold },
  ];

  const priorityData = [
    { name: 'P1', value: s.tickets_by_priority.P1 },
    { name: 'P2', value: s.tickets_by_priority.P2 },
    { name: 'P3', value: s.tickets_by_priority.P3 },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        sub={`Live operational overview · refreshes every 30 s`}
      />

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <MetricCard label="Open Tickets" value={s.open_tickets} href="/tickets"
          accent={s.open_tickets > 5 ? '#A32D2D' : '#1A1A18'} />
        <MetricCard label="Avg TAT" value={`${s.avg_tat_hours.toFixed(1)} hrs`} href="/tickets" />
        <MetricCard label="Lead Pipeline" value={s.lead_pipeline_count} href="/leads"
          accent="#005B41" />
        <MetricCard label="Active Vendors" value={s.active_vendors} href="/vendors" />
        <MetricCard label="Chat Sessions Today" value={s.chat_sessions_today} href="/chats" />
        <MetricCard label="SLA Compliance" value={`${s.sla_compliance_pct}%`} href="/tickets"
          accent={s.sla_compliance_pct < 80 ? '#A32D2D' : s.sla_compliance_pct < 90 ? '#854F0B' : '#0F6E56'} />
      </div>

      {/* 2 Bar Charts */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Ticket Volume by Tower */}
        <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65] mb-4">
            Ticket Volume by Tower
          </div>
          {s.tickets_by_tower.length === 0 ? (
            <div className="text-[#6B6B65] text-sm py-8 text-center">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={s.tickets_by_tower} layout="vertical" margin={{ left: 16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0EDE8" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B6B65' }} />
                <YAxis type="category" dataKey="tower" tick={{ fontSize: 11, fill: '#6B6B65' }} width={72} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: '1px solid #E8E5DF', borderRadius: 6 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer"
                  onClick={(d) => {
                    const tower = (d as { payload?: { tower?: string } })?.payload?.tower;
                    if (tower) router.push(`/tickets?tower=${encodeURIComponent(tower)}`);
                  }}>
                  {s.tickets_by_tower.map((_entry, i) => (
                    <Cell key={i} fill={TOWER_COLORS[i % TOWER_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lead Score + Priority breakdown */}
        <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65] mb-4">
            Lead Score Distribution &amp; Ticket Priority
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B65] mb-2">Leads</div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={scoreData} margin={{ bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E8E5DF', borderRadius: 6 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer"
                    onClick={(d) => {
                      const name = (d as { payload?: { name?: string } })?.payload?.name;
                      if (name) router.push(`/leads?score_tier=${name.toLowerCase()}`);
                    }}>
                    {scoreData.map((entry, i) => (
                      <Cell key={i} fill={SCORE_COLORS[entry.name.toLowerCase()]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B65] mb-2">Priority</div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={priorityData} margin={{ bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E8E5DF', borderRadius: 6 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer"
                    onClick={(d) => {
                      const name = (d as { payload?: { name?: string } })?.payload?.name;
                      if (name) router.push(`/tickets?priority=${name}`);
                    }}>
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
