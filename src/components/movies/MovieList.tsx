'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Movie, TMDBResponse } from '@/types';
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, searchMovies } from '@/lib/tmdb';
import { MovieCard } from './MovieCard';
import { MovieGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { ChevronDown, Filter, TrendingUp, Star, Clock, Calendar } from 'lucide-react';

interface MovieListProps {
  searchQuery?: string;
}

type MovieCategory = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

const categories = [
  { key: 'popular' as MovieCategory, label: 'Popular', icon: TrendingUp },
  { key: 'top_rated' as MovieCategory, label: 'Top Rated', icon: Star },
  { key: 'now_playing' as MovieCategory, label: 'Now Playing', icon: Clock },
  { key: 'upcoming' as MovieCategory, label: 'Upcoming', icon: Calendar },
];

export const MovieList: React.FC<MovieListProps> = ({ searchQuery = '' }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MovieCategory>('popular');
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async (
    category: MovieCategory, 
    page: number = 1, 
    query: string = '',
    append: boolean = false
  ) => {
    try {
      if (page === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      let response: TMDBResponse<Movie>;

      if (query) {
        response = await searchMovies(query, page);
      } else {
        switch (category) {
          case 'top_rated':
            response = await getTopRatedMovies(page);
            break;
          case 'now_playing':
            response = await getNowPlayingMovies(page);
            break;
          case 'upcoming':
            response = await getUpcomingMovies(page);
            break;
          default:
            response = await getPopularMovies(page);
            break;
        }
      }

      setTotalPages(response.total_pages);

      if (append) {
        setMovies(prev => {
          const existingIds = new Set(prev.map(movie => movie.id));
          const newMovies = response.results.filter(movie => !existingIds.has(movie.id));
          return [...prev, ...newMovies];
        });
      } else {
        setMovies(response.results);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    if (searchQuery) {
      fetchMovies('popular', 1, searchQuery, false);
    } else {
      fetchMovies(activeCategory, 1, '', false);
    }
  }, [activeCategory, searchQuery, fetchMovies]);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (searchQuery) {
        fetchMovies('popular', nextPage, searchQuery, true);
      } else {
        fetchMovies(activeCategory, nextPage, '', true);
      }
    }
  }, [currentPage, totalPages, isLoadingMore, activeCategory, searchQuery, fetchMovies]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const handleCategoryChange = (category: MovieCategory) => {
    if (category !== activeCategory && !searchQuery) {
      setActiveCategory(category);
      setCurrentPage(1);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
              Error Loading Movies
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => fetchMovies(activeCategory, 1, searchQuery, false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {!searchQuery && (
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Header */}
      {searchQuery && (
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Results for &quot;{searchQuery}&quot;
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Found {movies.length} movies
          </p>
        </div>
      )}

      {/* Movies Grid */}
      {isLoading ? (
        <MovieGridSkeleton count={20} />
      ) : movies.length > 0 ? (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-fr">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="text-center pt-8">
              {isLoadingMore ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600 dark:text-gray-400">Loading more movies...</span>
                </div>
              ) : (
                <button
                  onClick={loadMore}
                  className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>Load More</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Movies Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `No movies found for "${searchQuery}". Try a different search term.`
                : 'No movies available in this category at the moment.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
