"use client";

import { useState } from "react";
import Link from "next/link";
import { useData, Card } from "@/context/DataContext";

// Kartı düzenlerken veya eklerken kullanılan ara form tipi
type CardFormData = {
  title: string;
  content: string;
  imageUrl: string;
};

export default function ManageCards() {
  const { cards, updateCard, deleteCard, addCard, loading, error } = useData();
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCard, setNewCard] = useState<CardFormData>({
    title: "",
    content: "",
    imageUrl: ""
  });

  // Form gönderildiğinde yükleme durumları
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Kart düzenleme işlemi
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCard) {
      setIsSaving(true);
      setSaveError(null);

      try {
        const success = await updateCard({
          id: editingCard.id,
          title: editingCard.title,
          content: editingCard.content,
          imageUrl: editingCard.imageUrl
        });

        if (success) {
          setEditingCard(null);
        } else {
          setSaveError("Kart güncellenirken bir hata oluştu");
        }
      } catch (err) {
        console.error("Edit card error:", err);
        setSaveError("Bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Kart ekle
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newCard.title) {
      setIsSaving(true);
      setSaveError(null);

      try {
        const success = await addCard(newCard);

        if (success) {
          setIsAddingNew(false);
          setNewCard({
            title: "",
            content: "",
            imageUrl: ""
          });
        } else {
          setSaveError("Kart eklenirken bir hata oluştu");
        }
      } catch (err) {
        console.error("Add card error:", err);
        setSaveError("Bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Kart sil
  const handleDelete = async (id: number) => {
    if (window.confirm("Bu kartı silmek istediğinizden emin misiniz?")) {
      try {
        await deleteCard(id);
      } catch (err) {
        console.error("Delete card error:", err);
        alert("Kart silinirken bir hata oluştu");
      }
    }
  };

  if (loading.cards) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p>Kartlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Ana Sayfa Kartlarını Yönet</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingCard(null);
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            disabled={isAddingNew}
          >
            <i className="fa-solid fa-plus me-2"></i> Yeni Kart Ekle
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Geri Dön
          </Link>
        </div>
      </div>

      {error.cards && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {error.cards}
        </div>
      )}

      {saveError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {saveError}
        </div>
      )}

      {/* Yeni kart ekleme formu */}
      {isAddingNew && (
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Yeni Kart Ekle</h2>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input
                type="text"
                value={newCard.title}
                onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">İçerik</label>
              <textarea
                value={newCard.content}
                onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
                className="w-full p-2 border rounded-md h-24"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Resim URL</label>
              <input
                type="text"
                value={newCard.imageUrl || ''}
                onChange={(e) => setNewCard({ ...newCard, imageUrl: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="https://example.com/image.jpg"
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

      {/* Kart düzenleme formu */}
      {editingCard && (
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Kartı Düzenle</h2>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input
                type="text"
                value={editingCard.title}
                onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">İçerik</label>
              <textarea
                value={editingCard.content || ''}
                onChange={(e) => setEditingCard({ ...editingCard, content: e.target.value })}
                className="w-full p-2 border rounded-md h-24"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Resim URL</label>
              <input
                type="text"
                value={editingCard.imageUrl || ''}
                onChange={(e) => setEditingCard({ ...editingCard, imageUrl: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="https://example.com/image.jpg"
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCard(null)}
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

      {/* Kart listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-card rounded-lg border shadow-sm overflow-hidden">
            {card.imageUrl && (
              <div className="h-48 overflow-hidden">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{card.title}</h2>
              </div>
              {card.content && (
                <p className="text-sm mb-4">{card.content}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingCard(card)}
                  className="inline-flex items-center justify-center rounded-md border border-input px-3 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <i className="fa-solid fa-edit me-1"></i> Düzenle
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="inline-flex items-center justify-center rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                >
                  <i className="fa-solid fa-trash me-1"></i> Sil
                </button>
              </div>
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <div className="text-center py-12 text-muted-foreground col-span-3">
            <p>Henüz kart bulunmuyor. Yeni bir kart ekleyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
