'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { WorkOrder } from '@/lib/types';

export default function FacilityPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState<WorkOrder | null>(null);
  const [rejectModal, setRejectModal] = useState<WorkOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [detailModal, setDetailModal] = useState<WorkOrder | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getWorkOrders() as WorkOrder[];
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async () => {
    if (!approveModal) return;
    setSaving(true);
    try {
      await api.approveWorkOrder(approveModal.id, 'FM Manager');
      setApproveModal(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    if (!rejectModal || !rejectReason) return;
    setSaving(true);
    try {
      await api.rejectWorkOrder(rejectModal.id, 'FM Manager', rejectReason);
      setRejectModal(null);
      setRejectReason('');
      load();
    } finally {
      setSaving(false);
    }
  };

  const open = orders.filter((o) => o.status === 'in_progress' || o.status === 'pending_approval').length;
  const completed7d = orders.filter((o) => {
    const created = new Date(o.created_at);
    return o.status === 'completed' && Date.now() - created.getTime() < 7 * 86400000;
  }).length;
  const revenue7d = orders
    .filter((o) => {
      const created = new Date(o.created_at);
      return o.status === 'completed' && Date.now() - created.getTime() < 7 * 86400000;
    })
    .reduce((s, o) => s + (o.quote_amount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Facility Services"
        sub="Add-on service work orders from tenant requests"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Open Requests" value={open} />
        <MetricCard label="Completed (7d)" value={completed7d} accent="#0F6E56" />
        <MetricCard label="Revenue (7d) KD" value={revenue7d.toFixed(0)} accent="#005B41" />
        <MetricCard label="Total Orders" value={orders.length} />
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
                <th>Clinic / Tower</th>
                <th>Service Type</th>
                <th>Quote (KD)</th>
                <th>Status</th>
                <th>Vendor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center text-[#6B6B65] py-10">No work orders found</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="cursor-pointer" onClick={() => setDetailModal(o)}>
                  <td className="font-mono text-xs text-[#005B41] font-semibold">{o.ref}</td>
                  <td className="text-sm">{o.tenant_name} · {o.tower}</td>
                  <td className="text-sm capitalize">{o.service_type.replace(/_/g, ' ')}</td>
                  <td className="font-semibold">KD {o.quote_amount?.toFixed(3)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <StatusBadge value={o.status} />
                  </td>
                  <td className="text-sm">{o.vendor_name || <span className="text-[#6B6B65]">—</span>}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {o.status === 'pending_approval' && (
                      <div className="flex gap-1">
                        <button
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: '#F0F8F5', color: '#005B41', border: '1px solid #C8E8DF' }}
                          onClick={() => setApproveModal(o)}
                        >
                          Approve
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{ background: '#FBEAEA', color: '#A32D2D', border: '1px solid #F0C8C8' }}
                          onClick={() => { setRejectModal(o); setRejectReason(''); }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <Modal title={`Approve work order ${approveModal.ref}`} onClose={() => setApproveModal(null)}>
          <div className="mb-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Service', approveModal.service_type.replace(/_/g, ' ')],
                ['Tenant', approveModal.tenant_name],
                ['Tower', approveModal.tower],
                ['Quote', `KD ${approveModal.quote_amount?.toFixed(3)}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[11px] uppercase tracking-wide text-[#6B6B65] font-semibold">{k}</div>
                  <div className="font-medium">{v}</div>
                </div>
              ))}
            </div>
            {approveModal.quote_breakdown && Object.keys(approveModal.quote_breakdown).length > 0 && (
              <div className="mt-3 bg-[#F8F7F4] rounded-lg p-3">
                <div className="text-[11px] uppercase tracking-wide text-[#6B6B65] font-semibold mb-2">Quote breakdown</div>
                {Object.entries(approveModal.quote_breakdown).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs py-0.5">
                    <span className="text-[#6B6B65]">{k.replace(/_/g, ' ')}</span>
                    <span className="font-medium">KD {String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setApproveModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={approve} disabled={saving}>
              {saving ? 'Approving…' : 'Approve'}
            </button>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal title={`Reject work order ${rejectModal.ref}`} onClose={() => setRejectModal(null)}>
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">
              Reason for rejection
            </label>
            <textarea
              rows={3}
              placeholder="Explain why this work order is being rejected…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
            <button className="btn-danger" onClick={reject} disabled={saving || !rejectReason}>
              {saving ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal title={`Work Order ${detailModal.ref}`} onClose={() => setDetailModal(null)}>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {[
              ['Tenant', detailModal.tenant_name],
              ['Tower / Floor', `${detailModal.tower} · ${detailModal.floor}`],
              ['Service type', detailModal.service_type.replace(/_/g, ' ')],
              ['Quote', `KD ${detailModal.quote_amount?.toFixed(3)}`],
              ['Status', detailModal.status],
              ['Vendor', detailModal.vendor_name || '—'],
              ['Created', new Date(detailModal.created_at).toLocaleString('en-GB')],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px] uppercase tracking-wide text-[#6B6B65] font-semibold">{k}</div>
                <div className="font-medium">{v}</div>
              </div>
            ))}
          </div>
          {detailModal.status === 'pending_approval' && (
            <div className="flex justify-end gap-2">
              <button className="btn-danger" onClick={() => { setRejectModal(detailModal); setDetailModal(null); }}>
                Reject
              </button>
              <button className="btn-primary" onClick={() => { setApproveModal(detailModal); setDetailModal(null); }}>
                Approve
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
