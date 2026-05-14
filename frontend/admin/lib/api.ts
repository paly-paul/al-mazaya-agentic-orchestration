const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts?.headers,
    },
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data as T;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    req<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Dashboard
  getDashboardStats: () => req('/api/dashboard/stats'),
  getLiveChats: () => req('/api/dashboard/live-chats'),

  // Briefing
  getLatestBriefing: () => req('/api/briefing/latest'),
  generateBriefing: (period: 'daily' | 'weekly') =>
    req('/api/briefing/generate', { method: 'POST', body: JSON.stringify({ period, language: 'en' }) }),

  // Leads
  getLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req(`/api/leads${qs}`);
  },
  getLead: (id: number) => req(`/api/leads/${id}`),
  assignLead: (id: number, assigned_to: string) =>
    req(`/api/leads/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assigned_to }) }),
  updateLeadStatus: (id: number, status: string) =>
    req(`/api/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Tickets
  getTickets: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req(`/api/tickets${qs}`);
  },
  getTicket: (id: number) => req(`/api/tickets/${id}`),
  reassignTicketVendor: (id: number, vendor_id: number) =>
    req(`/api/tickets/${id}/vendor`, { method: 'PATCH', body: JSON.stringify({ vendor_id }) }),
  escalateTicket: (id: number) =>
    req(`/api/tickets/${id}/priority`, { method: 'PATCH', body: JSON.stringify({ priority: 'P1' }) }),
  closeTicket: (id: number, resolution_note: string) =>
    req(`/api/tickets/${id}/close`, { method: 'PATCH', body: JSON.stringify({ resolution_note }) }),

  // Work Orders
  getWorkOrders: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req(`/api/work-orders${qs}`);
  },
  getWorkOrder: (id: number) => req(`/api/work-orders/${id}`),
  approveWorkOrder: (id: number, approved_by: string) =>
    req(`/api/work-orders/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ approved_by }) }),
  rejectWorkOrder: (id: number, rejected_by: string, reason: string) =>
    req(`/api/work-orders/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ rejected_by, reason }) }),

  // Vendors
  getVendors: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req(`/api/vendors${qs}`);
  },
  getVendor: (id: number) => req(`/api/vendors/${id}`),
  createVendor: (data: Record<string, unknown>) =>
    req('/api/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateVendorStatus: (id: number, status: string) =>
    req(`/api/vendors/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Chat sessions
  getSession: (session_id: string) => req(`/api/chat/sessions/${session_id}`),

  // Reports
  getReports: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req(`/api/reports${qs}`);
  },
};
