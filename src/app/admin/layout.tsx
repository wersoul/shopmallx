import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminSidebar from './AdminSidebar';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/admin');
  if (user.role !== 'admin') redirect('/');

  return (
    <div className="max-w-7xl mx-auto px-3 py-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <AdminSidebar />
        <main className="md:col-span-4">{children}</main>
      </div>
    </div>
  );
}