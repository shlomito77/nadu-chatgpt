"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AlbumList from "@/components/gallery/AlbumList";
import CreateAlbumModal from "@/components/gallery/CreateAlbumModal";
import { Plus } from "lucide-react";

interface Album {
  id: string;
  title: string;
  visibility: "public" | "friends" | "private";
  photoCount: number;
}

export default function GalleryPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function fetchAlbums() {
        if (!user) return;
        try {
            const q = query(collection(db, "users", user.uid, "albums"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Album[];
            setAlbums(data);
        } catch (e) {
            console.error("Error fetching albums", e);
        } finally {
            setLoading(false);
        }
    }
    fetchAlbums();
  }, [user]);

  if (!user) return <div>Please log in.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Gallery</h1>
        <button onClick={() => setShowCreate(true)} className="p-2 bg-white text-black rounded-full">
            <Plus />
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No albums yet.</div>
      ) : (
        <AlbumList albums={albums} ownerUid={user.uid} />
      )}

      {showCreate && <CreateAlbumModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
