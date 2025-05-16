"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isLoggedIn: () => boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Session state changed");
    if (session?.user) {
      setUser({
        id: session.user.id || "",
        username: session.user.name || "",
        isAdmin: session.user.isAdmin || false,
      });
    } else {
      setUser(null);
      console.log("No session found");
    }
  }, [session]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("Login attempt started");

      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      console.log("Login attempt completed");

      if (!result?.error) {
        console.log("Login successful");
        return true;
      }

      console.log("Login failed");
      return false;
    } catch (error) {
      console.log("Login error occurred");
      return false;
    }
  };

  const logout = async () => {
    console.log("Logout started");
    await signOut({ redirect: false });
    router.push("/login");
    console.log("Logout completed");
  };

  const isAdmin = () => {
    const adminStatus = user?.isAdmin || false;
    return adminStatus;
  };

  const isLoggedIn = () => {
    const loggedInStatus = user !== null;
    return loggedInStatus;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isLoggedIn,
        isLoading: status === "loading",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
