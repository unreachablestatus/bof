"use client";

import React from "react";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ChatProvider } from "@/context/ChatContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

// Tema değiştirme butonu
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log("Theme toggle button clicked");
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="theme-toggle-btn"
      title={theme === "light" ? "Koyu temaya geç" : "Açık temaya geç"}
      aria-label={theme === "light" ? "Koyu temaya geç" : "Açık temaya geç"}
    >
      <i className="fas fa-sun" aria-hidden="true"></i>
      <i className="fas fa-moon" aria-hidden="true"></i>
    </button>
  );
}

function Navigation() {
  const { isLoggedIn, isAdmin, logout, user } = useAuth();

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold text-primary">
              <i className="fas fa-heart me-2"></i>
              Bize Özel
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary hover-icon">
              Ana Sayfa
            </Link>
            <Link href="/chat" className="text-sm font-medium hover:text-primary hover-icon">
              <i className="fas fa-comments me-1"></i> Chat
            </Link>
            <Link href="/notlar" className="text-sm font-medium hover:text-primary hover-icon">
              <i className="fas fa-note-sticky me-1"></i> Notlar
            </Link>
            <Link href="/siirler" className="text-sm font-medium hover:text-primary hover-icon">
              <i className="fas fa-book me-1"></i> Şiirler
            </Link>

            {isLoggedIn() ? (
              <>
                {isAdmin() && (
                  <Link href="/admin" className="text-sm font-medium hover:text-primary hover-icon">
                    <i className="fas fa-cog me-1"></i> Admin
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.username}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="text-sm font-medium hover:text-primary hover-icon"
                  >
                    <i className="fas fa-sign-out-alt me-1"></i> Çıkış
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium hover:text-primary hover-icon">
                <i className="fas fa-user me-1"></i> Giriş
              </Link>
            )}

            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

export function ClientBody({
  children,
  session
}: {
  children: React.ReactNode;
  session?: Session;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ChatProvider>
              <div className="flex min-h-screen flex-col">
                <Navigation />
                <main className="flex-1">{children}</main>
                <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                  <div className="container mx-auto px-4">
                    <p>© {new Date().getFullYear()} Bize Özel | Tüm hakları saklıdır</p>
                  </div>
                </footer>
              </div>
            </ChatProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
