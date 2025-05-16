"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useData } from "@/context/DataContext";
import { useChat } from "@/context/ChatContext";

// Basit bir kart komponenti
const StatCard = ({
  title,
  value,
  icon,
  href
}: {
  title: string;
  value: string | number;
  icon: string;
  href: string;
}) => (
  <Link
    href={href}
    className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <i className={`fas ${icon} text-primary text-xl`}></i>
      </div>
    </div>
  </Link>
);

// Son aktivite komponenti
const ActivityItem = ({
  title,
  description,
  time,
  icon
}: {
  title: string;
  description: string;
  time: string;
  icon: string;
}) => (
  <div className="flex gap-4 py-3 border-b last:border-b-0">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <i className={`fas ${icon} text-primary text-sm`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
    </div>
    <div className="text-xs text-muted-foreground whitespace-nowrap">
      {time}
    </div>
  </div>
);

export default function AdminDashboard() {
  const { cards, notes, poems, loading } = useData();
  const { messages } = useChat();
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // API'den kullanıcı sayısını al
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

    // Son aktiviteleri hazırla
    const activity = [];

    // Son 3 mesaj
    const recentMessages = [...messages].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 3);

    for (const msg of recentMessages) {
      activity.push({
        title: `${msg.sender.username}'dan yeni mesaj`,
        description: msg.content.length > 50 ? `${msg.content.substring(0, 50)}...` : msg.content,
        time: new Date(msg.timestamp).toLocaleDateString('tr-TR'),
        icon: 'fa-comment',
        timestamp: new Date(msg.timestamp).getTime()
      });
    }

    // Son 3 not
    const recentNotes = [...notes].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 3);

    for (const note of recentNotes) {
      activity.push({
        title: `Yeni not eklendi: ${note.title}`,
        description: note.content.length > 50 ? `${note.content.substring(0, 50)}...` : note.content,
        time: new Date(note.createdAt).toLocaleDateString('tr-TR'),
        icon: 'fa-note-sticky',
        timestamp: new Date(note.createdAt).getTime()
      });
    }

    // Son 3 şiir
    const recentPoems = [...poems].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 3);

    for (const poem of recentPoems) {
      activity.push({
        title: `Yeni şiir eklendi: ${poem.title}`,
        description: poem.content.length > 50 ? `${poem.content.substring(0, 50)}...` : poem.content,
        time: new Date(poem.createdAt).toLocaleDateString('tr-TR'),
        icon: 'fa-book',
        timestamp: new Date(poem.createdAt).getTime()
      });
    }

    // Tüm aktiviteleri sırala ve en yeni 5 tanesini al
    const sortedActivity = activity.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
    setRecentActivity(sortedActivity);

  }, [messages, notes, poems]);

  if (loading.cards || loading.notes || loading.poems || isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Dashboard</h1>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Anasayfa Kartları"
          value={cards.length}
          icon="fa-layer-group"
          href="/admin/kartlar"
        />
        <StatCard
          title="Notlar"
          value={notes.length}
          icon="fa-note-sticky"
          href="/admin/notlar"
        />
        <StatCard
          title="Şiirler"
          value={poems.length}
          icon="fa-book"
          href="/admin/siirler"
        />
        <StatCard
          title="Kullanıcılar"
          value={userCount}
          icon="fa-users"
          href="/admin/kullanicilar"
        />
      </div>

      {/* İçerik dağılımı ve aktivite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* İçerik özeti */}
        <div className="lg:col-span-2 bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-6">İçerik Özeti</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <i className="fas fa-layer-group text-primary"></i>
                <span>Kartlar</span>
              </h3>
              <ul className="space-y-1 text-sm">
                {cards.slice(0, 3).map(card => (
                  <li key={card.id} className="truncate" title={card.title}>
                    {card.title}
                  </li>
                ))}
                {cards.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{cards.length - 3} daha...
                  </li>
                )}
                {cards.length === 0 && (
                  <li className="text-muted-foreground">
                    Kart yok
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <i className="fas fa-note-sticky text-primary"></i>
                <span>Notlar</span>
              </h3>
              <ul className="space-y-1 text-sm">
                {notes.slice(0, 3).map(note => (
                  <li key={note.id} className="truncate" title={note.title}>
                    {note.title}
                  </li>
                ))}
                {notes.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{notes.length - 3} daha...
                  </li>
                )}
                {notes.length === 0 && (
                  <li className="text-muted-foreground">
                    Not yok
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <i className="fas fa-book text-primary"></i>
                <span>Şiirler</span>
              </h3>
              <ul className="space-y-1 text-sm">
                {poems.slice(0, 3).map(poem => (
                  <li key={poem.id} className="truncate" title={poem.title}>
                    {poem.title}
                  </li>
                ))}
                {poems.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{poems.length - 3} daha...
                  </li>
                )}
                {poems.length === 0 && (
                  <li className="text-muted-foreground">
                    Şiir yok
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Son aktiviteler */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Son Aktiviteler</h2>

          <div className="space-y-1">
            {recentActivity.map((activity, index) => (
              <ActivityItem
                key={index}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                icon={activity.icon}
              />
            ))}

            {recentActivity.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>Henüz aktivite yok</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
