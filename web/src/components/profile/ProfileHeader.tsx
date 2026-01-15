import { AppUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Settings, Shield, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface ProfileHeaderProps {
  user: AppUser;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  // Role colors
  const roleColors = {
    dom: 'bg-red-950/50 text-red-400 border-red-900',
    sub: 'bg-indigo-950/50 text-indigo-400 border-indigo-900',
    switch: 'bg-purple-950/50 text-purple-400 border-purple-900',
    curious: 'bg-slate-800 text-slate-400 border-slate-700',
    other: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const roleLabels = {
    dom: 'Dominant',
    sub: 'Submissive',
    switch: 'Switch',
    curious: 'Curious',
    other: 'Other'
  };

  return (
    <div className="relative">
      {/* Cover Image Placeholder */}
      <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl w-full" />

      <div className="px-4 pb-4">
        <div className="relative flex justify-between items-end -mt-12 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-slate-600" />
              )}
            </div>
            {/* Online Indicator */}
            <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-slate-950 bg-green-500" />
          </div>

          {/* Actions */}
          {isOwnProfile && (
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="bg-slate-950/50 backdrop-blur">
                <Settings className="h-4 w-4 ml-2" />
                עריכה
              </Button>
            </Link>
          )}
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
              <span className="text-sm text-slate-400">@{user.username}</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium border",
                roleColors[user.role || 'other']
              )}>
                {roleLabels[user.role || 'other']}
              </span>

              {user.age > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-medium border border-slate-800 bg-slate-900 text-slate-400">
                  {user.age}
                </span>
              )}

              {/* Mock Verified Badge */}
              <span className="px-2 py-0.5 rounded text-xs font-medium border border-blue-900/50 bg-blue-950/30 text-blue-400 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                מאומת
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 py-2 border-y border-slate-800/50">
            <div className="text-center">
              <span className="block text-lg font-bold text-white">0</span>
              <span className="text-xs text-slate-500">פוסטים</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-white">0</span>
              <span className="text-xs text-slate-500">עוקבים</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-white">0</span>
              <span className="text-xs text-slate-500">נעקבים</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {user.bio}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">
              טרם נוסף תיאור...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
