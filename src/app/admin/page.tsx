"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

interface QuickStat {
  title: string;
  value: number;
  icon: string;
  href: string;
  color: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { cards, notes, poems, loading } = useData();
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Kullanıcı sayısını API'den getir
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const users = await response.json();
          setUserCount(users.length);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  // İstatistikler ve kartlar hazırla
  useEffect(() => {
    if (!loading.cards && !loading.notes && !loading.poems && !isLoading) {
      setQuickStats([
        {
          title: "Anasayfa Kartları",
          value: cards.length,
          icon: "layer-group",
          href: "/admin/kartlar",
          color: "blue",
        },
        {
          title: "Notlar",
          value: notes.length,
          icon: "note-sticky",
          href: "/admin/notlar",
          color: "green",
        },
        {
          title: "Şiirler",
          value: poems.length,
          icon: "book",
          href: "/admin/siirler",
          color: "purple",
        },
        {
          title: "Kullanıcılar",
          value: userCount,
          icon: "users",
          href: "/admin/kullanicilar",
          color: "orange",
        },
      ]);
    }
  }, [cards, notes, poems, userCount, loading, isLoading]);

  if (loading.cards || loading.notes || loading.poems || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Hoş Geldiniz, {user?.username}</h1>
        <p className="text-muted-foreground">
          Blooom sitesi içeriklerini bu panelden yönetebilirsiniz.
        </p>
      </div>

      {/* Hızlı istatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Link
            key={index}
            href={stat.href}
            className="bg-card rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center`}>
                <i className={`fas fa-${stat.icon} text-primary text-xl`}></i>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ana yönetim kartları */}
      <h2 className="text-xl font-bold mb-4">Yönetim Paneli</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-layer-group text-primary"></i>
              </div>
              <h3 className="text-lg font-semibold">Ana Sayfa Kartları</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Ana sayfada görünen kartları düzenleyin, yeni kartlar ekleyin veya mevcut kartları silin.
            </p>
            <Link
              href="/admin/kartlar"
              className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Kartları Yönet
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-note-sticky text-primary"></i>
              </div>
              <h3 className="text-lg font-semibold">Notlar</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Uygulama üzerinden paylaşılan notları görüntüleyin, düzenleyin veya yeni notlar ekleyin.
            </p>
            <Link
              href="/admin/notlar"
              className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Notları Yönet
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-book text-primary"></i>
              </div>
              <h3 className="text-lg font-semibold">Şiirler</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Şiirleri görüntüleyin, düzenleyin veya yeni şiirler ekleyin.
            </p>
            <Link
              href="/admin/siirler"
              className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Şiirleri Yönet
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-users text-primary"></i>
              </div>
              <h3 className="text-lg font-semibold">Kullanıcılar</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Kullanıcı hesaplarını yönetin, yeni kullanıcılar ekleyin veya mevcut kullanıcıları düzenleyin.
            </p>
            <Link
              href="/admin/kullanicilar"
              className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Kullanıcıları Yönet
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-chart-bar text-primary"></i>
              </div>
              <h3 className="text-lg font-semibold">Dashboard</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Siteye ait detaylı istatistikleri ve analizleri görüntüleyin.
            </p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Dashboard'a Git
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-home text-primary"></i>
              </div>
              <h3 className="text-lg font-semibold">Siteye Dön</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Ana web sitesini ziyaret edin ve yapılan değişiklikleri kontrol edin.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Siteye Git
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
