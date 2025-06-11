"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Paperclip, X } from "lucide-react";
import { useRef } from "react";

interface ProfileEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string | null;
  initialBio: string | null;
  initialAvatarUrl: string | null;
  onProfileUpdated: (name: string, bio: string, avatarUrl: string) => void;
}

export function ProfileEditForm({
  open,
  onOpenChange,
  initialName,
  initialBio,
  initialAvatarUrl,
  onProfileUpdated,
}: ProfileEditFormProps) {
  const [name, setName] = useState(initialName || "");
  const [bio, setBio] = useState(initialBio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialAvatarUrl || null
  );
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setUploading(true);
    try {
      // 1. Get pre-signed URL
      const { data: urlRes } = await api.post("/media/upload-url", {
        fileType: selectedFile.type,
      });
      const { uploadUrl, fileUrl } = urlRes.data;

      // 2. Upload file to S3
      await api.put(uploadUrl, selectedFile, {
        headers: { "Content-Type": selectedFile.type },
      });
      // 3. Save metadata
      const { data: metaRes } = await api.post("/media/metadata", {
        url: fileUrl,
        type: selectedFile.type,
        size: selectedFile.size,
      });
      setAvatarUrl(fileUrl);
      toast.success("Avatar uploaded!");
    } catch (err) {
      if (err instanceof Error) {
        console.error("Upload failed:", err.message, err.stack);
      } else {
        console.error("Upload failed:", err);
      }
      toast.error("Avatar upload failed");
      setPreviewUrl(initialAvatarUrl || null);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setFile(null);
    setPreviewUrl(null);
    setAvatarUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/profile", { name, bio, avatarUrl });
      toast.success("Profile updated successfully");
      onProfileUpdated(name, bio, avatarUrl);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mb-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
                size="icon"
                aria-label="Upload avatar"
              >
                {uploading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </Button>
              {previewUrl && (
                <div className="relative w-fit max-w-[80px]">
                  <Image
                    src={previewUrl}
                    alt="Avatar Preview"
                    className="rounded border border-gray-200 bg-white object-cover max-h-16"
                    width={48}
                    height={48}
                  />
                  <Button
                    type="button"
                    onClick={handleRemovePreview}
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 bg-white hover:bg-gray-100 shadow p-1 h-5 w-5"
                    aria-label="Remove avatar"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              Save
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
