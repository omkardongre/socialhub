"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";
import { Paperclip, X, Loader2 } from "lucide-react";
import { Media } from "@/types/media";

export function NewPostForm() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Media upload handler
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
      setMedia(metaRes.data);
      toast.success("Media uploaded!");
    } catch (err) {
      toast.error("Media upload failed");
      setMedia(null);
      setPreviewUrl(null);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setFile(null);
    setMedia(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const postMutation = useMutation({
    mutationFn: () =>
      api.post("/posts", {
        content,
        mediaUrl: media?.url,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setContent("");
      setFile(null);
      setMedia(null);
      toast.success("Post created!");
    },
  });

  return (
    <Card className="w-full bg-white border-none shadow-none">
      <CardContent className="p-4 flex flex-col gap-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="mb-2"
        />
        <div className="flex items-center gap-2 mb-2">
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="post-upload"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            size="icon"
            aria-label="Attach media"
          >
            {uploading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </Button>
          {previewUrl && (
            <div className="relative w-fit max-w-[120px]">
              {file && file.type.startsWith("image/") ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  className="rounded border border-gray-200 bg-white object-cover max-h-20"
                  width={80}
                  height={80}
                />
              ) : file && file.type.startsWith("video/") ? (
                <video
                  src={previewUrl}
                  controls
                  className="rounded border border-gray-200 bg-white object-cover max-h-20 w-20"
                  width={80}
                  height={80}
                />
              ) : null}
              <Button
                type="button"
                onClick={handleRemovePreview}
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 bg-white hover:bg-gray-100 shadow p-1 h-6 w-6"
                aria-label="Remove media"
              >
                <X className="w-3 h-3 text-gray-600" />
              </Button>
            </div>
          )}
        </div>
        <div className="mt-2 text-right">
          <Button
            onClick={() => postMutation.mutate()}
            disabled={!content || postMutation.isPending || uploading}
          >
            {postMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
