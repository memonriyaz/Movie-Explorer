
const API_URL = '/api/favorites';

export const fetchFavorites = async (): Promise<number[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch favorites');
  }

  const data = await response.json();
  return data.favorites || [];
};

export const addFavorite = async (movieId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movieId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add favorite');
  }
};

export const removeFavorite = async (movieId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movieId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove favorite');
  }
};
