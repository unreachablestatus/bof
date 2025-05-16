"use client";

import { useData } from "@/context/DataContext";

export default function Notes() {
  const { notes, loading, error } = useData();

  // Örnek gradient ve icon stilleri
  const gradients = [
    "bg-gradient-to-r from-violet-500 to-pink-500",
    "bg-gradient-to-r from-blue-500 to-purple-500",
    "bg-gradient-to-r from-pink-500 to-orange-500",
    "bg-gradient-to-r from-green-500 to-blue-500",
  ];

  const icons = [
    "fa-heart",
    "fa-star",
    "fa-note-sticky",
    "fa-book",
    "fa-comments",
  ];

  if (loading.notes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex justify-center items-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
            <p>Notlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error.notes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error.notes}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">
          <i className="fas fa-note-sticky me-2"></i> Notlar
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className={`rounded-lg p-6 text-white shadow-lg ${gradients[index % gradients.length]}`}
            >
              <div className="flex justify-between items-start">
                <i className={`fas ${icons[index % icons.length]} text-2xl opacity-90`}></i>
                <span className="text-xs opacity-75">{new Date(note.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              <h3 className="text-xl font-semibold mt-4">{note.title}</h3>
              <p className="mt-2">{note.content}</p>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground col-span-2">
              <p>Henüz not bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
