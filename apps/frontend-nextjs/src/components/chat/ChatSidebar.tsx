import { Card } from "@/components/ui/card";

export default function ChatSidebar({ rooms, onSelect }: { rooms: Array<{ id: string; name: string }>; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Card
          key={room.id}
          onClick={() => onSelect(room.id)}
          className="p-4 hover:bg-muted cursor-pointer"
        >
          {room.name}
        </Card>
      ))}
    </div>
  );
}
