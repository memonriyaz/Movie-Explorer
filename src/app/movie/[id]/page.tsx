'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { MovieDetail } from '@/types';
import { getMovieDetails, getImageUrl, getBackdropUrl } from '@/lib/tmdb';
import { isFavorite, toggleFavorite, saveFavoriteMovie, removeFavoriteMovie } from '@/lib/favorites';
import { MovieDetailSkeleton } from '@/components/ui/LoadingSkeleton';
import { Heart, Star, Calendar, Clock, DollarSign, ArrowLeft } from 'lucide-react';

export default function MovieDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMovieFavorite, setIsMovieFavorite] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!id) return;

    const fetchMovie = async () => {
      try {
        setIsLoading(true);
        const movieData = await getMovieDetails(Number(id));
        setMovie(movieData);
        setIsMovieFavorite(isFavorite(movieData.id));
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError('Failed to load movie details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id, isAuthenticated, authLoading, router]);

  const handleFavoriteToggle = async () => {
    if (!movie) return;
  
    try {
      const newFavoriteState = await toggleFavorite(movie.id);
      setIsMovieFavorite(newFavoriteState);
      newFavoriteState ? saveFavoriteMovie(movie) : removeFavoriteMovie(movie.id) }
      catch (error) {
      console.error('Failed to update favorites:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8">
        <MovieDetailSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
                Error Loading Movie
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Movie Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The movie you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mb-10">
      {/* Backdrop */}
      <div className="relative h-64 md:h-80 bg-gray-900">
        {movie.backdrop_path && (
          <Image
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="w-64 h-96 mx-auto md:mx-0 relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-2xl">
              {movie.poster_path && (
                <Image
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {/* Movie Info */}
          <div className="flex-1 text-white">
            <div className="space-y-6">
              {/* Title and Actions */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-2">
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p className="text-xl text-gray-300 italic">{movie.tagline}</p>
                  )}
                </div>
                
                <button
                  onClick={handleFavoriteToggle}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isMovieFavorite
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isMovieFavorite ? 'fill-current' : ''}`}
                  />
                  <span>{isMovieFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>
              </div>

              {/* Movie Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                  <span className="text-gray-400">({movie.vote_count} votes)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>
                
                {movie.runtime > 0 && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div>
                <h2 className="text-2xl font-bold mb-3">Overview</h2>
                <p className="text-gray-300 leading-relaxed">
                  {movie.overview || 'No overview available.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Movie Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Budget */}
            {movie.budget > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Budget
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(movie.budget)}
                </p>
              </div>
            )}

            {/* Revenue */}
            {movie.revenue > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Revenue
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(movie.revenue)}
                </p>
              </div>
            )}

            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {movie.status}
              </p>
            </div>

            {/* Original Language */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Original Language
              </h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {movie.original_language.toUpperCase()}
              </p>
            </div>

            {/* Production Companies */}
            {movie.production_companies.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Production Companies
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {movie.production_companies.map(company => company.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
