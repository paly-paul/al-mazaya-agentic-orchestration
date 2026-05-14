import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-[220px] overflow-y-auto p-8" style={{ background: '#F8F7F4' }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
