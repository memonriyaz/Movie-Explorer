"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Movie } from "@/types";
import { getFavoriteMovies } from "@/lib/favorites";
import { MovieCard } from "@/components/movies/MovieCard";
import { MovieGridSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageLoading } from "@/components/ui/PageLoading";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Heart, Trash2 } from "lucide-react";
import { getMovieDetails } from "@/lib/tmdb";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { log } from "console";

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      const loadFavorites = async () => {
        // setIsLoading(true);
        const movies = getFavoriteMovies(); 

        try {
          const movieDetails = await Promise.all(
            movies.map((id) => getMovieDetails(Number(id)))
          );
          console.log("movieDetails", movieDetails);
          

          setFavoriteMovies(movieDetails);
        } catch (error) {
          console.error("Failed to load movie details", error);
        } finally {
          setIsLoading(false);
        }
        
      };
      loadFavorites();

      // Listen for storage changes to update favorites in real-time
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "movie-explorer-favorite-movies") {
          loadFavorites();
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [isAuthenticated, authLoading, router]);
  
  const clearAllFavorites = () => {
    if (
      confirm("Are you sure you want to remove all movies from your favorites?")
    ) {
      localStorage.removeItem("movie-explorer-favorite-movies");
      localStorage.removeItem("movie-explorer-favorites");
      setFavoriteMovies([]);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        <MovieGridSkeleton count={8} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              My Favorites
            </h1>
          </div>

          {favoriteMovies.length > 0 && (
            <button
              onClick={clearAllFavorites}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-400">
          {favoriteMovies.length > 0
            ? `You have ${favoriteMovies.length} movie${
                favoriteMovies.length === 1 ? "" : "s"
              } in your favorites.`
            : "Start building your favorite movies collection by clicking the heart icon on any movie."}
        </p>
      </div>

      {/* Favorites Grid */}
      {favoriteMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} showFavoriteButton={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Heart className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Discover amazing movies and add them to your favorites to see them
              here.
            </p>
            <LoadingButton
              onClick={() => router.push("/")}
              variant="primary"
              size="lg"
              loadingText="Loading movies..."
            >
              Explore Movies
            </LoadingButton>
          </div>
        </div>
      )}

      {/* Pro tip */}
      {favoriteMovies.length > 0 && (
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4 text-white fill-current" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-1">
                Pro Tip
              </h3>
              <p className="text-blue-700  dark:text-blue-200">
                Your favorites are saved locally in your browser. Click on any
                movie card to view detailed information, trailers, and more. You
                can also remove movies from favorites by clicking the heart icon
                again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
