"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface ReportButtonProps {
  targetId: string;
  targetType: "post" | "user" | "comment" | "chat";
}

export default function ReportButton({ targetId, targetType }: ReportButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "reports"), {
        targetId,
        targetType,
        reason,
        reporterId: user.uid,
        status: "open",
        createdAt: serverTimestamp()
      });
      setIsOpen(false);
      alert("Report submitted.");
    } catch (e) {
      console.error("Report error", e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-slate-500 hover:text-red-500 transition-colors p-1">
        <Flag size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center text-red-500">
                  <AlertTriangle className="mr-2" size={20}/> Report
              </h2>
              <button onClick={() => setIsOpen(false)}><X /></button>
            </div>

            <div>
                <label className="block text-sm mb-2 text-slate-300">Reason</label>
                <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                >
                    <option value="spam">Spam / Bot</option>
                    <option value="harassment">Harassment</option>
                    <option value="fake">Fake Profile</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <button
                onClick={handleReport}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
            >
                {loading ? "Reporting..." : "Submit Report"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
