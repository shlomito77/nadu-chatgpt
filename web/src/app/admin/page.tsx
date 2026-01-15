"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Check, X } from "lucide-react";

interface VerificationRequest {
  id: string;
  uid: string;
  displayName: string;
  photoUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // MVP Admin Check: Hardcoded UID or Role check
  // In real app, check Custom Claims. For MVP, we'll assume only specific UIDs can see this page
  // or rely on Firestore Rules blocking reads if not admin.
  // Since we haven't implemented Admin Custom Claims setting UI, this page might error out for normal users, which is fine.

  useEffect(() => {
    async function fetchRequests() {
      if (!user) return;
      try {
        const q = query(collection(db, "verificationRequests"), where("status", "==", "pending"));
        const snapshot = await getDocs(q);
        setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VerificationRequest[]);
      } catch (e) {
        console.error("Admin fetch error (likely not admin)", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [user]);

  const handleDecision = async (req: VerificationRequest, approved: boolean) => {
    try {
        // 1. Update Request Status
        await updateDoc(doc(db, "verificationRequests", req.id), {
            status: approved ? "approved" : "rejected",
            reviewedAt: serverTimestamp(),
            reviewedBy: user?.uid
        });

        // 2. If approved, update User doc
        if (approved) {
            await updateDoc(doc(db, "users", req.uid), {
                isVerified: true
            });
        }

        // Remove from local list
        setRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (e) {
        console.error("Decision failed", e);
        alert("Action failed.");
    }
  };

  if (!user) return <div>Please log in.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-indigo-400">Admin Dashboard</h1>

      <div className="space-y-4">
          <h2 className="text-lg font-bold">Verification Requests ({requests.length})</h2>

          {loading ? (
              <div>Loading...</div>
          ) : requests.length === 0 ? (
              <div className="text-slate-500">No pending requests.</div>
          ) : (
              <div className="grid gap-4">
                  {requests.map(req => (
                      <div key={req.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col space-y-4">
                          <div className="flex items-center space-x-4">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black">
                                  <Image src={req.photoUrl} alt="Proof" fill className="object-cover" />
                              </div>
                              <div>
                                  <div className="font-bold">{req.displayName}</div>
                                  <div className="text-xs text-slate-500">UID: {req.uid}</div>
                              </div>
                          </div>

                          <div className="flex space-x-2">
                              <button
                                onClick={() => handleDecision(req, true)}
                                className="flex-1 bg-green-900/30 text-green-400 border border-green-900 py-2 rounded-lg flex items-center justify-center hover:bg-green-900/50"
                              >
                                  <Check size={18} className="mr-2" /> Approve
                              </button>
                              <button
                                onClick={() => handleDecision(req, false)}
                                className="flex-1 bg-red-900/30 text-red-400 border border-red-900 py-2 rounded-lg flex items-center justify-center hover:bg-red-900/50"
                              >
                                  <X size={18} className="mr-2" /> Reject
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}
