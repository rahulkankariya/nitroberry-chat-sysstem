"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { User, ChatMessage } from "../types/chat";
import { SOCKET_EVENTS } from "../constants/socket-events";
import { notify } from "../utils/toast";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  users: User[];
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
});



export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const updateUserData = useCallback(
    (userId: string, updates: Partial<User>, shouldMoveToTop = false) => {
      setUsers((prevUsers) => {
        const userIndex = prevUsers.findIndex((u) => u._id === userId);
        if (userIndex === -1) return prevUsers;

        const updatedList = [...prevUsers];
        const currentUser = updatedList[userIndex];

        const updatedUser: User = {
          ...currentUser,
          ...updates,
          lastMessage: updates.lastMessage
            ? {
                ...updates.lastMessage,
                createdAt:
                  updates.lastMessage?.createdAt || new Date().toISOString(),
              }
            : currentUser.lastMessage,
        };

        if (shouldMoveToTop) {
          updatedList.splice(userIndex, 1);
          return [updatedUser, ...updatedList];
        } else {
          updatedList[userIndex] = updatedUser;
          return updatedList;
        }
      });
    },
    [],
  );

  useEffect(() => {
  const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = ClientIO(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080",
      { transports: ["websocket"], auth: { token } },
    );

    socketInstance.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
  
       notify.error("Something went wrong");
});

    socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
      setIsConnected(true);
      socketInstance.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
        pageIndex: 0,
        pageSize: 50,
      });
    });

    socketInstance.on(SOCKET_EVENTS.RESPONSE_USER_LIST, (res) => {
      if (res.status === 200) setUsers(res.data);
    });

    socketInstance.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (msg: ChatMessage) => {
      const senderId =
        typeof msg.sender === "string" ? msg.sender : msg.sender._id;
      // When receiving, we also want to increment unread count if logic is handled client-side
      updateUserData(senderId, { lastMessage: msg as any }, true);
    });

    socketInstance.on(SOCKET_EVENTS.MESSAGE_SENT_SUCCESS, (response: any) => {
      const msg = response.message || response;
      const receiverId =
        msg.receiverId ||
        (typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id);
      if (receiverId) updateUserData(receiverId, { lastMessage: msg }, true);
    });

    // --- FIX: LISTEN FOR READ STATUS UPDATES ---
    socketInstance.on(SOCKET_EVENTS.MESSAGE_READ_SUCCESS, (data: any) => {
      // The backend should return the ID of the user whose messages were read
      const userId = data.senderId || data.userId;
      updateUserData(userId, { unreadCount: 0 }, false);
    });

   

    socketInstance.on(SOCKET_EVENTS.USER_STATUS_CHANGED, (data) => {
      updateUserData(data.userId, { isOnline: data.isOnline }, false);
      if (data.isOnline) {
        socketInstance.emit(SOCKET_EVENTS.REQUEST_USER_LIST, { pageIndex: 0, pageSize: 50 });
      }
    });

    socketInstance.on(SOCKET_EVENTS.DISCONNECT, () => setIsConnected(false));
    setSocket(socketInstance);

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    };
  }, [updateUserData]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, users }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
