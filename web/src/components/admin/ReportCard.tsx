'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from 'lucide-react'; // Wait, Badge is usually a component
import { Flag, X, Check, Trash, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useState } from 'react';

interface Report {
  reportId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description?: string;
  createdAt: any;
  status: string;
}

interface ReportCardProps {
  report: Report;
  onResolve: (reportId: string) => void;
}

export function ReportCard({ report, onResolve }: ReportCardProps) {
  const [processing, setProcessing] = useState(false);

  const handleAction = async (action: 'dismiss' | 'ban_user' | 'delete_content') => {
    if (!confirm('האם אתה בטוח?')) return;
    setProcessing(true);

    try {
      const functions = getFunctions();
      const resolveReport = httpsCallable(functions, 'resolveReport');
      await resolveReport({
        reportId: report.reportId,
        action
      });
      onResolve(report.reportId);
    } catch (err) {
      console.error('Error resolving report:', err);
      alert('שגיאה בביצוע הפעולה');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded border border-red-900/50 uppercase font-bold">
              {report.targetType}
            </span>
            <span className="text-slate-400 text-xs">
              {report.createdAt?.toDate ? formatDistanceToNow(report.createdAt.toDate(), { locale: he }) : ''}
            </span>
          </div>
          <Flag className="h-4 w-4 text-red-500" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="font-bold text-slate-200">{report.reason}</div>
        {report.description && (
          <div className="text-slate-400 bg-slate-950 p-2 rounded">
            "{report.description}"
          </div>
        )}
        <div className="text-xs text-slate-500">ID: {report.targetId}</div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-800 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-slate-700 hover:bg-slate-800"
          onClick={() => handleAction('dismiss')}
          disabled={processing}
        >
          <X className="h-4 w-4 mr-1" /> התעלם
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="flex-1 bg-red-900/50 hover:bg-red-900 border border-red-800"
          onClick={() => handleAction('delete_content')}
          disabled={processing || report.targetType === 'user'}
        >
          <Trash className="h-4 w-4 mr-1" /> מחק
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="flex-1"
          onClick={() => handleAction('ban_user')}
          disabled={processing}
        >
          <Ban className="h-4 w-4 mr-1" /> חסום
        </Button>
      </CardFooter>
    </Card>
  );
}
