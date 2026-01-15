"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, doc, getDoc, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useParams, useSearchParams } from "next/navigation";
import ImageUploader from "@/components/ui/ImageUploader";
import Image from "next/image";

interface Album {
  id: string;
  title: string;
  visibility: "public" | "friends" | "private";
}

export default function AlbumViewPage() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const albumId = params.id as string;
  const ownerUid = searchParams.get("uid") || user?.uid;

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.uid === ownerUid;

  useEffect(() => {
    async function fetchData() {
        if (!ownerUid || !albumId) return;
        try {
            // Fetch Album Metadata first to know visibility
            const albumRef = doc(db, "users", ownerUid, "albums", albumId);
            const albumSnap = await getDoc(albumRef);
            if (albumSnap.exists()) {
                setAlbum({ id: albumSnap.id, ...albumSnap.data() } as Album);
            }

            // Fetch Photos
            const q = query(collection(db, "users", ownerUid, "albums", albumId, "photos"));
            const snapshot = await getDocs(q);
            setPhotos(snapshot.docs.map(doc => doc.data()));
        } catch (e) {
            console.error("Error fetching album data", e);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [ownerUid, albumId]);

  const handleUpload = async (url: string) => {
    if (!user || !isOwner || !album) return;
    try {
        await addDoc(collection(db, "users", user.uid, "albums", albumId, "photos"), {
            url,
            createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, "users", user.uid, "albums", albumId), {
            photoCount: increment(1)
        });
        window.location.reload();
    } catch (e) {
        console.error("Upload error", e);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!album) return <div>Album not found or access denied.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{album.title} <span className="text-sm font-normal text-slate-500">({album.visibility})</span></h1>

      {isOwner && (
        <div className="h-32 bg-slate-900 rounded-xl border border-dashed border-slate-700">
            <ImageUploader
                onUpload={handleUpload}
                pathPrefix={`users/${user?.uid}/albums/${album.visibility}`}
                className="w-full h-full"
            />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, idx) => (
            <div key={idx} className="aspect-square relative rounded-lg overflow-hidden bg-slate-800">
                <Image src={photo.url} alt="Photo" fill className="object-cover" />
            </div>
        ))}
      </div>
    </div>
  );
}
