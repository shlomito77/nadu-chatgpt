"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/Skeleton";
import { MessageSquare, ChevronRight } from "lucide-react";

interface Forum {
  id: string;
  name: string;
  description: string;
  postCount: number;
}

export default function ForumsPage() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "forums"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newForums = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Forum[];
      setForums(newForums);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching forums:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 pt-6">
      <h1 className="text-2xl font-bold text-slate-100 px-2">Forums</h1>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
               <div className="space-y-2">
                 <Skeleton className="w-32 h-5" />
                 <Skeleton className="w-48 h-3" />
               </div>
               <Skeleton className="w-6 h-6 rounded-full" />
            </div>
          ))
        ) : forums.length > 0 ? (
          forums.map((forum) => (
            <Link
              key={forum.id}
              href={`/forums/${forum.id}`}
              className="block bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 group-hover:text-white">{forum.name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-1">{forum.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{forum.postCount || 0} posts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500">
            No forums found.
          </div>
        )}
      </div>
    </div>
  );
}
