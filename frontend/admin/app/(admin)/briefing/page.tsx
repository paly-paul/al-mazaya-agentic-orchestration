'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  action_label?: string
  action_endpoint?: string
  action_method?: string
  action_payload?: Record<string, unknown>
  key_entities?: string[]
}

interface Briefing {
  id: string
  generated_at: string
  period: string
  briefing_en: string
  alerts: Alert[]
}

function severityToStyle(severity: string) {
  if (severity === 'critical') return { card: 'bg-red-50 border-red-300', icon: '🔴', text: 'text-red-800', badge: 'bg-red-100 text-red-700' }
  if (severity === 'warning') return { card: 'bg-amber-50 border-amber-300', icon: '⚠️', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700' }
  return { card: 'bg-blue-50 border-blue-300', icon: 'ℹ️', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' }
}

function highlightEntities(message: string, entities: string[] = []) {
  if (!entities.length) return <span>{message}</span>
  const parts = message.split(new RegExp(`(${entities.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        entities.some(e => e.toLowerCase() === part.toLowerCase())
          ? <strong key={i}>{part}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [actionStates, setActionStates] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({})

  const fetchBriefing = () => {
    setLoading(true)
    api.get('/api/briefing/latest')
      .then((data) => {
        if (data && !data.detail) setBriefing(data)
        else setBriefing(null)
      })
      .catch(() => setError('Failed to load briefing'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBriefing() }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      await api.post('/api/briefing/generate', { period: 'daily', language: 'en' })
      fetchBriefing()
    } catch {
      setError('Failed to generate briefing')
    } finally {
      setGenerating(false)
    }
  }

  const handleAction = async (alert: Alert) => {
    if (!alert.action_endpoint) return
    setActionStates(prev => ({ ...prev, [alert.id]: 'loading' }))
    try {
      await api.patch(alert.action_endpoint, alert.action_payload || {})
      setActionStates(prev => ({ ...prev, [alert.id]: 'done' }))
    } catch {
      setActionStates(prev => ({ ...prev, [alert.id]: 'error' }))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Briefing</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-generated operations briefing and alerts</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 flex items-center gap-2"
          style={{ backgroundColor: '#005B41' }}
        >
          {generating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate New Briefing
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border-l-4 border-green-500 border border-gray-200 p-6 animate-pulse">
            <div className="skeleton h-3 w-48 mb-4" />
            <div className="space-y-2">
              {[80, 95, 70, 88].map((w, i) => (
                <div key={i} className={`skeleton h-3`} style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : briefing ? (
        <div className="space-y-5">
          {/* Main briefing card */}
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 p-6" style={{ borderLeftColor: '#005B41' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily Briefing</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">
                {new Date(briefing.generated_at).toLocaleString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{briefing.briefing_en}</p>
          </div>

          {/* Alerts */}
          {briefing.alerts && briefing.alerts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Alerts ({briefing.alerts.length})
              </h2>
              <div className="space-y-3">
                {briefing.alerts.map((alert) => {
                  const style = severityToStyle(alert.severity)
                  const actionState = actionStates[alert.id] || 'idle'
                  return (
                    <div
                      key={alert.id}
                      className={`rounded-xl border p-5 ${style.card}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{style.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${style.badge}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className={`text-sm ${style.text} leading-relaxed`}>
                            {highlightEntities(alert.message, alert.key_entities)}
                          </p>
                        </div>
                        {alert.action_label && alert.action_endpoint && (
                          <button
                            onClick={() => handleAction(alert)}
                            disabled={actionState === 'loading' || actionState === 'done'}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              actionState === 'done'
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : actionState === 'error'
                                ? 'bg-red-100 text-red-700'
                                : actionState === 'loading'
                                ? 'opacity-60 cursor-wait bg-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {actionState === 'done' ? 'Done' : actionState === 'error' ? 'Retry' : alert.action_label}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(!briefing.alerts || briefing.alerts.length === 0) && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-700 font-medium">No active alerts</p>
              <p className="text-green-600 text-sm mt-1">All operations are running smoothly.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600 font-medium">No briefing available</p>
          <p className="text-gray-400 text-sm mt-1">Click &quot;Generate New Briefing&quot; to create the first briefing.</p>
        </div>
      )}
    </div>
  )
}
