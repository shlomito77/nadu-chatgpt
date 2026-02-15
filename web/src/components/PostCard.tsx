import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PostDoc } from "@/types/db";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PostCardProps {
  post: PostDoc;
}

export function PostCard({ post }: PostCardProps) {
  const isAnonymous = post.isAnonymous;
  const displayName = isAnonymous ? "Anonymous" : post.authorDisplayName;
  const photoURL = isAnonymous ? undefined : post.authorPhotoURL;

  // Handle Firestore Timestamp or Date object if converted
  const createdAt = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

  return (
    <Card className="mb-4 hover:bg-gray-900 transition-colors">
      <Link href={`/posts/${post.id}`}>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar src={photoURL} fallback={displayName.charAt(0)} />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{displayName}</span>
            <span className="text-xs text-gray-400">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-bold mb-2">{post.title}</h3>
          <p className="whitespace-pre-wrap text-sm text-gray-300">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
          <span>{post.commentCount} Comments</span>
          <span>{post.likeCount} Likes</span>
        </CardFooter>
      </Link>
    </Card>
  );
}
