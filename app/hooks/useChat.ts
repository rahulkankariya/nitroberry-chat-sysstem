import { useState, useEffect, useCallback, useRef } from "react";
import { SOCKET_EVENTS } from "../constants/socket-events";
import { MESSAGE_TYPES } from "../constants/chat";

export const useChat = (socket: any, activeUser: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. SEND MESSAGE ---
  const sendMessage = useCallback(
    (content: string,type: number =MESSAGE_TYPES.TEXT) => {
      if (!content.trim() || !socket || !activeUser) return;

      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        receiverId: activeUser._id,
        content: content.trim(),
        type: type,
      });
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { receiverId: activeUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    },
    [socket, activeUser],
  );

  // --- 2. LOAD MORE ---
  const loadMore = useCallback(() => {
    if (
      isLoading ||
      !hasMore ||
      !socket ||
      !activeUser ||
      messages.length === 0
    )
      return;

    setIsLoading(true);
    const nextPage = page + 1;
    socket.emit(SOCKET_EVENTS.REQUEST_MESSAGE_LIST, {
      receiverId: activeUser._id,
      pageIndex: nextPage,
    });
    setPage(nextPage);
  }, [hasMore, isLoading, page, socket, activeUser, messages.length]);

  // --- 3. SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket || !activeUser?._id) return;

    // A. Reset & Initial Fetch
    setMessages([]);
    setPage(0);
    setHasMore(true);
    setIsLoading(true);

    socket.emit(SOCKET_EVENTS.REQUEST_MESSAGE_LIST, {
      receiverId: activeUser._id,
      pageIndex: 0,
    });

    // B. MARK ENTIRE CHAT AS READ ON ENTRY
    // This clears existing unread counts when you click the user
    socket.emit(SOCKET_EVENTS.MARK_MESSAGE_READ, {
      senderId: activeUser._id,
    });

    const handleHistory = (response: any) => {
      if (response.status === 200) {
        const incoming = response.messageList || [];
        const pagin = response.pagination;
        if (pagin) setHasMore(pagin.page < pagin.pages);

        setMessages((prev) => {
          const combined = [...incoming, ...prev];
          return Array.from(new Map(combined.map((m) => [m._id, m])).values());
        });
      }
      setIsLoading(false);
    };

    const handleNewMessage = (msg: any) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender._id : msg.sender;

      // Determine if message belongs to this conversation
      const isFromActiveUser = senderId === activeUser._id;
      const isToActiveUser =
        msg.receiverId === activeUser._id ||
        (typeof msg.receiver === "object" &&
          msg.receiver._id === activeUser._id);

      if (isFromActiveUser || isToActiveUser) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        // C. AUTO-READ IF I AM LOOKING AT THE CHAT
        if (isFromActiveUser) {
          socket.emit(SOCKET_EVENTS.MARK_MESSAGE_READ, {
            senderId: senderId,
            chatId: msg.chatId,
          });
        }
      }
    };

    const handleStatusUpdate = (data: any) => {
      setMessages((prev) => {
        // 1. Create a brand new array reference
        return prev.map((m) => {
          // 2. Normalize ID comparison (ensure both are strings)
          const isCorrectChat = String(m.chatId) === String(data.chatId);

          if (isCorrectChat && m.status !== "seen") {
            if (data.status === "seen" && m.status !== "seen") {
              // console.log("Triggered SEEN logic");
               return {
              ...m,
              status: "seen",
              // Update any other fields the UI specifically listens to
            };
            }
            if (data.status === "delivered" && m.status === "sent") {
              // console.log("Triggered DELIVERED logic");
               return {
              ...m,
              status: "delivered",
              // Update any other fields the UI specifically listens to
            };
            }
            // 3. Return a brand new object reference
          
          }
          return m;
        });
      });
    };

    socket.on(SOCKET_EVENTS.RESPONSE_MESSAGE_LIST, handleHistory);
    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_SENT_SUCCESS, handleNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE, handleStatusUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.RESPONSE_MESSAGE_LIST, handleHistory);
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_SENT_SUCCESS, handleNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_STATUS_UPDATE, handleStatusUpdate);
    };
  }, [socket, activeUser?._id]);

  return { messages, sendMessage, loadMore, hasMore, isLoading };
};
