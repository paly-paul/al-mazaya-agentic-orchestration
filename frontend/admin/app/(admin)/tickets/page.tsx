'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { Ticket, Vendor } from '@/lib/types';

const P_COLOR: Record<string, string> = { P1: '#A32D2D', P2: '#854F0B', P3: '#0F6E56' };
const SLA_HOURS: Record<string, number> = { P1: 2, P2: 8, P3: 48 };

function slaRemaining(ticket: Ticket): { label: string; color: string } {
  const deadline = new Date(ticket.sla_deadline).getTime();
  const now = Date.now();
  const diff = deadline - now;
  const totalMs = SLA_HOURS[ticket.priority] * 3600000;
  if (diff <= 0) return { label: 'Overdue', color: '#A32D2D' };
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const label = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  const pct = diff / totalMs;
  const color = pct > 0.5 ? '#0F6E56' : pct > 0.2 ? '#854F0B' : '#A32D2D';
  return { label, color };
}

function TicketsContent() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState(searchParams.get('priority') || '');
  const [filterTower, setFilterTower] = useState(searchParams.get('tower') || '');
  const [showAll, setShowAll] = useState(false);
  const [detailModal, setDetailModal] = useState<Ticket | null>(null);
  const [reassignModal, setReassignModal] = useState<Ticket | null>(null);
  const [vendorId, setVendorId] = useState('');
  const [closeModal, setCloseModal] = useState<Ticket | null>(null);
  const [resolution, setResolution] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filterPriority) params.priority = filterPriority;
      if (filterTower) params.tower = filterTower;
      if (!showAll) params.status = 'open';
      const data = await api.getTickets(params) as Ticket[];
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filterPriority, filterTower, showAll]);

  useEffect(() => {
    load();
    api.getVendors().then((v) => setVendors(v as Vendor[])).catch(() => {});
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [load]);

  const reassign = async () => {
    if (!reassignModal || !vendorId) return;
    setSaving(true);
    try {
      await api.reassignTicketVendor(reassignModal.id, parseInt(vendorId));
      setReassignModal(null);
      setVendorId('');
      load();
    } finally {
      setSaving(false);
    }
  };

  const escalate = async (ticket: Ticket) => {
    try {
      await api.escalateTicket(ticket.id);
      load();
    } catch { /* ignore */ }
  };

  const close = async () => {
    if (!closeModal) return;
    setSaving(true);
    try {
      await api.closeTicket(closeModal.id, resolution);
      setCloseModal(null);
      setResolution('');
      load();
    } finally {
      setSaving(false);
    }
  };

  const p1 = tickets.filter((t) => t.priority === 'P1').length;
  const p2 = tickets.filter((t) => t.priority === 'P2').length;
  const p3 = tickets.filter((t) => t.priority === 'P3').length;

  return (
    <div>
      <PageHeader title="Maintenance Tickets" sub="Real-time ticket tracking with SLA monitoring" />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="P1 Critical" value={p1} accent="#A32D2D" href="/tickets?priority=P1" />
        <MetricCard label="P2 Urgent" value={p2} accent="#854F0B" href="/tickets?priority=P2" />
        <MetricCard label="P3 Routine" value={p3} accent="#0F6E56" href="/tickets?priority=P3" />
        <MetricCard label="Total Shown" value={tickets.length} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ width: 130 }}>
          <option value="">All priorities</option>
          <option value="P1">P1 Critical</option>
          <option value="P2">P2 Urgent</option>
          <option value="P3">P3 Routine</option>
        </select>
        <input
          placeholder="Filter by tower…"
          value={filterTower}
          onChange={(e) => setFilterTower(e.target.value)}
          style={{ width: 180 }}
        />
        <label className="flex items-center gap-2 text-sm text-[#6B6B65] cursor-pointer">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            style={{ width: 'auto' }}
          />
          Show all (incl. completed)
        </label>
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
                <th>Ref</th>
                <th>Tower · Floor</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>SLA Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 && (
                <tr><td colSpan={8} className="text-center text-[#6B6B65] py-10">No tickets found</td></tr>
              )}
              {tickets.map((t) => {
                const sla = slaRemaining(t);
                return (
                  <tr key={t.id} className="cursor-pointer" onClick={() => setDetailModal(t)}>
                    <td className="font-mono text-xs text-[#005B41] font-semibold">{t.ref}</td>
                    <td className="text-sm">{t.tower} · {t.floor}</td>
                    <td className="text-sm text-[#6B6B65] capitalize">{t.category}</td>
                    <td>
                      <span className="font-bold text-xs" style={{ color: P_COLOR[t.priority] }}>
                        ● {t.priority}
                      </span>
                    </td>
                    <td className="text-sm">{t.vendor_name || <span className="text-[#6B6B65]">Unassigned</span>}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <StatusBadge value={t.status} />
                    </td>
                    <td>
                      <span className="font-semibold text-sm" style={{ color: sla.color }}>{sla.label}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: '#F0F8F5', color: '#005B41', border: '1px solid #C8E8DF' }}
                          onClick={() => { setReassignModal(t); setVendorId(''); }}
                        >
                          Reassign
                        </button>
                        {t.priority === 'P2' && (
                          <button
                            className="text-xs px-2 py-1 rounded font-medium"
                            style={{ background: '#FBEAEA', color: '#A32D2D', border: '1px solid #F0C8C8' }}
                            onClick={() => escalate(t)}
                          >
                            → P1
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <Modal title={`Ticket ${detailModal.ref}`} onClose={() => setDetailModal(null)}>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {[
              ['Tenant', detailModal.tenant_name],
              ['Tower / Floor', `${detailModal.tower} · ${detailModal.floor}`],
              ['Category', detailModal.category],
              ['Priority', detailModal.priority],
              ['Status', detailModal.status],
              ['Vendor', detailModal.vendor_name || 'Unassigned'],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px] uppercase tracking-wide text-[#6B6B65] font-semibold">{k}</div>
                <div className="font-medium">{v}</div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="text-[11px] uppercase tracking-wide text-[#6B6B65] font-semibold mb-1">Description</div>
            <p className="text-sm text-[#1A1A18] bg-[#F8F7F4] rounded-lg p-3">{detailModal.description}</p>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => { setReassignModal(detailModal); setDetailModal(null); setVendorId(''); }}>
              Reassign vendor
            </button>
            {detailModal.priority === 'P2' && (
              <button className="btn-danger" onClick={() => { escalate(detailModal); setDetailModal(null); }}>
                Escalate to P1
              </button>
            )}
            <button
              className="btn-secondary"
              onClick={() => { setCloseModal(detailModal); setDetailModal(null); }}
            >
              Close ticket
            </button>
          </div>
        </Modal>
      )}

      {/* Reassign Modal */}
      {reassignModal && (
        <Modal title={`Reassign vendor — ${reassignModal.ref}`} onClose={() => setReassignModal(null)}>
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">
              Select Vendor
            </label>
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">— Select vendor —</option>
              {vendors.filter((v) => v.status === 'active').map((v) => (
                <option key={v.id} value={v.id}>{v.company_name} (score: {v.score})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setReassignModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={reassign} disabled={saving || !vendorId}>
              {saving ? 'Saving…' : 'Reassign'}
            </button>
          </div>
        </Modal>
      )}

      {/* Close Modal */}
      {closeModal && (
        <Modal title={`Close ticket ${closeModal.ref}`} onClose={() => setCloseModal(null)}>
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">
              Resolution note
            </label>
            <textarea
              rows={3}
              placeholder="Describe how the issue was resolved…"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setCloseModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={close} disabled={saving || !resolution}>
              {saving ? 'Saving…' : 'Close ticket'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense>
      <TicketsContent />
    </Suspense>
  );
}
