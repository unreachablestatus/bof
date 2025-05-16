"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();

  // Giriş yapılmamışsa veya admin değilse ana sayfaya yönlendir
  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      router.push("/login");
    }
  }, [isLoggedIn, isAdmin, router]);

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block">
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <i className="fas fa-cog text-primary"></i>
            <span className="font-bold text-xl">Admin Panel</span>
          </Link>
        </div>

        <nav className="p-4">
          <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
            İçerik Yönetimi
          </div>
          <ul className="space-y-1">
            <li>
              <Link href="/admin/kartlar" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm">
                <i className="fas fa-layer-group text-primary"></i>
                <span>Ana Sayfa Kartları</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/notlar" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm">
                <i className="fas fa-note-sticky text-primary"></i>
                <span>Notlar</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/siirler" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm">
                <i className="fas fa-book text-primary"></i>
                <span>Şiirler</span>
              </Link>
            </li>
          </ul>

          <div className="my-4 border-t"></div>

          <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
            Kullanıcı Yönetimi
          </div>
          <ul className="space-y-1">
            <li>
              <Link href="/admin/kullanicilar" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm">
                <i className="fas fa-users text-primary"></i>
                <span>Kullanıcılar</span>
              </Link>
            </li>
          </ul>

          <div className="my-4 border-t"></div>

          <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
            Sistem
          </div>
          <ul className="space-y-1">
            <li>
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm">
                <i className="fas fa-chart-bar text-primary"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-sm">
                <i className="fas fa-home text-primary"></i>
                <span>Siteye Dön</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile menu */}
      <div className="md:hidden w-full border-b bg-card sticky top-0 z-10">
        <div className="flex justify-between items-center p-4">
          <Link href="/admin" className="font-bold text-xl flex items-center gap-2">
            <i className="fas fa-cog text-primary"></i>
            <span>Admin Panel</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/admin/kartlar" className="p-2 rounded-md hover:bg-accent">
              <i className="fas fa-layer-group text-primary"></i>
            </Link>
            <Link href="/admin/notlar" className="p-2 rounded-md hover:bg-accent">
              <i className="fas fa-note-sticky text-primary"></i>
            </Link>
            <Link href="/admin/siirler" className="p-2 rounded-md hover:bg-accent">
              <i className="fas fa-book text-primary"></i>
            </Link>
            <Link href="/admin/kullanicilar" className="p-2 rounded-md hover:bg-accent">
              <i className="fas fa-users text-primary"></i>
            </Link>
            <Link href="/admin/dashboard" className="p-2 rounded-md hover:bg-accent">
              <i className="fas fa-chart-bar text-primary"></i>
            </Link>
            <Link href="/" className="p-2 rounded-md hover:bg-accent">
              <i className="fas fa-home text-primary"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
