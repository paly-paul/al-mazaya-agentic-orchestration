'use client';
import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import type { ChatSession } from '@/lib/types';

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: '#25D366', web_chat: '#005B41', email: '#6B6B65',
};
const INTENT_COLORS = ['#005B41', '#854F0B', '#1565C0', '#6B6B65', '#A32D2D'];

const AVATAR_EMOJIS = ['👨‍⚕️', '👩‍⚕️', '🧑‍💼', '👨‍💼', '👩‍💼', '🏥', '📋', '💊'];

export default function ChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [transcript, setTranscript] = useState<{ role: string; content: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getLiveChats() as ChatSession[];
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [load]);

  const openSession = async (session: ChatSession) => {
    setSelected(session);
    setLoadingTranscript(true);
    try {
      const data = await api.getSession(session.session_id) as { messages: { role: string; content: string; created_at: string }[] };
      setTranscript(data.messages || []);
    } catch {
      setTranscript([]);
    } finally {
      setLoadingTranscript(false);
    }
  };

  // Aggregate channel data
  const channelCounts: Record<string, number> = {};
  const intentCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const ch = s.use_case || 'web_chat';
    channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    const intent = s.intent || 'other';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  });

  const channelData = Object.entries(channelCounts).map(([name, value]) => ({ name, value }));
  const intentData = Object.entries(intentCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
    value,
  }));

  return (
    <div>
      <PageHeader title="Live Chats" sub="Active and recent chat sessions" />

      <div className="grid gap-5" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Session feed */}
        <div className="rounded-xl overflow-hidden flex flex-col" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', maxHeight: 600 }}>
          <div className="px-4 py-3 border-b border-[#E8E5DF]">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65]">
              Active Sessions ({sessions.length})
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#005B41] border-t-transparent" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-sm text-[#6B6B65] py-10">No active sessions</div>
            ) : (
              sessions.map((s, i) => (
                <div
                  key={s.session_id}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-[#F0EDE8] transition-colors"
                  style={{ background: selected?.session_id === s.session_id ? '#F0F8F5' : 'transparent' }}
                  onClick={() => openSession(s)}
                >
                  <div className="text-xl shrink-0 mt-0.5">{AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">{s.user_name || 'Anonymous'}</div>
                      <div className="text-[10px] text-[#6B6B65] shrink-0 ml-2">
                        {new Date(s.updated_at || s.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-xs text-[#6B6B65] truncate mt-0.5">{s.last_message || '…'}</div>
                    <div className="mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F8F5] text-[#005B41] font-medium capitalize">
                        {s.intent || s.use_case || 'unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Transcript viewer */}
          {selected ? (
            <div className="rounded-xl flex flex-col" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', maxHeight: 300 }}>
              <div className="px-4 py-3 border-b border-[#E8E5DF] flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65]">
                  Transcript — {selected.user_name || 'Anonymous'}
                </div>
                <button
                  className="text-xs px-3 py-1 rounded font-medium opacity-40 cursor-not-allowed"
                  style={{ background: '#F8F7F4', color: '#6B6B65', border: '1px solid #E8E5DF' }}
                  title="Available in Phase 2"
                >
                  Hand off to human
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {loadingTranscript ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#005B41] border-t-transparent" />
                  </div>
                ) : transcript.length === 0 ? (
                  <div className="text-sm text-[#6B6B65] text-center py-4">No messages</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {transcript.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className="max-w-[80%] px-3 py-2 rounded-lg text-sm"
                          style={m.role === 'user'
                            ? { background: '#005B41', color: '#fff' }
                            : { background: '#F8F7F4', color: '#1A1A18' }}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl flex items-center justify-center" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', height: 120 }}>
              <p className="text-sm text-[#6B6B65]">Select a session to view transcript</p>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65] mb-4">
                Today&apos;s Channel Breakdown
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={channelData} margin={{ bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E8E5DF', borderRadius: 6 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {channelData.map((entry, i) => (
                      <Cell key={i} fill={CHANNEL_COLORS[entry.name] || INTENT_COLORS[i % INTENT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#6B6B65] mb-4">
                Intent Classification
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={intentData} margin={{ bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B6B65' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6B65' }} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E8E5DF', borderRadius: 6 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {intentData.map((_entry, i) => (
                      <Cell key={i} fill={INTENT_COLORS[i % INTENT_COLORS.length]} />
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
