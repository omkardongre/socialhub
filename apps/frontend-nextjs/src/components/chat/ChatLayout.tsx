import React from "react";

export default function ChatLayout({
  sidebar,
  chatWindow,
}: {
  sidebar: React.ReactNode;
  chatWindow: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-1/4 border-r p-4">{sidebar}</div>
      <div className="flex-1 flex flex-col p-4">{chatWindow}</div>
    </div>
  );
}
