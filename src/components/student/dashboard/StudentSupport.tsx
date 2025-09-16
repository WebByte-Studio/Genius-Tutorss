"use client";

import { EnhancedStudentSupport } from "../EnhancedStudentSupport";

interface StudentSupportProps {
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
}

export function StudentSupport({
  selectedChat,
  setSelectedChat,
  newMessage,
  setNewMessage
}: StudentSupportProps) {
  return (
    <EnhancedStudentSupport
      selectedChat={selectedChat}
      setSelectedChat={setSelectedChat}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
    />
  );
}
