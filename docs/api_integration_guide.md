# Mazaya Clinics — API Integration Guide for Next.js Frontend
**Version:** 1.0  
**Date:** May 2025

This guide covers every backend integration pattern needed to build the Mazaya website chat widget and admin panel in Next.js (TypeScript).

---

## Setup

### Base URL and environment

```ts
// lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
```

In your `.env.local` files:

```bash
# frontend/website/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# frontend/admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ADMIN_SECRET=your_jwt_token_here
```

### Shared fetch helper

```ts
// lib/api.ts

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...init } = options ?? {};

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }

  return json.data as T;
}
```

---

## 1. Initialising a Chat Session

The chat widget creates a session UUID on first load and persists it for the lifetime of the conversation. Sessions are owned by the client — the backend does not issue session IDs.

```ts
// hooks/useChatSession.ts
import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useChatSession(): string {
  const sessionId = useRef<string>(
    // Persist across page reloads within the same tab
    sessionStorage.getItem('mazaya_session_id') ?? (() => {
      const id = uuidv4();
      sessionStorage.setItem('mazaya_session_id', id);
      return id;
    })()
  );
  return sessionId.current;
}
```

```tsx
// components/ChatWidget.tsx
import { useChatSession } from '@/hooks/useChatSession';

export function ChatWidget() {
  const sessionId = useChatSession();
  // Pass sessionId to all outgoing messages
}
```

---

## 2. Sending Messages and Handling Streaming

The Mazaya backend offers two message delivery modes:

| Mode | Endpoint | When to use |
|---|---|---|
| REST (single response) | `POST /api/chat` | Simpler integration; full response arrives at once |
| WebSocket (streaming) | `ws://…/ws/chat/{session_id}` | Real-time token-by-token display; preferred for UX |

### 2a. REST mode (`POST /api/chat`)

```ts
// lib/chat.ts
import { apiFetch } from './api';

export interface ChatMessage {
  sessionId: string;
  message: string;
  language?: 'en' | 'ar';
  useCaseHint?: 'enquiry' | 'maintenance' | 'facility' | 'vendor' | 'management' | null;
}

export interface ChatResponse {
  session_id: string;
  message: string;
  quick_replies: string[];
  structured_output: StructuredOutput | null;
  actions_taken: ActionTaken[];
}

export interface StructuredOutput {
  type: 'lead_score' | 'quote' | 'ticket_ref' | 'vendor_ref' | null;
  payload: Record<string, unknown>;
}

export interface ActionTaken {
  tool: string;
  result: Record<string, unknown>;
}

export async function sendMessage(msg: ChatMessage): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      session_id: msg.sessionId,
      message: msg.message,
      language: msg.language ?? 'en',
      use_case_hint: msg.useCaseHint ?? null,
    }),
  });
}
```

```tsx
// Usage in a component
const [messages, setMessages] = useState<DisplayMessage[]>([]);
const [loading, setLoading] = useState(false);

async function handleSend(text: string) {
  // Optimistically add user message
  setMessages(prev => [...prev, { role: 'user', content: text }]);
  setLoading(true);

  try {
    const res = await sendMessage({ sessionId, message: text, language });
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: res.message, quickReplies: res.quick_replies },
    ]);
    if (res.structured_output) {
      handleStructuredOutput(res.structured_output);
    }
  } catch (err) {
    setMessages(prev => [...prev, { role: 'error', content: 'Something went wrong. Please try again.' }]);
  } finally {
    setLoading(false);
  }
}
```

### 2b. WebSocket streaming mode

```ts
// hooks/useChatStream.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from '@/lib/api';

const WS_BASE = API_BASE.replace(/^http/, 'ws');

interface StreamState {
  streaming: boolean;
  buffer: string;
  quickReplies: string[];
  structuredOutput: StructuredOutput | null;
  actionsTaken: ActionTaken[];
}

export function useChatStream(sessionId: string) {
  const ws = useRef<WebSocket | null>(null);
  const [state, setState] = useState<StreamState>({
    streaming: false,
    buffer: '',
    quickReplies: [],
    structuredOutput: null,
    actionsTaken: [],
  });

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(`${WS_BASE}/ws/chat/${sessionId}`);

    ws.current.onmessage = (event) => {
      // Strip the SSE "data: " prefix
      const raw = (event.data as string).replace(/^data:\s*/, '').trim();
      if (!raw) return;

      const frame = JSON.parse(raw);

      if (frame.token !== undefined) {
        setState(prev => ({ ...prev, streaming: true, buffer: prev.buffer + frame.token }));
      }

      if (frame.done) {
        setState(prev => ({
          ...prev,
          streaming: false,
          quickReplies: frame.quick_replies ?? [],
          structuredOutput: frame.structured_output ?? null,
          actionsTaken: frame.actions_taken ?? [],
        }));
      }

      if (frame.error) {
        console.error('Stream error:', frame.error);
        setState(prev => ({ ...prev, streaming: false }));
      }
    };

    ws.current.onerror = () => {
      console.error('WebSocket error — reconnecting in 2s');
      setTimeout(connect, 2000);
    };
  }, [sessionId]);

  const sendMessage = useCallback((message: string, language: 'en' | 'ar' = 'en') => {
    if (ws.current?.readyState !== WebSocket.OPEN) {
      connect();
    }
    // Clear previous response before streaming new one
    setState(prev => ({ ...prev, buffer: '', streaming: false, quickReplies: [], structuredOutput: null }));

    ws.current?.send(JSON.stringify({ message, language }));
  }, [connect]);

  const disconnect = useCallback(() => ws.current?.close(), []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { ...state, sendMessage };
}
```

```tsx
// ChatWidget.tsx — streaming usage
function ChatWidget() {
  const sessionId = useChatSession();
  const { buffer, streaming, quickReplies, structuredOutput, sendMessage } = useChatStream(sessionId);
  const [committedMessages, setCommittedMessages] = useState<DisplayMessage[]>([]);

  // When streaming finishes, commit the buffered response
  const prevStreaming = useRef(streaming);
  useEffect(() => {
    if (prevStreaming.current && !streaming && buffer) {
      setCommittedMessages(prev => [...prev, { role: 'assistant', content: buffer }]);
    }
    prevStreaming.current = streaming;
  }, [streaming, buffer]);

  return (
    <div>
      {committedMessages.map((m, i) => <MessageBubble key={i} message={m} />)}
      {streaming && <MessageBubble message={{ role: 'assistant', content: buffer }} isStreaming />}
      {!streaming && quickReplies.length > 0 && (
        <QuickReplies replies={quickReplies} onSelect={text => sendMessage(text)} />
      )}
    </div>
  );
}
```

---

## 3. Handling Tool Action Responses (structured_output)

When the agent completes a structured action (creating a lead, generating a quote, logging a ticket), the response includes a `structured_output` field. The frontend should render this as a dedicated result card.

```ts
// lib/structuredOutput.ts

export type StructuredOutputType = 'lead_score' | 'quote' | 'ticket_ref' | 'vendor_ref';

export interface LeadScorePayload {
  lead_id: number;
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  breakdown: {
    specialty_match: number;
    budget_fit: number;
    timeline_urgency: number;
    tower_availability: number;
  };
}

export interface QuotePayload {
  work_order_ref: string;
  service_type: string;
  line_items: Array<{ description: string; amount_kd: number }>;
  total_kd: number;
  auto_approved: boolean;
}

export interface TicketRefPayload {
  ticket_id: number;
  ref: string;
  priority: 'P1' | 'P2' | 'P3';
  sla_deadline: string;
  vendor_assigned: string;
}

export interface VendorRefPayload {
  vendor_id: number;
  ref: string;
  status: string;
}
```

```tsx
// components/StructuredOutputCard.tsx
import type { StructuredOutput, LeadScorePayload, QuotePayload, TicketRefPayload } from '@/lib/structuredOutput';

function LeadScoreCard({ payload }: { payload: LeadScorePayload }) {
  const tierColor = { hot: '#005B41', warm: '#854F0B', cold: '#6B6B65' }[payload.tier];
  return (
    <div style={{ border: `2px solid ${tierColor}`, borderRadius: 8, padding: 16 }}>
      <p><strong>Lead Score: {payload.score}/100</strong> — {payload.tier.toUpperCase()}</p>
      <ul>
        <li>Specialty match: {payload.breakdown.specialty_match}/30</li>
        <li>Budget fit: {payload.breakdown.budget_fit}/25</li>
        <li>Timeline urgency: {payload.breakdown.timeline_urgency}/25</li>
        <li>Tower availability: {payload.breakdown.tower_availability}/20</li>
      </ul>
    </div>
  );
}

function QuoteCard({ payload }: { payload: QuotePayload }) {
  return (
    <div style={{ border: '1px solid #E8E5DF', borderRadius: 8, padding: 16 }}>
      <p><strong>{payload.work_order_ref}</strong> — {payload.service_type}</p>
      {payload.line_items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{item.description}</span>
          <span>KD {item.amount_kd}</span>
        </div>
      ))}
      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>Total</span>
        <span>KD {payload.total_kd}</span>
      </div>
      {payload.auto_approved && <p style={{ color: '#005B41' }}>✓ Auto-approved</p>}
    </div>
  );
}

function TicketCard({ payload }: { payload: TicketRefPayload }) {
  const priorityColor = { P1: '#A32D2D', P2: '#854F0B', P3: '#0F6E56' }[payload.priority];
  return (
    <div style={{ border: `2px solid ${priorityColor}`, borderRadius: 8, padding: 16 }}>
      <p><strong>{payload.ref}</strong> — <span style={{ color: priorityColor }}>{payload.priority}</span></p>
      <p>Vendor: {payload.vendor_assigned}</p>
      <p>SLA deadline: {new Date(payload.sla_deadline).toLocaleString()}</p>
    </div>
  );
}

export function StructuredOutputCard({ output }: { output: StructuredOutput }) {
  switch (output.type) {
    case 'lead_score':
      return <LeadScoreCard payload={output.payload as LeadScorePayload} />;
    case 'quote':
      return <QuoteCard payload={output.payload as QuotePayload} />;
    case 'ticket_ref':
      return <TicketCard payload={output.payload as TicketRefPayload} />;
    default:
      return null;
  }
}
```

---

## 4. Polling Dashboard Stats

The admin dashboard polls `/api/dashboard/stats` to keep metrics fresh. Use a 30-second interval in production.

```ts
// lib/dashboard.ts
import { apiFetch } from './api';

export interface DashboardStats {
  open_tickets: number;
  avg_tat_hours: number;
  lead_pipeline_count: number;
  active_vendors: number;
  chat_sessions_today: number;
  sla_compliance_pct: number;
  tickets_by_tower: Array<{ tower: string; count: number }>;
  leads_by_score_tier: { hot: number; warm: number; cold: number };
  tickets_by_priority: { P1: number; P2: number; P3: number };
}

export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/api/dashboard/stats', { token });
}
```

```tsx
// hooks/useDashboardStats.ts
import { useEffect, useState, useCallback } from 'react';
import { fetchDashboardStats, type DashboardStats } from '@/lib/dashboard';

export function useDashboardStats(token: string, intervalMs = 30_000) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchDashboardStats(token);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    }
  }, [token]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { stats, error, refresh };
}
```

```tsx
// app/dashboard/page.tsx
'use client';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { MetricCard } from '@/components/MetricCard';

export default function DashboardPage() {
  const token = process.env.NEXT_PUBLIC_ADMIN_SECRET!;
  const { stats, error } = useDashboardStats(token);

  if (error) return <p>Error: {error}</p>;
  if (!stats) return <p>Loading…</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16 }}>
        <MetricCard label="Open Tickets" value={stats.open_tickets} />
        <MetricCard label="Avg TAT (hrs)" value={stats.avg_tat_hours} />
        <MetricCard label="Lead Pipeline" value={stats.lead_pipeline_count} />
        <MetricCard label="Active Vendors" value={stats.active_vendors} />
        <MetricCard label="Chat Sessions Today" value={stats.chat_sessions_today} />
        <MetricCard label="SLA Compliance" value={`${stats.sla_compliance_pct}%`} />
      </div>
    </div>
  );
}
```

---

## 5. JWT Auth for Admin Endpoints

The admin panel authenticates every request with a Bearer token.

### Storing the token

For the PoC, the token is a shared static secret configured via environment variable. In production, implement a proper login flow.

```ts
// lib/auth.ts

// PoC: static token from env
export function getAdminToken(): string {
  const token = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  if (!token) throw new Error('NEXT_PUBLIC_ADMIN_SECRET is not set');
  return token;
}
```

### Attaching the token to requests

All admin API calls pass the token through the shared `apiFetch` helper:

```ts
import { apiFetch } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

const token = getAdminToken();

// GET leads
const leads = await apiFetch('/api/leads', { token });

// PATCH lead status
await apiFetch(`/api/leads/${leadId}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'meeting_set' }),
  token,
});
```

### Handling 401 responses

```ts
// lib/api.ts (extended)
export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...init } = options ?? {};

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    // In production: redirect to login page
    throw new Error('Unauthorized — please log in again');
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }

  return json.data as T;
}
```

---

## 6. Complete Integration Patterns

### Lead Pipeline — list, filter, assign

```ts
// lib/leads.ts
import { apiFetch } from './api';

export interface Lead {
  id: number;
  name: string;
  phone: string;
  specialty: string;
  clinic_size: string;
  tower_preference: string;
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  status: string;
  assigned_to: string | null;
  source: string;
  created_at: string;
}

export async function fetchLeads(
  token: string,
  filters?: { score_tier?: string; status?: string; tower?: string }
): Promise<Lead[]> {
  const params = new URLSearchParams(filters as Record<string, string>);
  return apiFetch<Lead[]>(`/api/leads?${params}`, { token });
}

export async function assignLead(token: string, leadId: number, assignedTo: string): Promise<Lead> {
  return apiFetch<Lead>(`/api/leads/${leadId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_to: assignedTo }),
    token,
  });
}

export async function updateLeadStatus(token: string, leadId: number, status: string): Promise<Lead> {
  return apiFetch<Lead>(`/api/leads/${leadId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
}
```

```tsx
// components/LeadTable.tsx
'use client';
import { useEffect, useState } from 'react';
import { fetchLeads, assignLead, type Lead } from '@/lib/leads';
import { getAdminToken } from '@/lib/auth';

export function LeadTable() {
  const token = getAdminToken();
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetchLeads(token).then(setLeads);
  }, [token]);

  async function handleAssign(leadId: number, rep: string) {
    const updated = await assignLead(token, leadId, rep);
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Specialty</th><th>Score</th><th>Status</th><th>Assigned</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads.map(lead => (
          <tr key={lead.id}>
            <td>{lead.name}</td>
            <td>{lead.specialty}</td>
            <td style={{ color: lead.tier === 'hot' ? '#005B41' : lead.tier === 'warm' ? '#854F0B' : '#6B6B65' }}>
              {lead.score}
            </td>
            <td>{lead.status}</td>
            <td>{lead.assigned_to ?? '—'}</td>
            <td>
              <button onClick={() => handleAssign(lead.id, 'Ahmed K.')}>Assign</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### Maintenance Tickets — list, reassign vendor, close

```ts
// lib/tickets.ts
import { apiFetch } from './api';

export interface Ticket {
  id: number;
  ref: string;
  tower: string;
  floor: string;
  category: string;
  priority: 'P1' | 'P2' | 'P3';
  status: string;
  vendor_id: number | null;
  vendor_name: string | null;
  sla_deadline: string;
  sla_remaining_minutes: number;
  description: string;
  created_at: string;
}

export async function fetchTickets(
  token: string,
  filters?: { priority?: string; status?: string; tower?: string }
): Promise<Ticket[]> {
  const params = new URLSearchParams(filters as Record<string, string>);
  return apiFetch<Ticket[]>(`/api/tickets?${params}`, { token });
}

export async function reassignVendor(token: string, ticketId: number, vendorId: number): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${ticketId}/vendor`, {
    method: 'PATCH',
    body: JSON.stringify({ vendor_id: vendorId }),
    token,
  });
}

export async function escalatePriority(token: string, ticketId: number, priority: 'P1' | 'P2' | 'P3'): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${ticketId}/priority`, {
    method: 'PATCH',
    body: JSON.stringify({ priority }),
    token,
  });
}

export async function closeTicket(token: string, ticketId: number, resolutionNote: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/api/tickets/${ticketId}/close`, {
    method: 'PATCH',
    body: JSON.stringify({ resolution_note: resolutionNote }),
    token,
  });
}
```

---

### Work Orders — approve or reject

```ts
// lib/workOrders.ts
import { apiFetch } from './api';

export interface WorkOrder {
  id: number;
  ref: string;
  tenant_name: string;
  tower: string;
  service_type: string;
  quote_amount_kd: number;
  status: string;
  auto_approved: boolean;
  approved_by: string | null;
}

export async function fetchWorkOrders(token: string, filters?: { status?: string }): Promise<WorkOrder[]> {
  const params = new URLSearchParams(filters as Record<string, string>);
  return apiFetch<WorkOrder[]>(`/api/work-orders?${params}`, { token });
}

export async function approveWorkOrder(token: string, orderId: number, approvedBy: string): Promise<WorkOrder> {
  return apiFetch<WorkOrder>(`/api/work-orders/${orderId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ approved_by: approvedBy }),
    token,
  });
}

export async function rejectWorkOrder(
  token: string,
  orderId: number,
  rejectedBy: string,
  reason: string
): Promise<WorkOrder> {
  return apiFetch<WorkOrder>(`/api/work-orders/${orderId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejected_by: rejectedBy, reason }),
    token,
  });
}
```

---

### AI Briefing — fetch latest + trigger alerts

```ts
// lib/briefing.ts
import { apiFetch } from './api';

export interface BriefingAlert {
  severity: 'critical' | 'warning' | 'info';
  entity_type: string;
  entity_id: number | null;
  message: string;
  action_label: string;
  action_endpoint: string;
}

export interface Briefing {
  id: number;
  period: 'daily' | 'weekly';
  generated_at: string;
  briefing_en: string;
  briefing_ar: string;
  alerts: BriefingAlert[];
}

export async function fetchLatestBriefing(token: string): Promise<Briefing> {
  return apiFetch<Briefing>('/api/briefing/latest', { token });
}

export async function generateBriefing(
  token: string,
  period: 'daily' | 'weekly' = 'daily'
): Promise<Briefing> {
  return apiFetch<Briefing>('/api/briefing/generate', {
    method: 'POST',
    body: JSON.stringify({ period }),
    token,
  });
}
```

```tsx
// components/BriefingCard.tsx
'use client';
import { useEffect, useState } from 'react';
import { fetchLatestBriefing, type Briefing, type BriefingAlert } from '@/lib/briefing';
import { reassignVendor } from '@/lib/tickets';
import { assignLead } from '@/lib/leads';
import { getAdminToken } from '@/lib/auth';

function AlertItem({ alert, onDismiss }: { alert: BriefingAlert; onDismiss: () => void }) {
  const token = getAdminToken();
  const severityColor = { critical: '#A32D2D', warning: '#854F0B', info: '#1D5C87' }[alert.severity];

  async function handleAction() {
    // Parse the action_endpoint to determine which API call to make
    const [method, path] = alert.action_endpoint.split(' ');
    const idMatch = path.match(/\/(\d+)\//);
    const entityId = idMatch ? parseInt(idMatch[1]) : null;

    if (method === 'PATCH' && path.includes('/vendor') && entityId) {
      // Open vendor selection modal in your UI; here we show the pattern
      const vendorId = 12; // from modal selection
      await reassignVendor(token, entityId, vendorId);
    } else if (method === 'PATCH' && path.includes('/assign') && entityId) {
      await assignLead(token, entityId, 'Ahmed K.'); // from modal selection
    }
    onDismiss();
  }

  return (
    <div style={{ borderLeft: `4px solid ${severityColor}`, padding: '12px 16px', marginBottom: 8 }}>
      <p dangerouslySetInnerHTML={{ __html: alert.message }} />
      <button onClick={handleAction} style={{ background: severityColor, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4 }}>
        {alert.action_label}
      </button>
    </div>
  );
}

export function BriefingCard() {
  const token = getAdminToken();
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  useEffect(() => {
    fetchLatestBriefing(token).then(setBriefing);
  }, [token]);

  if (!briefing) return <p>Loading briefing…</p>;

  return (
    <div>
      <div style={{ borderLeft: '4px solid #005B41', padding: '16px 20px', marginBottom: 24 }}>
        <p style={{ fontSize: 12, color: '#6B6B65' }}>
          {briefing.period === 'daily' ? 'Daily' : 'Weekly'} Briefing ·{' '}
          {new Date(briefing.generated_at).toLocaleString()}
        </p>
        <p>{briefing.briefing_en}</p>
      </div>
      {briefing.alerts.map((alert, i) => (
        <AlertItem
          key={i}
          alert={alert}
          onDismiss={() => setBriefing(prev =>
            prev ? { ...prev, alerts: prev.alerts.filter((_, j) => j !== i) } : prev
          )}
        />
      ))}
    </div>
  );
}
```

---

### Vendor Registry — list, onboard, update status

```ts
// lib/vendors.ts
import { apiFetch } from './api';

export interface Vendor {
  id: number;
  ref: string;
  company_name: string;
  categories: string[];
  towers_covered: string[];
  contact_name: string;
  phone: string;
  email: string;
  trade_licence: string;
  score: number;
  status: 'active' | 'onboarding' | 'suspended' | 'below_threshold';
  jobs_30d: number;
}

export async function fetchVendors(
  token: string,
  filters?: { status?: string; category?: string; min_score?: number }
): Promise<Vendor[]> {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
  );
  return apiFetch<Vendor[]>(`/api/vendors?${params}`, { token });
}

export async function createVendor(
  token: string,
  data: {
    company_name: string;
    categories: string[];
    towers_covered: string[];
    contact_name: string;
    phone: string;
    email?: string;
    trade_licence?: string;
  }
): Promise<Vendor> {
  return apiFetch<Vendor>('/api/vendors', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function updateVendorStatus(
  token: string,
  vendorId: number,
  status: 'active' | 'onboarding' | 'suspended'
): Promise<Vendor> {
  return apiFetch<Vendor>(`/api/vendors/${vendorId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
}
```

---

## 7. Error Handling Patterns

```ts
// lib/useApiCall.ts
import { useState, useCallback } from 'react';

export function useApiCall<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (...args: Args): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { call, loading, error };
}
```

```tsx
// Usage — approve work order with loading state
const { call: approve, loading, error } = useApiCall(approveWorkOrder);

async function handleApprove() {
  const updated = await approve(token, orderId, 'FM Manager');
  if (updated) {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  }
}

return (
  <button onClick={handleApprove} disabled={loading}>
    {loading ? 'Approving…' : 'Approve'}
  </button>
);
```

---

## 8. TypeScript Type Index

All types are co-located with their feature modules:

| Type | Module |
|---|---|
| `ChatMessage`, `ChatResponse`, `StructuredOutput`, `ActionTaken` | `lib/chat.ts` |
| `LeadScorePayload`, `QuotePayload`, `TicketRefPayload`, `VendorRefPayload` | `lib/structuredOutput.ts` |
| `DashboardStats` | `lib/dashboard.ts` |
| `Lead` | `lib/leads.ts` |
| `Ticket` | `lib/tickets.ts` |
| `WorkOrder` | `lib/workOrders.ts` |
| `Briefing`, `BriefingAlert` | `lib/briefing.ts` |
| `Vendor` | `lib/vendors.ts` |
