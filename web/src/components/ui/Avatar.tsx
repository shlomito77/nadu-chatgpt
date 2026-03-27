/* eslint-disable @next/next/no-img-element */
import { ImgHTMLAttributes } from "react";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export const Avatar = ({ src, alt, fallback = "U", size = "md", className = "", ...props }: AvatarProps) => {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt || "Avatar"} className="aspect-square h-full w-full object-cover" {...props} />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-gray-300 font-medium uppercase">
          {fallback.charAt(0)}
        </div>
      )}
    </div>
  );
};
