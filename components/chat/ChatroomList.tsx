
'use client';

import { useState, useMemo } from 'react';
import { Chatroom } from '@/lib/types';
import { formatTime, formatDate, debounce } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChatroomListProps {
  chatrooms: Chatroom[];
  currentChatroom: string | null;
  onSelectChatroom: (id: string) => void;
  onDeleteChatroom: (id: string) => void;
  onCreateChatroom: () => void;
}

export function ChatroomList({
  chatrooms,
  currentChatroom,
  onSelectChatroom,
  onDeleteChatroom,
  onCreateChatroom,
}: ChatroomListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSetSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  const filteredChatrooms = useMemo(() => {
    return chatrooms.filter(room =>
      room.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatrooms, searchQuery]);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Chats
          </h2>
          <Button
            onClick={onCreateChatroom}
            size="sm"
            className="w-8 h-8 p-0 flex items-center justify-center"
          >
            <i className="ri-add-line text-lg"></i>
          </Button>
        </div>
        
        <div className="relative">
          <Input
            placeholder="Search chats..."
            onChange={e => debouncedSetSearch(e.target.value)}
            className="pl-10"
          />
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChatrooms.length === 0 ? (
          <div className="p-8 text-center">
            <i className="ri-chat-3-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </p>
            {!searchQuery && (
              <Button
                onClick={onCreateChatroom}
                size="sm"
                className="mt-4"
              >
                Start a chat
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredChatrooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group ${
                  currentChatroom === room.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => onSelectChatroom(room.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {room.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {room.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(new Date(room.lastMessage.timestamp))}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChatroom(room.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                    {room.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {room.lastMessage.type === 'image' ? '📷 Image' : room.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
