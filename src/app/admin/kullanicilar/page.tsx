"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

type UserFormData = {
  username: string;
  password: string;
  isAdmin: boolean;
};

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<{
    password: string;
    isAdmin: boolean;
  }>({
    password: "",
    isAdmin: false,
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newUser, setNewUser] = useState<UserFormData>({
    username: "",
    password: "",
    isAdmin: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error('Kullanıcılar alınırken bir hata oluştu');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    fetchUsers();
  }, []);

  // Kullanıcı ekleme
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.username || !newUser.password) {
      setSaveError("Kullanıcı adı ve şifre zorunludur");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı eklenirken bir hata oluştu');
      }

      await fetchUsers();
      setIsAddingNew(false);
      setNewUser({
        username: "",
        password: "",
        isAdmin: false,
      });
    } catch (err) {
      console.error('Add user error:', err);
      setSaveError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsSaving(false);
    }
  };

  // Kullanıcı düzenleme
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    setIsSaving(true);
    setSaveError(null);

    const updateData: any = {};

    if (editFormData.password) {
      updateData.password = editFormData.password;
    }

    updateData.isAdmin = editFormData.isAdmin;

    try {
      const response = await fetch(`/api/users?id=${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı güncellenirken bir hata oluştu');
      }

      await fetchUsers();
      setEditingUser(null);
      setEditFormData({
        password: "",
        isAdmin: false,
      });
    } catch (err) {
      console.error('Edit user error:', err);
      setSaveError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsSaving(false);
    }
  };

  // Kullanıcı silme
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı silinirken bir hata oluştu');
      }

      await fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      alert(err instanceof Error ? err.message : 'Kullanıcı silinirken bir hata oluştu');
    }
  };

  // Düzenlemeye başla
  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      password: "",
      isAdmin: user.isAdmin,
    });
    setIsAddingNew(false);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
          <p>Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Kullanıcıları Yönet</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingUser(null);
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            disabled={isAddingNew}
          >
            <i className="fa-solid fa-plus me-2"></i> Yeni Kullanıcı Ekle
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Geri Dön
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {saveError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
          {saveError}
        </div>
      )}

      {/* Yeni kullanıcı ekleme formu */}
      {isAddingNew && (
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Yeni Kullanıcı Ekle</h2>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Şifre</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAdmin"
                checked={newUser.isAdmin}
                onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                className="h-4 w-4 rounded border-input"
                disabled={isSaving}
              />
              <label htmlFor="isAdmin" className="ml-2 block text-sm font-medium">
                Admin yetkilerine sahip
              </label>
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

      {/* Kullanıcı düzenleme formu */}
      {editingUser && (
        <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Kullanıcıyı Düzenle: {editingUser.username}
          </h2>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Yeni Şifre (değiştirmek istemiyorsanız boş bırakın)</label>
              <input
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                className="w-full p-2 border rounded-md"
                disabled={isSaving}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsAdmin"
                checked={editFormData.isAdmin}
                onChange={(e) => setEditFormData({ ...editFormData, isAdmin: e.target.checked })}
                className="h-4 w-4 rounded border-input"
                disabled={isSaving}
              />
              <label htmlFor="editIsAdmin" className="ml-2 block text-sm font-medium">
                Admin yetkilerine sahip
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
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

      {/* Kullanıcı listesi */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Kullanıcı Adı</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Rol</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Oluşturulma Tarihi</th>
                <th className="px-4 py-3 text-right text-sm font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <i className={`fas fa-user ${user.isAdmin ? 'text-amber-500' : 'text-primary'}`}></i>
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Kullanıcı
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => startEditing(user)}
                      className="inline-flex items-center justify-center rounded-md border border-input px-2 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      <i className="fa-solid fa-edit me-1"></i> Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="inline-flex items-center justify-center rounded-md bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 ml-2"
                    >
                      <i className="fa-solid fa-trash me-1"></i> Sil
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Henüz kullanıcı bulunmuyor. Yeni bir kullanıcı ekleyin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
