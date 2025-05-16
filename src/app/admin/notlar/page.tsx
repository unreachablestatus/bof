"use client";

import { useState } from "react";
import Link from "next/link";
import { useData, Note } from "@/context/DataContext";

// Form verisi için arayüz
interface NoteFormData {
  title: string;
  content: string;
}

export default function ManageNotes() {
  const { notes, updateNote, deleteNote, addNote, loading, error } = useData();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNote, setNewNote] = useState<NoteFormData>({
    title: "",
    content: ""
  });

  // Form gönderildiğinde yükleme durumları
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Not düzenleme işlemi
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingNote) {
      setIsSaving(true);
      setSaveError(null);

      try {
        const success = await updateNote({
          id: editingNote.id,
          title: editingNote.title,
          content: editingNote.content
        });

        if (success) {
          setEditingNote(null);
        } else {
          setSaveError("Not güncellenirken bir hata oluştu");
        }
      } catch (err) {
        console.error("Edit note error:", err);
        setSaveError("Bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Not ekle
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newNote.title && newNote.content) {
      setIsSaving(true);
      setSaveError(null);

      try {
        const success = await addNote(newNote);

        if (success) {
          setIsAddingNew(false);
          setNewNote({
            title: "",
            content: ""
          });
        } else {
          setSaveError("Not eklenirken bir hata oluştu");
        }
      } catch (err) {
        console.error("Add note error:", err);
        setSaveError("Bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Not sil
  const handleDelete = async (id: number) => {
    if (window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      try {
        await deleteNote(id);
      } catch (err) {
        console.error("Delete note error:", err);
        alert("Not silinirken bir hata oluştu");
      }
    }
  };

  if (loading.notes) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p>Notlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Örnek gradient ve icon stilleri
  const gradients = [
    "bg-gradient-to-r from-violet-500 to-pink-500",
    "bg-gradient-to-r from-blue-500 to-purple-500",
    "bg-gradient-to-r from-pink-500 to-orange-500",
    "bg-gradient-to-r from-green-500 to-blue-500"
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Notları Yönet</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingNote(null);
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            disabled={isAddingNew}
          >
            <i className="fa-solid fa-plus me-2"></i> Yeni Not Ekle
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Geri Dön
          </Link>
        </div>
      </div>

      {error.notes && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {error.notes}
        </div>
      )}

      {saveError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {saveError}
        </div>
      )}

      {/* Yeni not ekleme formu */}
      {isAddingNew && (
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Yeni Not Ekle</h2>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">İçerik</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="w-full p-2 border rounded-md h-24"
                required
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                disabled={isSaving}
              >
                İptal
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i> Kaydediliyor...
                  </>
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Not düzenleme formu */}
      {editingNote && (
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Notu Düzenle</h2>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">İçerik</label>
              <textarea
                value={editingNote.content || ''}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className="w-full p-2 border rounded-md h-24"
                required
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                disabled={isSaving}
              >
                İptal
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i> Güncelleniyor...
                  </>
                ) : (
                  'Güncelle'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Not listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map((note, index) => (
          <div key={note.id} className={`rounded-lg p-6 text-white shadow-lg ${gradients[index % gradients.length]}`}>
            <div className="flex justify-between items-start mb-4">
              <i className="fas fa-note-sticky text-xl opacity-75"></i>
              <span className="text-xs opacity-75">{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
            <p className="mb-6">{note.content}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingNote(note)}
                className="inline-flex items-center justify-center rounded-md bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white hover:bg-white/30"
              >
                <i className="fa-solid fa-edit me-1"></i> Düzenle
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="inline-flex items-center justify-center rounded-md bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white hover:bg-white/30"
              >
                <i className="fa-solid fa-trash me-1"></i> Sil
              </button>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground col-span-2">
            <p>Henüz not bulunmuyor. Yeni bir not ekleyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
