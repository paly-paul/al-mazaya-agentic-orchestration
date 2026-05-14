'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import type { Briefing, Alert } from '@/lib/types';

const SEVERITY_ICON: Record<string, string> = { critical: '🔴', warning: '🟡', info: '🔵' };
const SEVERITY_BORDER: Record<string, string> = {
  critical: '#A32D2D', warning: '#854F0B', info: '#1565C0',
};
const SEVERITY_BG: Record<string, string> = {
  critical: '#FBEAEA', warning: '#FEF3E2', info: '#E3F2FD',
};

type ActionModal = {
  alert: Alert;
  vendorId?: string;
  repName?: string;
  loading: boolean;
};

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [modal, setModal] = useState<ActionModal | null>(null);
  const [vendors, setVendors] = useState<{ id: number; company_name: string; score: number }[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await api.getLatestBriefing() as Briefing;
      setBriefing(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    api.getVendors().then((v) => setVendors(v as { id: number; company_name: string; score: number }[])).catch(() => {});
  }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      await api.generateBriefing('daily');
      await load();
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (alert: Alert) => {
    const endpoint = alert.action_endpoint;
    if (endpoint.includes('/vendor')) {
      setModal({ alert, loading: false });
    } else if (endpoint.includes('/assign')) {
      setModal({ alert, loading: false });
    } else if (endpoint.includes('/approve')) {
      // direct call
      setModal({ alert, loading: false });
    } else {
      setDismissed((d) => new Set([...d, alert.entity_id]));
    }
  };

  const confirmAction = async () => {
    if (!modal) return;
    setModal((m) => m ? { ...m, loading: true } : null);
    try {
      const ep = modal.alert.action_endpoint;
      if (ep.includes('/vendor') && modal.vendorId) {
        await api.reassignTicketVendor(modal.alert.entity_id, parseInt(modal.vendorId));
      } else if (ep.includes('/assign') && modal.repName) {
        await api.assignLead(modal.alert.entity_id, modal.repName);
      } else if (ep.includes('/approve')) {
        await api.approveWorkOrder(modal.alert.entity_id, 'Admin');
      }
      setDismissed((d) => new Set([...d, modal.alert.entity_id]));
      setModal(null);
    } catch {
      setModal((m) => m ? { ...m, loading: false } : null);
    }
  };

  const visibleAlerts = briefing?.alerts?.filter((a) => !dismissed.has(a.entity_id)) ?? [];

  return (
    <div>
      <PageHeader
        title="AI Briefing"
        sub="Daily management digest and actionable alerts"
        action={
          <button className="btn-secondary" onClick={generate} disabled={generating}>
            {generating ? 'Generating…' : '↻ Regenerate'}
          </button>
        }
      />

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#005B41] border-t-transparent" />
        </div>
      )}

      {!loading && briefing && (
        <>
          {/* Briefing Card */}
          <div
            className="rounded-xl p-6 mb-6"
            style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', borderLeft: '4px solid #005B41' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65]">
                Daily Briefing
              </div>
              <div className="text-xs text-[#6B6B65]">
                {new Date(briefing.generated_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#1A1A18' }}>{briefing.briefing_en}</p>
          </div>

          {/* Alert List */}
          {visibleAlerts.length === 0 ? (
            <div className="rounded-xl p-8 text-center text-sm text-[#6B6B65]"
              style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
              No active alerts — all clear.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleAlerts.map((alert, i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 flex items-start justify-between gap-4"
                  style={{
                    background: SEVERITY_BG[alert.severity] || '#FFFFFF',
                    border: `1px solid ${SEVERITY_BORDER[alert.severity] || '#E8E5DF'}`,
                  }}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg mt-0.5">{SEVERITY_ICON[alert.severity]}</span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                        style={{ color: SEVERITY_BORDER[alert.severity] }}>
                        {alert.severity}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#1A1A18' }}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="btn-primary text-xs px-3 py-1.5"
                      onClick={() => handleAction(alert)}
                    >
                      {alert.action_label}
                    </button>
                    <button
                      className="text-[#6B6B65] hover:text-[#1A1A18] text-xs px-2 py-1.5"
                      onClick={() => setDismissed((d) => new Set([...d, alert.entity_id]))}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !briefing && (
        <div className="rounded-xl p-10 text-center" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
          <p className="text-sm text-[#6B6B65] mb-4">No briefing generated yet for today.</p>
          <button className="btn-primary" onClick={generate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate Now'}
          </button>
        </div>
      )}

      {/* Action Modal */}
      {modal && (
        <Modal title={modal.alert.action_label} onClose={() => setModal(null)}>
          <p className="text-sm text-[#6B6B65] mb-4">{modal.alert.message}</p>

          {modal.alert.action_endpoint.includes('/vendor') && (
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">
                Select Replacement Vendor
              </label>
              <select value={modal.vendorId || ''} onChange={(e) => setModal((m) => m ? { ...m, vendorId: e.target.value } : null)}>
                <option value="">— Select vendor —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.company_name} (score: {v.score})</option>
                ))}
              </select>
            </div>
          )}

          {modal.alert.action_endpoint.includes('/assign') && (
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">
                Assign to Rep
              </label>
              <input
                type="text"
                placeholder="Rep name"
                value={modal.repName || ''}
                onChange={(e) => setModal((m) => m ? { ...m, repName: e.target.value } : null)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={confirmAction} disabled={modal.loading}>
              {modal.loading ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
