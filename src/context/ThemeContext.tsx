"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // İlk yüklemede localStorage'dan temayı al, yoksa sistem tercihini kullan
  useEffect(() => {
    setMounted(true);

    // Local storage'dan tema bilgisini al
    const storedTheme = localStorage.getItem("theme") as Theme | null;

    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Sistem tercihini kontrol et
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme("dark");
      }
    }
  }, []);

  // Tema değiştiğinde HTML elementine tema sınıfını ekle ve localStorage'a kaydet
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
    console.log("Theme changed to:", theme); // Debug için log
  }, [theme, mounted]);

  // Temayı değiştir
  const toggleTheme = () => {
    console.log("Toggle theme clicked, current theme:", theme); // Debug için log
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  // Theme context değerini oluştur
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
