'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearToken } from '@/lib/auth';
import { api } from '@/lib/api';
import type { NavBadges } from '@/lib/types';

const NAV = [
  {
    group: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '▦' },
      { label: 'AI Briefing', href: '/briefing', icon: '✦', badge: 'briefing_alerts' },
    ],
  },
  {
    group: 'OPERATIONS',
    items: [
      { label: 'Lead Pipeline', href: '/leads', icon: '◈', badge: 'open_leads' },
      { label: 'Maintenance Tickets', href: '/tickets', icon: '⚡', badge: 'p1_p2_tickets', badgeRed: true },
      { label: 'Facility Services', href: '/facility', icon: '⚙' },
      { label: 'Vendor Registry', href: '/vendors', icon: '◎' },
    ],
  },
  {
    group: 'ANALYTICS',
    items: [
      { label: 'Live Chats', href: '/chats', icon: '◉' },
      { label: 'Reports', href: '/reports', icon: '▤' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [badges, setBadges] = useState<NavBadges>({
    briefing_alerts: 0, open_leads: 0, p1_p2_tickets: 0, has_p1: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await api.getDashboardStats() as {
          open_tickets: number; lead_pipeline_count: number;
          tickets_by_priority: { P1: number; P2: number; P3: number };
        };
        const briefing = await api.getLatestBriefing() as { alerts: { severity: string }[] };
        setBadges({
          briefing_alerts: briefing?.alerts?.filter((a) => a.severity !== 'info').length ?? 0,
          open_leads: stats?.lead_pipeline_count ?? 0,
          p1_p2_tickets: (stats?.tickets_by_priority?.P1 ?? 0) + (stats?.tickets_by_priority?.P2 ?? 0),
          has_p1: (stats?.tickets_by_priority?.P1 ?? 0) > 0,
        });
      } catch {
        // silently ignore — backend may not be running
      }
    };
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  const logout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] flex flex-col"
      style={{ background: '#FFFFFF', borderRight: '1px solid #E8E5DF' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E8E5DF]">
        <div className="text-[#005B41] font-semibold text-sm leading-tight">Mazaya FM</div>
        <div className="text-[#6B6B65] text-[10px] uppercase tracking-widest mt-0.5">Operations Console</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV.map((group) => (
          <div key={group.group} className="mb-4">
            <div
              className="px-3 mb-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: '#6B6B65' }}
            >
              {group.group}
            </div>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const badgeCount = item.badge ? badges[item.badge as keyof NavBadges] : 0;
              const isRed = item.badgeRed && badges.has_p1;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-md mb-0.5 text-sm transition-colors"
                  style={{
                    background: active ? '#F0F8F5' : 'transparent',
                    color: active ? '#005B41' : '#1A1A18',
                    borderLeft: active ? '3px solid #005B41' : '3px solid transparent',
                    fontWeight: active ? '600' : '400',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </span>
                  {typeof badgeCount === 'number' && badgeCount > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white min-w-[20px] text-center"
                      style={{ background: isRed ? '#A32D2D' : '#005B41' }}
                    >
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#E8E5DF]">
        <button
          onClick={logout}
          className="w-full text-left text-xs text-[#6B6B65] hover:text-[#A32D2D] transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
