import axios from 'axios';
import { Movie, MovieDetail, TMDBResponse, Genre } from '@/types';
import NodeCache from "node-cache";


const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = process.env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

if (!API_KEY) {
  throw new Error('TMDB API key is required');
}

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const getPopularMovies = async (page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/popular', {
    params: { page },
  });
  return response.data;
};

export const getTopRatedMovies = async (page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/top_rated', {
    params: { page },
  });
  return response.data;
};

export const getNowPlayingMovies = async (page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/now_playing', {
    params: { page },
  });
  return response.data;
};

export const getUpcomingMovies = async (page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/movie/upcoming', {
    params: { page },
  });
  return response.data;
};

export const searchMovies = async (query: string, page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await tmdbApi.get<TMDBResponse<Movie>>('/search/movie', {
    params: { query, page },
  });
  return response.data;
};


const cache = new NodeCache({ stdTTL: 60 * 60 }); // 3600 seconds = 1 hour

export const getMovieDetails = async (
  movieId: number
): Promise<MovieDetail> => {
  const cacheKey = `movie-${movieId}`;

  // Check cache first
  const cached = cache.get<MovieDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await tmdbApi.get<MovieDetail>(`/movie/${movieId}`);
    const movieData = response.data;

    // Store in cache
    cache.set(cacheKey, movieData);

    return movieData;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};


export const getMovieGenres = async (): Promise<{ genres: Genre[] }> => {
  const response = await tmdbApi.get<{ genres: Genre[] }>('/genre/movie/list');
  return response.data;
};

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '/placeholder-movie.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: string = 'w1280'): string => {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};
