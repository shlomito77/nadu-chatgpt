import { Lock, Users, Globe } from "lucide-react";
import Link from "next/link";

interface Album {
  id: string;
  title: string;
  visibility: "public" | "friends" | "private";
  photoCount: number;
}

export default function AlbumList({ albums, ownerUid }: { albums: Album[], ownerUid: string }) {
  const getIcon = (v: string) => {
    if (v === 'private') return <Lock size={14} />;
    if (v === 'friends') return <Users size={14} />;
    return <Globe size={14} />;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {albums.map(album => (
        <Link href={`/profile/gallery/${album.id}?uid=${ownerUid}`} key={album.id} className="block group">
            <div className="aspect-square bg-slate-800 rounded-xl border border-slate-700 relative overflow-hidden">
                {/* Cover logic would go here */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold text-4xl group-hover:scale-110 transition-transform">
                    {album.title[0]}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-lg backdrop-blur text-white">
                    {getIcon(album.visibility)}
                </div>
            </div>
            <div className="mt-2">
                <h3 className="font-bold text-sm truncate">{album.title}</h3>
                <p className="text-xs text-slate-500">{album.photoCount} photos</p>
            </div>
        </Link>
      ))}
    </div>
  );
}
