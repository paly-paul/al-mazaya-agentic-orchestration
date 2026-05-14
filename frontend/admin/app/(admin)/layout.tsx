import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-mazaya-bg">
        <Sidebar />
        <main className="flex-1 ml-[220px] min-h-screen">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
