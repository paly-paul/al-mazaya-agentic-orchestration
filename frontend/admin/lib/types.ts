export interface DashboardStats {
  open_tickets: number;
  avg_tat_hours: number;
  lead_pipeline_count: number;
  active_vendors: number;
  chat_sessions_today: number;
  sla_compliance_pct: number;
  tickets_by_tower: { tower: string; count: number }[];
  leads_by_score_tier: { hot: number; warm: number; cold: number };
  tickets_by_priority: { P1: number; P2: number; P3: number };
}

export interface Lead {
  id: number;
  name: string;
  specialty: string;
  tower_preference: string;
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  source: 'web_chat' | 'whatsapp' | 'email' | 'hotline';
  status: string;
  assigned_to: string | null;
  created_at: string;
  phone: string;
  clinic_size: string;
  budget_range: string;
  timeline: string;
}

export interface Ticket {
  id: number;
  ref: string;
  tower: string;
  floor: string;
  clinic_number: string;
  category: string;
  priority: 'P1' | 'P2' | 'P3';
  vendor_id: number | null;
  vendor_name: string | null;
  status: string;
  sla_deadline: string;
  created_at: string;
  description: string;
  tenant_name: string;
  resolution_note: string | null;
}

export interface WorkOrder {
  id: number;
  ref: string;
  tenant_name: string;
  tower: string;
  floor: string;
  service_type: string;
  quote_amount: number;
  status: string;
  vendor_id: number | null;
  vendor_name: string | null;
  created_at: string;
  specification: Record<string, unknown>;
  quote_breakdown: Record<string, unknown>;
}

export interface Vendor {
  id: number;
  company_name: string;
  categories: string[];
  towers_covered: string[];
  score: number;
  jobs_30d: number;
  status: 'active' | 'onboarding' | 'suspended' | 'below_threshold';
  contact_name: string;
  phone: string;
  email: string;
  trade_licence: string;
}

export interface Alert {
  id?: number;
  severity: 'critical' | 'warning' | 'info';
  entity_type: string;
  entity_id: number;
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
  alerts: Alert[];
}

export interface ChatSession {
  session_id: string;
  use_case: string;
  language: string;
  last_message: string;
  created_at: string;
  updated_at: string;
  intent: string;
  user_name: string | null;
  messages?: { role: string; content: string; created_at: string }[];
}

export interface NavBadges {
  briefing_alerts: number;
  open_leads: number;
  p1_p2_tickets: number;
  has_p1: boolean;
}
