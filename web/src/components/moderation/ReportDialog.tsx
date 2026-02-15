"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // We'll need a dialog component or native
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { Flag } from "lucide-react";

interface ReportDialogProps {
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
}

export function ReportDialog({ targetType, targetId }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      const createReport = httpsCallable(functions, "createReport");
      await createReport({ targetType, targetId, reason, description });
      setIsOpen(false);
      alert("Report submitted. Thank you for keeping the community safe.");
      setReason("");
      setDescription("");
    } catch (error) {
      console.error("Report failed:", error);
      alert("Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="gap-2 text-xs h-8 px-2 border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300">
        <Flag size={12} />
        Report
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold mb-2">Report {targetType}</h2>
            <p className="text-sm text-gray-400 mb-4">Why are you reporting this?</p>

            <div className="space-y-4">
              <select
                className="w-full bg-black border border-gray-700 rounded p-2 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="spam">Spam or unwanted content</option>
                <option value="harassment">Harassment or bullying</option>
                <option value="hate_speech">Hate speech</option>
                <option value="violence">Violence or physical harm</option>
                <option value="other">Other</option>
              </select>

              <Textarea
                placeholder="Additional details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>Cancel</Button>
                <Button variant="danger" onClick={handleSubmit} disabled={loading || !reason}>
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
