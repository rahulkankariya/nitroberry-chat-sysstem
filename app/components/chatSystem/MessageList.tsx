"use client";
import { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";

export default function MessageList({
  messages,
  activeUser, // This is the user we are chatting with
  onLoadMore,
  hasMore,
  isLoading,
}: any) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topObserverRef = useRef<HTMLDivElement>(null);

  const isFirstLoadDone = useRef(false);
  const lastScrollHeight = useRef<number>(0);

  // 1. Pagination Logic (Scrolling UP)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && messages.length > 0) {
          if (scrollContainerRef.current) {
            lastScrollHeight.current = scrollContainerRef.current.scrollHeight;
          }
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (topObserverRef.current) observer.observe(topObserverRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, isLoading, messages.length]);

  // 2. AUTO-SCROLL LOGIC
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    if (isFirstLoadDone.current && !isLoading && lastScrollHeight.current > 0) {
      const delta = container.scrollHeight - lastScrollHeight.current;
      container.scrollTop = delta;
      lastScrollHeight.current = 0;
      return;
    }

    // Logic: If the last message sender is NOT the activeUser, then I sent it.
    const lastMsg = messages[messages.length - 1];
    const lastMsgSenderId = String(lastMsg?.sender?._id || lastMsg?.sender || "");
    const activeUserId = String(activeUser?._id || "");
    
    const iSentLastMessage = lastMsgSenderId !== activeUserId;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 400;

    if (!isFirstLoadDone.current || iSentLastMessage || isNearBottom) {
      const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({
          behavior: isFirstLoadDone.current ? "smooth" : "auto",
          block: "end",
        });
      };

      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 100);
      isFirstLoadDone.current = true;
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, activeUser?._id]);

  // Reset when switching users
  useEffect(() => {
    isFirstLoadDone.current = false;
  }, [activeUser?._id]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 custom-scrollbar relative"
      style={{ overflowAnchor: "none", height: "100%" }}
    >
      <div ref={topObserverRef} className="h-1 w-full" />

      {isLoading && hasMore && (
        <div className="text-center text-xs text-gray-500 py-4 italic animate-pulse">
          Loading messages...
        </div>
      )}

      <div className="flex flex-col gap-4 min-h-full justify-end">
        {messages.map((m: any, i: number) => {
          // If the message sender is NOT the activeUser, it's my message (isOwn = true)
          const isOwn = String(m.sender?._id || m.sender) !== String(activeUser?._id);

          return (
            <MessageItem
              key={m._id || i}
              msg={m}
              isOwn={isOwn}
              activeUserId={activeUser?._id} // Pass activeUser ID to help MessageItem determine "read" status
            />
          );
        })}
      </div>

      <div ref={bottomRef} className="h-1 w-full shrink-0" />
    </div>
  );
}