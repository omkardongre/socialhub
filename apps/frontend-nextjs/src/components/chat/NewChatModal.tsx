import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/types/profile";
import { UserSearchInput } from "./UserSearchInput";

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (participantIds: string[]) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [selected, setSelected] = useState<User[]>([]);

  const handleCreate = () => {
    if (selected.length > 0) {
      onCreate(selected.map((u) => u.id));
      setSelected([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogTitle>Start New Chat</DialogTitle>
        <div className="mb-4">
          <label className="block mb-2 text-sm">Add participants</label>
          <UserSearchInput selected={selected} setSelected={setSelected} />
        </div>
        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={selected.length === 0}
        >
          Create Chat
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;
