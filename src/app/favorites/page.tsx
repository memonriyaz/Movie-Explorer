"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Movie } from "@/types";
import { fetchFavorites } from "@/lib/favorites-client";
import { MovieCard } from "@/components/movies/MovieCard";
import { MovieGridSkeleton } from "@/components/ui/LoadingSkeleton";
import { Heart, Trash2 } from "lucide-react";
import { getMovieDetails } from "@/lib/tmdb";
import toast from "react-hot-toast";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const loadFavorites = async () => {
        setIsLoading(true);
        
        try {
          const ids = await fetchFavorites(); // Get favorites from server
          
          if (ids.length > 0) {
            const details = await Promise.all(
              ids.map((id) => getMovieDetails(Number(id)))
            );
            setFavoriteMovies(details);
          } else {
            setFavoriteMovies([]);
          }
        } catch (err) {
          console.error("Error loading favorite movies:", err);
          toast.error("Failed to load favorites");
        } finally {
          setIsLoading(false);
        }
      };

      loadFavorites();
    }
  }, [status, router]);

  const clearAllFavorites = async () => {
    const confirmed = confirm("Remove all favorites?");
    if (!confirmed) return;
    
    try {
  
      await Promise.all(
        favoriteMovies.map(movie => 
          fetch('/api/favorites/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId: movie.id })
          })
        )
      );
      
      setFavoriteMovies([]);
      toast.success("All favorites removed");
    } catch (error) {
      console.error("Error clearing favorites:", error);
      toast.error("Failed to clear favorites");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4 animate-pulse" />
        <MovieGridSkeleton count={8} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
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

      {/* Info Text */}
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {favoriteMovies.length > 0
          ? `You have ${favoriteMovies.length} favorite ${
              favoriteMovies.length === 1 ? "movie" : "movies"
            }.`
          : "You haven't added any favorites yet."}
      </p>

      {/* Favorites Grid */}
      {favoriteMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} showFavoriteButton />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 ">
          <Heart className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start by clicking the heart icon on a movie card to add it here.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Explore Movies
          </button>
        </div>
      )}
    </div>
  );
}
