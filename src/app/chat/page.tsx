"use client";

import { useState, useEffect, useRef } from "react";
import { formatDate } from "@/lib/utils";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

export default function Chat() {
  const { messages, sendMessage, setTyping, typingUser, loading } = useChat();
  const { isLoggedIn, user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mesajlar her güncellendiğinde otomatik olarak aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Mesajı gönder
    sendMessage(newMessage);
    setNewMessage("");
  };

  // Kullanıcı yazarken
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Kullanıcı yazıyor bilgisi gönder
    if (e.target.value.length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">
          <i className="fas fa-comments me-2"></i> Chat
        </h1>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {/* Mesajlar bölümü */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_current_user ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.is_current_user
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-semibold">
                          {message.is_current_user ? (
                            <i className="fas fa-user me-1"></i>
                          ) : (
                            <i className="fas fa-heart me-1"></i>
                          )}
                          {message.sender.username}
                        </p>
                      </div>
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 text-right mt-1">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Yazıyor göstergesi */}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-xs rounded-lg px-3 py-1 text-muted-foreground">
                      <i className="fas fa-pencil-alt me-1"></i> {typingUser} yazıyor...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Mesaj gönderme form bölümü */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder={isLoggedIn() ? "Mesajınızı yazın..." : "Mesaj göndermek için giriş yapmalısınız"}
                disabled={!isLoggedIn() || loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isLoggedIn() || !newMessage.trim() || loading}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-paper-plane me-2"></i> Gönder
              </button>
            </form>

            {!isLoggedIn() && (
              <p className="text-xs text-muted-foreground mt-2">
                Mesaj göndermek için <a href="/login" className="text-primary hover:underline">giriş yapın</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
