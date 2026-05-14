'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { Lead } from '@/lib/types';

const LEAD_STATUSES = ['follow_up_due', 'meeting_set', 'proposal_sent', 'nurture', 'cold_outreach', 'closed_won', 'closed_lost'];

function scoreColor(score: number) {
  if (score >= 70) return '#0F6E56';
  if (score >= 40) return '#854F0B';
  return '#6B6B65';
}

type SortKey = keyof Lead;

function LeadsContent() {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterTier, setFilterTier] = useState(searchParams.get('score_tier') || '');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTower, setFilterTower] = useState('');
  const [assignModal, setAssignModal] = useState<Lead | null>(null);
  const [assignRep, setAssignRep] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filterTier) params.score_tier = filterTier;
      if (filterStatus) params.status = filterStatus;
      if (filterTower) params.tower = filterTower;
      const data = await api.getLeads(params) as Lead[];
      setLeads(data);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [filterTier, filterStatus, filterTower]);

  useEffect(() => { load(); }, [load]);

  const sort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...leads].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const hot = leads.filter((l) => l.tier === 'hot').length;
  const warm = leads.filter((l) => l.tier === 'warm').length;
  const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0;

  const doAssign = async () => {
    if (!assignModal || !assignRep) return;
    setAssignLoading(true);
    try {
      await api.assignLead(assignModal.id, assignRep);
      setAssignModal(null);
      setAssignRep('');
      load();
    } finally {
      setAssignLoading(false);
    }
  };

  const updateStatus = async (lead: Lead, status: string) => {
    try {
      await api.updateLeadStatus(lead.id, status);
      load();
    } catch { /* ignore */ }
  };

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th className="cursor-pointer select-none" onClick={() => sort(k)}>
      {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div>
      <PageHeader
        title="Lead Pipeline"
        sub="AI-qualified leads from chat and web enquiries"
        action={
          <a href="/api/leads?format=csv" className="btn-secondary text-xs">Export CSV</a>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Hot Leads" value={hot} accent="#005B41" />
        <MetricCard label="Warm Leads" value={warm} accent="#854F0B" />
        <MetricCard label="Avg Score" value={avgScore} />
        <MetricCard label="Total" value={leads.length} />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} style={{ width: 140 }}>
          <option value="">All tiers</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 180 }}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <input
          placeholder="Filter by tower…"
          value={filterTower}
          onChange={(e) => setFilterTower(e.target.value)}
          style={{ width: 180 }}
        />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#005B41] border-t-transparent" />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <Th label="Name" k="name" />
                <Th label="Specialty" k="specialty" />
                <Th label="Tower" k="tower_preference" />
                <Th label="Score" k="score" />
                <th>Source</th>
                <th>Status</th>
                <th>Assigned</th>
                <Th label="Created" k="created_at" />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={9} className="text-center text-[#6B6B65] py-10">No leads found</td></tr>
              )}
              {sorted.map((lead) => (
                <tr key={lead.id} className="cursor-pointer" onClick={() => setDetailModal(lead)}>
                  <td className="font-medium">{lead.name}</td>
                  <td className="text-[#6B6B65]">{lead.specialty}</td>
                  <td className="text-[#6B6B65]">{lead.tower_preference || '—'}</td>
                  <td>
                    <span className="font-semibold" style={{ color: scoreColor(lead.score) }}>
                      {lead.score}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <StatusBadge value={lead.source} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      onChange={(e) => { e.stopPropagation(); updateStatus(lead, e.target.value); }}
                      className="text-xs"
                      style={{ width: 'auto', padding: '4px 8px' }}
                    >
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                  <td className="text-[#6B6B65] text-xs">{lead.assigned_to || '—'}</td>
                  <td className="text-[#6B6B65] text-xs">
                    {new Date(lead.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="text-xs px-3 py-1 rounded-md font-medium"
                      style={{ background: '#F0F8F5', color: '#005B41', border: '1px solid #C8E8DF' }}
                      onClick={() => { setAssignModal(lead); setAssignRep(lead.assigned_to || ''); }}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <Modal title={`Assign ${assignModal.name}`} onClose={() => setAssignModal(null)}>
          <p className="text-sm text-[#6B6B65] mb-4">Select a rep to assign this lead to.</p>
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">
              Rep Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ahmed K."
              value={assignRep}
              onChange={(e) => setAssignRep(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={doAssign} disabled={assignLoading || !assignRep}>
              {assignLoading ? 'Saving…' : 'Assign'}
            </button>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal title={`Lead: ${detailModal.name}`} onClose={() => setDetailModal(null)}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Phone', detailModal.phone],
              ['Specialty', detailModal.specialty],
              ['Tower preference', detailModal.tower_preference],
              ['Clinic size', detailModal.clinic_size],
              ['Budget', detailModal.budget_range],
              ['Timeline', detailModal.timeline],
              ['Source', detailModal.source],
              ['Score', `${detailModal.score} (${detailModal.tier})`],
              ['Status', detailModal.status],
              ['Assigned to', detailModal.assigned_to || '—'],
              ['Created', new Date(detailModal.created_at).toLocaleString('en-GB')],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px] uppercase tracking-wide text-[#6B6B65] font-semibold">{k}</div>
                <div className="font-medium">{v || '—'}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense>
      <LeadsContent />
    </Suspense>
  );
}
