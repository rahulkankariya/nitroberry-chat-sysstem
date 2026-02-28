"use client";

import { useSocket } from "../../context/SocketContext";
import { User } from "../../types/chat";
import { useChat } from "../../hooks/useChat";


import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EmptyState from "./EmptyState";
import { MESSAGE_TYPES } from "../../constants/chat";
import { uploadMedia } from "@/app/api/upload.api";
import { notify } from "@/app/utils/toast";


export default function ChatArea({ activeUser }: { activeUser: User | null }) {
  const { socket } = useSocket();
  const { messages, sendMessage, loadMore, hasMore } = useChat(
    socket,
    activeUser,
  );

  const handleSendVoice = async (blob: Blob) => {
    try {
      const fileName = `voice-${Date.now()}.mp3`;

      // Pass the single blob (now allowed by our updated API service)
      const result = await uploadMedia({files:blob, fileName});

      if (result.success) {
        // console.log("Voice upload successful, server response:", result);


        const savedAudioUrl = result.data[0].fullOSPath

      
        sendMessage(savedAudioUrl, MESSAGE_TYPES.AUDIO);
      }
    } catch (error) {
      console.error("Voice Upload Error:", error);
    }
  };
   const handleSendFile = async (file: File, type: "image" | "video" | "file") => {
  try {
    // Generate a unique filename using the original extension
    const extension = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${extension}`;

    // 1. Upload the file to your server
    const result = await uploadMedia({files:file, fileName});

    if (result.success) {
     
      
      // 3. Build the final reachable URL
      const finalUrl =  result.data[0].fullOSPath;

     
      // 4. Map the internal 'file' type to your MESSAGE_TYPES constant
      let messageType;
      switch (type) {
        case "image":
          messageType = MESSAGE_TYPES.IMAGE;
          break;
        case "video":
          messageType = MESSAGE_TYPES.VIDEO;
          break;
        default:
          messageType = MESSAGE_TYPES.FILE;
      }

      // 5. Send to socket/API
      sendMessage(finalUrl, messageType);
    }
  } catch (error) {
    // console.error(`${type} Upload Error:`, error);
notify.error(`Failed to upload ${type}`);
   
  }
};

  if (!activeUser) return <EmptyState />;

  return (
    <div className="flex-1 flex flex-col h-full bg-app-bg border-l border-app-border overflow-hidden">
      <ChatHeader user={activeUser} />
      <MessageList
        messages={messages}
        activeUser={activeUser}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />
      <MessageInput
        onSend={(val) => sendMessage(val, MESSAGE_TYPES.TEXT)}
        onSendVoice={handleSendVoice}
        onSendFile={handleSendFile}
        placeholder={`Secure channel to ${activeUser.fullName.split(" ")[0]}...`}
      />
    </div>
  );
}
