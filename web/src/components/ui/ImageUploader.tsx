"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  pathPrefix: string; // e.g., "users/uid/public" or "posts/uid"
  currentImage?: string | null;
  className?: string;
  isCircular?: boolean;
}

import { uploadFile } from "@/lib/storage";

export default function ImageUploader({
  onUpload,
  pathPrefix,
  currentImage,
  className = "",
  isCircular = false,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const path = `${pathPrefix}/${fileName}`;
      const url = await uploadFile(file, path);
      onUpload(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
      setPreview(currentImage || null); // Revert on failure
    } finally {
      setUploading(false);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUpload(""); // Or handle delete if needed, for MVP just clear ref
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`relative group cursor-pointer ${className}`} onClick={() => fileInputRef.current?.click()}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className={`relative w-full h-full overflow-hidden ${isCircular ? "rounded-full" : "rounded-xl"}`}>
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="animate-spin text-white" />
            </div>
          )}
          {!uploading && (
            <button
              onClick={clearImage}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-red-500/80 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-800 border-2 border-dashed border-slate-700 hover:border-slate-500 transition-colors text-slate-400 ${isCircular ? "rounded-full" : "rounded-xl"}`}>
          <Camera size={24} />
          {!isCircular && <span className="text-xs mt-2">Add Photo</span>}
        </div>
      )}
    </div>
  );
}
