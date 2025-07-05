"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { MovieDetail } from "@/types";
import { getMovieDetails, getImageUrl, getBackdropUrl } from "@/lib/tmdb";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from "@/lib/favorites-client";
import {
  Heart,
  Star,
  Calendar,
  Clock,
  Globe,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const movieId = params?.id as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (movieId && status === "authenticated") {
      fetchMovieDetails();
      checkFavoriteStatus();
    }
  }, [movieId, status, router]);

  const fetchMovieDetails = async () => {
    if (!movieId) return;
    try {
      setLoading(true);
      const movieData = await getMovieDetails(parseInt(movieId));
      setMovie(movieData);
    } catch (err) {
      setError("Failed to fetch movie details");
      console.error("Error fetching movie details:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!movieId) return;
    try {
      const favorites = await fetchFavorites();
      setIsFavorite(favorites.includes(parseInt(movieId)));
    } catch (err) {
      console.error("Error checking favorite status:", err);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!session || !movieId) {
      toast.error("Please log in to manage favorites");
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(parseInt(movieId));
        setIsFavorite(false);
        toast.success(`${movie?.title} removed from favorites`);
      } else {
        await addFavorite(parseInt(movieId));
        setIsFavorite(true);
        toast.success(`${movie?.title} added to favorites`);
      }
    } catch (err) {
      toast.error("Failed to update favorites");
      console.error("Error toggling favorite:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) return null;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-white mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
        <Image
          src={getBackdropUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-black/70 text-white rounded-md hover:bg-black/80 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <button
          onClick={handleFavoriteToggle}
          disabled={favoriteLoading}
          className={`absolute top-4 right-4 z-10 p-3 rounded-full transition-colors ${
            isFavorite
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-black/70 text-white hover:bg-black/80"
          } ${favoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Heart size={24} className={isFavorite ? "fill-current" : ""} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="relative w-full max-w-sm mx-auto">
              <Image
                src={getImageUrl(movie.poster_path, "w780")}
                alt={movie.title}
                width={400}
                height={600}
                className="rounded-lg shadow-2xl w-full h-auto"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111] rounded-lg p-6 shadow-lg dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-lg text-gray-600 dark:text-white italic mb-4">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({movie.vote_count} votes)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-600 dark:text-white">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(movie.release_date)}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-white">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-100 dark:bg-[#1a1a1a] text-blue-800 dark:text-white rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] rounded-lg p-6 shadow-lg dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Overview
              </h2>
              <p className="text-gray-700 dark:text-white leading-relaxed">
                {movie.overview}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#111] rounded-lg p-6 shadow-lg dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Production Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-white">
                      Status:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {movie.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-white">
                      Original Language:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {movie.original_language.toUpperCase()}
                    </p>
                  </div>
                  {movie.budget > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-white">
                        Budget:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(movie.budget)}
                      </p>
                    </div>
                  )}
                  {movie.revenue > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-white">
                        Revenue:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(movie.revenue)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#111] rounded-lg p-6 shadow-lg dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  External Links
                </h3>
                <div className="space-y-3">
                  {movie.homepage && (
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Official Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {movie.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${movie.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on IMDb
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {movie.production_companies.length > 0 && (
              <div className="bg-white dark:bg-[#111] rounded-lg p-6 shadow-lg dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Production Companies
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.production_companies.map((company) => (
                    <div
                      key={company.id}
                      className="text-center p-3 border border-gray-200 dark:border-[#1f1f1f] rounded-lg flex flex-col justify-center items-center min-h-[120px]"
                    >
                      {company.logo_path ? (
                        <>
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <Image
                              src={getImageUrl(company.logo_path, "w200")}
                              alt={company.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-sm text-gray-700 dark:text-white font-medium">
                            {company.name}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-700 dark:text-white font-medium text-center flex items-center justify-center h-full">
                          {company.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
