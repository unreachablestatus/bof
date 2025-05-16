"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Veri tipleri
export type Card = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  userId: number;
};

export type Poem = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  userId: number;
};

// Context tipi
type DataContextType = {
  cards: Card[];
  notes: Note[];
  poems: Poem[];
  loading: {
    cards: boolean;
    notes: boolean;
    poems: boolean;
  };
  error: {
    cards: string | null;
    notes: string | null;
    poems: string | null;
  };
  refreshData: () => Promise<void>;
  updateCard: (card: Partial<Card> & { id: number }) => Promise<boolean>;
  deleteCard: (id: number) => Promise<boolean>;
  addCard: (card: Omit<Card, "id" | "createdAt">) => Promise<boolean>;
  updateNote: (note: Partial<Note> & { id: number }) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  addNote: (note: Omit<Note, "id" | "createdAt" | "userId">) => Promise<boolean>;
  updatePoem: (poem: Partial<Poem> & { id: number }) => Promise<boolean>;
  deletePoem: (id: number) => Promise<boolean>;
  addPoem: (poem: Omit<Poem, "id" | "createdAt" | "userId">) => Promise<boolean>;
};

// Context oluşturma
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // State'leri tanımla
  const [cards, setCards] = useState<Card[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [poems, setPoems] = useState<Poem[]>([]);
  const { isLoggedIn, user } = useAuth();

  // Loading ve error state'leri
  const [loading, setLoading] = useState({
    cards: true,
    notes: true,
    poems: true,
  });

  const [error, setError] = useState({
    cards: null as string | null,
    notes: null as string | null,
    poems: null as string | null,
  });

  // Verileri yenileme fonksiyonu
  const refreshData = async () => {
    await Promise.all([
      fetchCards(),
      fetchNotes(),
      fetchPoems(),
    ]);
  };

  // Veri çekme fonksiyonları
  const fetchCards = async () => {
    try {
      setLoading(prev => ({ ...prev, cards: true }));
      setError(prev => ({ ...prev, cards: null }));

      const response = await fetch('/api/cards');

      if (!response.ok) {
        throw new Error('Kartlar alınırken bir hata oluştu');
      }

      const data = await response.json();
      setCards(data);
      return data;
    } catch (err) {
      console.error('Fetch cards error:', err);
      setError(prev => ({ ...prev, cards: err instanceof Error ? err.message : 'Bilinmeyen hata' }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, cards: false }));
    }
  };

  const fetchNotes = async () => {
    if (!isLoggedIn()) return;

    try {
      setLoading(prev => ({ ...prev, notes: true }));
      setError(prev => ({ ...prev, notes: null }));

      const response = await fetch('/api/notes');

      if (!response.ok) {
        throw new Error('Notlar alınırken bir hata oluştu');
      }

      const data = await response.json();
      setNotes(data);
      return data;
    } catch (err) {
      console.error('Fetch notes error:', err);
      setError(prev => ({ ...prev, notes: err instanceof Error ? err.message : 'Bilinmeyen hata' }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, notes: false }));
    }
  };

  const fetchPoems = async () => {
    if (!isLoggedIn()) return;

    try {
      setLoading(prev => ({ ...prev, poems: true }));
      setError(prev => ({ ...prev, poems: null }));

      const response = await fetch('/api/poems');

      if (!response.ok) {
        throw new Error('Şiirler alınırken bir hata oluştu');
      }

      const data = await response.json();
      setPoems(data);
      return data;
    } catch (err) {
      console.error('Fetch poems error:', err);
      setError(prev => ({ ...prev, poems: err instanceof Error ? err.message : 'Bilinmeyen hata' }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, poems: false }));
    }
  };

  // Kullanıcı durumu değiştiğinde verileri yeniden çek
  useEffect(() => {
    fetchCards();

    if (isLoggedIn()) {
      fetchNotes();
      fetchPoems();
    } else {
      setNotes([]);
      setPoems([]);
    }
  }, [isLoggedIn()]);

  // Kart fonksiyonları
  const updateCard = async (updatedCard: Partial<Card> & { id: number }): Promise<boolean> => {
    try {
      const response = await fetch(`/api/cards?id=${updatedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard),
      });

      if (!response.ok) {
        throw new Error('Kart güncellenirken bir hata oluştu');
      }

      await fetchCards();
      return true;
    } catch (err) {
      console.error('Update card error:', err);
      return false;
    }
  };

  const deleteCard = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/cards?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kart silinirken bir hata oluştu');
      }

      await fetchCards();
      return true;
    } catch (err) {
      console.error('Delete card error:', err);
      return false;
    }
  };

  const addCard = async (newCard: Omit<Card, "id" | "createdAt">): Promise<boolean> => {
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });

      if (!response.ok) {
        throw new Error('Kart eklenirken bir hata oluştu');
      }

      await fetchCards();
      return true;
    } catch (err) {
      console.error('Add card error:', err);
      return false;
    }
  };

  // Not fonksiyonları
  const updateNote = async (updatedNote: Partial<Note> & { id: number }): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notes?id=${updatedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) {
        throw new Error('Not güncellenirken bir hata oluştu');
      }

      await fetchNotes();
      return true;
    } catch (err) {
      console.error('Update note error:', err);
      return false;
    }
  };

  const deleteNote = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Not silinirken bir hata oluştu');
      }

      await fetchNotes();
      return true;
    } catch (err) {
      console.error('Delete note error:', err);
      return false;
    }
  };

  const addNote = async (newNote: Omit<Note, "id" | "createdAt" | "userId">): Promise<boolean> => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error('Not eklenirken bir hata oluştu');
      }

      await fetchNotes();
      return true;
    } catch (err) {
      console.error('Add note error:', err);
      return false;
    }
  };

  // Şiir fonksiyonları
  const updatePoem = async (updatedPoem: Partial<Poem> & { id: number }): Promise<boolean> => {
    try {
      const response = await fetch(`/api/poems?id=${updatedPoem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPoem),
      });

      if (!response.ok) {
        throw new Error('Şiir güncellenirken bir hata oluştu');
      }

      await fetchPoems();
      return true;
    } catch (err) {
      console.error('Update poem error:', err);
      return false;
    }
  };

  const deletePoem = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/poems?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Şiir silinirken bir hata oluştu');
      }

      await fetchPoems();
      return true;
    } catch (err) {
      console.error('Delete poem error:', err);
      return false;
    }
  };

  const addPoem = async (newPoem: Omit<Poem, "id" | "createdAt" | "userId">): Promise<boolean> => {
    try {
      const response = await fetch('/api/poems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPoem),
      });

      if (!response.ok) {
        throw new Error('Şiir eklenirken bir hata oluştu');
      }

      await fetchPoems();
      return true;
    } catch (err) {
      console.error('Add poem error:', err);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{
      cards,
      notes,
      poems,
      loading,
      error,
      refreshData,
      updateCard,
      deleteCard,
      addCard,
      updateNote,
      deleteNote,
      addNote,
      updatePoem,
      deletePoem,
      addPoem,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
