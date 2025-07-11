'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface MovieCardProps {
  movie: Movie;
  showFavoriteButton?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, showFavoriteButton = true }) => {
  const { data: session } = useSession();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [imageLoaded, setImageLoaded] = useState(false);

  // ✅ Check if the movie is a favorite using context - no database calls!
  const isMovieFavorite = isFavorite(movie.id);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      toast.error('Please log in to add favorites');
      return;
    }
    
    try {
      if (isMovieFavorite) {
        await removeFromFavorites(movie.id);
        toast.success(`${movie.title} removed from your favorites.`, { duration: 3000 });
      } else {
        await addToFavorites(movie.id);
        toast.success(`${movie.title} added to your favorites!`, { duration: 3000 });
      }
    } catch (error) {
      toast.error('Failed to update favorites. Please try again.', { duration: 3000 });
      console.error('Error toggling favorite:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return 'N/A';
    }
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <Link href={`/movie/${movie.id}`} className="block group h-full">
      <div className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg h-full flex flex-col border border-gray-200 dark:border-gray-800">
        <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          {movie.poster_path && (
            <Image
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          )}
          
          {/* Favorite Button */}
          {showFavoriteButton && (
            <button
              onClick={handleFavoriteToggle}
              className={`absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 ${
                isMovieFavorite
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
              }`}
              aria-label={isMovieFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={20}
                className={isMovieFavorite ? 'fill-current' : ''}
              />
            </button>
          )}

          {/* Rating Badge */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
            <Star size={12} className="mr-1 fill-current text-yellow-400" />
            {formatRating(movie.vote_average)}
          </div>

          {/* Loading overlay */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-grow">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[3rem] flex items-start">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-auto">
            <span>{formatDate(movie.release_date)}</span>
            <span className="flex items-center">
              <Star size={14} className="mr-1 fill-current text-yellow-400" />
              {formatRating(movie.vote_average)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
