'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { fetchFavorites, addFavorite, removeFavorite } from '@/lib/favorites-client';

// Extend the session type for user ID
interface SessionUser {
  id: string;
  email: string;
  name: string;
}

interface SessionWithUser {
  user: SessionUser;
}

interface FavoritesContextType {
  favorites: number[];
  isLoading: boolean;
  addToFavorites: (movieId: number) => Promise<void>;
  removeFromFavorites: (movieId: number) => Promise<void>;
  isFavorite: (movieId: number) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract user ID with proper type checking
  const userId = (session as SessionWithUser | null)?.user?.id;

  const getCacheKey = useCallback(() => {
    if (!userId) return null;
    return `favorites_${userId}`;
  }, [userId]);

  const loadFavorites = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    const cacheKey = getCacheKey();
    
    try {
      // Try cache first for instant UI
      if (cacheKey && typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const cachedFavorites = JSON.parse(cached);
            setFavorites(cachedFavorites);
          } catch (error) {
            console.error('Error parsing cached favorites:', error);
            localStorage.removeItem(cacheKey);
          }
        }
      }
      
      // Fetch fresh data from database
      const fresh = await fetchFavorites();
      setFavorites(fresh);
      
      // Update cache with fresh data
      if (cacheKey && typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(fresh));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // On error, keep existing favorites if any, otherwise set empty array
      setFavorites(prev => prev.length > 0 ? prev : []);
    } finally {
      setIsLoading(false);
    }
  }, [userId, getCacheKey]);

  // Load favorites on login
  useEffect(() => {
    if (userId) {
      loadFavorites();
    } else {
      setFavorites([]);
      // Clear cache when user logs out
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('favorites_')) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  }, [userId, loadFavorites]);

  const addToFavorites = useCallback(async (movieId: number) => {
    if (!userId) return;
    
    // Optimistic update - immediately update UI
    const newFavorites = [...favorites, movieId];
    setFavorites(newFavorites);
    
    try {
      await addFavorite(movieId);
      
      // Update cache on success
      const cacheKey = getCacheKey();
      if (cacheKey && typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(newFavorites));
      }
    } catch (error) {
      // Rollback on error
      setFavorites(favorites);
      
      // Don't update cache on error
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }, [userId, favorites, getCacheKey]);

  const removeFromFavorites = useCallback(async (movieId: number) => {
    if (!userId) return;
    
    // Optimistic update - immediately update UI
    const newFavorites = favorites.filter(id => id !== movieId);
    setFavorites(newFavorites);
    
    try {
      await removeFavorite(movieId);
      
      // Update cache on success
      const cacheKey = getCacheKey();
      if (cacheKey && typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(newFavorites));
      }
    } catch (error) {
      // Rollback on error
      setFavorites(favorites);
      
      // Don't update cache on error
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }, [userId, favorites, getCacheKey]);

  const isFavorite = useCallback((movieId: number) => favorites.includes(movieId), [favorites]);

  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isLoading,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      refreshFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};
