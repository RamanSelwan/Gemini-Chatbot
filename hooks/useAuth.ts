
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { storage } from '@/lib/storage';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = storage.getUser();
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    storage.setUser(userData);
  };

  const logout = () => {
    setUser(null);
    storage.removeUser();
  };

  return { user, isLoading, login, logout };
}
