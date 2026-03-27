"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDistanceToNow } from "date-fns";

interface ReportDoc {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string;
  status: string;
  reporterUid: string;
  snapshot?: any;
  createdAt: any;
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Basic role check on client - Security Rules/Functions protect actual data
    if (!user) return;

    // Check claims if available on idTokenResult, but for MVP just try to fetch
    const fetchReports = async () => {
      try {
        const q = query(
          collection(db, "reports"),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportDoc));
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleResolve = async (reportId: string, action: 'dismiss' | 'ban_user' | 'delete_content') => {
    setProcessing(reportId);
    try {
      const resolveReport = httpsCallable(functions, "resolveReport");
      await resolveReport({
        reportId,
        action,
        notes: `Action taken via admin dashboard: ${action}`
      });

      // Remove from list
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (error) {
      console.error("Failed to resolve report:", error);
      alert("Action failed. Ensure you have admin permissions.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Moderation Dashboard</h1>

      <div className="grid gap-4">
        {reports.length === 0 && <p className="text-gray-500">No pending reports.</p>}

        {reports.map((report) => (
          <Card key={report.id} className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center text-lg">
                <span className="uppercase text-xs font-bold bg-red-900/50 text-red-400 px-2 py-1 rounded">
                  {report.targetType}
                </span>
                <span className="text-xs text-gray-500 font-normal">
                  {formatDistanceToNow(report.createdAt?.toDate ? report.createdAt.toDate() : new Date(), { addSuffix: true })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-1">Reason</h4>
                  <p className="text-red-300 font-medium mb-2">{report.reason}</p>

                  {report.description && (
                    <>
                      <h4 className="text-sm font-semibold text-gray-400 mb-1">Description</h4>
                      <p className="text-gray-300 text-sm mb-2">{report.description}</p>
                    </>
                  )}

                  <p className="text-xs text-gray-600 mt-2">Reporter: {report.reporterUid}</p>
                  <p className="text-xs text-gray-600">Target ID: {report.targetId}</p>
                </div>

                <div className="bg-black/50 p-4 rounded border border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Evidence Snapshot</h4>
                  {report.snapshot ? (
                    <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(report.snapshot, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No snapshot available</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
                <Button
                  variant="outline"
                  onClick={() => handleResolve(report.id, 'dismiss')}
                  disabled={processing === report.id}
                >
                  Dismiss
                </Button>

                {report.targetType === 'post' || report.targetType === 'comment' ? (
                   <Button
                    variant="danger"
                    onClick={() => handleResolve(report.id, 'delete_content')}
                    disabled={processing === report.id}
                   >
                     Delete Content
                   </Button>
                ) : null}

                <Button
                  className="bg-red-900 hover:bg-red-800 text-white"
                  onClick={() => handleResolve(report.id, 'ban_user')}
                  disabled={processing === report.id}
                >
                  Ban User
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
