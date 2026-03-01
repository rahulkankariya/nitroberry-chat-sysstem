"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { User, ChatMessage } from "../types/chat";
import { SOCKET_EVENTS } from "../constants/socket-events";
import { notify } from "../utils/toast";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  users: User[];
  activeUserId: string | null; // --- ADDED ---
  setActiveUserId: (id: string | null) => void; // --- ADDED ---
  loadMore: () => void;
  searchUsers: (query: string) => void;
  fetchRecentChats: () => void;
  fetchAllUsers: () => void;
  hasMore: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  activeUserId: null, // --- ADDED ---
  setActiveUserId: () => {}, // --- ADDED ---
  loadMore: () => {},
  searchUsers: () => {},
  fetchRecentChats: () => {},
  fetchAllUsers: () => {},
  hasMore: true,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null); // --- ADDED STATE ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"recent" | "all">("recent");
  const searchTermRef = useRef("");
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

  // --- NEW: Fetch Recent Chats ---
  const fetchRecentChats = useCallback(() => {
    if (socket && isConnected) {
      setViewMode("recent");
      setPage(0);
      setUsers([]);
      searchTermRef.current = "";
      socket.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
        pageIndex: 0,
        pageSize: PAGE_SIZE,
      });
    }
  }, [socket, isConnected]);

  // --- NEW: Fetch All Users (Toggle Flow) ---
  const fetchAllUsers = useCallback(() => {
    if (socket && isConnected) {
      setViewMode("all");
      setPage(0);
      setUsers([]);
      searchTermRef.current = "";
      socket.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
        pageIndex: 0,
        pageSize: PAGE_SIZE,
        fetchAll: true,
      });
    }
  }, [socket, isConnected]);

  const searchUsers = useCallback(
    (query: string) => {
      if (socket && isConnected) {
        searchTermRef.current = query;
        setPage(0);
        setHasMore(true);
        setUsers([]);
        socket.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
          pageIndex: 0,
          pageSize: PAGE_SIZE,
          search: query,
          fetchAll: viewMode === "all",
        });
      }
    },
    [socket, isConnected, viewMode]
  );

  const loadMore = useCallback(() => {
    if (socket && isConnected && hasMore) {
      const nextPage = page + 1;
      socket.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
        pageIndex: nextPage,
        pageSize: PAGE_SIZE,
        search: searchTermRef.current,
        fetchAll: viewMode === "all",
      });
      setPage(nextPage);
    }
  }, [socket, isConnected, hasMore, page, viewMode]);

  useEffect(() => {
    const token = localStorage.getItem("socketToken");
    if (!token) {
      notify.error("Chat connection is off. Missing token.");
      return;
    }

    const socketInstance = ClientIO(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080",
      {
        transports: ["websocket"],
        auth: { token },
        reconnectionAttempts: 2,
      },
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const MAX_RETRIES = 2;
    let retryCount = 0;

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
      retryCount++;
      if (retryCount <= MAX_RETRIES) {
        console.log(`Connection failed. Attempt ${retryCount}/${MAX_RETRIES}`);
        notify.error(`Something Went wrong`);
      }
      if (retryCount >= MAX_RETRIES) {
        socket.disconnect();
      }
    });

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      setIsConnected(true);
      retryCount = 0;
      socket.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
        pageIndex: 0,
        pageSize: 10,
      });
    });

    socket.on(SOCKET_EVENTS.RESPONSE_USER_LIST, (res) => {
      if (res.status === 200) {
        setUsers((prev) => {
          const userMap = new Map(prev.map((u) => [u._id, u]));
          res.data.forEach((user: User) => {
            userMap.set(user._id, { ...userMap.get(user._id), ...user });
          });

          return Array.from(userMap.values());
        });
        setHasMore(res.data.length >= PAGE_SIZE);
      }
    });

    // --- UPDATED: RECEIVE_MESSAGE ---
    const handleReceiveMessage = (msg: ChatMessage) => {
      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender._id;

      setUsers((prevUsers) => {
        // activeUserId is now in scope because it's in the dependency array
        const isChatOpen = activeUserId === senderId;

        const userIndex = prevUsers.findIndex((u) => u._id === senderId);
        if (userIndex === -1) return prevUsers;

        const updatedList = [...prevUsers];
        const currentUser = updatedList[userIndex];

        const updatedUser: User = {
          ...currentUser,
          lastMessage: msg as any,
          // Reset count if open, increment if closed
          unreadCount: isChatOpen ? 0 : (currentUser.unreadCount || 0) + 1,
        };

        updatedList.splice(userIndex, 1);
        return [updatedUser, ...updatedList];
      });
    };

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    socket.on(SOCKET_EVENTS.MESSAGE_SENT_SUCCESS, (response: any) => {
      const msg = response.message || response;
      const receiverId =
        msg.receiverId ||
        (typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id);
      if (receiverId) updateUserData(receiverId, { lastMessage: msg }, true);
    });

    socket.on(SOCKET_EVENTS.MESSAGE_READ_SUCCESS, (data: any) => {
      updateUserData(data.senderId || data.userId, { unreadCount: 0 }, false);
    });

    socket.on(SOCKET_EVENTS.USER_STATUS_CHANGED, (data) => {
      updateUserData(data.userId, { isOnline: data.isOnline }, false);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => setIsConnected(false));

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_SENT_SUCCESS);
      socket.off(SOCKET_EVENTS.MESSAGE_READ_SUCCESS);
      socket.off(SOCKET_EVENTS.USER_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.CONNECT);
      socket.off(SOCKET_EVENTS.RESPONSE_USER_LIST);
      socket.off(SOCKET_EVENTS.DISCONNECT);
    };
    // CRITICAL: activeUserId MUST be in this dependency array!
  }, [socket, updateUserData, activeUserId]); 

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        users,
        activeUserId,
        setActiveUserId,
        loadMore,
        hasMore,
        searchUsers,
        fetchRecentChats,
        fetchAllUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);