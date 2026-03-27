import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PostDoc } from "@/types/db";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ReportDialog } from "@/components/moderation/ReportDialog";

interface PostCardProps {
  post: PostDoc;
}

export function PostCard({ post }: PostCardProps) {
  const isAnonymous = post.isAnonymous;
  const displayName = isAnonymous ? "Anonymous" : post.authorDisplayName;
  const photoURL = isAnonymous ? undefined : post.authorPhotoURL;

  const createdAt = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

  return (
    <Card className="mb-4 bg-gray-950 border-gray-800">
      <div className="block hover:bg-gray-900/50 transition-colors rounded-t-lg">
        <Link href={`/posts/${post.id}`}>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar src={photoURL} fallback={displayName.charAt(0)} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-200">{displayName}</span>
              <span className="text-xs text-gray-500">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-bold mb-2 text-white">{post.title}</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-300 line-clamp-3">{post.content}</p>
          </CardContent>
        </Link>
      </div>

      <CardFooter className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-800 bg-gray-950 rounded-b-lg px-6 pb-4">
        <div className="flex gap-4">
          <span>{post.commentCount} Comments</span>
          <span>{post.likeCount} Likes</span>
        </div>

        {/* Prevent click propagation if needed, or place outside Link */}
        <div onClick={(e) => e.stopPropagation()}>
          <ReportDialog targetType="post" targetId={post.id} />
        </div>
      </CardFooter>
    </Card>
  );
}
