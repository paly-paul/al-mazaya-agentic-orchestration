import Link from 'next/link';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  accent?: string;
}

export default function MetricCard({ label, value, sub, href, accent }: Props) {
  const inner = (
    <div
      className="rounded-lg p-5 flex flex-col gap-1 cursor-pointer hover:shadow-sm transition-shadow"
      style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#6B6B65' }}>
        {label}
      </div>
      <div className="text-2xl font-bold" style={{ color: accent || '#1A1A18' }}>
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: '#6B6B65' }}>{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
