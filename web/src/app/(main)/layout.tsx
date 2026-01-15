import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-16">
      <TopBar />
      <main className="container mx-auto px-4 max-w-2xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
