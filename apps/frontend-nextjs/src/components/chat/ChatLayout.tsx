import React from "react";
import { Separator } from "@/components/ui/separator";

export default function ChatLayout({
  sidebar,
  chatWindow,
}: {
  sidebar: React.ReactNode;
  chatWindow: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-1/4 p-4">
        {sidebar}
      </div>
      <Separator orientation="vertical" className="mx-0" />
      <div className="flex-1 flex flex-col p-4">
        {chatWindow}
      </div>
    </div>
  );
}
