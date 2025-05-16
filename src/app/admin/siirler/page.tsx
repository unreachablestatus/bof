"use client";

import { useState } from "react";
import Link from "next/link";
import { useData, Poem } from "@/context/DataContext";

// Form verisi için arayüz
interface PoemFormData {
  title: string;
  content: string;
  gradient: string;
}

export default function ManagePoems() {
  const { poems, updatePoem, deletePoem, addPoem, loading, error } = useData();
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPoem, setNewPoem] = useState<PoemFormData>({
    title: "",
    content: "",
    gradient: "bg-gradient-to-r from-violet-500 to-pink-500"
  });

  // Form gönderildiğinde yükleme durumları
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Şiir düzenleme işlemi
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPoem) {
      setIsSaving(true);
      setSaveError(null);

      try {
        const success = await updatePoem({
          id: editingPoem.id,
          title: editingPoem.title,
          content: editingPoem.content
        });

        if (success) {
          setEditingPoem(null);
        } else {
          setSaveError("Şiir güncellenirken bir hata oluştu");
        }
      } catch (err) {
        console.error("Edit poem error:", err);
        setSaveError("Bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Şiir ekle
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPoem.title && newPoem.content) {
      setIsSaving(true);
      setSaveError(null);

      try {
        const success = await addPoem(newPoem);

        if (success) {
          setIsAddingNew(false);
          setNewPoem({
            title: "",
            content: "",
            gradient: "bg-gradient-to-r from-violet-500 to-pink-500"
          });
        } else {
          setSaveError("Şiir eklenirken bir hata oluştu");
        }
      } catch (err) {
        console.error("Add poem error:", err);
        setSaveError("Bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Şiir sil
  const handleDelete = async (id: number) => {
    if (window.confirm("Bu şiiri silmek istediğinizden emin misiniz?")) {
      try {
        await deletePoem(id);
      } catch (err) {
        console.error("Delete poem error:", err);
        alert("Şiir silinirken bir hata oluştu");
      }
    }
  };

  if (loading.poems) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p>Şiirler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanılabilir gradientler
  const gradients = {
    "bg-gradient-to-r from-violet-500 to-pink-500": "Mor-Pembe",
    "bg-gradient-to-r from-blue-500 to-purple-500": "Mavi-Mor",
    "bg-gradient-to-r from-pink-500 to-orange-500": "Pembe-Turuncu",
    "bg-gradient-to-r from-green-500 to-blue-500": "Yeşil-Mavi"
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Şiirleri Yönet</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingPoem(null);
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            disabled={isAddingNew}
          >
            <i className="fa-solid fa-plus me-2"></i> Yeni Şiir Ekle
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Geri Dön
          </Link>
        </div>
      </div>

      {error.poems && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {error.poems}
        </div>
      )}

      {saveError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {saveError}
        </div>
      )}

      {/* Yeni şiir ekleme formu */}
      {isAddingNew && (
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Yeni Şiir Ekle</h2>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input
                type="text"
                value={newPoem.title}
                onChange={(e) => setNewPoem({ ...newPoem, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">İçerik</label>
              <textarea
                value={newPoem.content}
                onChange={(e) => setNewPoem({ ...newPoem, content: e.target.value })}
                className="w-full p-2 border rounded-md h-40"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gradyan Renk</label>
              <select
                value={newPoem.gradient}
                onChange={(e) => setNewPoem({ ...newPoem, gradient: e.target.value })}
                className="w-full p-2 border rounded-md"
                disabled={isSaving}
              >
                {Object.entries(gradients).map(([value, name]) => (
                  <option key={value} value={value}>{name}</option>
                ))}
              </select>
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

      {/* Şiir düzenleme formu */}
      {editingPoem && (
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Şiiri Düzenle</h2>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input
                type="text"
                value={editingPoem.title}
                onChange={(e) => setEditingPoem({ ...editingPoem, title: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">İçerik</label>
              <textarea
                value={editingPoem.content || ''}
                onChange={(e) => setEditingPoem({ ...editingPoem, content: e.target.value })}
                className="w-full p-2 border rounded-md h-40"
                required
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPoem(null)}
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

      {/* Şiir listesi */}
      <div className="space-y-6">
        {poems.map((poem) => (
          <div key={poem.id} className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 text-white" style={{
              background: poem.gradient || "linear-gradient(to right, var(--tw-gradient-stops))",
              backgroundImage: poem.gradient || "linear-gradient(to right, var(--violet-500), var(--pink-500))",
            }}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{poem.title}</h2>
                <span className="text-xs opacity-75">{new Date(poem.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm mb-4 leading-relaxed">{poem.content}</pre>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingPoem(poem)}
                  className="inline-flex items-center justify-center rounded-md border border-input px-3 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <i className="fa-solid fa-edit me-1"></i> Düzenle
                </button>
                <button
                  onClick={() => handleDelete(poem.id)}
                  className="inline-flex items-center justify-center rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                >
                  <i className="fa-solid fa-trash me-1"></i> Sil
                </button>
              </div>
            </div>
          </div>
        ))}

        {poems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Henüz şiir bulunmuyor. Yeni bir şiir ekleyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
