'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '@/lib/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface ChatSession {
  id: string
  channel: string
  intent?: string
  last_message?: string
  message_count?: number
  started_at: string
  status?: string
  messages?: ChatMessage[]
}

interface LiveChatsResponse {
  sessions: ChatSession[]
  total: number
}

const CHANNEL_MOCK = [
  { channel: 'WhatsApp', count: 34 },
  { channel: 'Web Widget', count: 18 },
  { channel: 'Telegram', count: 12 },
  { channel: 'Email', count: 7 },
]

const INTENT_MOCK = [
  { intent: 'Maintenance', count: 28 },
  { intent: 'Leasing', count: 21 },
  { intent: 'Billing', count: 15 },
  { intent: 'General', count: 11 },
  { intent: 'Services', count: 9 },
]

function channelBadgeColor(channel: string): string {
  if (channel?.toLowerCase().includes('whatsapp')) return 'bg-green-100 text-green-700'
  if (channel?.toLowerCase().includes('telegram')) return 'bg-blue-100 text-blue-700'
  if (channel?.toLowerCase().includes('web')) return 'bg-purple-100 text-purple-700'
  return 'bg-gray-100 text-gray-600'
}

export default function LiveChatsPage() {
  const [data, setData] = useState<LiveChatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)

  useEffect(() => {
    api.get('/api/dashboard/live-chats')
      .then((res) => {
        if (Array.isArray(res)) {
          setData({ sessions: res, total: res.length })
        } else if (res?.sessions) {
          setData(res)
        } else {
          setData({ sessions: [], total: 0 })
        }
      })
      .catch(() => setError('Failed to load live chats'))
      .finally(() => setLoading(false))
  }, [])

  const sessions = data?.sessions || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Chats</h1>
        <p className="text-sm text-gray-500 mt-0.5">Active chat sessions and conversation analytics</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Active Sessions</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {loading ? '...' : sessions.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="skeleton h-3 w-24 mb-2" />
                    <div className="skeleton h-3 w-full mb-1" />
                    <div className="skeleton h-3 w-2/3" />
                  </div>
                ))
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No active chat sessions
                </div>
              ) : (
                sessions.map(session => (
                  <button
                    key={session.id}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedSession?.id === session.id ? 'bg-green-50 border-l-2' : ''}`}
                    style={selectedSession?.id === session.id ? { borderLeftColor: '#005B41' } : {}}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${channelBadgeColor(session.channel)}`}>
                        {session.channel}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(session.started_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 truncate leading-relaxed">
                      {session.last_message || 'No message preview'}
                    </p>
                    {session.intent && (
                      <span className="mt-1.5 inline-block text-xs text-gray-400">
                        Intent: {session.intent}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transcript View */}
          {selectedSession ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Session Transcript</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedSession.channel} · {selectedSession.message_count ?? '?'} messages
                    {selectedSession.intent ? ` · ${selectedSession.intent}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-medium"
                >
                  Close
                </button>
              </div>
              <div className="p-5 max-h-72 overflow-y-auto space-y-3">
                {selectedSession.messages && selectedSession.messages.length > 0 ? (
                  selectedSession.messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gray-100 text-gray-800'
                          : 'text-white'
                      }`}
                        style={msg.role === 'assistant' ? { backgroundColor: '#005B41' } : {}}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm py-8">
                    <p className="font-medium">Last message preview:</p>
                    <p className="mt-2 italic">{selectedSession.last_message || 'No transcript available'}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-3xl mb-3">💬</div>
              <p className="text-gray-500 text-sm">Select a session to view the transcript</p>
            </div>
          )}

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Today&apos;s Channel Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={CHANNEL_MOCK} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#005B41" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Intent Classification
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={INTENT_MOCK} layout="vertical" margin={{ top: 4, right: 10, left: 20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="intent" type="category" tick={{ fontSize: 10 }} width={65} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
