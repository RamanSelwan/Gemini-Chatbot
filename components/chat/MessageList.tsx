"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/lib/types";
import { formatTime, copyToClipboard } from "@/lib/utils";
import toast from "react-hot-toast";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function MessageList({
  messages,
  isTyping,
  onLoadMore,
  hasMore,
  isLoading,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom && messages.length > 0);

      if (scrollTop === 0 && hasMore && !isLoading) {
        onLoadMore();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, isLoading, messages.length, onLoadMore]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await copyToClipboard(content);
      toast.success("Message copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-chat-3-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Start a conversation with Gemini
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Send a message to begin chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div ref={containerRef} className="h-full overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-transparent border-t-gray-500"></div>
              <span className="text-sm">Loading messages...</span>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`group max-w-xs lg:max-w-md relative ${
                message.sender === "user" ? "ml-12" : "mr-12"
              }`}
            >
              <div
                className={`rounded-lg p-3 shadow-sm ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
              >
                {message.type === "image" && message.imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      className="rounded-lg max-w-full h-auto"
                    />
                    {message.content && (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
              </div>

              <div
                className={`flex items-center mt-1 space-x-2 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span className="text-xs text-gray-500">
                  {formatTime(new Date(message.timestamp))}
                </span>
                <button
                  onClick={() => handleCopyMessage(message.content)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity cursor-pointer"
                  title="Copy message"
                >
                  <i className="ri-file-copy-line text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="mr-12">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Gemini is typing...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        >
          <i className="ri-arrow-down-line"></i>
        </button>
      )}
    </div>
  );
}
