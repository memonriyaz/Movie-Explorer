import { getStoredUser } from './auth-client';

const API_URL = '/api/favorites';

export const fetchFavorites = async (): Promise<number[]> => {
  const user = getStoredUser();
  if (!user) throw new Error('User not authenticated');

  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('movie-explorer-token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch favorites');
  }

  const data = await response.json();
  return data.favorites || [];
};

export const addFavorite = async (movieId: number): Promise<void> => {
  const user = getStoredUser();
  if (!user) throw new Error('User not authenticated');

  const response = await fetch(`${API_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('movie-explorer-token')}`
    },
    body: JSON.stringify({ movieId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add favorite');
  }
};

export const removeFavorite = async (movieId: number): Promise<void> => {
  const user = getStoredUser();
  if (!user) throw new Error('User not authenticated');

  const response = await fetch(`${API_URL}/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('movie-explorer-token')}`
    },
    body: JSON.stringify({ movieId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove favorite');
  }
};

