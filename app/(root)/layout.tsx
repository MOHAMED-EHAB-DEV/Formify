import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { SocketProvider } from '@/context/socket-context';

export const dynamic = 'force-dynamic';

export default async function RootAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <SocketProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop Sidebar */}
        <Sidebar user={user} />

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 md:ps-60">
          <Topbar user={user} />
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}