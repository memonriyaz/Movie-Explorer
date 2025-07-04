import { User } from '@/types';

// Storage utilities for client-side
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('movie-explorer-token');
  const userData = localStorage.getItem('movie-explorer-user');
  const favoriteMovies = localStorage.getItem('movie-explorer-favorites');
  
  if (!token || !userData) return null;
  
  try {
    const user = JSON.parse(userData) as User;
    // Get favorites from localStorage
    const favorites = favoriteMovies ? JSON.parse(favoriteMovies) : [];
    console.log('Favorites:', favorites);
    
    user.favorites = favorites;
    
    return user;
  } catch {
    // If parsing fails, clear all stored data
    clearStoredUser();
    return null;
  }
};

export const storeUser = (user: User, token: string): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('movie-explorer-token', token);
  localStorage.setItem('movie-explorer-user', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    favorites: user.favorites
  }));
  localStorage.setItem('movie-explorer-favorites', JSON.stringify(user.favorites));
};

export const clearStoredUser = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('movie-explorer-token');
  localStorage.removeItem('movie-explorer-user');
  localStorage.removeItem('movie-explorer-favorites');
  localStorage.removeItem('movie-explorer-favorite-movies');
};

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("movie-explorer-token");
};

