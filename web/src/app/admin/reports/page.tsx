'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ReportCard } from '@/components/admin/ReportCard';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(
          collection(db, 'reports'),
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          reportId: doc.id,
          ...doc.data()
        }));

        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const handleResolve = (reportId: string) => {
    setReports(prev => prev.filter(r => r.reportId !== reportId));
  };

  if (loading) return <div className="text-center p-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-8 w-8 text-yellow-500" />
        <h2 className="text-2xl font-bold">דיווחים פתוחים ({reports.length})</h2>
      </div>

      {reports.length === 0 ? (
        <div className="text-center p-12 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
          אין דיווחים חדשים. הכל שקט...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <ReportCard key={report.reportId} report={report} onResolve={handleResolve} />
          ))}
        </div>
      )}
    </div>
  );
}
