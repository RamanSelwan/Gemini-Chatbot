
export interface Country {
  name: {
    common: string;
  };
  cca2: string;
  idd: {
    root: string;
    suffixes: string[];
  };
  flag: string;
}

export interface User {
  id: string;
  phone: string;
  countryCode: string;
  isAuthenticated: boolean;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'image';
  imageUrl?: string;
}

export interface Chatroom {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastMessage?: Message;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export interface ChatState {
  chatrooms: Chatroom[];
  currentChatroom: string | null;
  isTyping: boolean;
}
