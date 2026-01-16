'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flag, X, Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface ReportDialogProps {
  targetId: string;
  targetType: 'post' | 'user' | 'comment';
  isOpen: boolean;
  onClose: () => void;
}

const REASONS = [
  'תוכן פוגעני / הטרדה',
  'ספאם / פרסום',
  'תוכן לא חוקי',
  'חשיפת פרטים אישיים',
  'אחר'
];

export function ReportDialog({ targetId, targetType, isOpen, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);

    try {
      const functions = getFunctions();
      const createReport = httpsCallable(functions, 'createReport');
      await createReport({
        targetId,
        targetType,
        reason
      });
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error('Error reporting:', err);
      alert('שגיאה בשליחת הדיווח');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-sm bg-slate-900 border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
        {!submitted ? (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2 text-red-400">
                <Flag className="h-5 w-5" />
                דיווח על תוכן
              </h3>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-400">אנא בחר את הסיבה לדיווח:</p>
              <div className="space-y-1">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`w-full text-right p-3 rounded-lg text-sm transition-colors ${
                      reason === r
                        ? 'bg-red-950/50 text-red-200 border border-red-900'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSubmit}
              disabled={!reason || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              שלח דיווח
            </Button>
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <div className="h-12 w-12 bg-green-900/50 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">הדיווח התקבל</h3>
            <p className="text-sm text-slate-400">תודה על עזרתך בשמירה על הקהילה בטוחה.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
