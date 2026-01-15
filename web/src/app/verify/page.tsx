"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ImageUploader from "@/components/ui/ImageUploader";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function VerificationPage() {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !imageUrl) return;
    setLoading(true);
    try {
        await addDoc(collection(db, "verificationRequests"), {
            uid: user.uid,
            displayName: user.displayName,
            photoUrl: imageUrl,
            status: "pending",
            createdAt: serverTimestamp()
        });
        setSubmitted(true);
    } catch (e) {
        console.error("Verification submit failed", e);
        alert("Failed to submit request.");
    } finally {
        setLoading(false);
    }
  };

  if (!user) return <div>Please log in.</div>;

  if (submitted) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
              <CheckCircle size={64} className="text-green-500" />
              <h1 className="text-2xl font-bold">Request Submitted</h1>
              <p className="text-slate-400">Our team will review your photo shortly.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Get Verified</h1>

      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-start space-x-3">
              <AlertCircle className="text-indigo-400 shrink-0 mt-1" />
              <div>
                  <h3 className="font-bold">Instructions</h3>
                  <p className="text-sm text-slate-300 mt-1">
                      Upload a photo of yourself holding a piece of paper with your
                      <span className="font-bold text-white mx-1">Display Name</span>
                      and today's date written on it.
                  </p>
              </div>
          </div>
      </div>

      <div className="h-64 bg-slate-900 rounded-xl border border-dashed border-slate-700">
          <ImageUploader
            onUpload={setImageUrl}
            pathPrefix={`verification/${user.uid}`}
            currentImage={imageUrl}
            className="w-full h-full"
          />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!imageUrl || loading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
          {loading ? "Submitting..." : "Submit for Review"}
      </button>
    </div>
  );
}
