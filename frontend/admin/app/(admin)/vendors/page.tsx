'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { Vendor } from '@/lib/types';

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#005B41' : score >= 50 ? '#854F0B' : '#A32D2D';
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm w-8" style={{ color }}>{score}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[#E8E5DF] overflow-hidden" style={{ minWidth: 60 }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

const CATEGORIES = ['electrical', 'hvac', 'plumbing', 'lift', 'fire', 'medical_gas', 'civil', 'cleaning', 'pest', 'other'];
const TOWERS = ['Clinic I', 'Clinic II', 'Clinic III', 'Clinic IV', 'Clinic V', 'Clinic VI', 'all'];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardModal, setOnboardModal] = useState(false);
  const [detailModal, setDetailModal] = useState<Vendor | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '', contact_name: '', phone: '', email: '',
    trade_licence: '', categories: [] as string[], towers_covered: [] as string[],
  });

  const load = useCallback(async () => {
    try {
      const data = await api.getVendors() as Vendor[];
      setVendors(data);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const suspend = async (vendor: Vendor) => {
    try {
      await api.updateVendorStatus(vendor.id, vendor.status === 'suspended' ? 'active' : 'suspended');
      load();
    } catch { /* ignore */ }
  };

  const onboard = async () => {
    if (!form.company_name || !form.contact_name || !form.phone) return;
    setSaving(true);
    try {
      await api.createVendor(form as Record<string, unknown>);
      setOnboardModal(false);
      setForm({ company_name: '', contact_name: '', phone: '', email: '', trade_licence: '', categories: [], towers_covered: [] });
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleArr = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const total = vendors.length;
  const onboarding = vendors.filter((v) => v.status === 'onboarding').length;
  const below = vendors.filter((v) => v.score < 60).length;
  const avg = total ? Math.round(vendors.reduce((s, v) => s + v.score, 0) / total) : 0;

  return (
    <div>
      <PageHeader
        title="Vendor Registry"
        sub="Empaneled vendor pool with performance scores"
        action={
          <button className="btn-primary" onClick={() => setOnboardModal(true)}>+ Onboard new vendor</button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Vendors" value={total} />
        <MetricCard label="Onboarding" value={onboarding} accent="#854F0B" />
        <MetricCard label="Below Threshold" value={below} accent="#A32D2D" />
        <MetricCard label="Avg Score" value={avg} accent="#005B41" />
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
                <th>Vendor</th>
                <th>Category</th>
                <th>Towers</th>
                <th>Score</th>
                <th>Jobs (30d)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 && (
                <tr><td colSpan={7} className="text-center text-[#6B6B65] py-10">No vendors found</td></tr>
              )}
              {vendors.map((v) => (
                <tr key={v.id} className="cursor-pointer" onClick={() => setDetailModal(v)}>
                  <td>
                    <div className="font-medium">{v.company_name}</div>
                    <div className="text-xs text-[#6B6B65]">{v.contact_name}</div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {v.categories?.slice(0, 2).map((c) => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F8F7F4] text-[#6B6B65] border border-[#E8E5DF] capitalize">
                          {c}
                        </span>
                      ))}
                      {v.categories?.length > 2 && (
                        <span className="text-[10px] text-[#6B6B65]">+{v.categories.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-xs text-[#6B6B65]">{v.towers_covered?.join(', ') || '—'}</td>
                  <td><ScoreBar score={v.score} /></td>
                  <td className="text-sm">{v.jobs_30d ?? 0}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <StatusBadge value={v.status} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={v.status === 'suspended'
                        ? { background: '#F0F8F5', color: '#005B41', border: '1px solid #C8E8DF' }
                        : { background: '#FBEAEA', color: '#A32D2D', border: '1px solid #F0C8C8' }}
                      onClick={() => suspend(v)}
                    >
                      {v.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Onboard Modal */}
      {onboardModal && (
        <Modal title="Onboard New Vendor" onClose={() => setOnboardModal(false)}>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">Company name *</label>
                <input value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">Contact name *</label>
                <input value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">Phone *</label>
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">Email</label>
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">Trade licence</label>
                <input value={form.trade_licence} onChange={(e) => setForm((f) => ({ ...f, trade_licence: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">Categories</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="text-xs px-2 py-1 rounded capitalize"
                    style={{
                      background: form.categories.includes(c) ? '#005B41' : '#F8F7F4',
                      color: form.categories.includes(c) ? '#fff' : '#6B6B65',
                      border: '1px solid #E8E5DF',
                    }}
                    onClick={() => setForm((f) => ({ ...f, categories: toggleArr(f.categories, c) }))}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B6B65] mb-1">Towers covered</label>
              <div className="flex flex-wrap gap-1.5">
                {TOWERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: form.towers_covered.includes(t) ? '#005B41' : '#F8F7F4',
                      color: form.towers_covered.includes(t) ? '#fff' : '#6B6B65',
                      border: '1px solid #E8E5DF',
                    }}
                    onClick={() => setForm((f) => ({ ...f, towers_covered: toggleArr(f.towers_covered, t) }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button className="btn-secondary" onClick={() => setOnboardModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={onboard}
                disabled={saving || !form.company_name || !form.contact_name || !form.phone}
              >
                {saving ? 'Saving…' : 'Onboard vendor'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <Modal title={detailModal.company_name} onClose={() => setDetailModal(null)}>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {[
              ['Contact', detailModal.contact_name],
              ['Phone', detailModal.phone],
              ['Email', detailModal.email || '—'],
              ['Trade licence', detailModal.trade_licence || '—'],
              ['Score', String(detailModal.score)],
              ['Status', detailModal.status],
              ['Jobs (30d)', String(detailModal.jobs_30d ?? 0)],
              ['Towers', detailModal.towers_covered?.join(', ') || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px] uppercase tracking-wide text-[#6B6B65] font-semibold">{k}</div>
                <div className="font-medium">{v}</div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="text-[11px] uppercase tracking-wide text-[#6B6B65] font-semibold mb-1">Score</div>
            <ScoreBar score={detailModal.score} />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className={detailModal.status === 'suspended' ? 'btn-primary' : 'btn-danger'}
              onClick={() => { suspend(detailModal); setDetailModal(null); }}
            >
              {detailModal.status === 'suspended' ? 'Reactivate' : 'Suspend vendor'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
