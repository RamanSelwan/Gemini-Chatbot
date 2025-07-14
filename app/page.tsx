
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { LoginForm } from '@/components/auth/LoginForm';
import { OtpForm } from '@/components/auth/OtpForm';
import { Header } from '@/components/layout/Header';
import { ChatroomList } from '@/components/chat/ChatroomList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { CreateChatroomModal } from '@/components/chat/CreateChatroomModal';
import { ToastProvider } from '@/components/ui/Toast';
import { Chatroom, Message } from '@/lib/types';
import { storage } from '@/lib/storage';
import { generateId, throttle } from '@/lib/utils';
import toast from 'react-hot-toast';

const MESSAGES_PER_PAGE = 20;

const AI_RESPONSES = [
  "I'm here to help! What would you like to know?",
  "That's an interesting question. Let me think about that...",
  "I understand what you're asking. Here's my perspective:",
  "Thanks for sharing that with me. I find that quite fascinating.",
  "I'm processing your request. Give me a moment to provide a thoughtful response.",
  "That's a great point! I'd like to explore that idea further.",
  "I appreciate you bringing this up. Let me share some insights:",
  "Your question touches on something important. Here's what I think:",
];

export default function Home() {
  const { user, isLoading: authLoading, login } = useAuth();
  const { theme } = useTheme();
  
  // Auth states
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [phoneData, setPhoneData] = useState({ phone: '', countryCode: '' });
  
  // Chat states
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [currentChatroom, setCurrentChatroom] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [messagePages, setMessagePages] = useState<Record<string, number>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load chatrooms on mount
  useEffect(() => {
    if (user && isClient) {
      const savedChatrooms = storage.getChatrooms();
      setChatrooms(savedChatrooms);
      
      if (savedChatrooms.length > 0 && !currentChatroom) {
        setCurrentChatroom(savedChatrooms[0].id);
      }
    }
  }, [user, currentChatroom, isClient]);

  // Save chatrooms to storage
  useEffect(() => {
    if (user && chatrooms.length > 0 && isClient) {
      storage.setChatrooms(chatrooms);
    }
  }, [chatrooms, user, isClient]);

  // Mock message generation for pagination
  const generateMockMessages = useCallback((chatroomId: string, page: number): Message[] => {
    const messages: Message[] = [];
    const baseIndex = page * MESSAGES_PER_PAGE;
    
    for (let i = 0; i < MESSAGES_PER_PAGE; i++) {
      const messageIndex = baseIndex + i;
      const isUser = Math.random() > 0.5;
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - messageIndex);
      
      messages.push({
        id: generateId(),
        content: isUser 
          ? `User message ${messageIndex + 1}` 
          : AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        sender: isUser ? 'user' : 'ai',
        timestamp,
        type: 'text',
      });
    }
    
    return messages.reverse();
  }, []);

  // Throttled AI response
  const throttledAiResponse = useMemo(
    () => throttle((chatroomId: string, userMessage: string) => {
      setIsTyping(true);
      
      setTimeout(() => {
        const aiResponse: Message = {
          id: generateId(),
          content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
          sender: 'ai',
          timestamp: new Date(),
          type: 'text',
        };

        setChatrooms(prev => prev.map(room => 
          room.id === chatroomId 
            ? { 
                ...room, 
                messages: [...room.messages, aiResponse],
                lastMessage: aiResponse
              }
            : room
        ));
        
        setIsTyping(false);
        toast.success('New message from Gemini');
      }, 1500 + Math.random() * 2000);
    }, 3000),
    []
  );

  // Auth handlers
  const handleOtpSent = (phone: string, countryCode: string) => {
    setPhoneData({ phone, countryCode });
    setAuthStep('otp');
  };

  const handleOtpVerified = () => {
    const userData = {
      id: generateId(),
      phone: phoneData.phone,
      countryCode: phoneData.countryCode,
      isAuthenticated: true,
    };
    login(userData);
    toast.success('Welcome to Gemini Chat!');
  };

  // Chat handlers
  const handleCreateChatroom = (title: string) => {
    const newChatroom: Chatroom = {
      id: generateId(),
      title,
      messages: [],
      createdAt: new Date(),
    };

    setChatrooms(prev => [newChatroom, ...prev]);
    setCurrentChatroom(newChatroom.id);
    toast.success('Chat created successfully!');
  };

  const handleDeleteChatroom = (id: string) => {
    setChatrooms(prev => prev.filter(room => room.id !== id));
    
    if (currentChatroom === id) {
      const remaining = chatrooms.filter(room => room.id !== id);
      setCurrentChatroom(remaining.length > 0 ? remaining[0].id : null);
    }
    
    toast.success('Chat deleted successfully!');
  };

  const handleSendMessage = (content: string, type: 'text' | 'image', imageUrl?: string) => {
    if (!currentChatroom) return;

    const newMessage: Message = {
      id: generateId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type,
      imageUrl,
    };

    setChatrooms(prev => prev.map(room => 
      room.id === currentChatroom 
        ? { 
            ...room, 
            messages: [...room.messages, newMessage],
            lastMessage: newMessage
          }
        : room
    ));

    // Trigger AI response for text messages
    if (type === 'text') {
      throttledAiResponse(currentChatroom, content);
    }
    
    toast.success('Message sent!');
  };

  const handleLoadMoreMessages = () => {
    if (!currentChatroom || isLoadingMessages) return;
    
    setIsLoadingMessages(true);
    const currentPage = messagePages[currentChatroom] || 0;
    const newPage = currentPage + 1;
    
    setTimeout(() => {
      const newMessages = generateMockMessages(currentChatroom, newPage);
      
      setChatrooms(prev => prev.map(room => 
        room.id === currentChatroom 
          ? { ...room, messages: [...newMessages, ...room.messages] }
          : room
      ));
      
      setMessagePages(prev => ({
        ...prev,
        [currentChatroom]: newPage
      }));
      
      setIsLoadingMessages(false);
    }, 1000);
  };

  // Loading state
  if (authLoading || !isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-transparent border-t-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  // Authentication flow
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <ToastProvider />
        {authStep === 'phone' ? (
          <LoginForm onOtpSent={handleOtpSent} />
        ) : (
          <OtpForm
            phone={phoneData.phone}
            countryCode={phoneData.countryCode}
            onVerify={handleOtpVerified}
            onBack={() => setAuthStep('phone')}
          />
        )}
      </div>
    );
  }

  const currentRoom = chatrooms.find(room => room.id === currentChatroom);

  // Main chat interface
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ToastProvider />
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <ChatroomList
          chatrooms={chatrooms}
          currentChatroom={currentChatroom}
          onSelectChatroom={setCurrentChatroom}
          onDeleteChatroom={handleDeleteChatroom}
          onCreateChatroom={() => setShowCreateModal(true)}
        />

        <div className="flex-1 flex flex-col">
          {currentRoom ? (
            <>
              <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {currentRoom.title}
                </h2>
              </div>
              
              <MessageList
                messages={currentRoom.messages}
                isTyping={isTyping}
                onLoadMore={handleLoadMoreMessages}
                hasMore={true}
                isLoading={isLoadingMessages}
              />
              
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isTyping}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
              <div className="text-center">
                <i className="ri-chat-3-line text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                  Select a chat to start messaging
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Create your first chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateChatroomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateChatroom={handleCreateChatroom}
      />
    </div>
  );
}