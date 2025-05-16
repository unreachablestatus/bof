"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { io, Socket } from "socket.io-client";

// ChatMessage tipi
export interface ChatMessage {
  id: number;
  content: string;
  sender: {
    id: number;
    username: string;
  };
  receiver: {
    id: number;
    username: string;
  };
  timestamp: string;
}

// Kullanıcı durum tipi
interface UserStatus {
  userId: number;
  status: 'online' | 'offline';
}

// ChatContext için tipler
interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<boolean>;
  setTyping: (isTyping: boolean) => void;
  typingUser: string | null;
  loading: boolean;
  error: string | null;
  refreshMessages: () => Promise<void>;
  onlineUsers: number[];
}

// Context oluştur
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Örnek mesajlar (sadece offline durumda kullanılacak)
const fallbackMessages: ChatMessage[] = [
  {
    id: 1,
    content: "Merhaba, nasılsın?",
    timestamp: "2023-06-15T10:30:00Z",
    sender: {
      id: 1,
      username: "Kullanıcı",
    },
    receiver: {
      id: 2,
      username: "Sevgilim",
    },
  },
  {
    id: 2,
    content: "İyiyim, teşekkür ederim. Sen nasılsın?",
    timestamp: "2023-06-15T10:31:00Z",
    sender: {
      id: 2,
      username: "Sevgilim",
    },
    receiver: {
      id: 1,
      username: "Kullanıcı",
    },
  },
];

// WebSocket sunucu URL'i
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// ChatProvider komponenti
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [useRealtime, setUseRealtime] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user, isLoggedIn } = useAuth();

  // WebSocket bağlantısını kur
  useEffect(() => {
    if (!isLoggedIn() || !user) {
      setIsConnected(false);
      return;
    }

    try {
      // Socket.io bağlantısı kur
      socketRef.current = io(SOCKET_URL);

      const socket = socketRef.current;

      // Bağlantı olayları
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        setUseRealtime(true);

        // Kullanıcının kimliğini doğrula
        socket.emit('authenticate', user.id);
      });

      // Bağlantı hatası
      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setError('WebSocket sunucusuna bağlanılamadı. Offline modda çalışılıyor.');
        setIsConnected(false);
        setUseRealtime(false);
      });

      // Bağlantı koptu
      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
        setUseRealtime(false);
      });

      // Geçmiş mesajları al
      socket.on('recent_messages', (recentMessages: ChatMessage[]) => {
        setMessages(recentMessages);
        setLoading(false);
      });

      // Yeni mesaj geldi
      socket.on('new_message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);

        // Mesaj alındığında yazıyor bilgisini temizle
        setTypingUser(null);
      });

      // Yazıyor bilgisi
      socket.on('user_typing', ({ userId }) => {
        // Kullanıcı adını bul
        const typingUsername = userId === 2 ? "Sevgilim" : "Kullanıcı";
        setTypingUser(typingUsername);
      });

      // Yazma durumu durdu
      socket.on('user_stop_typing', () => {
        setTypingUser(null);
      });

      // Kullanıcı durumu değişti
      socket.on('user_status', (status: UserStatus) => {
        if (status.status === 'online') {
          setOnlineUsers(prev => [...prev, status.userId]);
        } else {
          setOnlineUsers(prev => prev.filter(id => id !== status.userId));
        }
      });

      // Hata
      socket.on('error', (err: { message: string }) => {
        setError(err.message);
      });

      // Temizleme
      return () => {
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setUseRealtime(false);
      };
    } catch (err) {
      console.error('Socket init error:', err);
      setError('WebSocket başlatılamadı. Offline modda çalışılıyor.');
      setUseRealtime(false);
    }
  }, [isLoggedIn, user]);

  // Mesajları API'den çek (WebSocket ile bağlantı kurulamazsa yedek mekanizma)
  const fetchMessages = async (): Promise<ChatMessage[]> => {
    // Eğer WebSocket bağlantısı varsa, zaten mesajları getiriyor olacak
    if (isConnected && useRealtime) {
      return messages;
    }

    // WebSocket bağlantısı yoksa API'den çek
    if (!isLoggedIn()) {
      const storedMessages = localStorage.getItem('chat_messages');
      return storedMessages ? JSON.parse(storedMessages) : fallbackMessages;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chat');

      if (!response.ok) {
        throw new Error('Mesajlar alınırken bir hata oluştu');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');

      // Offline durumunda localStorage'dan çek
      const storedMessages = localStorage.getItem('chat_messages');
      return storedMessages ? JSON.parse(storedMessages) : fallbackMessages;
    } finally {
      setLoading(false);
    }
  };

  // Mesajları yenileme fonksiyonu
  const refreshMessages = async () => {
    // Eğer WebSocket bağlantısı varsa tekrar almaya gerek yok
    if (isConnected && useRealtime) {
      return;
    }

    const newMessages = await fetchMessages();
    setMessages(newMessages);

    // Yerel depolamaya yedekle
    if (newMessages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(newMessages));
    }
  };

  // İlk yükleme ve oturum değişikliklerinde mesajları çek
  useEffect(() => {
    // WebSocket bağlantısı yoksa API'den al
    if (!isConnected || !useRealtime) {
      refreshMessages();
    }
  }, [isLoggedIn(), isConnected, useRealtime]);

  // Mesaj gönderme fonksiyonu
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!content.trim()) return false; // Boş mesaj göndermeyi engelle

    try {
      // WebSocket bağlantısı varsa WebSocket üzerinden gönder
      if (isConnected && useRealtime && socketRef.current) {
        socketRef.current.emit('new_message', {
          content,
          senderId: user?.id || 1,
          receiverId: 2, // Varsayılan alıcı ID (Sevgilim)
        });

        return true;
      }

      // WebSocket bağlantısı yoksa API üzerinden gönder
      // Kullanıcı giriş yapmamışsa offline modda çalış
      if (!isLoggedIn()) {
        // Demo modu
        const newMessage: ChatMessage = {
          id: Date.now(),
          content,
          sender: {
            id: 1,
            username: "Kullanıcı",
          },
          receiver: {
            id: 2,
            username: "Sevgilim",
          },
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMessage]);

        // Demo yanıt
        setTimeout(() => {
          const responses = [
            "Harika! Ben de iyi olduğuna sevindim.",
            "Bugün seninle vakit geçirmek harika olurdu.",
            "Seni seviyorum!",
            "Ne düşünüyorsun?",
            "Tabii, harika bir fikir!"
          ];

          const randomResponse = responses[Math.floor(Math.random() * responses.length)];

          const responseMessage: ChatMessage = {
            id: Date.now() + 1,
            content: randomResponse,
            sender: {
              id: 2,
              username: "Sevgilim",
            },
            receiver: {
              id: 1,
              username: "Kullanıcı",
            },
            timestamp: new Date().toISOString(),
          };

          setMessages(prev => [...prev, responseMessage]);

          // Local storage'a kaydet
          localStorage.setItem('chat_messages', JSON.stringify([...messages, newMessage, responseMessage]));
        }, 1000 + Math.random() * 2000);

        return true;
      }

      // API ile gönder
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          receiverId: 2, // Sabit alıcı ID (gerçek uygulamada değişebilir)
        }),
      });

      if (!response.ok) {
        throw new Error('Mesaj gönderilirken bir hata oluştu');
      }

      const newMessage = await response.json();

      // Mesajları yenile
      await refreshMessages();

      return true;
    } catch (err) {
      console.error('Send message error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      return false;
    }
  };

  // Yazma durumunu bildir
  const setTyping = (isTyping: boolean) => {
    // WebSocket ile bildirme
    if (isConnected && useRealtime && socketRef.current) {
      if (isTyping) {
        socketRef.current.emit('typing', {
          userId: user?.id || 1,
          receiverId: 2, // Sabit alıcı ID
        });
      } else {
        socketRef.current.emit('stop_typing', {
          userId: user?.id || 1,
          receiverId: 2, // Sabit alıcı ID
        });
      }
    } else {
      // WebSocket yoksa demo davranış
      if (isTyping) {
        // Yazıyor bilgisi
        setTypingUser("Sevgilim");

        // Önceki zamanlayıcıyı temizle
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // 3 saniye sonra yazma durumunu otomatik durdur
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      } else {
        // Yazma durumunu durdur
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        setTypingUser(null);
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        setTyping,
        typingUser,
        loading,
        error,
        refreshMessages,
        onlineUsers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Hook oluştur
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
