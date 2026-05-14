const BADGE: Record<string, { bg: string; color: string; label?: string }> = {
  // Priority
  P1: { bg: '#FBEAEA', color: '#A32D2D', label: '● P1' },
  P2: { bg: '#FEF3E2', color: '#854F0B', label: '● P2' },
  P3: { bg: '#E8F5F0', color: '#0F6E56', label: '● P3' },
  // Status generic
  active: { bg: '#E8F5F0', color: '#005B41' },
  completed: { bg: '#E8F5F0', color: '#005B41' },
  in_progress: { bg: '#E8F5F0', color: '#0F6E56' },
  pending: { bg: '#FEF3E2', color: '#854F0B' },
  pending_approval: { bg: '#FEF3E2', color: '#854F0B', label: 'Pending approval' },
  onboarding: { bg: '#FEF3E2', color: '#854F0B' },
  suspended: { bg: '#F5F5F5', color: '#6B6B65' },
  cancelled: { bg: '#F5F5F5', color: '#6B6B65' },
  below_threshold: { bg: '#FBEAEA', color: '#A32D2D', label: 'Below threshold' },
  unresponsive: { bg: '#FBEAEA', color: '#A32D2D' },
  en_route: { bg: '#FEF3E2', color: '#854F0B', label: 'En route' },
  scheduled: { bg: '#E8F5F0', color: '#005B41' },
  pending_schedule: { bg: '#F5F5F5', color: '#6B6B65', label: 'Pending schedule' },
  // Lead status
  follow_up_due: { bg: '#FEF3E2', color: '#854F0B', label: 'Follow-up due' },
  meeting_set: { bg: '#E8F5F0', color: '#005B41', label: 'Meeting set' },
  proposal_sent: { bg: '#E8F5F0', color: '#005B41', label: 'Proposal sent' },
  nurture: { bg: '#FEF3E2', color: '#854F0B', label: 'Nurture' },
  cold_outreach: { bg: '#F5F5F5', color: '#6B6B65', label: 'Cold outreach' },
  closed_won: { bg: '#E8F5F0', color: '#005B41', label: 'Won' },
  closed_lost: { bg: '#FBEAEA', color: '#A32D2D', label: 'Lost' },
  // Source
  whatsapp: { bg: '#E3F2FD', color: '#1565C0' },
  web_chat: { bg: '#F5F5F5', color: '#6B6B65', label: 'Web' },
  email: { bg: '#F5F5F5', color: '#6B6B65' },
  hotline: { bg: '#F5F5F5', color: '#6B6B65' },
  // Severity
  critical: { bg: '#FBEAEA', color: '#A32D2D' },
  warning: { bg: '#FEF3E2', color: '#854F0B' },
  info: { bg: '#E3F2FD', color: '#1565C0' },
};

interface Props {
  value: string;
  className?: string;
}

export default function StatusBadge({ value, className = '' }: Props) {
  const key = value.toLowerCase().replace(/ /g, '_');
  const style = BADGE[key] || { bg: '#F5F5F5', color: '#6B6B65' };
  const label = style.label || value.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${className}`}
      style={{ background: style.bg, color: style.color }}
    >
      {label}
    </span>
  );
}
