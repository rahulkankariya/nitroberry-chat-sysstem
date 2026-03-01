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
  loadMore: () => void;
  hasMore: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  loadMore: () => {},
  hasMore: true,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

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

  const loadMore = useCallback(() => {
    console.log("Page",page,hasMore)
    if (socket && isConnected && hasMore) {
      
      const nextPage = page + 1;
      socket.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
        pageIndex: nextPage,
        pageSize: PAGE_SIZE,
      });
      setPage(nextPage);
    }
  }, [socket, isConnected, hasMore, page]);

  useEffect(() => {
    const token = localStorage.getItem("socketToken");
    if (!token) {
      notify.error("Chat connection is off. Missing token.");
      return;
    }

    const MAX_RETRIES = 2;
    let retryCount = 0;

    const socketInstance = ClientIO(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080",
      {
        transports: ["websocket"],
        auth: { token },
        reconnectionAttempts: MAX_RETRIES,
      },
    );

    socketInstance.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
      retryCount++;
      if (retryCount <= MAX_RETRIES) {
        console.log(`Connection failed. Attempt ${retryCount}/${MAX_RETRIES}`);
        notify.error(`Something Went wrong`);
      }
      if (retryCount >= MAX_RETRIES) {
        socketInstance.disconnect();
      }
    });

    socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
      setIsConnected(true);
      retryCount = 0;
      socketInstance.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
        pageIndex: 0,
        pageSize: 10,
      });
    });

    socketInstance.on(SOCKET_EVENTS.RESPONSE_USER_LIST, (res) => {
      if (res.status === 200) {
        setUsers((prev) => {
          // Use a Map to ensure we don't have duplicate IDs when merging pages
          const userMap = new Map(prev.map((u) => [u._id, u]));
          res.data.forEach((user: User) => {
            userMap.set(user._id, { ...userMap.get(user._id), ...user });
          });

          const combined = Array.from(userMap.values());
          // Optional: Sort by last message date
          return combined.sort(
            (a, b) =>
              new Date(b.lastMessage?.createdAt || 0).getTime() -
              new Date(a.lastMessage?.createdAt || 0).getTime(),
          );
        });

        // If returned data is less than page size, we've reached the end
        if (res.data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    });

    socketInstance.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (msg: ChatMessage) => {
      const senderId =
        typeof msg.sender === "string" ? msg.sender : msg.sender._id;
      updateUserData(senderId, { lastMessage: msg as any }, true);
    });

    socketInstance.on(SOCKET_EVENTS.MESSAGE_SENT_SUCCESS, (response: any) => {
      const msg = response.message || response;
      const receiverId =
        msg.receiverId ||
        (typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id);
      if (receiverId) updateUserData(receiverId, { lastMessage: msg }, true);
    });

    socketInstance.on(SOCKET_EVENTS.MESSAGE_READ_SUCCESS, (data: any) => {
      const userId = data.senderId || data.userId;
      updateUserData(userId, { unreadCount: 0 }, false);
    });

    socketInstance.on(SOCKET_EVENTS.USER_STATUS_CHANGED, (data) => {
      updateUserData(data.userId, { isOnline: data.isOnline }, false);
      if (data.isOnline) {
        socketInstance.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
          pageIndex: 0,
          pageSize: 10,
        });
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
    <SocketContext.Provider
      value={{ socket, isConnected, users, loadMore, hasMore }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
