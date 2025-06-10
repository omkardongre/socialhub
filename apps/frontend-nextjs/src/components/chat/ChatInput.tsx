import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Socket } from "socket.io-client";
import { sendMessage } from "@/lib/chatSocket";
import { api } from "@/lib/axios";
import { Loader2, Paperclip, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function ChatInput({
  roomId,
  socket,
}: {
  roomId: string;
  socket: Socket | null;
}) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = (mediaUrl?: string) => {
    if (!text.trim() && !mediaUrl) return;
    if (!socket || !socket.connected) return;
    sendMessage(socket, roomId, text, mediaUrl);
    setText("");
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const { data: urlRes } = await api.post("/media/upload-url", {
        fileType: selectedFile.type,
      });
      const { uploadUrl, fileUrl } = urlRes.data;
      await api.put(uploadUrl, selectedFile, {
        headers: { "Content-Type": selectedFile.type },
      });
      await api.post("/media/metadata", {
        url: fileUrl,
        type: selectedFile.type,
        size: selectedFile.size,
      });
      handleSend(fileUrl);
    } catch (err) {
      toast.error("Media upload failed");
    }
    setUploading(false);
  };

  const handleRemovePreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="w-full bg-white border-none shadow-none">
      <CardContent className="p-2 flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !selectedFile) handleSend();
              if (e.key === "Enter" && selectedFile) handleUpload();
            }}
            disabled={uploading}
            className="flex-1 min-w-0"
            autoFocus
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="chat-upload"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            size="icon"
            aria-label="Attach image"
          >
            {uploading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </Button>
          <Button
            onClick={() => (selectedFile ? handleUpload() : handleSend())}
            disabled={uploading || (!text.trim() && !selectedFile)}
            variant="default"
            size="sm"
            className="ml-1"
          >
            Send
          </Button>
        </div>
        {previewUrl && (
          <div className="relative mt-2 w-fit max-w-xs">
            <Image
              src={previewUrl}
              alt="Preview"
              className="rounded border border-gray-200 bg-white object-contain max-h-40"
              width={240}
              height={160}
            />
            <Button
              type="button"
              onClick={handleRemovePreview}
              size="icon"
              variant="ghost"
              className="absolute top-1 right-1 bg-white hover:bg-gray-100 shadow"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
