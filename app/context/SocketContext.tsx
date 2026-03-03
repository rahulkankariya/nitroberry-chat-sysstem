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

// 1. ADDED togglePin to the Type definition
type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  users: User[];
  activeUserId: string | null;
  setActiveUserId: (id: string | null) => void;
  loadMore: (filter?: string) => void;
  searchUsers: (query: string) => void;
  fetchRecentChats: (filter?: string) => void;
  fetchAllUsers: () => void;
  togglePin: (userId: string, isPinned: boolean) => void; // --- ADDED ---
  hasMore: boolean;
};

// 2. ADDED togglePin to the Default Context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  users: [],
  activeUserId: null,
  setActiveUserId: () => {},
  loadMore: () => {},
  searchUsers: () => {},
  fetchRecentChats: () => {},
  fetchAllUsers: () => {},
  togglePin: () => {}, // --- ADDED ---
  hasMore: true,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
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
    []
  );

  // 3. IMPLEMENTED togglePin Function
  const togglePin = useCallback((userId: string, isPinned: boolean) => {
    if (socket && isConnected) {
      // Optimistic Update: Update UI immediately
      updateUserData(userId, { isPinned });
      
      // Emit to server
      socket.emit("TOGGLE_PIN_CHAT", { targetUserId: userId, isPinned });
    }
  }, [socket, isConnected, updateUserData]);

  const fetchRecentChats = useCallback((filter: string = "all") => {
    if (socket && isConnected) {
      setViewMode("recent");
      setPage(0);
      setUsers([]);
      searchTermRef.current = "";
      socket.emit(SOCKET_EVENTS.REQUEST_USER_LIST, {
        pageIndex: 0,
        pageSize: PAGE_SIZE,
        filter: filter,
      });
    }
  }, [socket, isConnected]);

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

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      setIsConnected(true);
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

    // --- NEW: Handle Pin Response from server ---
    socket.on("RESPONSE_TOGGLE_PIN", (res: any) => {
      if (res.status === 200) {
        updateUserData(res.userId, { isPinned: res.isPinned });
      }
    });

    const handleReceiveMessage = (msg: ChatMessage) => {
      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender._id;

      setUsers((prevUsers) => {
        const isChatOpen = activeUserId === senderId;
        const userIndex = prevUsers.findIndex((u) => u._id === senderId);
        if (userIndex === -1) return prevUsers;

        const updatedList = [...prevUsers];
        const currentUser = updatedList[userIndex];

        const updatedUser: User = {
          ...currentUser,
          lastMessage: msg as any,
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
      socket.off("RESPONSE_TOGGLE_PIN"); // Clean up pin listener
      socket.off(SOCKET_EVENTS.MESSAGE_SENT_SUCCESS);
      socket.off(SOCKET_EVENTS.MESSAGE_READ_SUCCESS);
      socket.off(SOCKET_EVENTS.USER_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.CONNECT);
      socket.off(SOCKET_EVENTS.RESPONSE_USER_LIST);
      socket.off(SOCKET_EVENTS.DISCONNECT);
    };
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
        togglePin, // 4. ADDED to Provider Value
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);