interface Props {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, sub, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: '#1A1A18' }}>{title}</h1>
        {sub && <p className="text-sm mt-0.5" style={{ color: '#6B6B65' }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
