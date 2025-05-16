"use client";

import Link from "next/link";
import { useData } from "@/context/DataContext";

export default function Home() {
  const { cards } = useData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Bölümü */}
      <section className="hero-section">
        <h1 className="hero-title">İyi ki varsın</h1>
        <p className="hero-description">
          Birlikte yaşadığımız özel anları, paylaştığımız duyguları ve hayallerimizi içeren özel yerimiz.
        </p>
        <div className="hero-buttons">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <i className="fas fa-comments text-lg text-white me-2"></i> Chat'e Başla
          </Link>
          <Link
            href="/notlar"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            <i className="fas fa-heart text-lg text-red-500 me-2"></i> Notları Oku
          </Link>
        </div>
      </section>

      {/* Kartlar Bölümü */}
      <section className="cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
            data-card-id={card.id}
          >
            <div className="p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{card.title}</h2>
                <i className={`fas ${card.icon} text-2xl text-primary`}></i>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
            </div>
            <div className="p-6 pt-0">
              <p>{card.content}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Alt Bölüm */}
      <section className="footer-section">
        <h2 className="footer-title">Sevgimizin İzinde</h2>
        <p className="footer-text">
          Bu site, sevgimizin bir yansıması olarak tasarlandı. Birlikte yaşadığımız anılarımızı,
          paylaştığımız duyguları ve birbirimize olan sevgimizi kutlamak için.
        </p>
      </section>
    </div>
  );
}
