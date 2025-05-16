"use client";

import { formatDate } from "@/lib/utils";
import { useData } from "@/context/DataContext";

export default function Poems() {
  const { poems } = useData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">
          <i className="fas fa-book me-2"></i> Şiirler
        </h1>

        <div className="space-y-8">
          {poems.map((poem) => (
            <div
              key={poem.id}
              className={`rounded-lg overflow-hidden shadow-lg`}
            >
              <div className={`${poem.gradient} p-6 text-white`}>
                <h2 className="text-2xl font-bold">{poem.title}</h2>
                <p className="text-sm mt-2 opacity-80">{formatDate(poem.created_at)}</p>
              </div>
              <div className="p-6 bg-card">
                <pre className="whitespace-pre-wrap font-sans leading-relaxed">{poem.content}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
