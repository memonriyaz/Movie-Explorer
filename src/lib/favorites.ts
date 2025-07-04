import { Movie } from '@/types';
import { addFavorite as addFavoriteToAPI, removeFavorite as removeFavoriteFromAPI } from './favorites-client';

export const getFavorites = (): number[] => {
  if (typeof window === 'undefined') return [];
  
  const favorites = localStorage.getItem('movie-explorer-favorites');
  return favorites ? JSON.parse(favorites) : [];
};

export const addToFavorites = async (movieId: number): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const favorites = getFavorites();
  if (!favorites.includes(movieId)) {
    favorites.push(movieId);
    localStorage.setItem('movie-explorer-favorites', JSON.stringify(favorites));
    
    
    // Sync with database
    try {
      await addFavoriteToAPI(movieId);
    } catch (error) {
      console.error('Failed to sync favorite with database:', error);
      // Remove from localStorage if API fails
      const revertFavorites = favorites.filter(id => id !== movieId);
      localStorage.setItem('movie-explorer-favorites', JSON.stringify(revertFavorites));
      throw error;
    }
  }
};

export const removeFromFavorites = async (movieId: number): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(id => id !== movieId);
  localStorage.setItem('movie-explorer-favorites', JSON.stringify(updatedFavorites));
  
  // Sync with database
  try {
    await removeFavoriteFromAPI(movieId);
  } catch (error) {
    console.error('Failed to sync favorite removal with database:', error);
    // Restore to localStorage if API fails
    localStorage.setItem('movie-explorer-favorites', JSON.stringify(favorites));
    throw error;
  }
};

export const isFavorite = (movieId: number): boolean => {
  const favorites = getFavorites();
  return favorites.includes(movieId);
};

export const toggleFavorite = async (movieId: number): Promise<boolean> => {
  const favorites = getFavorites();
  const isCurrentlyFavorite = favorites.includes(movieId);
  
  if (isCurrentlyFavorite) {
    await removeFromFavorites(movieId);
    return false;
  } else {
    await addToFavorites(movieId);
    return true;
  }
};

export const getFavoriteMovies = (): Movie[] => {
  if (typeof window === 'undefined') return [];
  
  const favoriteMovies = localStorage.getItem('movie-explorer-favorites');
  return favoriteMovies ? JSON.parse(favoriteMovies) : [];
};

export const saveFavoriteMovie = (movie: Movie): void => {
  if (typeof window === 'undefined') return;
  
  const favoriteMovies = getFavoriteMovies();
  const existingIndex = favoriteMovies.findIndex(m => m.id === movie.id);
  
  if (existingIndex === -1) {
    favoriteMovies.push(movie);
    localStorage.setItem('movie-explorer-favorite-movies', JSON.stringify(favoriteMovies));
  }
};

export const removeFavoriteMovie = (movieId: number): void => {
  if (typeof window === 'undefined') return;
  
  const favoriteMovies = getFavoriteMovies();
  const updatedFavorites = favoriteMovies.filter(movie => movie.id !== movieId);
  localStorage.setItem('movie-explorer-favorite-movies', JSON.stringify(updatedFavorites));
};
